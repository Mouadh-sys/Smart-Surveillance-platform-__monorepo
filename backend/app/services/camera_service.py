import cv2

def open_camera_source(source: str):
    """
    Source can be:
    - "0" for laptop webcam
    - URL for IP camera
    - file path for video
    """
    if source.isdigit():
        source = int(source)

    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open camera source: {source}")

    return cap