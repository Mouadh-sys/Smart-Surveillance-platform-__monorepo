from datetime import datetime

from pydantic import BaseModel


class PersonBase(BaseModel):
    full_name: str
    role: str | None = None
    access_status: str = "AUTHORIZED"
    image_folder: str | None = None


class PersonCreate(PersonBase):
    pass


class PersonRead(PersonBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
