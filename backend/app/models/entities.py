from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import UniqueConstraint

from app.db.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="admin")
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
        }


class Person(db.Model):
    __tablename__ = "persons"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False)
    employee_code = db.Column(db.String(64), unique=True, nullable=False)
    department = db.Column(db.String(120), nullable=True)
    dataset_path = db.Column(db.String(255), nullable=False)
    avatar_path = db.Column(db.String(255), nullable=True)
    image_count = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )

    attendance = db.relationship("Attendance", back_populates="person", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "employeeCode": self.employee_code,
            "department": self.department,
            "datasetPath": self.dataset_path,
            "avatarPath": self.avatar_path,
            "imageCount": self.image_count,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat(),
        }


class Attendance(db.Model):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("person_id", "session_key", name="uq_attendance_session_person"),
    )

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    person_id = db.Column(db.String(36), db.ForeignKey("persons.id"), nullable=False)
    session_key = db.Column(db.String(32), nullable=False)
    recognized_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    confidence = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(40), nullable=False, default="websocket")

    person = db.relationship("Person", back_populates="attendance")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "personId": self.person_id,
            "name": self.person.name if self.person else None,
            "employeeCode": self.person.employee_code if self.person else None,
            "department": self.person.department if self.person else None,
            "recognizedAt": self.recognized_at.isoformat(),
            "sessionKey": self.session_key,
            "confidence": round(self.confidence, 2),
            "source": self.source,
        }
