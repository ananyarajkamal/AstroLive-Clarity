import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface MatchRequest {
  user_id?: number;
  name?: string;
  birth_date: string;
  birth_time: string;
  birth_city: str;
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

export const getMatches = async (data: MatchRequest): Promise<MatchResponse> => {
  const res = await api.post("/api/v1/match", data);
  return res.data;
};

export const getClarityCheck = async (data: ClarityCheckRequest): Promise<ClarityCheckResponse> => {
  const res = await api.post("/api/v1/clarity-check", data);
  return res.data;
};

export const getTrustScore = async (id: number): Promise<TrustScoreResponse> => {
  const res = await api.get(`/api/v1/astrologers/${id}/trustscore`);
  return res.data;
};
