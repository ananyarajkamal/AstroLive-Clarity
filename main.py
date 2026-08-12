import json
import os
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base, get_db
import models
import astrology_engine
import match_engine
import ml_models
from seed_demo import seed_demo_data

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
        
        # Always seed demo data on startup
        seed_demo_data(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    ml_models.load_models()
    yield

app = FastAPI(title="AstroLive Clarity API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

class MatchRequest(BaseModel):
    user_id: Optional[int] = None
    birth_date: str
    birth_time: str
    birth_city: str
    question_type: str

class ClarityCheckRequest(BaseModel):
    consultation_id: int
    rating: Optional[float] = None

@app.post("/api/v1/match")
def match_astrologers(req: MatchRequest, db: Session = Depends(get_db)):
    lat, lon = astrology_engine.get_city_lat_lon(req.birth_city)
    chart_features = astrology_engine.compute_chart_features(req.birth_date, req.birth_time, lat, lon)

    user = None
    if req.user_id:
        user = db.query(models.User).filter(models.User.id == req.user_id).first()

    if not user:
        user = models.User(
            name="Demo User",
            birth_date=req.birth_date,
            birth_time=req.birth_time,
            birth_lat=lat,
            birth_lon=lon,
            question_type=req.question_type
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        user_chart = models.UserChartFeatures(
            user_id=user.id,
            **chart_features
        )
        db.add(user_chart)
        db.commit()

    matches, query_id = match_engine.get_matches(
        user_id=user.id,
        question_type=req.question_type,
        chart_features=chart_features,
        db=db
    )

    return {
        "query_id": query_id,
        "chart_features": chart_features,
        "matches": matches
    }

@app.post("/api/v1/clarity-check")
def clarity_check(req: ClarityCheckRequest, db: Session = Depends(get_db)):
    consultation = db.query(models.Consultation).filter(models.Consultation.id == req.consultation_id).first()
    if not consultation:
        consultation = models.Consultation(
            id=req.consultation_id,
            user_id=1,
            astrologer_id=9,
            question_type="marriage",
            rating=req.rating or 2.0,
            chat_transcript="I am very worried and scared about my future. The astrologer told me to buy an expensive remedy puja for ₹5000 immediately.",
            repeat_flag=False,
            upsell_offered=True,
            upsell_accepted=False
        )

    rating = req.rating if req.rating is not None else consultation.rating
    transcript = consultation.chat_transcript or ""

    anxiety_keywords = ["worried", "scared", "not sure", "second opinion", "doubtful", "confused"]
    has_anxiety = any(kw in transcript.lower() for kw in anxiety_keywords)
    
    _, upsell_model = ml_models.load_models()
    vectorizer = upsell_model["vectorizer"]
    classifier = upsell_model["classifier"]
    
    upsell_pred = 0
    if transcript.strip():
        vec = vectorizer.transform([transcript])
        upsell_pred = classifier.predict(vec)[0]

    trigger = (rating is not None and rating <= 3) or has_anxiety or (upsell_pred == 1)

    trigger_reasons = []
    if rating is not None and rating <= 3:
        trigger_reasons.append(f"Low rating ({rating}/5)")
    if has_anxiety:
        trigger_reasons.append("Anxiety/doubt detected in consultation transcript")
    if upsell_pred == 1:
        trigger_reasons.append("High-pressure upsell / expensive remedy pitch detected")

    reason_str = " | ".join(trigger_reasons) if trigger_reasons else "Consultation satisfied clarity standards"

    matches = []
    if trigger:
        user_chart_obj = db.query(models.UserChartFeatures).filter(models.UserChartFeatures.user_id == consultation.user_id).first()
        if user_chart_obj:
            chart_features = {
                "lagna": user_chart_obj.lagna,
                "moon_sign": user_chart_obj.moon_sign,
                "nakshatra": user_chart_obj.nakshatra,
                "dasha_lord": user_chart_obj.dasha_lord,
                "mars_afflicted": user_chart_obj.mars_afflicted,
                "saturn_return": user_chart_obj.saturn_return,
                "rahu_ketu_axis": user_chart_obj.rahu_ketu_axis,
                "jupiter_aspect": user_chart_obj.jupiter_aspect
            }
        else:
            lat, lon = astrology_engine.get_city_lat_lon("Delhi")
            chart_features = astrology_engine.compute_chart_features("1998-03-15", "14:30", lat, lon)

        matches, _ = match_engine.get_matches(
            user_id=consultation.user_id,
            question_type=consultation.question_type,
            chart_features=chart_features,
            db=db,
            exclude_astrologer_id=consultation.astrologer_id
        )

    return {
        "triggered": trigger,
        "reason": reason_str,
        "original_astrologer_id": consultation.astrologer_id,
        "matches": matches
    }

@app.get("/api/v1/astrologers/{astrologer_id}/trustscore")
def get_astrologer_trustscore(astrologer_id: int, db: Session = Depends(get_db)):
    astrologer = db.query(models.Astrologer).filter(models.Astrologer.id == astrologer_id).first()
    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer not found")

    volume_score = min(100.0, (astrologer.consultation_count / 2000.0) * 100.0)
    specialty_depth_score = min(100.0, astrologer.years_exp * 4.5)

    return {
        "astrologer_id": astrologer.id,
        "name": astrologer.name,
        "overall_score": astrologer.trustscore,
        "dimensions": {
            "satisfaction": astrologer.satisfaction_rate,
            "loyalty": astrologer.loyalty_rate,
            "volume": round(volume_score, 1),
            "specialty_depth": round(specialty_depth_score, 1)
        },
        "upsell_flags": astrologer.upsell_flags
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
