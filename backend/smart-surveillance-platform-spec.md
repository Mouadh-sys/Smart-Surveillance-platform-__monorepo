# Smart Surveillance Platform — Technical Specification

**Project:** Plateforme de Surveillance Vidéo Intelligente avec Tatouage des Captures  
**Chosen approach:** Modern practical approach  
**Document type:** Markdown technical specification  
**Version:** 1.0

---

## 1. Project Overview

The goal of this project is to build an intelligent video surveillance platform capable of detecting and recognizing faces from a video stream, classifying people according to their authorization status, capturing proof images, watermarking those captures, and storing all related events in a database.

The original academic project requires:

- Real-time face detection on video streams.
- Facial recognition using an internal database.
- Automatic watermarking of captured images with date, time, and camera ID.
- Classification into:
  - Authorized person
  - Known but non-authorized person
  - Unknown person
- Alerts with watermarked images as evidence.
- Robustness of watermarking against JPEG compression.
- Verifiable proof of authenticity.
- GDPR-aware handling of biometric images.
- Final deliverables including application, source code, test videos, technical documentation, robustness report, PowerPoint presentation, and demonstration.

This implementation modernizes the initial proposed stack by replacing the desktop GUI with a web dashboard and using a modern deep learning based facial recognition pipeline.

---

## 2. Chosen Technology Stack

### 2.1 Backend

```txt
Python + FastAPI
```

FastAPI will expose REST APIs for persons, cameras, events, monitoring, verification, reports, and authentication.

### 2.2 Computer Vision

```txt
OpenCV
```

OpenCV will be used for:

- Reading camera/video streams.
- Capturing frames.
- Drawing bounding boxes.
- Saving image captures.
- Adding visible watermarks.
- Measuring FPS.

### 2.3 Face Detection

```txt
MTCNN
```

MTCNN will be used to detect and align faces before recognition.

### 2.4 Face Recognition

```txt
FaceNet embeddings + SVM
```

The recognition pipeline will use:

1. MTCNN for face detection/alignment.
2. FaceNet to extract facial embeddings.
3. SVM classifier to identify known persons.
4. Confidence thresholding to detect unknown persons.

Optional advanced upgrade:

```txt
ArcFace embeddings
```

ArcFace can be added later if higher recognition performance is needed.

### 2.5 Database

```txt
PostgreSQL
```

PostgreSQL will store:

- Admin accounts.
- Registered persons.
- Camera sources.
- Detection/recognition events.
- Alert records.
- Capture paths.
- Watermark payloads.
- Image hashes.
- Verification results.

### 2.6 Dashboard

```txt
React
```

React will provide the web dashboard for:

- Live monitoring.
- Person management.
- Camera management.
- Alerts.
- Events.
- Image verification.
- Reports.

### 2.7 Watermarking

Two types of watermarking will be implemented.

#### Visible watermark

Visible metadata drawn directly on the image:

```txt
Date
Time
Camera ID
Event ID
Status
```

#### Invisible watermark

Hidden metadata embedded inside the image:

```txt
Event ID
Camera ID
Timestamp
Status
Hash reference
```

Initial implementation:

```txt
LSB watermarking
```

Advanced improvement:

```txt
DCT watermarking
```

---

## 3. Main System Features

### 3.1 Real-Time Video Surveillance

The system must support video input from:

- Laptop webcam.
- Mobile phone used as an IP camera.
- IP camera URL.
- Pre-recorded video file.

Supported camera source examples:

```txt
0
http://192.168.1.15:8080/video
backend/data/test_videos/demo.mp4
```

### 3.2 Face Detection

The system detects faces in each video frame using MTCNN.

Output:

```txt
Bounding box
Detection confidence
Face crop
Aligned face image
```

### 3.3 Face Recognition

Each detected face is transformed into a FaceNet embedding.

Recognition flow:

```txt
Detected face
↓
Face alignment
↓
Embedding extraction
↓
SVM prediction
↓
Confidence threshold
↓
Identity or UNKNOWN
```

### 3.4 Person Classification

The system classifies people into three categories.

| Category | Condition | System Action |
|---|---|---|
| Authorized | Person recognized and marked authorized | Access event saved |
| Known non-authorized | Person recognized but not authorized | Alert event created |
| Unknown | Face not matched with database | Alarm event created |

