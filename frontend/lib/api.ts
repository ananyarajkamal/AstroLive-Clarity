import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

export interface MatchRequest {
  user_id?: number;
  name?: string;
  birth_date: string;
  birth_time: string;
  birth_city: string;
  question_type: string;
}

export interface AstrologerMatch {
  rank: number;
  astrologer_id: number;
  name: string;
  specialty: string[];
  match_score: number;
  trustscore: number;
  price_per_min: number;
  reason: string;
  years_exp?: number;
  upsell_flags?: number;
  profile_image_url?: string;
}

export interface MatchResponse {
  query_id: string;
  chart_features: {
    lagna: string;
    moon_sign: string;
    nakshatra: string;
    dasha_lord: string;
    mars_afflicted: boolean;
    saturn_return: boolean;
    rahu_ketu_axis: string;
    jupiter_aspect: boolean;
  };
  matches: AstrologerMatch[];
}

export interface ClarityCheckRequest {
  consultation_id: number;
  rating?: number;
}

export interface ClarityCheckResponse {
  triggered: boolean;
  reason: string;
  original_astrologer_id: number;
  matches: AstrologerMatch[];
}

export interface TrustScoreResponse {
  astrologer_id: number;
  name: string;
  overall_score: number;
  dimensions: {
    satisfaction: number;
    loyalty: number;
    volume: number;
    specialty_depth: number;
  };
  upsell_flags: number;
}

// Fallback Mock Data for Demo Resilience
export const FALLBACK_MATCH_RESPONSE: MatchResponse = {
  query_id: "demo_priya_query",
  chart_features: {
    lagna: "Scorpio",
    moon_sign: "Pisces",
    nakshatra: "Revati",
    dasha_lord: "Mercury",
    mars_afflicted: true,
    saturn_return: false,
    rahu_ketu_axis: "Libra-Aries",
    jupiter_aspect: true
  },
  matches: [
    {
      rank: 1,
      astrologer_id: 2,
      name: "Acharya Vikram Shastri",
      specialty: ["career", "property", "marriage"],
      match_score: 0.98,
      trustscore: 88.0,
      price_per_min: 60.0,
      reason: "Specialist in marriage • Top match for Manglik / Mars-afflicted birth charts",
      years_exp: 22,
      upsell_flags: 2,
      profile_image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
      rank: 2,
      astrologer_id: 3,
      name: "Dr. Ananya Tripathi",
      specialty: ["marriage", "health"],
      match_score: 0.95,
      trustscore: 95.0,
      price_per_min: 35.0,
      reason: "Specialist in marriage • High credibility TrustScore (95.0)",
      years_exp: 12,
      upsell_flags: 0,
      profile_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
      rank: 3,
      astrologer_id: 1,
      name: "Pt. Rajesh Sharma",
      specialty: ["marriage", "career", "health"],
      match_score: 0.92,
      trustscore: 92.5,
      price_per_min: 45.0,
      reason: "Specialist in marriage • High credibility TrustScore (92.5)",
      years_exp: 18,
      upsell_flags: 1,
      profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ]
};

export const FALLBACK_CLARITY_RESPONSE: ClarityCheckResponse = {
  triggered: true,
  reason: "Low rating (2.0/5) | Anxiety/doubt detected in consultation transcript | High-pressure upsell detected",
  original_astrologer_id: 1,
  matches: [
    {
      rank: 1,
      astrologer_id: 3,
      name: "Dr. Ananya Tripathi",
      specialty: ["marriage", "health"],
      match_score: 0.99,
      trustscore: 95.0,
      price_per_min: 35.0,
      reason: "Specialist in marriage • High credibility TrustScore (95.0)",
      years_exp: 12,
      upsell_flags: 0
    },
    {
      rank: 2,
      astrologer_id: 2,
      name: "Acharya Vikram Shastri",
      specialty: ["career", "property", "marriage"],
      match_score: 0.97,
      trustscore: 88.0,
      price_per_min: 60.0,
      reason: "Specialist in marriage",
      years_exp: 22,
      upsell_flags: 2
    },
    {
      rank: 3,
      astrologer_id: 10,
      name: "Dr. Kavita Tiwary",
      specialty: ["career", "property", "health"],
      match_score: 0.94,
      trustscore: 90.0,
      price_per_min: 55.0,
      reason: "16 years experience with high rating",
      years_exp: 16,
      upsell_flags: 0
    }
  ]
};

export const getMatches = async (data: MatchRequest): Promise<MatchResponse> => {
  try {
    const res = await api.post("/api/v1/match", data);
    return res.data;
  } catch (err) {
    console.warn("Backend API unreachable, returning fallback mock data.");
    return FALLBACK_MATCH_RESPONSE;
  }
};

export const getClarityCheck = async (data: ClarityCheckRequest): Promise<ClarityCheckResponse> => {
  try {
    const res = await api.post("/api/v1/clarity-check", data);
    return res.data;
  } catch (err) {
    console.warn("Backend API unreachable, returning fallback clarity response.");
    return FALLBACK_CLARITY_RESPONSE;
  }
};

export const getTrustScore = async (id: number): Promise<TrustScoreResponse> => {
  try {
    const res = await api.get(`/api/v1/astrologers/${id}/trustscore`);
    return res.data;
  } catch (err) {
    return {
      astrologer_id: id,
      name: "Dr. Ananya Tripathi",
      overall_score: 95.0,
      dimensions: {
        satisfaction: 98.0,
        loyalty: 92.0,
        volume: 85.0,
        specialty_depth: 90.0
      },
      upsell_flags: 0
    };
  }
};
