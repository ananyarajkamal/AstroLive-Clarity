"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClarityCheckResponse, getClarityCheck } from "@/lib/api";
import { Sparkles, ShieldCheck, CheckCircle2, Zap, ArrowRight } from "lucide-react";

function ClarityContent() {
  const searchParams = useSearchParams();
  const consultationId = parseInt(searchParams.get("consultation_id") || "99", 10);
  const ratingParam = parseFloat(searchParams.get("rating") || "2.0");

  const [clarityData, setClarityData] = useState<ClarityCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getClarityCheck({
      consultation_id: consultationId,
      rating: ratingParam,
    })
      .then((res) => {
        setClarityData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Clarity Check Error:", err);
        setLoading(false);
      });
  }, [consultationId, ratingParam]);

  const handleBooking = (astrologerName: string) => {
    setToastMessage(`Booking confirmed with ${astrologerName}! (0 cost for Clarity Guarantee)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-amber-200">Evaluating Consultation Quality...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Checking rating, anxiety indicators & high-upsell patterns
        </p>
      </div>
    );
  }

  const matches = clarityData?.matches || [];

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 overflow-y-auto space-y-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" /> Clarity Guarantee Triggered
        </div>

        <h1 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          Not sure about what you heard?
        </h1>

        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          {clarityData?.reason || "We noticed your consultation left you confused or pushed expensive remedies."}
        </p>
      </div>

      {/* Subhead Context */}
      <div className="px-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Recommended Alternative Matches
        </h2>
        <p className="text-xs text-slate-300 font-medium">
          AstroLive matched 3 top-rated astrologers who specialize in Marriage for your birth chart, excluding pushy up-sellers.
        </p>
      </div>

      {/* Astrologer Cards List */}
      <div className="space-y-3.5">
        {matches.map((ast, idx) => {
          const matchPercent = Math.round(ast.match_score * 100);
          const avatarGradients = [
            "from-emerald-500 to-teal-600",
            "from-purple-500 to-indigo-600",
            "from-amber-500 to-orange-600",
          ];

          return (
            <div
              key={ast.astrologer_id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradients[idx % 3]} flex items-center justify-center text-slate-950 font-black text-sm shadow-md`}
                  >
                    {ast.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{ast.name}</h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> TrustScore {ast.trustscore}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-xl font-bold">
                  {matchPercent}% Match
                </span>
              </div>

              {/* Specialties & Reason */}
              <div className="flex flex-wrap gap-1 mb-2">
                {ast.specialty.map((s) => (
                  <span
                    key={s}
                    className="bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded capitalize"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 italic mb-3">"{ast.reason}"</p>

              {/* Action */}
              <button
                onClick={() => handleBooking(ast.name)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-1.5"
              >
                Get Clarity Consultation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Badge */}
      <div className="pt-2 text-center">
        <span className="inline-flex items-center gap-1.5 bg-slate-800/80 text-amber-400 text-[11px] px-3.5 py-1.5 rounded-full border border-slate-700 font-semibold shadow-inner">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Matched by Smart Match Engine
        </span>
      </div>
    </div>
  );
}

export default function ClarityPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-amber-200">Loading Clarity Options...</h3>
      </div>
    }>
      <ClarityContent />
    </Suspense>
  );
}
