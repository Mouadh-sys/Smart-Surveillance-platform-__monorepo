from pydantic import BaseModel


class CameraBase(BaseModel):
    name: str


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase):
    id: int
