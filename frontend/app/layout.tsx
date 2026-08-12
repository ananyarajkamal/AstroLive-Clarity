import type { Metadata } from "next";
import Link from "next/link";
import { Star, Shield, Sparkles } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstroLive Clarity - ML-Powered Astrologer Matching",
  description: "AI & Vedic astrology consultation platform with multi-dimensional TrustScore credibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        {/* SaaS Top Navigation Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  AstroLive Clarity
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
                  Smart Astrology Match Engine
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> TrustScore Credibility Verification
              </span>
              <Link
                href="/"
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition"
              >
                Match Astrologer
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* SaaS Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AstroLive Clarity • ML Match Platform</span>
            </div>
            <div>Powered by pyswisseph Vedic Engine & LightGBM Model</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
