# Smart Surveillance Platform Backend

## Structure

- `app/`: source FastAPI application
- `data/`: local storage folders for captures, known faces, and temporary files
- `migrations/`: database migrations placeholder
- `tests/`: automated tests

## Run locally

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

Run tests:

```powershell
pytest
```
