from __future__ import annotations

import json
from threading import Lock
from typing import Any


class RealtimeHub:
    def __init__(self) -> None:
        self._clients: set[Any] = set()
        self._lock = Lock()

    def connect(self, ws: Any) -> None:
        with self._lock:
            self._clients.add(ws)

    def disconnect(self, ws: Any) -> None:
        with self._lock:
            self._clients.discard(ws)

    def count(self) -> int:
        with self._lock:
            return len(self._clients)

    def broadcast(self, event: str, data: dict) -> None:
        message = json.dumps({"event": event, "data": data})
        stale_clients: list[Any] = []

        with self._lock:
            clients = list(self._clients)

        for client in clients:
            try:
                client.send(message)
            except Exception:
                stale_clients.append(client)

        if stale_clients:
            with self._lock:
                for client in stale_clients:
                    self._clients.discard(client)


realtime_hub = RealtimeHub()
