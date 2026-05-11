# Smart Surveillance Platform

> Full-stack surveillance platform with AI-powered face recognition, real-time monitoring, event management, reporting, and image authenticity verification.

## Overview

This repository contains the complete Smart Surveillance Platform:

- **Backend**: FastAPI + PostgreSQL + JWT authentication + WebSocket monitoring
- **Frontend**: React + Vite + TypeScript dashboard
- **AI / CV pipeline**: face detection, embedding generation, and recognition
- **Security features**: watermarking, hashing, and authenticity verification
- **Analytics**: event summaries, filters, and reports

## Key Features

- Real-time video/event monitoring
- JWT login with access and refresh tokens
- CRUD management for persons, cameras, and events
- WebSocket broadcasting for live updates
- Image watermarking and SHA-256 integrity checks
- Verification endpoint for face recognition and authenticity checks
- Reports and dashboard visualizations

## Repository Structure

```text
smart-surveillance-platform/
├── backend/              # FastAPI application, database, tests, scripts
├── frontend/             # React dashboard
├── docs/                 # Project documentation and implementation notes
├── LICENSE               # MIT license
└── README.md             # Project overview and setup
```

## Requirements

### Backend

- Python 3.10+
- PostgreSQL 14+
- `pip` / virtual environment support

### Frontend

- Node.js 18+
- npm

## Configuration

### Backend environment variables

Create `backend/.env` with values similar to:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/smart_surveillance
SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend environment variables

Create `frontend/.env.local` (or `frontend/.env`) with:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Quick Start

The recommended workflow is to run the backend and frontend in separate terminals.

### 1) Backend

```powershell
Set-Location D:\projects\smart-surveillance-platform\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts\db_manager.py init
python scripts\db_manager.py bootstrap-admin
uvicorn app.main:app --reload
```

Backend URLs:

- API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2) Frontend

```powershell
Set-Location D:\projects\smart-surveillance-platform\frontend
npm install
npm run dev
```

Frontend URL:

- Dashboard: `http://localhost:3000`

## Docker

The backend folder includes a `docker-compose.yml` that starts PostgreSQL and the FastAPI service:

```powershell
Set-Location D:\projects\smart-surveillance-platform\backend
docker-compose up -d
```

You can also build and run the backend image manually from `backend/`:

```powershell
docker build -t surveillance-backend .
docker run -p 8000:8000 surveillance-backend
```

## Testing

### Backend tests

```powershell
Set-Location D:\projects\smart-surveillance-platform\backend
pytest tests -q
```

### Frontend checks

```powershell
Set-Location D:\projects\smart-surveillance-platform\frontend
npm run build
npm run lint
```

## Main Backend Areas

- `app/routes/` — API endpoints for auth, persons, cameras, events, monitoring, verification, and reports
- `app/models/` — SQLAlchemy database models
- `app/services/` — business logic, including monitoring and authentication helpers
- `app/ml/` — trained face-recognition artifacts
- `scripts/db_manager.py` — database initialization and admin bootstrap utilities
- `tests/` — automated backend test suite

## Main Frontend Pages

- Login
- Dashboard
- Live Monitoring
- Events
- Alerts
- Persons
- Cameras
- Verification
- Reports
- Settings

## Troubleshooting

- **Database connection fails**: confirm PostgreSQL is running and `DATABASE_URL` matches your local setup.
- **CORS errors**: ensure the backend is running and the frontend uses the correct `VITE_API_BASE_URL`.
- **WebSocket connection issues**: verify the backend is accessible at `http://localhost:8000` and the monitoring endpoint is available.
- **Login fails immediately**: make sure an admin account has been created with `python scripts\db_manager.py bootstrap-admin`.

## Documentation

Additional details are available in `docs/`, including implementation notes, status reports, and technical summaries.

## License

This project is licensed under the MIT License. See `LICENSE` for full text.


