"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCTA from "@/components/HeroCTA";
import { useI18n } from "@/lib/i18n";
import { Video, Users, Link2, Shield, Zap, Globe, ChevronRight, Star, Check } from "lucide-react";
import { useMemo } from "react";

/* ── ASCII capsule shape ───────────────────────────────── */
const CHARS = "01アイウエオカキクケコ∑∆∏∫≈≠√";

function AsciiShape() {
  const rows = useMemo(() => {
    const R = 38, C = 68;
    const cx = C / 2, cy = R / 2;
    const rx = C * 0.38, ry = R * 0.46;
    const lines: string[] = [];
    for (let r = 0; r < R; r++) {
      let row = "";
      for (let c = 0; c < C; c++) {
        const dx = (c - cx) / rx, dy = (r - cy) / ry;
        const inside = dx * dx + dy * dy;
        if (inside <= 1) {
          const d = Math.sqrt(inside);
          const idx = Math.floor((c * 7 + r * 13) % CHARS.length);
          row += d > 0.85 ? CHARS[idx] : d > 0.55 ? CHARS[(idx + 3) % CHARS.length] : " ";
        } else { row += " "; }
      }
      lines.push(row);
    }
    return lines;
  }, []);

  return (
    <div className="ascii-grid float-anim select-none" aria-hidden>
      {rows.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}

/* ── Feature card ─────────────────────────────────────── */
function FeatCard({ icon: Icon, title, desc, color }: {
  icon: React.ElementType; title: string; desc: string; color: string;
}) {
  return (
    <div className="ck-card p-6 group hover:border-[var(--accent)] transition-all"
      style={{ background: "var(--card)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
    </div>
  );
}

/* ── Step ─────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
        style={{ background: "var(--glow-a)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
        {n}
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>{title}</h4>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Testimonial ──────────────────────────────────────── */
function Testimonial({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <div className="ck-card p-6" style={{ background: "var(--card)" }}>
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_,i) => (
          <Star key={i} size={13} fill="var(--accent2)" style={{ color: "var(--accent2)" }} />
        ))}
      </div>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted2)" }}>"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "var(--accent)" }}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{name}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Section label ────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4"
      style={{ background: "var(--glow-a)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { t } = useI18n();

  const feats = [
    { icon: Video,  color: "#6366F1", tk: "feat_hd",      dk: "feat_hd_d" },
    { icon: Users,  color: "#8B5CF6", tk: "feat_friends",  dk: "feat_friends_d" },
    { icon: Link2,  color: "#A855F7", tk: "feat_link",     dk: "feat_link_d" },
    { icon: Globe,  color: "#6366F1", tk: "feat_screen",   dk: "feat_screen_d" },
    { icon: Zap,    color: "#8B5CF6", tk: "feat_nc",       dk: "feat_nc_d" },
    { icon: Shield, color: "#A855F7", tk: "feat_secure",   dk: "feat_secure_d" },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-20 px-5 overflow-hidden min-h-screen flex items-center">
        {/* Ambient glows */}
        <div className="ck-glow-br" />
        <div className="ck-glow-tl" />

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left copy */}
          <div className="fade-up">
            {/* Beta badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-7 cursor-pointer"
              style={{ background: "var(--pill-bg)", border: "1px solid var(--pill-border)", color: "var(--muted2)" }}>
              {t("hero_badge")}
            </div>

            <h1 className="font-black leading-[1.05] mb-5"
              style={{ fontSize: "clamp(2.4rem,5vw,3.8rem)", color: "var(--text)" }}>
              {t("hero_h1a")}<br />
              <span style={{ background: "linear-gradient(90deg,var(--accent),var(--accent3))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("hero_h1b")}
              </span>
            </h1>

            <p className="text-base leading-relaxed mb-8 max-w-md"
              style={{ color: "var(--muted2)" }}>
              {t("hero_sub")}
            </p>

            <HeroCTA />

            <div className="flex flex-wrap gap-5 mt-6">
              {([["hero_free","#34D399"],["hero_nodl","#6366F1"],["hero_enc","#A855F7"]] as const).map(([k,c]) => (
                <span key={k} className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: c }}>
                  <Check size={13}/> {t(k)}
                </span>
              ))}
            </div>
          </div>

          {/* Right — ASCII hero */}
          <div className="hidden md:flex justify-center items-center fade-up"
            style={{ animationDelay: ".15s" }}>
            <AsciiShape />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-5" style={{ background: "var(--bg2)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Label>{t("feat_label")}</Label>
            <h2 className="font-black text-3xl mb-3" style={{ color: "var(--text)" }}>{t("feat_h")}</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{t("feat_sub")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feats.map(f => (
              <FeatCard key={f.tk} icon={f.icon} color={f.color}
                title={t(f.tk)} desc={t(f.dk)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Label>{t("how_label")}</Label>
            <h2 className="font-black text-3xl" style={{ color: "var(--text)" }}>{t("how_h")}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-7">
              <Step n="1" title={t("how_1t")} desc={t("how_1d")} />
              <Step n="2" title={t("how_2t")} desc={t("how_2d")} />
              <Step n="3" title={t("how_3t")} desc={t("how_3d")} />
            </div>
            {/* Mini UI mockup */}
            <div className="ck-card p-5" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="font-black text-sm" style={{ color: "var(--text)" }}>callkori</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--glow-a)", color: "var(--green)", border: "1px solid var(--green)" }}>
                  LIVE
                </span>
              </div>
              {[
                { name:"Alex Kim", on:true },
                { name:"Samira H.", on:true },
                { name:"Tanvir A.", on:false },
              ].map(f => (
                <div key={f.name} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--accent)" }}>
                    {f.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{f.name}</p>
                    <p className="text-[10px]" style={{ color: f.on?"var(--green)":"var(--muted)" }}>
                      {f.on ? "Online" : "Offline"}
                    </p>
                  </div>
                  {f.on && (
                    <div className="p-1.5 rounded-lg" style={{ background: "var(--glow-a)" }}>
                      <Video size={12} style={{ color: "var(--accent)" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 px-5" style={{ background: "var(--bg2)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Label>{t("test_label")}</Label>
            <h2 className="font-black text-3xl" style={{ color: "var(--text)" }}>{t("test_h")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Testimonial name="Arif H." role="Software Engineer"
              text="Never found a video call this simple. I use it with friends every day." />
            <Testimonial name="Nafisa T." role="Student"
              text="The invite link feature is brilliant. Friends can join without an account." />
            <Testimonial name="Rakib U." role="Team Lead"
              text="Perfect for team meetings. HD quality and zero lag." />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 px-5 relative overflow-hidden">
        <div className="ck-glow-br" style={{ opacity: 0.6 }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{ background: "var(--glow-a)", border: "1px solid var(--green)", color: "var(--green)" }}>
            <Check size={11} /> {t("cta_badge")}
          </div>
          <h2 className="font-black mb-4" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)" }}>
            {t("cta_h")}
          </h2>
          <p className="text-base mb-10" style={{ color: "var(--muted2)" }}>{t("cta_sub")}</p>
          <Link href="/login" className="btn-white px-9 py-3.5 text-base inline-flex items-center gap-2">
            {t("cta_btn")} <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
