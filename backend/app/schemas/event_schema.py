from datetime import datetime
from pydantic import BaseModel, field_serializer, field_validator
from pathlib import Path


def _normalize_image_path(path: str | None) -> str | None:
    """Convert absolute or partially-relative paths to relative paths (captures/..., watermarked/, etc)."""
    if not path:
        return None

    path_str = str(path).replace("\\", "/")

    try:
        # If path starts with "data/", remove it
        if path_str.startswith("data/"):
            return path_str[5:]  # Remove "data/" prefix

        # If it's an absolute path, extract the part after "data/"
        p = Path(path)
        if p.is_absolute():
            parts = p.parts
            try:
                # Look for 'data' folder and get everything after it
                data_idx = parts.index("data")
                rel_parts = parts[data_idx + 1:]
                rel_path = str(Path(*rel_parts)).replace("\\", "/")
                return rel_path
            except ValueError:
                # If 'data' not found, return as-is
                return path_str

        # If already relative (like "captures/xxx.jpg"), return as-is
        return path_str
    except Exception:
        return path_str


class EventBase(BaseModel):
    event_code: str
    camera_id: int | None = None
    person_id: int | None = None
    person_name: str | None = None
    status: str
    confidence: float | None = None
    original_image_path: str | None = None
    watermarked_image_path: str | None = None
    visible_watermark_text: str | None = None
    invisible_watermark_payload: str | None = None
    image_hash: str | None = None
    verification_status: str = "NOT_VERIFIED"


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    id: int
    created_at: datetime | None = None

    @field_serializer('original_image_path', 'watermarked_image_path')
    def normalize_paths(self, value: str | None) -> str | None:
        """Normalize image paths to be relative to data directory."""
        return _normalize_image_path(value)

    class Config:
        from_attributes = True
