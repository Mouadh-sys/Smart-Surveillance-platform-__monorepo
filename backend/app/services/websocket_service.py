from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected; total=%s", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WebSocket disconnected; total=%s", len(self.active_connections))

    async def send_personal_message(self, message: Any, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: Any) -> None:
        if not self.active_connections:
            return
        stale: list[WebSocket] = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


def broadcast_message(message: Any) -> None:
    """Safely broadcast from sync code by scheduling onto the running loop if present."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        logger.debug("No running event loop available for broadcast")
        return

    loop.create_task(manager.broadcast(message))


def handle_stream_event(event_data: dict[str, Any]) -> None:
    payload = {
        "type": "monitoring_event",
        "data": event_data,
    }
    broadcast_message(payload)