### 3.5 Event Capture

For each important detection, the system saves:

- Original image capture.
- Visible watermarked image.
- Invisible watermarked image.
- Event metadata.
- SHA-256 image hash.
- Verification data.

### 3.6 Alert System

Alerts are generated when:

- A known non-authorized person is detected.
- An unknown person is detected.

Alert types:

```txt
WARNING: Known non-authorized person
CRITICAL: Unknown person
```

### 3.7 Authenticity Verification

The system verifies captured images using:

1. SHA-256 hash comparison.
2. Invisible watermark extraction.
3. Database event lookup.
4. Metadata consistency check.

Verification statuses:

```txt
AUTHENTIC
HASH_MISMATCH
WATERMARK_NOT_FOUND
UNKNOWN_EVENT
MODIFIED
```

### 3.8 Reports

The system should provide basic reports:

- Daily detections.
- Authorized accesses.
- Unknown detections.
- Non-authorized alerts.
- Camera activity.
- Watermark verification results.
- Export to CSV.

---

## 4. Global Architecture

```txt
React Dashboard
       ↓
FastAPI Backend
       ↓
Application Services
       ↓
Computer Vision + ML Pipeline
       ↓
PostgreSQL + Image Storage
```

Detailed processing pipeline:

```txt
Camera / Video Source
        ↓
OpenCV Frame Reader
        ↓
MTCNN Face Detection
        ↓
Face Crop + Alignment
        ↓
FaceNet Embedding Extraction
        ↓
SVM Classification
        ↓
Decision Logic
        ↓
Watermarking + Hashing
        ↓
PostgreSQL Event Storage
        ↓
React Dashboard Alert
```

---

## 5. Project Structure

```txt
smart-surveillance-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   │
│   │   ├── models/
│   │   │   ├── person_model.py
│   │   │   ├── camera_model.py
│   │   │   ├── event_model.py
│   │   │   ├── admin_model.py
│   │   │   └── embedding_model.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── person_schema.py
│   │   │   ├── camera_schema.py
│   │   │   ├── event_schema.py
│   │   │   ├── auth_schema.py
│   │   │   └── verification_schema.py
│   │   │
│   │   ├── services/
│   │   │   ├── camera_service.py
│   │   │   ├── detection_service.py
│   │   │   ├── recognition_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── classifier_service.py
│   │   │   ├── watermark_service.py
│   │   │   ├── alert_service.py
│   │   │   ├── hash_service.py
│   │   │   ├── monitoring_service.py
│   │   │   └── report_service.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── persons.py
│   │   │   ├── cameras.py
│   │   │   ├── events.py
│   │   │   ├── monitoring.py
│   │   │   ├── verification.py
│   │   │   └── reports.py
│   │   │
│   │   ├── ml/
│   │   │   ├── face_classifier.pkl
│   │   │   ├── label_encoder.pkl
│   │   │   └── known_embeddings.npy
│   │   │
│   │   └── utils/
│   │       ├── image_utils.py
│   │       ├── security_utils.py
│   │       ├── file_utils.py
│   │       └── time_utils.py
│   │
│   ├── data/
│   │   ├── known_faces/
│   │   ├── captures/
│   │   ├── watermarked/
│   │   ├── temp/
│   │   └── test_videos/
│   │
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
│
├── notebooks/
│   ├── face_model_training_colab.ipynb
│   └── watermark_tests.ipynb
│
├── docs/
│   ├── technical_report.md
│   ├── robustness_report.md
│   ├── gdpr_notes.md
│   └── presentation.pptx
│
└── README.md
```

---

## 6. Backend Specification

### 6.1 Main Modules

#### `main.py`

Application entry point.

Responsibilities:

- Create FastAPI instance.
- Configure CORS.
- Register API routers.
- Expose root health route.

#### `config.py`

Loads environment variables:

```txt
DATABASE_URL
SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES
CAPTURES_DIR
WATERMARKED_DIR
KNOWN_FACES_DIR
TEMP_DIR
```

#### `database.py`

Responsibilities:

- Create PostgreSQL engine.
- Create SQLAlchemy session.
- Provide database dependency.

#### `dependencies.py`

Shared FastAPI dependencies:

- Current admin user.
- Database session.
- Authentication validation.

---

