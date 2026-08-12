import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import lightgbm as lgb

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
RANKER_PATH = os.path.join(MODELS_DIR, "ranker.pkl")
UPSELL_PATH = os.path.join(MODELS_DIR, "upsell_classifier.pkl")

# Feature encodings
QUESTION_TYPES = ["marriage", "career", "health", "property"]
SPECIALTIES = ["marriage", "career", "health", "property"]

def train_ranking_model():
    os.makedirs(MODELS_DIR, exist_ok=True)
    np.random.seed(42)
    n_queries = 500  # 500 users
    astrologers_per_query = 10
    total_samples = n_queries * astrologers_per_query

    query_ids = np.repeat(np.arange(n_queries), astrologers_per_query)
    
    # Synthetic user features
    mars_afflicted = np.random.choice([0, 1], size=total_samples)
    saturn_return = np.random.choice([0, 1], size=total_samples)
    jupiter_aspect = np.random.choice([0, 1], size=total_samples)
    q_type_idx = np.repeat(np.random.choice(4, size=n_queries), astrologers_per_query)
    
    # Synthetic astrologer features
    years_exp = np.random.randint(2, 30, size=total_samples)
    trustscore = np.random.uniform(40, 98, size=total_samples)
    upsell_flags = np.random.randint(0, 12, size=total_samples)
    astrologer_spec_match = np.random.choice([0, 1], size=total_samples, p=[0.4, 0.6])

    # Target calculation: 0.4*rating + 0.3*repeat + 0.2*completion + 0.1*tip
    # Build synthetic positive affinity when specialty matches and trustscore is high
    base_score = (
        0.3 * astrologer_spec_match +
        0.4 * (trustscore / 100.0) -
        0.2 * (upsell_flags / 12.0) +
        0.1 * (years_exp / 30.0) +
        np.random.normal(0, 0.1, size=total_samples)
    )
    
    ratings = np.clip(3.0 + 2.0 * base_score, 1.0, 5.0)
    repeats = (base_score > 0.4).astype(float)
    completions = np.clip(0.5 + 0.5 * base_score, 0.0, 1.0)
    tips = (base_score > 0.6).astype(float)

    utility_score = 0.4 * (ratings / 5.0) + 0.3 * repeats + 0.2 * completions + 0.1 * tips
    # Convert to relevance grades 0 to 4 for LambdaRank
    relevance = pd.qcut(utility_score, q=5, labels=[0, 1, 2, 3, 4]).astype(int)

    X = pd.DataFrame({
        "mars_afflicted": mars_afflicted,
        "saturn_return": saturn_return,
        "jupiter_aspect": jupiter_aspect,
        "q_type": q_type_idx,
        "years_exp": years_exp,
        "trustscore": trustscore,
        "upsell_flags": upsell_flags,
        "spec_match": astrologer_spec_match
    })

    group_counts = [astrologers_per_query] * n_queries

    ranker = lgb.LGBMRanker(
        objective="lambdarank",
        metric="ndcg",
        n_estimators=50,
        learning_rate=0.05,
        random_state=42
    )

    ranker.fit(X, relevance, group=group_counts)
    joblib.dump(ranker, RANKER_PATH)
    print("Ranking model trained and saved to", RANKER_PATH)
    return ranker

def train_upsell_classifier():
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    normal_transcripts = [
        "Hello sir, I wanted to ask about my career progression in 2026.",
        "Your chart shows Jupiter is well placed. Focus on hard work and skills.",
        "When will I get married according to my Kundli?",
        "Mars aspect is favorable next year. Stay patient.",
        "Can you suggest good career paths for me?",
        "You will do great in IT or public administration."
    ] * 20

    high_upsell_transcripts = [
        "Your Rahu is severely afflicted! You must buy an expensive gemstone immediately.",
        "There is a major dosha. Only solution is an expensive remedy puja costing ₹5000.",
        "If you don't do this urgent puja right now, terrible things will happen.",
        "Pay ₹10000 for special Yantra to fix your marriage issues immediately.",
        "Dangerous Saturn transit! Must do expensive remedy today.",
        "Only solution is special crystal ritual immediately for guaranteed job."
    ] * 20

    transcripts = normal_transcripts + high_upsell_transcripts
    labels = [0] * len(normal_transcripts) + [1] * len(high_upsell_transcripts)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    X = vectorizer.fit_transform(transcripts)

    clf = LogisticRegression()
    clf.fit(X, labels)

    model_data = {"vectorizer": vectorizer, "classifier": clf}
    joblib.dump(model_data, UPSELL_PATH)
    print("Upsell classifier trained and saved to", UPSELL_PATH)
    return model_data

def load_models():
    if not os.path.exists(RANKER_PATH):
        ranker = train_ranking_model()
    else:
        ranker = joblib.load(RANKER_PATH)

    if not os.path.exists(UPSELL_PATH):
        upsell_model = train_upsell_classifier()
    else:
        upsell_model = joblib.load(UPSELL_PATH)

    return ranker, upsell_model
