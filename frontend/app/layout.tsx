import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstroLive Clarity - Smart Astrologer Matching",
  description: "ML-powered Indian Vedic Astrology consultation matching with multi-dimensional TrustScore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        <div className="max-w-md mx-auto min-h-screen bg-slate-900 border-x border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
          {/* Subtle Vedic Mandala Radial Background Glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          {children}
        </div>
      </body>
    </html>
  );
}
