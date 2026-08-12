import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
import ml_models

# Load global models
ranker, upsell_model = ml_models.load_models()

QUESTION_TYPES = ["marriage", "career", "health", "property"]

def generate_reason(astrologer, question_type: str, chart_features: dict) -> str:
    reasons = []
    if question_type in astrologer.specialties:
        reasons.append(f"Specialist in {question_type}")
    if chart_features.get("mars_afflicted") and question_type == "marriage":
        reasons.append("Top match for Manglik / Mars-afflicted birth charts")
    if chart_features.get("saturn_return") and question_type == "career":
        reasons.append("Expert in Saturn transit career guidance")
    if astrologer.trustscore >= 90:
        reasons.append(f"High credibility TrustScore ({astrologer.trustscore})")
    if astrologer.upsell_flags == 0:
        reasons.append("Zero pushy upsell reports")
    
    if not reasons:
        reasons.append(f"{astrologer.years_exp} years experience with high rating")
        
    return " • ".join(reasons[:2])

def get_matches(user_id: int, question_type: str, chart_features: dict, db: Session, exclude_astrologer_id: int = None):
    # Check cache in DB (if valid within 1 hour)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    if user_id:
        cached = db.query(models.MatchResult).filter(
            models.MatchResult.user_id == user_id,
            models.MatchResult.question_type == question_type,
            models.MatchResult.created_at >= one_hour_ago
        ).order_by(models.MatchResult.created_at.desc()).first()
        
        if cached and not exclude_astrologer_id:
            return cached.results, cached.query_id

    astrologers = db.query(models.Astrologer).all()
    if exclude_astrologer_id:
        astrologers = [a for a in astrologers if a.id != exclude_astrologer_id]

    if not astrologers:
        return [], str(uuid.uuid4())

    q_type_idx = QUESTION_TYPES.index(question_type) if question_type in QUESTION_TYPES else 0
    
    X_list = []
    for ast in astrologers:
        spec_match = 1 if question_type in ast.specialties else 0
        X_list.append({
            "mars_afflicted": 1 if chart_features.get("mars_afflicted") else 0,
            "saturn_return": 1 if chart_features.get("saturn_return") else 0,
            "jupiter_aspect": 1 if chart_features.get("jupiter_aspect") else 0,
            "q_type": q_type_idx,
            "years_exp": ast.years_exp,
            "trustscore": ast.trustscore,
            "upsell_flags": ast.upsell_flags,
            "spec_match": spec_match
        })

    X_df = pd.DataFrame(X_list)
    raw_scores = ranker.predict(X_df)
    
    # Min-max normalize scores to 0.50 - 0.99 range for match_score
    if len(raw_scores) > 1 and (raw_scores.max() - raw_scores.min()) > 0:
        norm_scores = 0.50 + 0.49 * (raw_scores - raw_scores.min()) / (raw_scores.max() - raw_scores.min())
    else:
        norm_scores = np.full(len(raw_scores), 0.85)

    ranked_indices = np.argsort(-norm_scores)
    
    matches = []
    for rank_idx, idx in enumerate(ranked_indices[:3], start=1):
        ast = astrologers[idx]
        score = float(round(norm_scores[idx], 2))
        reason = generate_reason(ast, question_type, chart_features)
        
        matches.append({
            "rank": rank_idx,
            "astrologer_id": ast.id,
            "name": ast.name,
            "specialty": ast.specialties,
            "match_score": score,
            "trustscore": ast.trustscore,
            "price_per_min": ast.price_per_min,
            "reason": reason,
            "profile_image_url": ast.profile_image_url
        })

    query_id = str(uuid.uuid4())
    # Save match cache if user_id present
    if user_id and not exclude_astrologer_id:
        db_match = models.MatchResult(
            query_id=query_id,
            user_id=user_id,
            question_type=question_type,
            results=matches
        )
        db.add(db_match)
        db.commit()

    return matches, query_id
