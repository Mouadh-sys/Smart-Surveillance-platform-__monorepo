from app.main import app


def test_reports_routes_registered():
    report_routes = [route for route in app.routes if getattr(route, "path", None) and "/api/reports" in route.path]
    assert report_routes, "Expected reports routes to be registered"
