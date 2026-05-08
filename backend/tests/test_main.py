from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Smart Surveillance Platform API"}


def test_hello():
    response = client.get("/hello/Alice")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello Alice"}