## 7. Database Design

### 7.1 `admins`

Stores dashboard administrator accounts.

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| username | String | Unique username |
| password_hash | String | Hashed password |
| created_at | DateTime | Creation date |

### 7.2 `persons`

Stores known persons.

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| full_name | String | Person name |
| role | String | Role or description |
| access_status | String | AUTHORIZED or NON_AUTHORIZED |
| image_folder | String | Path to stored face images |
| created_at | DateTime | Registration date |

### 7.3 `face_embeddings`

Stores extracted embeddings.

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| person_id | Integer | Related person |
| embedding_json | Text | Embedding vector |
| source_image_path | String | Image used to generate embedding |
| created_at | DateTime | Creation date |

### 7.4 `cameras`

Stores camera/video sources.

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| camera_code | String | Unique camera identifier |
| name | String | Camera name |
| source | String | Webcam index, IP stream URL, or video path |
| location | String | Camera location |
| is_active | Boolean | Camera status |
| created_at | DateTime | Creation date |

### 7.5 `events`

Stores surveillance events.

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| event_code | String | Unique event identifier |
| camera_id | Integer | Related camera |
| person_id | Integer | Related person if known |
| person_name | String | Recognized person name |
| status | String | AUTHORIZED, KNOWN_NON_AUTHORIZED, UNKNOWN |
| confidence | Float | Recognition confidence |
| original_image_path | String | Path to raw capture |
| watermarked_image_path | String | Path to watermarked capture |
| visible_watermark_text | Text | Visible watermark data |
| invisible_watermark_payload | Text | Hidden watermark data |
| image_hash | String | SHA-256 image hash |
| verification_status | String | Verification result |
| created_at | DateTime | Event timestamp |

---

## 8. API Specification

### 8.1 Authentication

```http
POST /api/auth/login
GET  /api/auth/me
```

### 8.2 Persons

```http
POST   /api/persons
GET    /api/persons
GET    /api/persons/{id}
PUT    /api/persons/{id}
DELETE /api/persons/{id}
POST   /api/persons/{id}/images
POST   /api/persons/train
```

### 8.3 Cameras

```http
POST   /api/cameras
GET    /api/cameras
GET    /api/cameras/{id}
PUT    /api/cameras/{id}
DELETE /api/cameras/{id}
```

### 8.4 Monitoring

```http
POST /api/monitoring/start/{camera_id}
POST /api/monitoring/stop/{camera_id}
GET  /api/monitoring/status
GET  /api/monitoring/stream/{camera_id}
```

### 8.5 Events

```http
GET    /api/events
GET    /api/events/{id}
GET    /api/events/alerts
GET    /api/events/today
DELETE /api/events/{id}
```

Supported filters:

```http
GET /api/events?status=UNKNOWN
GET /api/events?camera_id=1
GET /api/events?date=2026-05-08
```

### 8.6 Verification

```http
POST /api/verification/verify-image
GET  /api/verification/event/{event_id}
```

Example verification response:

```json
{
  "hash_match": true,
  "watermark_found": true,
  "status": "AUTHENTIC",
  "payload": {
    "event_code": "EVT-20260508-0001",
    "camera_code": "CAM-001",
    "timestamp": "2026-05-08 15:20:10",
    "status": "UNKNOWN"
  }
}
```

### 8.7 Reports

```http
GET /api/reports/summary
GET /api/reports/daily
GET /api/reports/export/csv
```

---

## 9. Computer Vision and Recognition Pipeline

### 9.1 Camera Input

The system reads frames using OpenCV.

Supported sources:

```txt
Laptop webcam
Phone IP camera
IP camera stream
Uploaded/pre-recorded video
```

### 9.2 Face Detection

MTCNN detects faces and returns:

```txt
x1, y1, x2, y2
confidence
```

### 9.3 Face Embedding

Each detected face is aligned and converted into an embedding vector using FaceNet.

Example:

```txt
face_image → [0.12, -0.45, 0.33, ...]
```

### 9.4 SVM Classification

The SVM classifier predicts the most likely person.

Decision logic:

```txt
if confidence >= threshold:
    recognized person
else:
    UNKNOWN
```

Recommended initial threshold:

```txt
0.65
```

This threshold should be tuned using project test images.

---

## 10. Monitoring Automation

