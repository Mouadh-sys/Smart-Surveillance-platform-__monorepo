from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import persons, cameras, events, monitoring, verification, auth, reports

app = FastAPI(title="Smart Surveillance Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(persons.router, prefix="/api/persons", tags=["Persons"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["Monitoring"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "Smart Surveillance API is running"}