from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.admin_model import Admin
from app.schemas.report_schema import ReportFilter
from app.services.report_service import build_report, build_daily_report

router = APIRouter(tags=["reports"])


@router.get("/summary")
def get_summary(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    camera_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    filters = ReportFilter(start_date=start_date, end_date=end_date, camera_id=camera_id, status=status)
    return build_report(
        db,
        start_date=filters.start_date,
        end_date=filters.end_date,
        camera_id=filters.camera_id,
        status=filters.status,
    )


@router.get("/daily")
def get_daily_report(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    return build_daily_report(db, start_date=start_date, end_date=end_date)


@router.get("/by-camera/{camera_id}")
def get_camera_report(
    camera_id: int,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    return build_report(db, start_date=start_date, end_date=end_date, camera_id=camera_id)


@router.get("/by-status/{status}")
def get_status_report(
    status: str,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    return build_report(db, start_date=start_date, end_date=end_date, status=status)
