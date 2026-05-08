import cv2
import torch
from facenet_pytorch import MTCNN
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"

mtcnn = MTCNN(
    image_size=160,
    margin=20,
    min_face_size=40,
    thresholds=[0.6, 0.7, 0.7],
    factor=0.709,
    post_process=True,
    device=device
)

def detect_faces(frame_bgr):
    """
    Returns bounding boxes and probabilities.
    """
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(frame_rgb)

    boxes, probs = mtcnn.detect(image)

    if boxes is None:
        return []

    results = []

    for box, prob in zip(boxes, probs):
        if prob is None or prob < 0.90:
            continue

        x1, y1, x2, y2 = box.astype(int)

        results.append({
            "box": [x1, y1, x2, y2],
            "probability": float(prob)
        })

    return results