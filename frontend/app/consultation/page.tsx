"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck, AlertTriangle, UserCheck, MessageSquare, CheckCircle } from "lucide-react";

const MOCK_MESSAGES = [
  {
    sender: "astrologer",
    text: "Namaste Priya ji. I have opened your birth chart.",
    time: "10:16 AM"
  },
  {
    sender: "user",
    text: "Namaste Pandit ji. I wanted to ask when will I get married? Is there any delay in my chart?",
    time: "10:16 AM"
  },
  {
    sender: "astrologer",
    text: "Your Rahu is severely afflicted in 7th house! Marriage is under heavy dark dosha.",
    time: "10:17 AM"
  },
  {
    sender: "user",
    text: "Oh no... I am really worried and scared. Is there any remedy?",
    time: "10:17 AM"
  },
  {
    sender: "astrologer",
    text: "Only solution is an urgent Mahamrityunjaya Puja & Gemstone ritual costing Rs 5000. You must do this immediately today!",
    time: "10:18 AM"
  }
];

export default function ConsultationPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleRating = (stars: number) => {
    setRating(stars);
    setShowToast(true);
    setTimeout(() => {
      router.push(`/clarity?consultation_id=99&rating=${stars}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold animate-bounce">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Feedback recorded. Redirecting to Clarity Check...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Live Consultation Session</h1>
          <p className="text-xs text-slate-500">Session ID: #CS-9920 • Real-time Chat</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Session
        </span>
      </div>

      {/* 2-Column SaaS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chat Window (WhatsApp Web style) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[520px]">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                PR
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pandit Rajesh Sharma</h3>
                <p className="text-xs text-slate-500">18 Years Experience • Vedic Marriage Expert</p>
              </div>
            </div>
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {MOCK_MESSAGES.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-200 text-slate-900 rounded-tr-none font-medium"
                      : "bg-white border border-slate-200 text-slate-900 shadow-sm rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Rating Footer */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rate your consultation experience
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-1.5 hover:scale-110 active:scale-95 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating && star <= rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Astrologer Profile & TrustScore Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> TrustScore Audit
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Overall TrustScore</span>
                  <span className="text-amber-600">92.5 / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "92.5%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Satisfaction Rate</span>
                  <span className="font-semibold text-slate-900">96%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Client Repeat Rate</span>
                  <span className="font-semibold text-slate-900">88%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Upsell Warning:</span> High-priced remedy pushed during consultation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
