"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div style={{background:"var(--bg)"}} className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="ck-glow-br" style={{opacity:.5}}/>
      <div className="relative z-10 max-w-md">
        <div className="mb-8"><span className="font-black text-2xl" style={{color:"var(--text)"}}>callkori</span></div>
        <div className="ck-card p-6 mb-8 mx-auto max-w-xs" style={{background:"var(--card)"}}>
          <div className="aspect-video rounded-xl flex flex-col items-center justify-center gap-3 mb-4"
            style={{background:"var(--bg3)",border:"1px solid var(--border)"}}>
            <div className="text-5xl">📡</div>
            <div className="flex gap-1">
              {[8,14,6,18,10].map((h,i)=>(
                <div key={i} className="w-1 rounded-full" style={{height:`${h}px`,background:"var(--red)",opacity:i%2===0?1:.3}}/>
              ))}
            </div>
          </div>
          <p className="text-xs font-bold tracking-widest text-center" style={{color:"var(--red)"}}>SIGNAL LOST</p>
        </div>
        <h1 className="font-black text-7xl mb-2" style={{color:"var(--text)"}}>404</h1>
        <h2 className="font-bold text-2xl mb-3" style={{color:"var(--text)"}}>{t("err_title")}</h2>
        <p className="mb-8 leading-relaxed" style={{color:"var(--muted)"}}>{t("err_sub")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2">
            <Home size={16}/>{t("err_home")}
          </Link>
          <Link href="/dashboard" className="btn-ghost px-6 py-3 text-sm flex items-center justify-center gap-2">
            <LayoutDashboard size={16}/>{t("err_dash")}
          </Link>
        </div>
      </div>
    </div>
  );
}
