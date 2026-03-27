from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class Settings:
    project_root: Path
    backend_root: Path
    database_url: str
    secret_key: str
    cors_origins: list[str]
    admin_email: str
    admin_password: str
    admin_name: str
    dataset_dir: Path
    encodings_dir: Path
    encodings_file: Path
    attendance_dir: Path
    jwt_exp_minutes: int
    recognition_scale: float
    recognition_tolerance: float
    frame_interval_ms: int


def _build_settings() -> Settings:
    backend_root = Path(__file__).resolve().parents[2]
    project_root = backend_root.parent
    dataset_dir = project_root / "dataset"
    encodings_dir = project_root / "encodings"
    attendance_dir = project_root / "attendance"

    dataset_dir.mkdir(parents=True, exist_ok=True)
    encodings_dir.mkdir(parents=True, exist_ok=True)
    attendance_dir.mkdir(parents=True, exist_ok=True)

    default_db_path = backend_root / "attendance.db"
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

    return Settings(
        project_root=project_root,
        backend_root=backend_root,
        database_url=os.getenv("DATABASE_URL", f"sqlite:///{default_db_path.as_posix()}"),
        secret_key=os.getenv("SECRET_KEY", "change-this-in-production"),
        cors_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
        admin_email=os.getenv("ADMIN_EMAIL", "admin@facenova.ai"),
        admin_password=os.getenv("ADMIN_PASSWORD", "Admin@123"),
        admin_name=os.getenv("ADMIN_NAME", "System Admin"),
        dataset_dir=dataset_dir,
        encodings_dir=encodings_dir,
        encodings_file=encodings_dir / "encodings.pkl",
        attendance_dir=attendance_dir,
        jwt_exp_minutes=int(os.getenv("JWT_EXP_MINUTES", "1440")),
        recognition_scale=float(os.getenv("RECOGNITION_SCALE", "0.5")),
        recognition_tolerance=float(os.getenv("RECOGNITION_TOLERANCE", "0.47")),
        frame_interval_ms=int(os.getenv("FRAME_INTERVAL_MS", "350")),
    )


settings = _build_settings()
