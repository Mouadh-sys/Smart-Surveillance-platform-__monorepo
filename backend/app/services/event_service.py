from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def generate_event_code(prefix: str = "EVT") -> str:
    return f"{prefix}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:8]}"


def normalize_event_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(payload)
    normalized.setdefault("event_code", generate_event_code())
    normalized.setdefault("verification_status", "NOT_VERIFIED")
    return normalized
