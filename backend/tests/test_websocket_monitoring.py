from app.main import app
from app.routes import monitoring


def test_monitoring_websocket_module_imported():
    assert monitoring.router is not None
    assert app is not None
