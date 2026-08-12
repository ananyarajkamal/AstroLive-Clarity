"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldAlert, CheckCircle2, User, Send } from "lucide-react";

const MOCK_MESSAGES = [
  {
    sender: "astrologer",
    text: "Namaste Rahul ji. I am looking at your birth chart right now.",
    time: "10:16 AM"
  },
  {
    sender: "user",
    text: "Namaste Pandit ji. I wanted to ask when will I get married? Is there any delay?",
    time: "10:16 AM"
  },
  {
    sender: "astrologer",
    text: "Your Rahu is severely afflicted in 7th house! Marriage is under heavy dark dosha.",
    time: "10:17 AM"
  },
  {
    sender: "user",
    text: "Oh no... I am really scared. Is there any solution?",
    time: "10:17 AM"
  },
  {
    sender: "astrologer",
    text: "Only solution is an urgent Mahamrityunjaya Puja & Gemstone ritual costing ₹5000. You must do this immediately today, or consequences will be terrible!",
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
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-slate-100 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Thanks for your feedback! Evaluating clarity...</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
            PR
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Pandit Rajesh Sharma</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Consultation</span>
            </div>
          </div>
        </div>
        <div className="bg-rose-950/80 text-rose-300 text-[10px] px-2.5 py-1 rounded-full border border-rose-500/40 flex items-center gap-1 font-semibold">
          <ShieldAlert className="w-3 h-3" /> High Upsell Risk
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        <div className="text-center my-2">
          <span className="bg-slate-900/80 text-slate-400 text-[10px] px-3 py-1 rounded-full border border-slate-800">
            Consultation started • 10:15 AM
          </span>
        </div>

        {MOCK_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                msg.sender === "user"
                  ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                  : "bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Footer Rating Section */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 shadow-2xl rounded-t-3xl">
        <div className="text-center mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Rate your consultation experience
          </h3>
          <p className="text-[11px] text-slate-500">
            Was the advice helpful or felt pushy?
          </p>
        </div>

        <div className="flex justify-center items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="p-2 hover:scale-110 active:scale-95 transition"
            >
              <Star
                className={`w-8 h-8 ${
                  rating && star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-600 hover:text-amber-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
