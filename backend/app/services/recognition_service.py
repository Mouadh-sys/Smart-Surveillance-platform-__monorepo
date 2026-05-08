import os
import joblib
import numpy as np

CLASSIFIER_PATH = "app/ml/face_classifier.pkl"
LABEL_ENCODER_PATH = "app/ml/label_encoder.pkl"

classifier = None
label_encoder = None

UNKNOWN_CONFIDENCE_THRESHOLD = 0.65

def load_recognition_model():
    global classifier, label_encoder

    if os.path.exists(CLASSIFIER_PATH) and os.path.exists(LABEL_ENCODER_PATH):
        classifier = joblib.load(CLASSIFIER_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)

def recognize_embedding(embedding):
    """
    Returns:
    {
      "person_name": str | None,
      "confidence": float,
      "is_unknown": bool
    }
    """
    global classifier, label_encoder

    if classifier is None or label_encoder is None:
        load_recognition_model()

    if classifier is None:
        return {
            "person_name": None,
            "confidence": 0.0,
            "is_unknown": True
        }

    embedding = np.array(embedding).reshape(1, -1)

    probabilities = classifier.predict_proba(embedding)[0]
    best_index = int(np.argmax(probabilities))
    confidence = float(probabilities[best_index])

    if confidence < UNKNOWN_CONFIDENCE_THRESHOLD:
        return {
            "person_name": None,
            "confidence": confidence,
            "is_unknown": True
        }

    person_name = label_encoder.inverse_transform([best_index])[0]

    return {
        "person_name": person_name,
        "confidence": confidence,
        "is_unknown": False
    }