The monitoring service runs a continuous loop:

```txt
Start camera
↓
Read frame
↓
Detect faces
↓
Extract embeddings
↓
Classify identity
↓
Classify authorization status
↓
Create event if needed
↓
Watermark capture
↓
Hash image
↓
Save event in PostgreSQL
↓
Send alert to dashboard
```

### 10.1 Cooldown Logic

To avoid duplicate event spam:

```txt
Same person + same status + same camera
→ Create one event every 10 seconds maximum
```

For unknown persons:

```txt
UNKNOWN + same camera
→ Create one event every 5-10 seconds maximum
```

---

## 11. Watermarking Specification

### 11.1 Visible Watermark

Visible watermark content:

```txt
Event ID: EVT-20260508-0001
Camera: CAM-001
Time: 2026-05-08 15:20:10
Status: UNKNOWN
```

Visible watermark is added using OpenCV.

### 11.2 Invisible Watermark

Invisible watermark payload:

```json
{
  "event_code": "EVT-20260508-0001",
  "camera_code": "CAM-001",
  "timestamp": "2026-05-08 15:20:10",
  "status": "UNKNOWN"
}
```

Initial method:

```txt
LSB watermarking
```

Advanced method:

```txt
DCT watermarking
```

### 11.3 Hashing

The system computes a SHA-256 hash of the final watermarked image.

Purpose:

```txt
Verify exact file integrity.
Detect image modification.
Connect image to database event.
```

Important limitation:

```txt
If the image is compressed or modified, the SHA-256 hash will change.
```

Therefore:

```txt
Hashing proves exact integrity.
Watermarking proves embedded event metadata.
DCT watermarking improves robustness against JPEG compression.
```

---

## 12. React Dashboard Specification

### 12.1 Dashboard Pages

```txt
Login
Dashboard
Live Monitoring
Persons
Cameras
Events
Alerts
Verification
Reports
Settings
```

### 12.2 Dashboard Home

Shows:

```txt
Total persons
Authorized persons
Non-authorized persons
Active cameras
Today’s events
Unknown detections
Alerts
Average FPS
Recent events
```

### 12.3 Live Monitoring Page

Features:

```txt
Select camera
Start monitoring
Stop monitoring
View live stream
Display FPS
Display latest recognition result
Display latest alert
```

### 12.4 Persons Page

Features:

```txt
Add person
Upload face images
Set access status
View registered persons
Edit person
Delete person
Retrain recognition model
```

### 12.5 Cameras Page

Features:

```txt
Add camera
Set camera source
Test camera
Edit camera
Delete camera
Enable/disable camera
```

### 12.6 Events Page

Features:

```txt
List all events
Filter by date
Filter by camera
Filter by status
Open image capture
Verify capture authenticity
Export CSV
```

### 12.7 Alerts Page

Shows:

```txt
UNKNOWN detections
KNOWN_NON_AUTHORIZED detections
Alert images
Timestamp
Camera
Confidence
Verification status
```

### 12.8 Verification Page

Features:

```txt
Upload captured image
Extract invisible watermark
Calculate SHA-256 hash
Compare with stored event
Display authenticity status
```

---

## 13. Frontend Structure

```txt
frontend/src/
│
├── api/
│   ├── axiosClient.js
│   ├── personsApi.js
│   ├── camerasApi.js
│   ├── eventsApi.js
│   ├── monitoringApi.js
│   └── verificationApi.js
│
├── components/
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── StatCard.jsx
│   ├── EventTable.jsx
│   ├── AlertCard.jsx
│   ├── CameraStream.jsx
│   └── PersonForm.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── LiveMonitoring.jsx
│   ├── Persons.jsx
│   ├── Cameras.jsx
│   ├── Events.jsx
│   ├── Alerts.jsx
│   ├── Verification.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
│
├── layouts/
│   └── DashboardLayout.jsx
│
├── hooks/
│
├── context/
│   └── AuthContext.jsx
│
└── App.jsx
```

---

## 14. Development Roadmap

### Phase 0 — Initialization

Tasks:

```txt
Create GitHub repository
Create backend and frontend folders
Set up Python virtual environment
Set up React with Vite
Set up PostgreSQL using Docker
Create .env
```

Deliverable:

```txt
Backend, frontend, and PostgreSQL running.
```

