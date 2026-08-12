# AstroLive Clarity 🌌

**ML-powered Indian Astrology Match Engine & TrustScore Credibility Platform.**

AstroLive Clarity solves the problem of arbitrary, identical 4.8-star ratings in online astrology by introducing multi-dimensional **TrustScore** verification, real-time **Vedic Birth Chart computations** (Lagna, Nakshatra, Dasha lord via `pyswisseph`), a **LightGBM LambdaRank** match engine, and a **Clarity Check** fallback after unsatisfactory consultations.

---

## 🚀 Features

1. **Vedic Planetary Calculations**: Precise astronomical position computation (`pyswisseph` with Sidereal Lahiri Ayanamsa) calculating Lagna, Moon sign, Nakshatra, Dasha lord, Manglik affliction, Saturn return, and Jupiter aspects.
2. **LightGBM Smart Match**: ML model trained to pair user chart features with astrologer specialties and credibility scores.
3. **Multi-Dimensional TrustScore**: 0-100 credibility metric evaluating consultation satisfaction, repeat rate, consultation volume, specialty depth, and pushy upsell penalties.
4. **Automated Clarity Check**: Scans transcripts for high-pressure upsell pitches and low ratings to recommend non-pushy alternative astrologers.

---

## 🛠️ Architecture Overview

- **Backend**: FastAPI (Python 3.11), SQLAlchemy, SQLite (`astrolive.db`), `pyswisseph`, LightGBM, scikit-learn.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios, Lucide Icons.

---

## 📦 Quick Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/ananyarajkamal/AstroLive-Clarity.git
cd AstroLive-Clarity

# Install dependencies
pip install -r requirements.txt

# Start FastAPI dev server (auto-seeds database with astrologers & demo user Priya)
uvicorn main:app --reload
```
The backend runs at `http://localhost:8000`. You can visit `http://localhost:8000/health` to confirm status.

### 2. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🎯 Demo Walkthrough Script

1. **Screen 1 (`/`)**: Form opens pre-filled with **Priya** (`1998-03-15`, `14:30`, `Delhi`, `Marriage`). Press `Shift + D` anytime to auto-populate. Click **Find My Astrologer**.
2. **Screen 2 (`/results`)**: View Priya's computed birth chart banner (*Scorpio Lagna • Revati Nakshatra • Jupiter Aspect*) and top 3 ML-ranked astrologers with TrustScore progress bars. Click **Consult**.
3. **Screen 3 (`/consultation`)**: Read the mock consultation transcript where Pandit Rajesh pushes a ₹5000 remedy. Rate **2 stars**.
4. **Screen 4 (`/clarity`)**: Clarity Guarantee automatically triggers, displaying 3 re-matched astrologers excluding Pandit Rajesh with a 1-click booking confirmation.

---

## 🚢 Deployment

### Deploy Backend to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)
- Uses included `Dockerfile` and `railway.json`.

### Deploy Frontend to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
- Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-railway-url.up.railway.app`.

---

## 📜 License
MIT License. Built for hackathon demonstration.
