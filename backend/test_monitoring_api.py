"""
Test script to verify the camera monitoring API endpoint
"""
import asyncio
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.admin_model import Admin
from app.services.auth_service import create_access_token

# Create test client
client = TestClient(app)

# Create or get admin user for testing
db = SessionLocal()
admin = db.query(Admin).filter(Admin.username == "admin").first()
if not admin:
    admin = Admin(username="admin", password_hash="test")
    db.add(admin)
    db.commit()
    db.refresh(admin)
db.close()

# Get JWT token
token = create_access_token(data={"sub": admin.username})

print(f"Using token: {token[:50]}...")
print(f"Testing POST /api/monitoring/cameras/1/start")

# Test the endpoint
response = client.post(
    "/api/monitoring/cameras/1/start",
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")


