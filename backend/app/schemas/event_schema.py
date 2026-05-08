from pydantic import BaseModel


class EventBase(BaseModel):
    event_type: str


class EventRead(EventBase):
    id: int
