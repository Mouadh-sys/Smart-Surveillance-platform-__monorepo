import asyncio
from app.services.stream_service import start_stream

# Test if stream can start with camera 0 (webcam)
result = start_stream(1, "0")
print(f"Stream start result: {result}")

