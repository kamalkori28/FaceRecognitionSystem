from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

import cv2
import face_recognition
import numpy as np

from app.core.config import settings
from app.db.extensions import db
from app.models.entities import Person
from app.services.activity_service import activity_service
from app.services.attendance_service import attendance_service
from app.services.encoding_service import encoding_service
from app.services.realtime_hub import realtime_hub
from app.utils.image_utils import decode_data_url


@dataclass(slots=True)
class MatchResult:
    person: Person | None
    name: str
    confidence: float
    distance: float


class RecognitionService:
    def __init__(self) -> None:
        self.known_encodings: list[np.ndarray] = []
        self.known_names: list[str] = []
        self.known_person_ids: list[str] = []
        self.active_streams = 0

    # ✅ FIXED (for websocket)
    def stream_opened(self) -> None:
        self.active_streams += 1
        print("🎥 Stream started")

    def stream_closed(self) -> None:
        self.active_streams = max(0, self.active_streams - 1)
        print("🛑 Stream stopped")

    def refresh_known_faces(self) -> None:
        payload = encoding_service.read_payload()
        self.known_encodings = payload.get("encodings", [])
        self.known_names = payload.get("names", [])
        self.known_person_ids = payload.get("personIds", [])

    def system_status(self) -> dict[str, Any]:
        return {
            "status": "running" if self.active_streams > 0 else "idle",
            "activeStreams": self.active_streams,
            "knownFaces": len(self.known_person_ids),
            "eventSubscribers": realtime_hub.count(),
            "frameIntervalMs": settings.frame_interval_ms,
        }

    def _match_face(self, face_encoding: np.ndarray) -> MatchResult:
        if not self.known_encodings:
            return MatchResult(None, "Unknown", 0.0, 1.0)

        distances = face_recognition.face_distance(self.known_encodings, face_encoding)
        best_index = int(np.argmin(distances))
        best_distance = float(distances[best_index])

        if best_distance > settings.recognition_tolerance:
            return MatchResult(None, "Unknown", 0.0, best_distance)

        person = db.session.get(Person, self.known_person_ids[best_index])
        confidence = max(0.0, min(99.9, (1.0 - best_distance) * 100))

        return MatchResult(
            person=person,
            name=person.name if person else self.known_names[best_index],
            confidence=confidence,
            distance=best_distance,
        )

    def process_frame(self, image_data_url: str) -> dict[str, Any]:
        started = perf_counter()
        frame = decode_data_url(image_data_url)

        original_height, original_width = frame.shape[:2]

        # 🔽 resize for speed
        small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb)
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        detections = []
        new_attendance = []
        scan_result = None

        scale = 4  # because 0.25 resize

        for face_encoding, location in zip(face_encodings, face_locations):
            match = self._match_face(face_encoding)

            top, right, bottom, left = location

            bbox = {
                "top": int(top * scale),
                "right": int(right * scale),
                "bottom": int(bottom * scale),
                "left": int(left * scale),
                "width": int((right - left) * scale),
                "height": int((bottom - top) * scale),
            }

            detections.append({
                "bbox": bbox,
                "name": match.name,
                "confidence": round(match.confidence, 2),
                "recognized": bool(match.person),
            })

            # 🎯 ATTENDANCE LOGIC
            if match.person:
                record, created = attendance_service.mark_attendance(
                    match.person,
                    match.confidence,
                )

                if created:
                    scan_result = "success"
                    new_attendance.append(record.to_dict())
                else:
                    scan_result = "already_marked"
            else:
                scan_result = "failed"

        latency = round((perf_counter() - started) * 1000, 2)

        if detections:
            activity_service.log(
                level="recognition",
                message=f"{len(detections)} face(s) detected in {latency} ms",
            )

        return {
            "frame": {
                "width": original_width,
                "height": original_height,
            },
            "detections": detections,
            "newAttendance": new_attendance,
            "latencyMs": latency,
            "scanResult": scan_result,  # 🔥 IMPORTANT
            "systemStatus": self.system_status(),
        }


recognition_service = RecognitionService()