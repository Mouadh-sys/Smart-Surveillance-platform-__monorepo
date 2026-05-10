from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

APP_DIR = Path(__file__).resolve().parents[1]
ML_DIR = APP_DIR / "ml"
CLASSIFIER_PATH = ML_DIR / "face_classifier.pkl"
LABEL_ENCODER_PATH = ML_DIR / "label_encoder.pkl"
KNOWN_EMBEDDINGS_PATH = ML_DIR / "known_embeddings.npy"
TRAINING_REPORT_PATH = ML_DIR / "training_report.json"

classifier: Any = None
label_encoder: Any = None

# Tune this after testing. Higher = stricter, more UNKNOWN results.
UNKNOWN_CONFIDENCE_THRESHOLD = 0.65


def get_recognition_artifact_paths() -> dict[str, str]:
    return {
        "classifier": str(CLASSIFIER_PATH),
        "label_encoder": str(LABEL_ENCODER_PATH),
        "known_embeddings": str(KNOWN_EMBEDDINGS_PATH),
        "training_report": str(TRAINING_REPORT_PATH),
    }


def load_recognition_model(force: bool = False) -> bool:
    global classifier, label_encoder

    if classifier is not None and label_encoder is not None and not force:
        return True

    if not CLASSIFIER_PATH.exists() or not LABEL_ENCODER_PATH.exists():
        classifier = None
        label_encoder = None
        return False

    if CLASSIFIER_PATH.stat().st_size == 0 or LABEL_ENCODER_PATH.stat().st_size == 0:
        classifier = None
        label_encoder = None
        return False

    classifier = joblib.load(CLASSIFIER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    return True


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

    if classifier is None or label_encoder is None:
        return {
            "person_name": None,
            "confidence": 0.0,
            "is_unknown": True,
            "reason": "Recognition model is not trained/loaded",
            "artifacts": get_recognition_artifact_paths(),
        }

    model = classifier
    encoder = label_encoder

    try:
        embedding = np.array(embedding, dtype="float32").reshape(1, -1)
    except Exception as exc:
        return {
            "person_name": None,
            "confidence": 0.0,
            "is_unknown": True,
            "reason": f"Invalid embedding shape: {exc}",
        }

    probabilities = model.predict_proba(embedding)[0]
    best_position = int(np.argmax(probabilities))
    confidence = float(probabilities[best_position])

    # SVC probabilities are ordered by classifier.classes_. Do not assume position == label id.
    class_id = int(model.classes_[best_position])
    person_name = str(encoder.inverse_transform([class_id])[0])

    if confidence < UNKNOWN_CONFIDENCE_THRESHOLD:
        return {
            "person_name": None,
            "predicted_person_name": person_name,
            "confidence": confidence,
            "is_unknown": True,
            "artifacts": get_recognition_artifact_paths(),
        }

    return {
        "person_name": person_name,
        "confidence": confidence,
        "is_unknown": False,
        "artifacts": get_recognition_artifact_paths(),
    }
