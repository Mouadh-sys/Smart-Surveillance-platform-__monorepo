from pydantic import BaseModel


class VerificationRequest(BaseModel):
    person_name: str
