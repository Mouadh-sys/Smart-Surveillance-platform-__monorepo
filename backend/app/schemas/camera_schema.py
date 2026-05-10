from datetime import datetime

from pydantic import BaseModel


class CameraBase(BaseModel):
    camera_code: str
    name: str
    source: str
    location: str | None = None
    is_active: bool = True


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
