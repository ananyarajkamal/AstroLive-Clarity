import json
import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models
import astrology_engine
import match_engine

def seed_demo_data(db: Session):
    Base.metadata.create_all(bind=engine)

    priya = db.query(models.User).filter(models.User.name == "Priya").first()
    if not priya:
        lat, lon = astrology_engine.get_city_lat_lon("Delhi")
        chart_features = astrology_engine.compute_chart_features("1998-03-15", "14:30", lat, lon)

        priya = models.User(
            name="Priya",
            birth_date="1998-03-15",
            birth_time="14:30",
            birth_lat=lat,
            birth_lon=lon,
            question_type="marriage"
        )
        db.add(priya)
        db.commit()
        db.refresh(priya)

        priya_chart = models.UserChartFeatures(
            user_id=priya.id,
            **chart_features
        )
        db.add(priya_chart)
        db.commit()

        rajesh = db.query(models.Astrologer).filter(models.Astrologer.id == 1).first()
        if rajesh:
            consultation = models.Consultation(
                id=99,
                user_id=priya.id,
                astrologer_id=rajesh.id,
                question_type="marriage",
                rating=2.0,
                chat_transcript="Your Rahu is severely afflicted in 7th house! Marriage is under heavy dark dosha. Only solution is an urgent Mahamrityunjaya Puja & Gemstone ritual costing ₹5000. You must do this immediately today!",
                repeat_flag=False,
                upsell_offered=True,
                upsell_accepted=False
            )
            db.add(consultation)
            db.commit()

        match_engine.get_matches(
            user_id=priya.id,
            question_type="marriage",
            chart_features=chart_features,
            db=db
        )
        print("Demo data seeded for user Priya.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
