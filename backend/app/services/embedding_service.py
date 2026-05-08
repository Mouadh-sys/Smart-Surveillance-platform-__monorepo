import cv2
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1

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
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(frame_rgb)

    face_tensor = mtcnn_aligner(image)

    if face_tensor is None:
        return None

    face_tensor = face_tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = embedding_model(face_tensor)

    return embedding.cpu().numpy()[0]