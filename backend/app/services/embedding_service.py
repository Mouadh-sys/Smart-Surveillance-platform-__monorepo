import cv2
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
import logging

logger = logging.getLogger(__name__)

device = "cuda" if torch.cuda.is_available() else "cpu"

mtcnn_aligner = MTCNN(
    image_size=160,
    margin=20,
    post_process=True,
    device=device
)

embedding_model = InceptionResnetV1(pretrained="vggface2").eval().to(device)

def extract_embedding_from_frame(frame_bgr):
    """
    Extracts FaceNet embedding from a face image/frame.
    """
    try:
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(frame_rgb)

        face_tensor = mtcnn_aligner(image)

        if face_tensor is None:
            return None

        face_tensor = face_tensor.unsqueeze(0).to(device)

        with torch.no_grad():
            embedding = embedding_model(face_tensor)

        return embedding.cpu().numpy()[0]
    except Exception as e:
        logger.error(f"Error extracting embedding: {e}")
        return None


# Alias for convenience
def extract_embedding(frame_bgr):
    """Alias for extract_embedding_from_frame"""
    return extract_embedding_from_frame(frame_bgr)
