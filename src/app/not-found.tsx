import Link from "next/link";
import { Logo } from "@/lib/ui";
import { Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ background: "#0B0F14" }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse,#FF5C5C15,transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 max-w-md">
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {/* Mockup with disconnected screen */}
        <div className="card p-6 mb-8 mx-auto max-w-xs" style={{ background: "#141B23" }}>
          <div className="aspect-video rounded-xl flex flex-col items-center justify-center gap-3 mb-4"
            style={{ background: "#0D1117", border: "1px solid #FF5C5C33" }}>
            <div className="text-5xl">📡</div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-1 rounded-full bg-[#FF5C5C]"
                  style={{ height: `${[8,14,6,18,10][i-1]}px`, opacity: i % 2 === 0 ? 0.3 : 1 }} />
              ))}
            </div>
          </div>
          <p className="text-[#FF5C5C] text-xs font-sora font-bold tracking-widest text-center">
            CALL DISCONNECTED
          </p>
        </div>

        <h1 className="font-sora font-extrabold text-7xl text-[#E9EEF3] mb-2">404</h1>
        <h2 className="font-sora font-bold text-2xl text-[#E9EEF3] mb-3">সিগন্যাল পাওয়া যাচ্ছে না</h2>
        <p className="text-[#6B7E93] font-manrope mb-8 leading-relaxed">
          আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা কখনো ছিল না।
          হয়তো link টি ভুল।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2">
            <Home size={16} /> হোমে যান
          </Link>
          <Link href="/dashboard" className="btn-ghost px-6 py-3 text-sm flex items-center justify-center gap-2">
            <RefreshCw size={16} /> ড্যাশবোর্ড
          </Link>
        </div>
      </div>
    </div>
  );
}
