from datetime import datetime
from pydantic import BaseModel


class ReportFilter(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None
    camera_id: int | None = None
    status: str | None = None


class ReportSummary(BaseModel):
    total_events: int
    authorized_events: int
    known_non_authorized_events: int
    unknown_events: int
    cameras_affected: int
    persons_detected: int


class CameraReportItem(BaseModel):
    camera_id: int | None = None
    camera_code: str | None = None
    camera_name: str | None = None
    event_count: int


class StatusReportItem(BaseModel):
    status: str
    count: int


class ReportResponse(BaseModel):
    summary: ReportSummary
    by_camera: list[CameraReportItem]
    by_status: list[StatusReportItem]
    events: list[dict]
