#!/usr/bin/env python
"""Quick startup test for Smart Surveillance Backend"""

import sys
import logging
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_imports():
    """Test that all core modules can be imported"""
    logger.info("Testing imports...")

    try:
        from app.main import app
        logger.info("✅ Main app imports successfully")
    except ImportError as e:
        logger.error(f"❌ Failed to import app: {e}")
        return False

    try:
        from app.services.stream_service import start_stream, stop_stream
        logger.info("✅ Stream service imports successfully")
    except ImportError as e:
        logger.error(f"❌ Failed to import stream_service: {e}")
        return False

    try:
        from app.services.monitoring_service import start_monitoring_camera
        logger.info("✅ Monitoring service imports successfully")
    except ImportError as e:
        logger.error(f"❌ Failed to import monitoring_service: {e}")
        return False

    try:
        from app.routes.monitoring import router as monitoring_router
        logger.info("✅ Monitoring routes import successfully")
    except ImportError as e:
        logger.error(f"❌ Failed to import monitoring routes: {e}")
        return False

    return True


def test_app_routes():
    """Test that app has all expected routes"""
    logger.info("Testing app routes...")

    from app.main import app

    routes = [route.path for route in app.routes]

    expected_prefixes = [
        "/api/auth",
        "/api/persons",
        "/api/cameras",
        "/api/events",
        "/api/monitoring",
        "/api/verification",
    ]

    missing = []
    for prefix in expected_prefixes:
        found = any(prefix in route for route in routes)
        if found:
            logger.info(f"✅ Found routes with prefix: {prefix}")
        else:
            logger.warning(f"⚠️  No routes found with prefix: {prefix}")
            missing.append(prefix)

    logger.info(f"Total routes: {len(routes)}")
    return len(missing) == 0


def test_database_models():
    """Test that database models are importable"""
    logger.info("Testing database models...")

    try:
        from app.models.camera_model import Camera
        from app.models.person_model import Person
        from app.models.event_model import Event
        from app.models.embedding_model import Embedding
        from app.models.admin_model import Admin

        logger.info("✅ All database models import successfully")
        return True
    except ImportError as e:
        logger.error(f"❌ Failed to import models: {e}")
        return False


def test_services():
    """Test that all services are importable"""
    logger.info("Testing services...")

    services = [
        "embedding_service",
        "detection_service",
        "recognition_service",
        "watermark_service",
        "hash_service",
        "event_service",
        "alert_service",
        "camera_service",
        "classifier_service",
        "monitoring_service",
        "stream_service",
    ]

    failed = []
    for service_name in services:
        try:
            __import__(f"app.services.{service_name}")
            logger.info(f"✅ {service_name} imports successfully")
        except ImportError as e:
            logger.warning(f"⚠️  {service_name} failed: {e}")
            failed.append(service_name)

    return len(failed) == 0


def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("Smart Surveillance Backend - Startup Test")
    logger.info("=" * 60)

    tests = [
        ("Imports", test_imports),
        ("App Routes", test_app_routes),
        ("Database Models", test_database_models),
        ("Services", test_services),
    ]

    results = []
    for test_name, test_func in tests:
        logger.info(f"\n[{test_name}]")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ Test {test_name} failed with exception: {e}")
            results.append((test_name, False))

    logger.info("\n" + "=" * 60)
    logger.info("Test Results:")
    logger.info("=" * 60)

    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if not result:
            all_passed = False

    logger.info("=" * 60)

    if all_passed:
        logger.info("✅ All startup tests passed!")
        logger.info("\nYou can now start the server with:")
        logger.info("  uvicorn app.main:app --reload")
        logger.info("\nAPI will be available at:")
        logger.info("  http://localhost:8000")
        logger.info("  http://localhost:8000/docs (Swagger UI)")
        return 0

    logger.error("❌ Some tests failed. Please fix the errors above.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
