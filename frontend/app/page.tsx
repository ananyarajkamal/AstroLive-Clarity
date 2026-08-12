"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMatches } from "@/lib/api";
import { Sparkles, Calendar, Clock, MapPin, HelpCircle, Compass, RefreshCw, Command } from "lucide-react";

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

const QUESTION_TYPES = [
  { id: "marriage", label: "Marriage & Relationship" },
  { id: "career", label: "Career & Job" },
  { id: "health", label: "Health & Well-being" },
  { id: "property", label: "Property & Wealth" }
];

const DEFAULT_PRIYA_DATA = {
  name: "Priya",
  birth_date: "1998-03-15",
  birth_time: "14:30",
  birth_city: "Delhi",
  question_type: "marriage"
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_PRIYA_DATA);

  // Shortcut Listener for Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        setFormData(DEFAULT_PRIYA_DATA);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReset = () => {
    sessionStorage.clear();
    setFormData(DEFAULT_PRIYA_DATA);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getMatches(formData);
      sessionStorage.setItem(`match_${res.query_id}`, JSON.stringify(res));
      router.push(`/results?query_id=${res.query_id}`);
    } catch (err) {
      console.error("Match API Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 z-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30 mb-2">
          <Compass className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
          AstroLive Clarity
        </h1>
        <p className="text-xs text-amber-200/70 mt-1 uppercase tracking-widest font-semibold">
          Vedic Astrology • Smart ML Match
        </p>
      </div>

      {/* Main Form Card */}
      <div className="my-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Enter Birth Details
            </h2>
            <p className="text-xs text-slate-400">
              Calculates Lagna, Nakshatra & Dasha to rank astrologers using LightGBM.
            </p>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono hidden sm:inline-block">
            Shift + D
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Priya"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date
              </label>
              <input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Time
              </label>
              <input
                type="time"
                required
                value={formData.birth_time}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Birth City
            </label>
            <select
              value={formData.birth_city}
              onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Primary Query
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              {QUESTION_TYPES.map((q) => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Computing Chart & Ranking...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Find My Astrologer
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Helper Actions */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 hover:text-amber-400 transition"
        >
          <RefreshCw className="w-3 h-3" /> Reset Demo
        </button>
        <span className="text-[10px]">Priya Demo Profile Loaded</span>
      </div>
    </div>
  );
}
