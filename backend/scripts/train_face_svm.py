"""
Train the FaceNet + SVM face recognition model.

Dataset layout expected:

backend/data/known_faces/
  Person_Name_1/
    img1.jpg
    img2.jpg
  Person_Name_2/
    img1.jpg
    img2.jpg

Run from the backend folder:
    python scripts/train_face_svm.py

Optional tuning:
    python scripts/train_face_svm.py --tune
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Iterable

import cv2
import joblib
import numpy as np
from sklearn.metrics import classification_report
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, Normalizer
from sklearn.svm import SVC

# backend/scripts/train_face_svm.py -> backend
BACKEND_DIR = Path(__file__).resolve().parents[1]
APP_DIR = BACKEND_DIR / "app"
DATASET_DIR = BACKEND_DIR / "data" / "known_faces"
MODEL_DIR = APP_DIR / "ml"

sys.path.insert(0, str(BACKEND_DIR))

from app.services.embedding_service import extract_embedding_from_frame  # noqa: E402

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def iter_images(dataset_dir: Path) -> Iterable[tuple[str, Path]]:
    for person_dir in sorted(dataset_dir.iterdir()):
        if not person_dir.is_dir():
            continue
        person_name = person_dir.name.replace("_", " ").strip()
        for image_path in sorted(person_dir.rglob("*")):
            if image_path.suffix.lower() in IMAGE_EXTENSIONS:
                yield person_name, image_path


def load_embeddings(dataset_dir: Path) -> tuple[np.ndarray, np.ndarray, list[dict]]:
    embeddings: list[np.ndarray] = []
    labels: list[str] = []
    skipped: list[dict] = []

    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset folder not found: {dataset_dir}")

    for person_name, image_path in iter_images(dataset_dir):
        frame = cv2.imread(str(image_path))
        if frame is None:
            skipped.append({"path": str(image_path), "reason": "OpenCV could not read image"})
            continue

        embedding = extract_embedding_from_frame(frame)
        if embedding is None:
            skipped.append({"path": str(image_path), "reason": "No face detected"})
            continue

        embeddings.append(embedding.astype("float32"))
        labels.append(person_name)
        print(f"[OK] {person_name}: {image_path.name}")

    if not embeddings:
        raise RuntimeError("No valid face embeddings were extracted. Add clear face images first.")

    return np.vstack(embeddings), np.array(labels), skipped


def build_classifier(tune: bool, X_train: np.ndarray, y_train: np.ndarray):
    pipeline = Pipeline([
        ("norm", Normalizer(norm="l2")),
        ("svm", SVC(kernel="linear", C=1.0, probability=True, class_weight="balanced")),
    ])

    if not tune:
        pipeline.fit(X_train, y_train)
        return pipeline

    class_counts = Counter(y_train)
    min_class_count = min(class_counts.values())
    if min_class_count < 3:
        print("[WARN] Not enough images per person for cross-validation tuning. Training default SVM.")
        pipeline.fit(X_train, y_train)
        return pipeline

    cv = StratifiedKFold(n_splits=min(3, min_class_count), shuffle=True, random_state=42)
    grid = GridSearchCV(
        estimator=pipeline,
        param_grid={
            "svm__kernel": ["linear", "rbf"],
            "svm__C": [0.1, 1.0, 10.0],
            "svm__gamma": ["scale", "auto"],
        },
        scoring="accuracy",
        cv=cv,
        n_jobs=-1,
    )
    grid.fit(X_train, y_train)
    print(f"[INFO] Best params: {grid.best_params_}")
    print(f"[INFO] Best CV accuracy: {grid.best_score_:.3f}")
    return grid.best_estimator_


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset-dir", type=Path, default=DATASET_DIR)
    parser.add_argument("--model-dir", type=Path, default=MODEL_DIR)
    parser.add_argument("--tune", action="store_true", help="Tune SVM hyperparameters with GridSearchCV")
    args = parser.parse_args()

    X, names, skipped = load_embeddings(args.dataset_dir)

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(names)

    class_counts = Counter(y)
    if len(class_counts) < 2:
        raise RuntimeError("SVM needs at least 2 different known people/classes to train.")

    print("\n[INFO] Dataset summary")
    print(f"Embeddings: {len(X)}")
    for class_id, count in sorted(class_counts.items()):
        print(f"- {label_encoder.inverse_transform([class_id])[0]}: {count} images")

    can_stratify_split = min(class_counts.values()) >= 2 and len(X) >= 6
    if can_stratify_split:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.25,
            random_state=42,
            stratify=y,
        )
    else:
        print("[WARN] Dataset is small. Training on all images without a test split.")
        X_train, X_test, y_train, y_test = X, None, y, None

    classifier = build_classifier(args.tune, X_train, y_train)

    if X_test is not None and y_test is not None:
        y_pred = classifier.predict(X_test)
        print("\n[INFO] Evaluation")
        print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    args.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(classifier, args.model_dir / "face_classifier.pkl")
    joblib.dump(label_encoder, args.model_dir / "label_encoder.pkl")
    np.save(args.model_dir / "known_embeddings.npy", X)

    report = {
        "dataset_dir": str(args.dataset_dir),
        "model_dir": str(args.model_dir),
        "classes": label_encoder.classes_.tolist(),
        "num_embeddings": int(len(X)),
        "skipped": skipped,
    }
    (args.model_dir / "training_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    print("\n[DONE] Saved model files:")
    print(f"- {args.model_dir / 'face_classifier.pkl'}")
    print(f"- {args.model_dir / 'label_encoder.pkl'}")
    print(f"- {args.model_dir / 'known_embeddings.npy'}")
    print(f"- {args.model_dir / 'training_report.json'}")

    if skipped:
        print("\n[WARN] Some images were skipped. Check training_report.json.")


if __name__ == "__main__":
    main()
