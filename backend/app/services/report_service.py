from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.camera_model import Camera
from app.models.event_model import Event


def _apply_filters(query, start_date: datetime | None = None, end_date: datetime | None = None, camera_id: int | None = None, status: str | None = None):
    if start_date is not None:
        query = query.filter(Event.created_at >= start_date)
    if end_date is not None:
        query = query.filter(Event.created_at <= end_date)
    if camera_id is not None:
        query = query.filter(Event.camera_id == camera_id)
    if status:
        query = query.filter(Event.status == status)
    return query


def build_report(db: Session, start_date: datetime | None = None, end_date: datetime | None = None, camera_id: int | None = None, status: str | None = None) -> dict[str, Any]:
    query = db.query(Event)
    query = _apply_filters(query, start_date=start_date, end_date=end_date, camera_id=camera_id, status=status)
    events = query.order_by(Event.created_at.desc()).all()

    summary = {
        "total_events": len(events),
        "authorized_events": sum(1 for e in events if e.status == "AUTHORIZED"),
        "known_non_authorized_events": sum(1 for e in events if e.status == "KNOWN_NON_AUTHORIZED"),
        "unknown_events": sum(1 for e in events if e.status == "UNKNOWN"),
        "cameras_affected": len({e.camera_id for e in events if e.camera_id is not None}),
        "persons_detected": len({e.person_name for e in events if e.person_name}),
    }

    camera_counts: dict[tuple[int | None, str | None, str | None], int] = {}
    camera_rows = (
        db.query(Camera.id, Camera.camera_code, Camera.name)
        .all()
    )
    lookup = {(row[0], row[1], row[2]): 0 for row in camera_rows}
    for event in events:
        key = next(((cid, code, name) for cid, code, name in lookup.keys() if cid == event.camera_id), (event.camera_id, None, None))
        camera_counts[key] = camera_counts.get(key, 0) + 1

    by_camera = [
        {
            "camera_id": camera_id,
            "camera_code": camera_code,
            "camera_name": camera_name,
            "event_count": count,
        }
        for (camera_id, camera_code, camera_name), count in sorted(camera_counts.items(), key=lambda item: (item[0][1] or "", item[0][0] or 0))
    ]

    status_counts: dict[str, int] = {"AUTHORIZED": 0, "KNOWN_NON_AUTHORIZED": 0, "UNKNOWN": 0}
    for event in events:
        status_counts[event.status] = status_counts.get(event.status, 0) + 1

    by_status = [
        {"status": status_name, "count": count}
        for status_name, count in status_counts.items()
        if count > 0
    ]

    return {
        "summary": summary,
        "by_camera": by_camera,
        "by_status": by_status,
        "events": [
            {
                "id": event.id,
                "event_code": event.event_code,
                "camera_id": event.camera_id,
                "person_id": event.person_id,
                "person_name": event.person_name,
                "status": event.status,
                "confidence": event.confidence,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "verification_status": event.verification_status,
            }
            for event in events
        ],
    }


def build_daily_report(
    db: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[dict[str, Any]]:
    """Return per-day event counts for the trend chart."""
    from collections import defaultdict

    query = db.query(Event)
    query = _apply_filters(query, start_date=start_date, end_date=end_date)
    events = query.order_by(Event.created_at.asc()).all()

    daily: dict[str, dict[str, int]] = defaultdict(
        lambda: {"total_events": 0, "authorized_events": 0, "unauthorized_events": 0, "unknown_events": 0}
    )

    for event in events:
        date_key = event.created_at.strftime("%Y-%m-%d") if event.created_at else "unknown"
        daily[date_key]["total_events"] += 1
        if event.status == "AUTHORIZED":
            daily[date_key]["authorized_events"] += 1
        elif event.status == "KNOWN_NON_AUTHORIZED":
            daily[date_key]["unauthorized_events"] += 1
        elif event.status == "UNKNOWN":
            daily[date_key]["unknown_events"] += 1

    return [
        {"date": date, **counts}
        for date, counts in sorted(daily.items())
    ]

