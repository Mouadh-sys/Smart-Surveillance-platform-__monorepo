from app.main import app

paths = [getattr(r, 'path', None) for r in app.routes if hasattr(r, 'path')]
print('route_count=', len(paths))
print('auth_routes=', [p for p in paths if p and p.startswith('/api/auth')])
print('protected_routes=', [p for p in paths if p and p.startswith('/api/cameras')][:3])
