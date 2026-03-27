from __future__ import annotations

import base64
from pathlib import Path
from typing import Iterable

import cv2
import numpy as np

from app.core.config import settings
from app.db.extensions import db
from app.models.entities import Person
from app.services.activity_service import activity_service


def slugify(value: str) -> str:
    return "".join(char.lower() if char.isalnum() else "-" for char in value).strip("-")


class DatasetService:
    def list_people(self) -> list[dict]:
        people = Person.query.order_by(Person.created_at.desc()).all()
        return [person.to_dict() for person in people]

    def create_person(self, name: str, employee_code: str, department: str | None = None) -> Person:
        person = Person(
            name=name.strip(),
            employee_code=employee_code.strip().upper(),
            department=department.strip() if department else None,
            dataset_path="",
        )
        db.session.add(person)
        db.session.flush()

        dataset_folder = settings.dataset_dir / f"{slugify(person.name)}-{person.id[:8]}"
        dataset_folder.mkdir(parents=True, exist_ok=True)
        person.dataset_path = dataset_folder.resolve().as_posix()
        db.session.commit()

        activity_service.log(
            level="dataset",
            message=f"Created dataset profile for {person.name}.",
            context={"personId": person.id},
        )
        return person

    def get_person(self, person_id: str) -> Person | None:
        return db.session.get(Person, person_id)

    def _decode_image(self, image_data_url: str) -> np.ndarray:
        _, encoded = image_data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(array, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid image payload")
        return frame

    def save_captured_images(self, person: Person, images: Iterable[str]) -> dict:
        dataset_folder = Path(person.dataset_path)
        dataset_folder.mkdir(parents=True, exist_ok=True)

        saved_files: list[str] = []
        start_index = person.image_count

        for offset, image_data_url in enumerate(images, start=1):
            frame = self._decode_image(image_data_url)
            file_path = dataset_folder / f"capture_{start_index + offset:03d}.jpg"
            cv2.imwrite(file_path.as_posix(), frame)
            saved_files.append(file_path.as_posix())

        if saved_files and not person.avatar_path:
            person.avatar_path = saved_files[0]

        person.image_count += len(saved_files)
        db.session.commit()

        activity_service.log(
            level="dataset",
            message=f"Stored {len(saved_files)} training frames for {person.name}.",
            context={"personId": person.id, "imageCount": person.image_count},
        )

        return {
            "saved": len(saved_files),
            "imageCount": person.image_count,
            "files": saved_files,
            "person": person.to_dict(),
        }


dataset_service = DatasetService()
