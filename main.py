import json
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import engine, SessionLocal, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Astrologer).count() == 0:
            seed_file_path = os.path.join(os.path.dirname(__file__), "data", "seed_data.json")
            if os.path.exists(seed_file_path):
                with open(seed_file_path, "r", encoding="utf-8") as f:
                    astrologers_data = json.load(f)
                    for item in astrologers_data:
                        astrologer = models.Astrologer(**item)
                        db.add(astrologer)
                db.commit()
                print("Seeded database with initial astrologers data.")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield

app = FastAPI(title="AstroLive Clarity API", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
