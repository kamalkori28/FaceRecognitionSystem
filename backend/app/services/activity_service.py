from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Any

from app.services.realtime_hub import realtime_hub


class ActivityService:
    def __init__(self) -> None:
        self._logs: deque[dict[str, Any]] = deque(maxlen=80)

    def log(self, level: str, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = {
            "id": f"log-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "level": level,
            "message": message,
            "context": context or {},
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        self._logs.appendleft(payload)
        realtime_hub.broadcast("log:new", payload)
        return payload

    def snapshot(self) -> list[dict[str, Any]]:
        return list(self._logs)


activity_service = ActivityService()
