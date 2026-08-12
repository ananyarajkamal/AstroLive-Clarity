"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMatches } from "@/lib/api";
import { Star, User, Calendar, Clock, MapPin, Search, RefreshCw, Sparkles } from "lucide-react";

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

const QUESTION_TYPES = [
  { id: "marriage", label: "Marriage & Relationship" },
  { id: "career", label: "Career & Growth" },
  { id: "health", label: "Health & Vitality" },
  { id: "property", label: "Property & Investments" }
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

  // Keyboard shortcut listener for Shift + D
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
    <div className="max-w-2xl mx-auto py-4">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> LightGBM Match Engine & Vedic Chart
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Find Your Matched Astrologer
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          Enter your birth details to calculate planetary positions and connect with astrologers ranked for your chart.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Birth Chart Parameters</h2>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono font-medium hidden sm:inline-block">
            Shortcut: Shift + D
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Priya"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Birth Date
              </label>
              <input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Birth Time
              </label>
              <input
                type="time"
                required
                value={formData.birth_time}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Birth City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Birth City
            </label>
            <select
              value={formData.birth_city}
              onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" /> Primary Consultation Area
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            >
              {QUESTION_TYPES.map((q) => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Computing Chart & Ranking...
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" /> Find My Astrologer
              </>
            )}
          </button>
        </form>

        {/* Footer Reset Helper */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Form
          </button>
          <span>Pre-loaded Demo Profile: Priya</span>
        </div>
      </div>
    </div>
  );
}
