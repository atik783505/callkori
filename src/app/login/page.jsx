"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Logo, GreenDot, Waveform } from "@/lib/ui";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

function CallPreview() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center h-full p-10"
      style={{ background: "linear-gradient(135deg,#0D1117 0%,#141B23 100%)" }}>
      <div className="w-full max-w-xs">
        <div className="card p-4 mb-6 float-anim" style={{ background: "#141B23" }}>
          <div className="flex items-center gap-2 mb-3">
            <GreenDot />
            <span className="text-[#3DF29B] text-xs font-bold font-sora">LIVE · ck-a3f9b2</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[{ n:"র", c:"#4F8EF7", sp:true },{ n:"ক", c:"#A855F7", sp:false },
              { n:"ত", c:"#F97316", sp:false },{ n:"স", c:"#3DF29B", sp:false }].map((t) => (
              <div key={t.n} className={`rounded-xl aspect-video flex items-center justify-center text-xl font-bold text-white font-sora ${t.sp ? "ring-2 ring-[#3DF29B] glow-green" : ""}`}
                style={{ background: `linear-gradient(135deg,${t.c}22,${t.c}44)` }}>
                {t.n}
                {t.sp && (
                  <div className="absolute bottom-1 right-2">
                    <Waveform bars={3} active />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {["🎙️","📷","📵"].map(e => (
              <div key={e} className="w-8 h-8 rounded-lg bg-[#1A2330] flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
        </div>
        <p className="text-[#E9EEF3] font-sora font-bold text-xl text-center mb-2">ভিডিও কলে কাছে থাকুন</p>
        <p className="text-[#6B7E93] font-manrope text-sm text-center">বিনামূল্যে একাউন্ট খুলুন এবং এখনই শুরু করুন।</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      await authClient.signUp.email({ email, password, name }, {
        onSuccess: () => {
          // Full reload so session cookie is properly read
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      });
    } else {
      await authClient.signIn.email({ email, password }, {
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "#0B0F14" }}>
      <CallPreview />

      {/* Form side */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/"><Logo /></Link>
          </div>

          <h1 className="font-sora font-extrabold text-3xl text-[#E9EEF3] mb-2">
            {isSignUp ? "একাউন্ট তৈরি করুন" : "স্বাগতম ফিরে"}
          </h1>
          <p className="text-[#6B7E93] font-manrope text-sm mb-8">
            {isSignUp ? "বিনামূল্যে যোগ দিন এবং শুরু করুন।" : "আপনার একাউন্টে লগইন করুন।"}
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-7" style={{ background: "#141B23", border: "1px solid #1F2D3D" }}>
            {[["লগইন", false], ["নতুন একাউন্ট", true]].map(([label, val]) => (
              <button key={String(val)} onClick={() => { setIsSignUp(val); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-sora font-semibold transition-all ${isSignUp === val ? "bg-[#3DF29B] text-[#0B0F14]" : "text-[#6B7E93] hover:text-[#E9EEF3]"}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7E93] group-focus-within:text-[#3DF29B] transition-colors" />
                <input type="text" placeholder="আপনার নাম" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none transition-all"
                  style={{ background: "#141B23", border: "1px solid #1F2D3D" }}
                  onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                  onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
              </div>
            )}
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7E93] group-focus-within:text-[#3DF29B] transition-colors" />
              <input type="email" placeholder="ইমেইল অ্যাড্রেস" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none transition-all"
                style={{ background: "#141B23", border: "1px solid #1F2D3D" }}
                onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
            </div>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7E93] group-focus-within:text-[#3DF29B] transition-colors" />
              <input type={showPass ? "text" : "password"} placeholder="পাসওয়ার্ড" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none transition-all"
                style={{ background: "#141B23", border: "1px solid #1F2D3D" }}
                onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7E93] hover:text-[#E9EEF3] transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-manrope" style={{ background: "#FF5C5C12", border: "1px solid #FF5C5C33", color: "#FF5C5C" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <>{isSignUp ? "একাউন্ট খুলুন" : "লগইন করুন"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[#6B7E93] font-manrope">
            এগিয়ে যাওয়ার মাধ্যমে আপনি আমাদের{" "}
            <a href="#" className="text-[#3DF29B] hover:underline">Terms</a> ও{" "}
            <a href="#" className="text-[#3DF29B] hover:underline">Privacy Policy</a> মেনে নিচ্ছেন।
          </p>
        </div>
      </div>
    </div>
  );
}
