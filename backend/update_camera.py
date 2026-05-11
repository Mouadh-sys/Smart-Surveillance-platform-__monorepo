from app.database import SessionLocal
from app.models.camera_model import Camera

db = SessionLocal()
camera = db.query(Camera).filter(Camera.id == 1).first()
if camera:
    # Update source to use webcam (index 0)
    camera.source = "0"
    db.commit()
    print(f"Updated camera {camera.id}: {camera.name}")
    print(f"New source: {camera.source}")
else:
    print("Camera not found")
db.close()

