"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { Video, Users, Link2, Shield, Zap, Monitor } from "lucide-react";
import Link from "next/link";

const FEATS = [
  { icon:Video,   tk:"feat_hd"      as const, dk:"feat_hd_d"      as const, color:"#6366F1" },
  { icon:Users,   tk:"feat_friends" as const, dk:"feat_friends_d" as const, color:"#8B5CF6" },
  { icon:Link2,   tk:"feat_link"    as const, dk:"feat_link_d"    as const, color:"#A855F7" },
  { icon:Monitor, tk:"feat_screen"  as const, dk:"feat_screen_d"  as const, color:"#6366F1" },
  { icon:Zap,     tk:"feat_nc"      as const, dk:"feat_nc_d"      as const, color:"#8B5CF6" },
  { icon:Shield,  tk:"feat_secure"  as const, dk:"feat_secure_d"  as const, color:"#A855F7" },
];

export default function FeaturesPage() {
  const { t } = useI18n();
  return (
    <div style={{background:"var(--bg)"}} className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>
              {t("feat_label")}
            </div>
            <h1 className="font-black text-5xl mb-4" style={{color:"var(--text)"}}>{t("feat_h")}</h1>
            <p className="text-base max-w-xl mx-auto" style={{color:"var(--muted)"}}>{t("feat_sub")}</p>
          </div>
          <div className="space-y-20">
            {FEATS.map((f, i) => {
              const Icon = f.icon;
              const isRight = i % 2 === 1;
              return (
                <div key={f.tk} className={`grid md:grid-cols-2 gap-14 items-center ${isRight?"md:[direction:rtl]":""}`}>
                  <div className={isRight?"md:[direction:ltr]":""}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{background:`${f.color}15`,border:`1px solid ${f.color}30`}}>
                      <Icon size={22} style={{color:f.color}}/>
                    </div>
                    <h2 className="font-black text-3xl mb-4" style={{color:"var(--text)"}}>{t(f.tk)}</h2>
                    <p className="text-base leading-relaxed mb-6" style={{color:"var(--muted)"}}>{t(f.dk)}</p>
                    <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
                      Get started →
                    </Link>
                  </div>
                  <div className={`ck-card p-8 flex items-center justify-center ${isRight?"md:[direction:ltr]":""}`}
                    style={{background:"var(--card)",minHeight:"200px"}}>
                    <Icon size={64} style={{color:`${f.color}60`}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-24 ck-card p-12 text-center" style={{background:"var(--card)"}}>
            <h2 className="font-black text-4xl mb-4" style={{color:"var(--text)"}}>All features, free</h2>
            <p className="mb-8" style={{color:"var(--muted)"}}>No hidden charges. Start today.</p>
            <Link href="/login" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
              Get started free →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
