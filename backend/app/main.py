from fastapi import FastAPI

from app.routes import auth, cameras, events, monitoring, persons, reports, verification

app = FastAPI(title="Smart Surveillance Platform")

app.include_router(auth.router)
app.include_router(persons.router)
app.include_router(cameras.router)
app.include_router(events.router)
app.include_router(monitoring.router)
app.include_router(verification.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    return {"message": "Smart Surveillance Platform API"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
