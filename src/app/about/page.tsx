"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { Heart, Target, Zap } from "lucide-react";

export default function AboutPage() {
  const { t } = useI18n();
  const team = [
    { name:"Atik", role:"Founder & Developer", color:"#6366F1" },
    { name:"Rahela", role:"UI/UX Designer", color:"#8B5CF6" },
    { name:"Karim", role:"Backend Engineer", color:"#A855F7" },
  ];
  const values = [
    { icon:Heart, color:"#EC4899", title:"Honesty", desc:"Transparent pricing. No hidden fees or misleading claims." },
    { icon:Target, color:"var(--green)", title:"Simplicity", desc:"Complex technology made simple. That's our goal." },
    { icon:Zap, color:"var(--accent)", title:"Speed", desc:"Connect in seconds. No downloads, no friction." },
  ];
  const stats = t("about_stats") as unknown as string[];

  return (
    <div style={{background:"var(--bg)"}} className="min-h-screen">
      <Navbar/>
      <div className="pt-28 pb-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>Our Story</div>
            <h1 className="font-black text-5xl mb-5" style={{color:"var(--text)"}}>{t("about_h")}</h1>
            <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{color:"var(--muted)"}}>{t("about_sub")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>
                {t("about_mission_label")}
              </div>
              <h2 className="font-black text-4xl mb-4" style={{color:"var(--text)"}}>{t("about_mission_h")}</h2>
              <p className="text-sm leading-relaxed mb-3" style={{color:"var(--muted)"}}>{t("about_mission_p1")}</p>
              <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{t("about_mission_p2")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {values.map(v=>{
                const Icon=v.icon;
                return(
                  <div key={v.title} className="ck-card p-5 flex items-start gap-4" style={{background:"var(--card)"}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{background:`${v.color}15`,border:`1px solid ${v.color}30`}}>
                      <Icon size={18} style={{color:v.color}}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{color:"var(--text)"}}>{v.title}</h3>
                      <p className="text-xs leading-relaxed" style={{color:"var(--muted)"}}>{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map(s=>{
              const [n,...rest]=s.split(" ");
              return(
                <div key={s} className="ck-card p-5 text-center" style={{background:"var(--card)"}}>
                  <p className="font-black text-3xl" style={{color:"var(--accent)"}}>{n}</p>
                  <p className="text-xs mt-1" style={{color:"var(--muted)"}}>{rest.join(" ")}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>
                {t("about_team_label")}
              </div>
              <h2 className="font-black text-4xl" style={{color:"var(--text)"}}>{t("about_team_h")}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {team.map(m=>(
                <div key={m.name} className="ck-card p-6 text-center" style={{background:"var(--card)"}}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-4"
                    style={{background:m.color}}>{m.name[0]}</div>
                  <h3 className="font-bold mb-1" style={{color:"var(--text)"}}>{m.name}</h3>
                  <p className="text-xs font-semibold" style={{color:"var(--accent)"}}>{m.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ck-card p-12 text-center" style={{background:"var(--card)"}}>
            <h2 className="font-black text-4xl mb-3" style={{color:"var(--text)"}}>{t("about_cta_h")}</h2>
            <p className="mb-8" style={{color:"var(--muted)"}}>{t("about_cta_p")}</p>
            <Link href="/login" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
              Get started free →
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
