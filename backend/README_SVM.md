# FaceNet + SVM training integration

## 1. Put training images here

```text
backend/data/known_faces/
  Mouadh_Boukari/
    01.jpg
    02.jpg
    03.jpg
  Person_Two/
    01.jpg
    02.jpg
    03.jpg
```

Use at least 5-10 clear images per person. SVM needs at least 2 different people/classes.

## 2. Copy these files into your project

```text
backend/scripts/train_face_svm.py
backend/app/services/recognition_service.py
backend/app/routes/verification.py
```

Also create this folder if it does not exist:

```text
backend/app/ml/
```

## 3. Train

From the backend folder:

```bash
python scripts/train_face_svm.py
```

Optional hyperparameter tuning:

```bash
python scripts/train_face_svm.py --tune
```

The script saves:

```text
backend/app/ml/face_classifier.pkl
backend/app/ml/label_encoder.pkl
backend/app/ml/known_embeddings.npy
backend/app/ml/training_report.json
```

## 4. Start API

```bash
uvicorn app.main:app --reload
```

Test endpoint:

```bash
curl -X POST "http://localhost:8000/api/verification/recognize-image" \
  -F "file=@test_face.jpg"
```

## 5. Important idea

You do not fine-tune the FaceNet neural network here. FaceNet is used as a fixed embedding extractor. The SVM is trained/retrained on those embeddings.
