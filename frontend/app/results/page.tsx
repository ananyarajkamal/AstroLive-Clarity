"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MatchResponse, getMatches } from "@/lib/api";
import { Sparkles, AlertTriangle, ShieldCheck, ArrowLeft, Star, Clock } from "lucide-react";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("query_id");

  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!queryId) {
      // Fallback request if navigated directly
      getMatches({
        birth_date: "1997-06-21",
        birth_time: "10:15",
        birth_city: "Delhi",
        question_type: "marriage",
      })
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }

    const cached = sessionStorage.getItem(`match_${queryId}`);
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    // Fallback API call
    getMatches({
      birth_date: "1997-06-21",
      birth_time: "10:15",
      birth_city: "Delhi",
      question_type: "marriage",
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [queryId]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-amber-200">Analyzing Planetary Positions...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Computing Lagna, Moon sign & executing LightGBM ranker
        </p>
      </div>
    );
  }

  const { chart_features, matches } = data;

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <h2 className="text-sm font-bold text-slate-100">Smart Match Results</h2>
          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
            Ranked by AI & Vedic Chart
          </span>
        </div>
      </div>

      {/* Chart Features Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
            Your Birth Chart Summary
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
            {chart_features.lagna} Lagna
          </span>
          <span className="bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
            {chart_features.nakshatra} Nakshatra
          </span>
          <span className="bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
            {chart_features.dasha_lord} Dasha
          </span>
          {chart_features.mars_afflicted && (
            <span className="bg-rose-950/80 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/40 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Mars Afflicted
            </span>
          )}
        </div>
      </div>

      {/* Astrologers List */}
      <div className="space-y-4">
        {matches.map((ast, idx) => {
          const matchPercent = Math.round(ast.match_score * 100);
          // Color coding for TrustScore
          let trustColor = "bg-emerald-500 text-emerald-400";
          let trustBorder = "border-emerald-500/40";
          if (ast.trustscore < 60) {
            trustColor = "bg-rose-500 text-rose-400";
            trustBorder = "border-rose-500/40";
          } else if (ast.trustscore < 80) {
            trustColor = "bg-amber-500 text-amber-400";
            trustBorder = "border-amber-500/40";
          }

          // Initial avatar colors
          const avatarGradients = [
            "from-amber-500 to-orange-600",
            "from-purple-500 to-indigo-600",
            "from-emerald-500 to-teal-600",
          ];

          return (
            <div
              key={ast.astrologer_id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Row: Avatar, Name, Match Score */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradients[idx % 3]} flex items-center justify-center text-slate-950 font-black text-lg shadow-md border-2 border-slate-700`}
                  >
                    {ast.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                      {ast.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{ast.years_exp || 15} yrs exp</span>
                      <span>•</span>
                      <span>₹{ast.price_per_min}/min</span>
                    </div>
                  </div>
                </div>

                {/* Match Percentage */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-1 rounded-xl text-sm font-black shadow-md">
                    {matchPercent}% Match
                  </div>
                </div>
              </div>

              {/* TrustScore Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> TrustScore Credibility
                  </span>
                  <span className={`font-black ${trustColor.split(" ")[1]}`}>
                    {ast.trustscore} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${trustColor.split(" ")[0]} transition-all duration-500 rounded-full`}
                    style={{ width: `${ast.trustscore}%` }}
                  />
                </div>
              </div>

              {/* Specialties & Warnings */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {ast.specialty.map((spec) => (
                  <span
                    key={spec}
                    className="bg-slate-700/60 text-slate-300 text-[11px] px-2 py-0.5 rounded-md font-medium capitalize"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* AI Match Reason */}
              <p className="text-xs text-slate-400 italic mb-4 bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                "{ast.reason}"
              </p>

              {/* Action Button */}
              <button
                onClick={() => router.push(`/consultation?astrologer_id=${ast.astrologer_id}`)}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <Clock className="w-4 h-4 text-slate-700" /> Start Consultation (₹{ast.price_per_min}/min)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-amber-200">Loading Matches...</h3>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
