from __future__ import annotations

import csv
from datetime import datetime, timedelta, timezone

from sqlalchemy import func

from app.core.config import settings
from app.db.extensions import db
from app.models.entities import Attendance, Person
from app.services.activity_service import activity_service
from app.services.realtime_hub import realtime_hub


class AttendanceService:
    def _session_key(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def _csv_path(self, session_key: str):
        return settings.attendance_dir / f"{session_key}.csv"

    def _append_to_csv(self, record: Attendance) -> None:
        csv_path = self._csv_path(record.session_key)
        file_exists = csv_path.exists()
        with csv_path.open("a", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            if not file_exists:
                writer.writerow([
                    "attendance_id",
                    "person_id",
                    "name",
                    "employee_code",
                    "department",
                    "recognized_at",
                    "confidence",
                ])
            writer.writerow(
                [
                    record.id,
                    record.person_id,
                    record.person.name,
                    record.person.employee_code,
                    record.person.department or "",
                    record.recognized_at.isoformat(),
                    round(record.confidence, 2),
                ]
            )

    def mark_attendance(self, person: Person, confidence: float, source: str = "websocket") -> tuple[Attendance, bool]:
        session_key = self._session_key()
        existing = Attendance.query.filter_by(person_id=person.id, session_key=session_key).first()
        if existing:
            return existing, False

        record = Attendance(
            person_id=person.id,
            session_key=session_key,
            confidence=confidence,
            source=source,
        )
        db.session.add(record)
        db.session.commit()
        db.session.refresh(record)
        self._append_to_csv(record)

        payload = record.to_dict()
        activity_service.log(
            level="attendance",
            message=f"{person.name} marked present at {record.recognized_at.strftime('%H:%M:%S UTC')}",
            context={"personId": person.id, "attendanceId": record.id},
        )
        realtime_hub.broadcast("attendance:new", payload)
        realtime_hub.broadcast("analytics:update", self.analytics_summary())
        return record, True

    def today_records(self) -> list[dict]:
        session_key = self._session_key()
        rows = (
            Attendance.query.filter_by(session_key=session_key)
            .order_by(Attendance.recognized_at.desc())
            .all()
        )
        return [row.to_dict() for row in rows]

    def recent_records(self, limit: int = 50) -> list[dict]:
        rows = Attendance.query.order_by(Attendance.recognized_at.desc()).limit(limit).all()
        return [row.to_dict() for row in rows]

    def analytics_summary(self, days: int = 7) -> dict:
        total_employees = Person.query.filter_by(is_active=True).count()
        today_present = len(self.today_records())
        today_absent = max(total_employees - today_present, 0)

        now = datetime.now(timezone.utc)
        day_start = now - timedelta(days=days - 1)
        raw_daily = (
            db.session.query(
                Attendance.session_key,
                func.count(Attendance.id),
            )
            .filter(Attendance.recognized_at >= day_start)
            .group_by(Attendance.session_key)
            .order_by(Attendance.session_key.asc())
            .all()
        )
        daily_map = {session_key: count for session_key, count in raw_daily}

        chart = []
        for offset in range(days):
            day = (now - timedelta(days=days - 1 - offset)).strftime("%Y-%m-%d")
            chart.append({"date": day, "count": daily_map.get(day, 0)})

        return {
            "totalEmployees": total_employees,
            "todayPresent": today_present,
            "todayAbsent": today_absent,
            "dailyAttendance": chart,
        }


attendance_service = AttendanceService()
