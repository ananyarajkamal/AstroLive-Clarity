"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClarityCheckResponse, getClarityCheck } from "@/lib/api";
import { Zap, ShieldCheck, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";

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
    setToastMessage(`Booking confirmed with ${astrologerName}! (Covered under Clarity Guarantee)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (loading) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Evaluating Consultation Transcript...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Checking rating, anxiety indicators & high-upsell patterns
        </p>
      </div>
    );
  }

  const matches = clarityData?.matches || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold animate-bounce">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-sm text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-3.5 py-1.5 rounded-full font-bold mb-3">
          <Zap className="w-4 h-4 text-indigo-600" /> Clarity Check Triggered
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">
          Not sure about what you heard?
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-4">
          AstroLive matched 3 top-rated astrologers who specialize in your specific chart and question, excluding pushy up-sellers.
        </p>

        {clarityData?.reason && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2 rounded-xl font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Trigger reason: {clarityData.reason}</span>
          </div>
        )}
      </div>

      {/* 3 Astrologers Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {matches.map((ast, idx) => {
          const matchPercent = Math.round(ast.match_score * 100);
          const avatarGradients = [
            "from-emerald-500 to-teal-600",
            "from-indigo-500 to-purple-600",
            "from-amber-500 to-orange-600",
          ];

          return (
            <div
              key={ast.astrologer_id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradients[idx % 3]} text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0`}
                  >
                    {ast.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ast.name}</h3>
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> TrustScore {ast.trustscore}
                    </p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {ast.specialty.map((s) => (
                    <span
                      key={s}
                      className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium capitalize"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Match percentage */}
                <div className="text-lg font-black text-indigo-600 mb-1">
                  {matchPercent}% Match
                </div>

                <p className="text-xs text-slate-500 italic leading-relaxed mb-4">
                  "{ast.reason}"
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleBooking(ast.name)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition text-xs flex items-center justify-center gap-1.5"
              >
                Book Consultation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Smart Match Badge */}
      <div className="text-center pt-4">
        <span className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs px-4 py-2 rounded-full font-bold shadow-sm">
          <Zap className="w-4 h-4 text-indigo-600" /> Matched by Smart Match Engine
        </span>
      </div>
    </div>
  );
}

export default function ClarityPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Loading Clarity Options...</h3>
      </div>
    }>
      <ClarityContent />
    </Suspense>
  );
}
