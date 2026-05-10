from app.main import app


def test_auth_refresh_logout_endpoints_registered():
    auth_routes = [route for route in app.routes if getattr(route, "path", None) and "/api/auth" in route.path]
    route_paths = [route.path for route in auth_routes if getattr(route, "path", None)]
    assert len(auth_routes) >= 4, f"Expected at least 4 auth routes, got {len(auth_routes)}: {route_paths}"
