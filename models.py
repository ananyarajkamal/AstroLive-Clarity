from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)
    birth_time = Column(String, nullable=False)
    birth_lat = Column(Float, nullable=False)
    birth_lon = Column(Float, nullable=False)
    question_type = Column(String, nullable=False)

    consultations = relationship("Consultation", back_populates="user")
    chart_features = relationship("UserChartFeatures", back_populates="user", uselist=False)

class Astrologer(Base):
    __tablename__ = "astrologers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    years_exp = Column(Integer, nullable=False)
    specialties = Column(JSON, nullable=False)  # List of strings
    languages = Column(JSON, nullable=False)    # List of strings
    price_per_min = Column(Float, nullable=False)
    trustscore = Column(Float, nullable=False)
    satisfaction_rate = Column(Float, nullable=False)
    loyalty_rate = Column(Float, nullable=False)
    consultation_count = Column(Integer, nullable=False)
    upsell_flags = Column(Integer, nullable=False)
    profile_image_url = Column(String, nullable=True)

    consultations = relationship("Consultation", back_populates="astrologer")

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    astrologer_id = Column(Integer, ForeignKey("astrologers.id"), nullable=False)
    question_type = Column(String, nullable=False)
    rating = Column(Float, nullable=True)
    chat_transcript = Column(String, nullable=True)
    repeat_flag = Column(Boolean, default=False)
    upsell_offered = Column(Boolean, default=False)
    upsell_accepted = Column(Boolean, default=False)

    user = relationship("User", back_populates="consultations")
    astrologer = relationship("Astrologer", back_populates="consultations")

class UserChartFeatures(Base):
    __tablename__ = "user_chart_features"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lagna = Column(String, nullable=False)
    moon_sign = Column(String, nullable=False)
    nakshatra = Column(String, nullable=False)
    dasha_lord = Column(String, nullable=False)
    mars_afflicted = Column(Boolean, default=False)
    saturn_return = Column(Boolean, default=False)
    rahu_ketu_axis = Column(String, nullable=False)
    jupiter_aspect = Column(Boolean, default=False)

    user = relationship("User", back_populates="chart_features")

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question_type = Column(String, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
