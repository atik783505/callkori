import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCTA from "@/components/HeroCTA";
import { Logo, SectionLabel, GreenDot, Waveform } from "@/lib/ui";
import { Shield, Zap, Globe, Users, Video, Link2, ChevronRight, Star } from "lucide-react";

/* ── Live call mockup ──────────────────────────────────── */
function CallMockup() {
  const tiles = [
    { name: "রাহেলা", color: "#4F8EF7", speaking: true },
    { name: "করিম", color: "#A855F7", speaking: false },
    { name: "তানভীর", color: "#F97316", speaking: false },
    { name: "সুমাইয়া", color: "#3DF29B", speaking: false },
  ];
  return (
    <div className="relative w-full max-w-lg mx-auto float-anim">
      <div className="card p-3 shadow-2xl" style={{ boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>
        {/* top bar */}
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex items-center gap-1.5">
            <GreenDot />
            <span className="text-[#3DF29B] text-xs font-bold font-sora tracking-wider">LIVE</span>
          </div>
          <span className="text-[#6B7E93] text-xs font-manrope">ck-a3f9b2 · 4 জন</span>
          <div className="flex gap-1">
            {[1,2,3].map(i=><div key={i} className="w-2 h-2 rounded-full bg-[#1F2D3D]"/>)}
          </div>
        </div>
        {/* grid */}
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <div key={t.name} className={`relative rounded-xl overflow-hidden aspect-video flex items-center justify-center transition-all ${t.speaking ? "glow-green ring-2 ring-[#3DF29B] scale-[1.02]" : ""}`}
              style={{ background: `linear-gradient(135deg,${t.color}22,${t.color}44)` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white font-sora"
                style={{ background: t.color }}>
                {t.name[0]}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-white text-xs font-semibold font-manrope drop-shadow">{t.name}</span>
                {t.speaking && <Waveform bars={4} active />}
              </div>
            </div>
          ))}
        </div>
        {/* controls */}
        <div className="flex justify-center gap-3 pt-3">
          {["🎙️","📷","💬","👥"].map(e=>(
            <div key={e} className="w-9 h-9 rounded-xl bg-[#1A2330] flex items-center justify-center text-base">{e}</div>
          ))}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{background:"#FF5C5C22",border:"1px solid #FF5C5C44"}}>📵</div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature bento card ────────────────────────────────── */
function BentoCard({ icon: Icon, title, desc, color, wide = false }: {
  icon: React.ElementType; title: string; desc: string; color: string; wide?: boolean;
}) {
  return (
    <div className={`card p-6 hover:border-[#3DF29B44] transition-all group ${wide ? "md:col-span-2" : ""}`}
      style={{ background: "#141B23" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <h3 className="font-sora font-bold text-[#E9EEF3] text-base mb-2">{title}</h3>
      <p className="text-[#6B7E93] text-sm font-manrope leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Step ───────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-xl font-sora font-bold text-sm flex items-center justify-center text-[#3DF29B]"
        style={{ background:"#3DF29B0F", border:"1px solid #3DF29B33" }}>{n}</div>
      <div>
        <h4 className="font-sora font-bold text-[#E9EEF3] mb-1">{title}</h4>
        <p className="text-[#6B7E93] text-sm font-manrope leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Testimonial ────────────────────────────────────────── */
function Testimonial({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <div className="card p-6" style={{ background: "#141B23" }}>
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="#3DF29B" className="text-[#3DF29B]" />)}
      </div>
      <p className="text-[#E9EEF3] text-sm font-manrope leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#4F8EF7] flex items-center justify-center text-white font-bold text-sm font-sora">{name[0]}</div>
        <div>
          <p className="text-[#E9EEF3] text-sm font-semibold font-manrope">{name}</p>
          <p className="text-[#6B7E93] text-xs font-manrope">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#0B0F14" }}>
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative pt-32 pb-24 px-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse,#3DF29B 0%,transparent 70%)", filter:"blur(80px)" }} />
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="fade-up">
            <SectionLabel>🎥 Powered by Agora RTC</SectionLabel>
            <h1 className="font-sora font-extrabold text-5xl sm:text-6xl leading-[1.1] mt-6 mb-6"
              style={{ color:"#E9EEF3" }}>
              ভিডিও কলে<br />
              <span style={{ background:"linear-gradient(90deg,#3DF29B,#4F8EF7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                কাছে থাকুন
              </span>
            </h1>
            <p className="text-[#6B7E93] text-lg font-manrope leading-relaxed mb-8 max-w-md">
              বন্ধু যোগ করুন, ইনভাইট লিংক শেয়ার করুন এবং এক ক্লিকে HD ভিডিও কল শুরু করুন।
            </p>
            <HeroCTA />
            <div className="flex flex-wrap gap-5 text-sm font-manrope text-[#6B7E93]">
              {["✓ বিনামূল্যে","✓ কোনো ডাউনলোড নেই","✓ এন্ড-টু-এন্ড এনক্রিপ্টেড"].map(t=>(
                <span key={t} className="text-[#3DF29B]">{t}</span>
              ))}
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay: ".15s" }}>
            <CallMockup />
          </div>
        </div>
      </section>

      {/* ══ FEATURES BENTO ══ */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 fade-up">
            <SectionLabel>Features</SectionLabel>
            <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mt-4 mb-3">সব কিছু এক জায়গায়</h2>
            <p className="text-[#6B7E93] font-manrope">ভিডিও কলের জন্য যা দরকার সব আছে</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BentoCard icon={Video} color="#3DF29B" title="HD ভিডিও কল"
              desc="Agora.io এর শক্তিতে লো-লেটেন্সি, হাই-কোয়ালিটি ভিডিও কল।" />
            <BentoCard icon={Users} color="#4F8EF7" title="বন্ধু সিস্টেম"
              desc="বন্ধুদের খুঁজুন, রিকোয়েস্ট পাঠান এবং এক ক্লিকে কল করুন।" />
            <BentoCard icon={Link2} color="#A855F7" title="ইনভাইট লিংক"
              desc="ইউনিক লিংক তৈরি করুন — একাউন্ট ছাড়াও যোগ দেওয়া যাবে।" />
            <BentoCard icon={Shield} color="#F97316" title="নিরাপদ"
              desc="Token-based authentication এবং এনক্রিপ্টেড কানেকশন।" />
            <BentoCard icon={Zap} color="#EC4899" title="তাৎক্ষণিক"
              desc="কোনো ডাউনলোড নেই। ব্রাউজারেই সেকেন্ডে কানেক্ট হন।" />
            <BentoCard icon={Globe} color="#06B6D4" title="যেকোনো ডিভাইস"
              desc="মোবাইল, ট্যাবলেট বা ডেস্কটপ — সব ডিভাইসে কাজ করে।" />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-24 px-5" style={{ background: "#0D1117" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mt-4 mb-3">মাত্র ৩ ধাপে শুরু করুন</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <Step n="১" title="একাউন্ট তৈরি করুন"
                desc="ইমেইল ও পাসওয়ার্ড দিয়ে মাত্র কয়েক সেকেন্ডে বিনামূল্যে একাউন্ট খুলুন।" />
              <Step n="২" title="বন্ধু যোগ করুন বা লিংক শেয়ার করুন"
                desc="বন্ধুর নাম বা ইমেইল দিয়ে খুঁজুন এবং রিকোয়েস্ট পাঠান।" />
              <Step n="৩" title="কল শুরু করুন"
                desc="এক ক্লিকে মিট তৈরি করুন এবং বন্ধুদের সাথে HD ভিডিও কলে যুক্ত হন।" />
            </div>
            {/* mini dashboard mockup */}
            <div className="card p-5" style={{ background:"#141B23" }}>
              <div className="flex items-center justify-between mb-5">
                <Logo size="sm" />
                <span className="text-[#3DF29B] text-xs font-bold font-sora border border-[#3DF29B33] bg-[#3DF29B0F] px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              {[{ name:"রাহেলা আক্তার", on:true },{ name:"করিম হোসেন", on:true },{ name:"তানভীর আহমেদ", on:false }].map(f=>(
                <div key={f.name} className="flex items-center gap-3 py-2.5 border-b border-[#1F2D3D] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#4F8EF7] flex items-center justify-center text-white text-xs font-bold font-sora">{f.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-[#E9EEF3] text-xs font-semibold font-manrope">{f.name}</p>
                    <p className={`text-xs font-manrope ${f.on?"text-[#3DF29B]":"text-[#6B7E93]"}`}>{f.on?"অনলাইন":"অফলাইন"}</p>
                  </div>
                  {f.on && <button className="p-1.5 rounded-lg text-[#3DF29B]" style={{background:"#3DF29B15"}}><Video size={13}/></button>}
                </div>
              ))}
              <div className="mt-4 rounded-xl p-3 text-center" style={{background:"#3DF29B0A",border:"1px solid #3DF29B22"}}>
                <p className="text-[#3DF29B] text-xs font-bold font-sora">নতুন মিট শুরু করুন</p>
                <p className="text-[#6B7E93] text-xs font-manrope mt-0.5">callkori.vercel.app/room/ck-a3f9b2</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mt-4">ব্যবহারকারীরা কী বলছেন</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Testimonial name="আরিফ হোসেন" role="Software Engineer" text="এত সহজ ভিডিও কল আর কোথাও পাইনি। বন্ধুদের সাথে প্রতিদিন ব্যবহার করি।" />
            <Testimonial name="নাফিসা তাসনিম" role="Student" text="লিংক শেয়ার করার ফিচারটা দারুণ। কোনো একাউন্ট ছাড়াই বন্ধু join করতে পারে।" />
            <Testimonial name="রাকিব উল্লাহ" role="Team Lead" text="Team meeting এর জন্য perfect। HD quality এবং কোনো lag নেই।" />
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 px-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-15"
            style={{ background:"radial-gradient(ellipse,#3DF29B,transparent 70%)", filter:"blur(60px)" }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <SectionLabel>Get started free</SectionLabel>
          <h2 className="font-sora font-extrabold text-5xl text-[#E9EEF3] mt-6 mb-4 leading-tight">
            আজই শুরু করুন,<br />
            <span style={{ background:"linear-gradient(90deg,#3DF29B,#4F8EF7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>বিনামূল্যে</span>
          </h2>
          <p className="text-[#6B7E93] font-manrope text-lg mb-10">কোনো ক্রেডিট কার্ড দরকার নেই। কোনো সময়সীমা নেই।</p>
          <Link href="/login" className="btn-primary px-10 py-4 text-lg inline-flex items-center gap-2">
            বিনামূল্যে শুরু করুন <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
