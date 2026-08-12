"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MatchResponse, getMatches } from "@/lib/api";
import { ChevronLeft, Star, ShieldCheck, AlertTriangle, Sparkles, UserCheck } from "lucide-react";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("query_id");

  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!queryId) {
      getMatches({
        birth_date: "1998-03-15",
        birth_time: "14:30",
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

    getMatches({
      birth_date: "1998-03-15",
      birth_time: "14:30",
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
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Calculating Planetary Positions...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Ranking 1,500 astrologers via LightGBM LambdaRank
        </p>
      </div>
    );
  }

  const { chart_features, matches } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Form
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Your Matched Astrologers</h1>
          <p className="text-xs text-slate-500">Ranked by birth chart alignment & credibility</p>
        </div>
      </div>

      {/* Computed Chart Features Banner */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Computed Birth Chart Summary
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            {chart_features.lagna} Rising
          </span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            {chart_features.nakshatra} Nakshatra
          </span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            {chart_features.dasha_lord} Dasha Lord
          </span>
          {chart_features.mars_afflicted && (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Mars Afflicted
            </span>
          )}
          {chart_features.jupiter_aspect && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold">
              Jupiter Aspect Active
            </span>
          )}
        </div>
      </div>

      {/* 3 Astrologer Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((ast, idx) => {
          const matchPercent = Math.round(ast.match_score * 100);
          const upsellCount = ast.upsell_flags || 0;

          // Color coding for TrustScore
          let trustBarColor = "bg-emerald-500";
          let trustTextColor = "text-emerald-700";
          if (ast.trustscore < 60) {
            trustBarColor = "bg-rose-500";
            trustTextColor = "text-rose-700";
          } else if (ast.trustscore < 80) {
            trustBarColor = "bg-amber-500";
            trustTextColor = "text-amber-700";
          }

          const avatarGradients = [
            "from-indigo-500 to-purple-600",
            "from-amber-500 to-orange-600",
            "from-emerald-500 to-teal-600",
          ];

          return (
            <div
              key={ast.astrologer_id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Exp */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradients[idx % 3]} text-white font-bold text-base flex items-center justify-center shadow-sm flex-shrink-0`}
                  >
                    {ast.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ast.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {ast.years_exp || 15} Years Experience
                    </p>
                  </div>
                </div>

                {/* TrustScore Section */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" /> TrustScore
                    </span>
                    <span className={`font-black text-sm ${trustTextColor}`}>
                      {ast.trustscore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${trustBarColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${ast.trustscore}%` }}
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ast.specialty.map((spec) => (
                    <span
                      key={spec}
                      className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium capitalize"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Upsell Warning Box */}
                {upsellCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4 flex items-start gap-2 text-xs text-amber-800 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Flagged for high-upsell behavior {upsellCount} times</span>
                  </div>
                )}

                {/* Match Score & Reason */}
                <div className="mb-4">
                  <div className="text-2xl font-black text-indigo-600 mb-1">
                    {matchPercent}% Match
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {ast.reason}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900">
                  Rs {ast.price_per_min}/min
                </div>
                <button
                  onClick={() => router.push(`/consultation?astrologer_id=${ast.astrologer_id}`)}
                  className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                >
                  Consult Now
                </button>
              </div>
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
      <div className="py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Loading Matches...</h3>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
