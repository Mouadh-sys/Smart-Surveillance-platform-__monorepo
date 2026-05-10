from pathlib import Path

import cv2
import numpy as np

from app.services.hash_service import sha256_file, sha256_text
from app.services.watermark_service import (
    build_visible_watermark_text,
    embed_lsb_payload,
    extract_lsb_payload,
)


def test_sha256_text_changes_with_input():
    assert sha256_text("a") != sha256_text("b")


def test_visible_watermark_text_contains_core_fields():
    text = build_visible_watermark_text("EVT-1", 12, "AUTHORIZED")
    assert "EVT-1" in text
    assert "CAMERA=12" in text
    assert "STATUS=AUTHORIZED" in text


def test_lsb_embed_and_extract_roundtrip(tmp_path: Path):
    image_path = tmp_path / "sample.png"
    image = np.full((32, 32, 3), 255, dtype=np.uint8)
    assert cv2.imwrite(str(image_path), image)

    encoded_path = embed_lsb_payload(str(image_path), "HELLO")
    assert Path(encoded_path).exists()
    assert extract_lsb_payload(encoded_path) == "HELLO"


def test_sha256_file(tmp_path: Path):
    file_path = tmp_path / "sample.txt"
    file_path.write_text("hello", encoding="utf-8")
    assert len(sha256_file(file_path)) == 64
