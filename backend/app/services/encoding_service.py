from __future__ import annotations

import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import face_recognition
import numpy as np

from app.core.config import settings
from app.models.entities import Person
from app.services.activity_service import activity_service


class EncodingService:
    def ensure_encoding_file(self) -> None:
        if not settings.encodings_file.exists():
            self._write_payload(
                {
                    "encodings": [],
                    "personIds": [],
                    "names": [],
                    "updatedAt": None,
                }
            )

    def _write_payload(self, payload: dict[str, Any]) -> None:
        settings.encodings_dir.mkdir(parents=True, exist_ok=True)
        with settings.encodings_file.open("wb") as handle:
            pickle.dump(payload, handle)

    def read_payload(self) -> dict[str, Any]:
        self.ensure_encoding_file()
        with settings.encodings_file.open("rb") as handle:
            return pickle.load(handle)

    def rebuild(self) -> dict[str, Any]:
        known_encodings: list[np.ndarray] = []
        person_ids: list[str] = []
        names: list[str] = []
        people_processed = 0
        images_processed = 0

        people = Person.query.filter_by(is_active=True).all()
        for person in people:
            person_folder = Path(person.dataset_path)
            if not person_folder.exists():
                continue

            person_has_encoding = False
            for image_path in sorted(person_folder.glob("*.jpg")):
                images_processed += 1
                image = face_recognition.load_image_file(image_path.as_posix())
                face_locations = face_recognition.face_locations(image, model="hog")
                face_encodings = face_recognition.face_encodings(image, face_locations)

                if len(face_encodings) != 1:
                    continue

                known_encodings.append(face_encodings[0])
                person_ids.append(person.id)
                names.append(person.name)
                person_has_encoding = True

            if person_has_encoding:
                people_processed += 1

        payload = {
            "encodings": known_encodings,
            "personIds": person_ids,
            "names": names,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
        self._write_payload(payload)

        activity_service.log(
            level="encoding",
            message="Encoding index rebuilt successfully.",
            context={
                "peopleProcessed": people_processed,
                "imagesProcessed": images_processed,
                "encodings": len(known_encodings),
            },
        )

        return {
            "peopleProcessed": people_processed,
            "imagesProcessed": images_processed,
            "encodings": len(known_encodings),
        }


encoding_service = EncodingService()