### Phase 1 — Backend and Database

Tasks:

```txt
Create FastAPI app
Connect PostgreSQL
Create SQLAlchemy models
Create schemas
Create CRUD routes for persons and cameras
```

Deliverable:

```txt
API can create persons and cameras.
```

### Phase 2 — Computer Vision

Tasks:

```txt
Implement camera_service
Open webcam/video/IP camera
Implement MTCNN detection
Draw bounding boxes
Save detected face crops
```

Deliverable:

```txt
System detects faces from camera/video.
```

### Phase 3 — Recognition Model

Tasks:

```txt
Collect face images
Extract FaceNet embeddings
Train SVM classifier
Save classifier and label encoder
Build recognition service
```

Deliverable:

```txt
System recognizes known persons and marks others as unknown.
```

### Phase 4 — Event System

Tasks:

```txt
Implement classification logic
Create events in PostgreSQL
Save original captures
Apply visible watermark
Apply invisible LSB watermark
Calculate SHA-256 hash
```

Deliverable:

```txt
Every detection event creates a watermarked proof image and database record.
```

### Phase 5 — Monitoring Automation

Tasks:

```txt
Create monitoring loop
Add start/stop API
Add cooldown logic
Create MJPEG stream endpoint
Send latest alert data to dashboard
```

Deliverable:

```txt
Monitoring can be controlled from the API.
```

### Phase 6 — React Dashboard

Tasks:

```txt
Build dashboard layout
Create login page
Create persons page
Create cameras page
Create live monitoring page
Create events page
Create alerts page
Create verification page
```

Deliverable:

```txt
Full web dashboard connected to backend.
```

### Phase 7 — Testing and Evaluation

Tasks:

```txt
Test laptop webcam
Test phone camera as IP camera
Test video file fallback
Measure FPS
Measure recognition accuracy
Test watermark verification
Test JPEG compression robustness
```

Deliverable:

```txt
Test results ready for technical report.
```

### Phase 8 — Documentation and Presentation

Tasks:

```txt
Write technical report
Write robustness report
Write GDPR notes
Prepare PowerPoint presentation
Record demo video
Finalize README
```

Deliverable:

```txt
Project ready for final defense.
```

---

## 15. Testing Plan

### 15.1 Functional Tests

| Test | Expected Result |
|---|---|
| Add person | Person saved in PostgreSQL |
| Upload face images | Images stored in known_faces |
| Train model | Classifier saved successfully |
| Add camera | Camera source saved |
| Start monitoring | Video stream starts |
| Detect face | Bounding box appears |
| Recognize authorized person | Authorized event saved |
| Recognize non-authorized person | Alert generated |
| Detect unknown person | Alarm generated |
| Verify capture | Authenticity result displayed |

### 15.2 Performance Tests

| Metric | Target |
|---|---|
| FPS | ≥ 15 FPS if possible |
| Detection latency | Acceptable for live demo |
| Recognition latency | Acceptable for live demo |
| Event creation time | Under a few seconds |

### 15.3 Watermark Robustness Tests

Test images after:

```txt
JPEG quality 90
JPEG quality 70
JPEG quality 50
JPEG quality 30
Resize
Crop
Brightness change
```

Check:

```txt
Visible watermark readable?
Invisible watermark extractable?
SHA-256 hash match?
```

Expected:

```txt
Visible watermark survives most transformations.
SHA-256 only matches unchanged files.
LSB watermark is fragile under JPEG compression.
DCT watermarking is recommended for better robustness.
```

---

## 16. Camera Limitation Strategy

The system must support multiple input sources to avoid depending on a dedicated surveillance camera.

### 16.1 Laptop Webcam

```txt
source = 0
```

Use for basic development and quick testing.

### 16.2 Mobile Phone as IP Camera

Use apps such as:

```txt
IP Webcam
DroidCam
Iriun Webcam
Camo
```

Example source:

```txt
http://192.168.1.15:8080/video
```

Use this for a more realistic demo.

### 16.3 Pre-recorded Video

Example:

```txt
backend/data/test_videos/demo.mp4
```

Use this as a reliable backup during final demonstration.

---

## 17. Google Colab Usage

Google Colab can be used for:

```txt
Testing FaceNet/ArcFace models
Extracting embeddings
Training SVM classifier
Evaluating recognition accuracy
Comparing thresholds
Running heavier models if local machine is weak
```

