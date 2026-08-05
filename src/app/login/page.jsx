"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Video } from "lucide-react";

function CallPreview() {
  const tiles = [
    { initials:"AK", color:"#6366F1", active:true },
    { initials:"SH", color:"#8B5CF6", active:false },
    { initials:"TA", color:"#A855F7", active:true },
    { initials:"RU", color:"#6366F1", active:false },
  ];
  return (
    <div className="hidden lg:flex flex-col justify-center items-center h-full p-12 relative overflow-hidden"
      style={{background:"var(--bg2)"}}>
      <div className="ck-glow-br" style={{opacity:.7}}/>
      <div className="ck-glow-tl"/>
      <div className="relative z-10 w-full max-w-xs">
        <div className="ck-card p-4 mb-6" style={{background:"var(--card)"}}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{background:"var(--green)",
              boxShadow:"0 0 6px var(--green)"}}/>
            <span className="text-xs font-semibold" style={{color:"var(--green)"}}>
              LIVE · ck-a3f9b2
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tiles.map(t=>(
              <div key={t.initials}
                className={`rounded-xl aspect-video flex items-center justify-center text-xl font-black text-white transition-all ${t.active?"ring-2":"opacity-60"}`}
                style={{background:`linear-gradient(135deg,${t.color}22,${t.color}44)`,
                  ringColor:t.active?t.color:"transparent"}}>
                {t.initials}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {["🎙️","📷","📵"].map(e=>(
              <div key={e} className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{background:"var(--bg3)"}}>
                {e}
              </div>
            ))}
          </div>
        </div>
        <h2 className="font-black text-xl text-center mb-2" style={{color:"var(--text)"}}>
          Connect in HD
        </h2>
        <p className="text-sm text-center" style={{color:"var(--muted)"}}>
          Free forever. No downloads required.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (isSignUp) {
      await authClient.signUp.email({ email, password, name }, {
        onSuccess: () => { window.location.href = "/dashboard"; },
        onError: (ctx) => { setError(ctx.error.message); setLoading(false); },
      });
    } else {
      await authClient.signIn.email({ email, password }, {
        onSuccess: () => { window.location.href = "/dashboard"; },
        onError: (ctx) => { setError(ctx.error.message); setLoading(false); },
      });
    }
  };

  const inputClass = "ck-input px-4 py-3 text-sm pl-11";

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{background:"var(--bg)"}}>
      <CallPreview />

      {/* Form */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/">
              <span className="font-black text-xl tracking-tight" style={{color:"var(--text)"}}>callkori</span>
            </Link>
          </div>

          <h1 className="font-black text-2xl mb-1" style={{color:"var(--text)"}}>
            {isSignUp ? t("login_signup_title") : t("login_title")}
          </h1>
          <p className="text-sm mb-7" style={{color:"var(--muted)"}}>
            {isSignUp ? t("login_signup_sub") : t("login_sub")}
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-6"
            style={{background:"var(--bg3)", border:"1px solid var(--border)"}}>
            {[[t("login_tab_in"), false],[t("login_tab_up"), true]].map(([label, val]) => (
              <button key={String(val)}
                onClick={() => { setIsSignUp(val); setError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={isSignUp === val
                  ? {background:"var(--accent)", color:"#fff"}
                  : {color:"var(--muted)"}}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {isSignUp && (
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{color:"var(--muted)"}}/>
                <input type="text" placeholder={t("login_name")} required value={name}
                  onChange={e=>setName(e.target.value)} className={inputClass}/>
              </div>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{color:"var(--muted)"}}/>
              <input type="email" placeholder={t("login_email")} required value={email}
                onChange={e=>setEmail(e.target.value)} className={inputClass}/>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{color:"var(--muted)"}}/>
              <input type={showPass?"text":"password"} placeholder={t("login_pass")} required
                value={password} onChange={e=>setPassword(e.target.value)}
                className={`${inputClass} pr-11`}/>
              <button type="button" onClick={()=>setShowPass(v=>!v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{color:"var(--muted)"}}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",
                  color:"var(--red)"}}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-1">
              {loading
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>{t("login_loading")}</>
                : <>{isSignUp ? t("login_btn_up") : t("login_btn_in")}<ArrowRight size={15}/></>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{color:"var(--muted)"}}>
            {t("login_terms")}{" "}
            <a href="#" style={{color:"var(--accent)"}} className="hover:underline">{t("login_terms2")}</a>
            {" "}{t("login_terms3")}{" "}
            <a href="#" style={{color:"var(--accent)"}} className="hover:underline">{t("login_terms4")}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
