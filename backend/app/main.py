from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routes import persons, cameras, events, monitoring, verification, auth, reports
from app.services.monitoring_service import start_all_cameras, stop_all_cameras

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Surveillance Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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


@app.on_event("startup")
async def startup_event():
    """Initialize monitoring streams on startup."""
    logger.info("Starting up Smart Surveillance Platform")
    # Note: Uncomment to auto-start all cameras on startup
    # result = start_all_cameras()
    # logger.info(f"Startup monitoring result: {result}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup monitoring streams on shutdown."""
    logger.info("Shutting down Smart Surveillance Platform")
    result = stop_all_cameras()
    logger.info(f"Shutdown monitoring result: {result}")


@app.get("/")
def root():
    return {"message": "Smart Surveillance API is running"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Smart Surveillance Platform"
    }
