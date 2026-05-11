from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np


LSB_SENTINEL = "1111111111111110"


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _get_relative_path(absolute_path: str | Path) -> str:
    """Convert an absolute path to a path relative to the data directory."""
    try:
        path = Path(absolute_path)
        data_dir = Path(__file__).resolve().parents[2] / "data"
        rel_path = path.relative_to(data_dir)
        return str(rel_path).replace("\\", "/")
    except (ValueError, TypeError):
        # If not relative to data dir, return as-is
        return str(absolute_path).replace("\\", "/")


def build_visible_watermark_text(event_code: str, camera_id: str | int | None, status: str) -> str:
    return f"EVENT={event_code} | CAMERA={camera_id or 'N/A'} | STATUS={status}"


def watermark_image(path: str, visible_text: str | None = None, output_path: str | None = None) -> str:
    input_path = Path(path)
    output = Path(output_path) if output_path else input_path.with_name(f"watermarked_{input_path.name}")
    _ensure_parent(output)

    image = cv2.imread(str(input_path))
    if image is None:
        raise ValueError(f"Unable to read image: {path}")

    if visible_text:
        cv2.rectangle(image, (0, image.shape[0] - 42), (image.shape[1], image.shape[0]), (0, 0, 0), -1)
        cv2.putText(
            image,
            visible_text,
            (10, image.shape[0] - 14),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    if not cv2.imwrite(str(output), image):
        raise ValueError(f"Unable to write watermarked image: {output}")
    return str(output)


def _payload_to_bits(payload: str) -> str:
    return "".join(f"{ord(char):08b}" for char in payload) + LSB_SENTINEL


def _bits_to_payload(bits: str) -> str:
    collected = []
    for index in range(0, len(bits), 8):
        chunk = bits[index : index + 8]
        if len(chunk) < 8:
            break
        if bits[index : index + len(LSB_SENTINEL)] == LSB_SENTINEL:
            break
        collected.append(chr(int(chunk, 2)))
    return "".join(collected)


def embed_lsb_payload(path: str, payload: str, output_path: str | None = None) -> str:
    input_path = Path(path)
    output = Path(output_path) if output_path else input_path.with_name(f"lsb_{input_path.name}")
    _ensure_parent(output)

    image = cv2.imread(str(input_path))
    if image is None:
        raise ValueError(f"Unable to read image: {path}")

    flat = image.reshape(-1)
    bits = _payload_to_bits(payload)
    if len(bits) > len(flat):
        raise ValueError("Payload is too large for the image capacity")

    for index, bit in enumerate(bits):
        flat[index] = (flat[index] & 0xFE) | int(bit)

    encoded = flat.reshape(image.shape)
    if not cv2.imwrite(str(output), encoded):
        raise ValueError(f"Unable to write LSB watermarked image: {output}")
    return str(output)


def extract_lsb_payload(path: str) -> str:
    image = cv2.imread(path)
    if image is None:
        raise ValueError(f"Unable to read image: {path}")

    flat = image.reshape(-1)
    bits = "".join(str(pixel & 1) for pixel in flat)

    sentinel_index = bits.find(LSB_SENTINEL)
    if sentinel_index == -1:
        return ""

    payload_bits = bits[:sentinel_index]
    return _bits_to_payload(payload_bits)