Notebook:

```txt
notebooks/face_model_training_colab.ipynb
```

Dataset structure:

```txt
known_faces/
├── Person_A/
│   ├── img1.jpg
│   ├── img2.jpg
│   └── img3.jpg
├── Person_B/
│   ├── img1.jpg
│   └── img2.jpg
└── Person_C/
    ├── img1.jpg
    └── img2.jpg
```

Recommended minimum:

```txt
5 images per person
```

Better:

```txt
10-20 images per person
```

---

## 18. Security and GDPR Considerations

Because the system processes biometric data, the following rules should be respected:

```txt
Admin login is required.
Passwords are hashed.
Only admins can add/delete persons.
Images are stored securely.
Biometric data is used only for the declared purpose.
Persons can be deleted from the system.
Captured images are retained only as surveillance proof.
The system avoids unnecessary data collection.
Access to events and captures is restricted.
The project is marked as academic/demo use.
```

---

## 19. Final Deliverables

The final project should include:

```txt
Functional surveillance application
Backend source code
React dashboard source code
PostgreSQL schema/migrations
Test videos
Technical report
Watermark robustness report
GDPR/privacy notes
README installation guide
PowerPoint presentation
Demo video
```

---

## 20. Presentation Plan

Suggested 14-slide structure:

```txt
1. Title
2. Context and problem
3. Project objectives
4. Functional requirements
5. Global architecture
6. Technology stack
7. Face detection with MTCNN
8. Face recognition with FaceNet embeddings + SVM
9. Classification logic
10. Watermarking and authenticity verification
11. PostgreSQL database design
12. React dashboard
13. Tests and results
14. Conclusion and future improvements
```

---

## 21. MVP Scope

The first complete version should include:

```txt
FastAPI backend
PostgreSQL database
React dashboard
Camera/video source support
MTCNN face detection
FaceNet embeddings
SVM classifier
Authorized/non-authorized/unknown classification
Visible watermark
LSB invisible watermark
SHA-256 hash
Event storage
Live monitoring page
Events page
Verification page
```

---

## 22. Advanced Improvements

After the MVP works, add:

```txt
ArcFace embeddings
DCT watermarking
WebSocket real-time alerts
Email or Telegram notifications
Dockerized full deployment
Role-based access control
Advanced analytics
Face anti-spoofing
Multi-camera concurrent monitoring
```

---

## 23. Implementation Priority Checklist

Build in this order:

```txt
1. Backend runs.
2. PostgreSQL connects.
3. Persons CRUD works.
4. Cameras CRUD works.
5. Webcam/video opens.
6. MTCNN detects faces.
7. FaceNet extracts embeddings.
8. SVM classifier trains.
9. Recognition works on images.
10. Recognition works on video.
11. Events are saved.
12. Images are captured.
13. Visible watermark works.
14. SHA-256 hashing works.
15. LSB invisible watermark works.
16. Monitoring start/stop works.
17. React dashboard displays data.
18. React dashboard controls monitoring.
19. Verification page works.
20. Reports and demo are prepared.
```

---

## 24. Key Technical Risks

| Risk | Mitigation |
|---|---|
| Low FPS | Resize frames, process every Nth frame, use lightweight model |
| Weak laptop | Use Colab for training and local app only for inference |
| Camera unavailable | Support video file and phone IP camera |
| Recognition errors | Collect more images and tune confidence threshold |
| Duplicate alerts | Add cooldown logic |
| LSB watermark fragile | Document limitation and add DCT as improvement |
| Hash mismatch after compression | Explain hash verifies exact file integrity only |
| GDPR concerns | Add admin access, deletion, purpose limitation, and privacy notes |

---

## 25. Final System Summary

The Smart Surveillance Platform is a modern web-based video surveillance system. It uses FastAPI as the backend, React as the dashboard, PostgreSQL as the database, OpenCV for video processing, MTCNN for face detection, FaceNet embeddings with SVM for face recognition, and visible plus invisible watermarking for proof image authenticity.

The final system will allow an administrator to manage persons and cameras, start live monitoring, detect and recognize faces, classify detected individuals, create watermarked evidence captures, generate alerts, store events, and verify image authenticity through a dedicated dashboard.
