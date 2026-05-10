#!/usr/bin/env python
"""Database migration management script for Smart Surveillance Platform."""

import sys
import logging
from pathlib import Path
from hashlib import sha256
from sqlalchemy import inspect, text
from sqlalchemy.orm import sessionmaker

# Add backend dir to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.database import Base, engine
from app.models import admin_model, camera_model, embedding_model, event_model, person_model
from app.models.admin_model import Admin
from app.services.auth_service import get_password_hash, PasswordTooLongError, validate_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def print_usage():
    print("Usage: python db_manager.py [command]")
    print("\nCommands:")
    print("  init          - Initialize database with tables")
    print("  check         - Check database connection")
    print("  list-tables   - List all tables and columns")
    print("  reset         - Drop all tables and recreate (WARNING!)")
    print("  sample-data   - Create sample camera and persons")
    print("  bootstrap-admin [username] [password] - Create first admin account")
    print("\nExample:")
    print("  python db_manager.py init")


def init_db():
    """Initialize database with all tables."""
    logger.info(f"Initializing database: {settings.database_url}")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False


def check_db_connection():
    """Check database connection."""
    logger.info(f"Checking connection to: {settings.database_url}")

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
            return True
    except Exception as e:
        logger.error(f"❌ Connection failed: {e}")
        return False


def list_tables():
    """List all tables in the database."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if not tables:
            logger.info("No tables found in database")
            return

        logger.info(f"Found {len(tables)} tables:")
        for table_name in tables:
            columns = inspector.get_columns(table_name)
            logger.info(f"  📋 {table_name}")
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                logger.info(f"     - {col['name']}: {col['type']} [{nullable}]")
    except Exception as e:
        logger.error(f"Error listing tables: {e}")


def reset_db():
    """Drop all tables and recreate them."""
    logger.warning("⚠️  RESETTING DATABASE - This will delete all data!")

    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Dropped all tables")

        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database reset complete - tables recreated")
        return True
    except Exception as e:
        logger.error(f"❌ Error resetting database: {e}")
        return False


def _cli_password_hash(password: str) -> str:
    """Hash password for CLI operations using the application's standard hashing method."""
    return get_password_hash(password)


def bootstrap_admin(username: str = "mouadh", password: str = "mou@123"):
    """Create the first admin account if none exists."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        validate_password(password)
        existing_admin = db.query(Admin).first()
        if existing_admin:
            logger.info("An admin account already exists")
            return True

        admin = Admin(username=username, password_hash=_cli_password_hash(password))
        db.add(admin)
        db.commit()
        db.refresh(admin)

        logger.info("✅ Admin account created successfully")
        logger.info(f"   - Username: {admin.username}")
        logger.info("   - Password: [hidden]")
        return True
    except PasswordTooLongError as e:
        logger.error(f"❌ {e}")
        return False
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creating admin account: {e}")
        return False
    finally:
        db.close()


def create_sample_data():
    """Create sample data for testing."""
    from sqlalchemy.orm import sessionmaker
    from app.models.camera_model import Camera
    from app.models.person_model import Person

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Create sample camera
        camera = Camera(
            camera_code="CAM_001",
            name="Main Entrance",
            source="0",  # Webcam
            location="Building A - Entry",
            is_active=True
        )
        db.add(camera)

        # Create sample persons
        person1 = Person(
            full_name="John Doe",
            role="Employee",
            access_status="AUTHORIZED"
        )
        person2 = Person(
            full_name="Jane Smith",
            role="Visitor",
            access_status="NON_AUTHORIZED"
        )
        db.add(person1)
        db.add(person2)

        db.commit()
        logger.info("✅ Sample data created successfully")
        logger.info("   - Camera: CAM_001 (Main Entrance)")
        logger.info("   - Person: John Doe (AUTHORIZED)")
        logger.info("   - Person: Jane Smith (NON_AUTHORIZED)")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creating sample data: {e}")
        return False
    finally:
        db.close()


def main():
    """Main CLI."""
    if len(sys.argv) < 2 or sys.argv[1] in {"-h", "--help", "help"}:
        print_usage()
        sys.exit(0 if len(sys.argv) >= 2 else 1)

    command = sys.argv[1]

    if command == "init":
        success = init_db()
    elif command == "check":
        success = check_db_connection()
    elif command == "list-tables":
        list_tables()
        success = True
    elif command == "reset":
        confirm = input("Are you sure? Type 'yes' to confirm: ")
        if confirm.lower() == "yes":
            success = reset_db()
        else:
            logger.info("Reset cancelled")
            success = True
    elif command == "sample-data":
        success = create_sample_data()
    elif command == "bootstrap-admin":
        username = sys.argv[2] if len(sys.argv) > 2 else "mouadh"
        password = sys.argv[3] if len(sys.argv) > 3 else "mou@123"
        success = bootstrap_admin(username=username, password=password)
    else:
        logger.error(f"Unknown command: {command}")
        success = False

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
