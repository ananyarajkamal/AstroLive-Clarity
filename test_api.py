from fastapi.testclient import TestClient
import json
from main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing GET /health ---")
    r = client.get("/health")
    print("Health response:", r.status_code, r.json())
    assert r.status_code == 200

    print("\n--- 2. Testing POST /api/v1/match ---")
    payload_match = {
        "birth_date": "1995-08-15",
        "birth_time": "14:30",
        "birth_city": "Delhi",
        "question_type": "marriage"
    }
    r = client.post("/api/v1/match", json=payload_match)
    print("Match response status:", r.status_code)
    match_data = r.json()
    print("Chart Features:", json.dumps(match_data["chart_features"], indent=2))
    print("Top 3 Matches:")
    for m in match_data["matches"]:
        print(f"  Rank {m['rank']}: {m['name']} (Score: {m['match_score']}, TrustScore: {m['trustscore']}) -> {m['reason']}")

    print("\n--- 3. Testing POST /api/v1/clarity-check (Triggered by rating <= 3 & anxiety transcript) ---")
    payload_clarity = {
        "consultation_id": 99,
        "rating": 2.0
    }
    r = client.post("/api/v1/clarity-check", json=payload_clarity)
    print("Clarity Check response:", json.dumps(r.json(), indent=2))

    print("\n--- 4. Testing GET /api/v1/astrologers/1/trustscore ---")
    r = client.get("/api/v1/astrologers/1/trustscore")
    print("TrustScore response:", json.dumps(r.json(), indent=2))

if __name__ == "__main__":
    run_tests()
