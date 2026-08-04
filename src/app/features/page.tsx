import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SectionLabel } from "@/lib/ui";
import { Video, Users, Link2, Shield, Zap, Globe, Mic, MonitorPlay, Bell, Lock } from "lucide-react";

const features = [
  {
    icon: Video, color: "#3DF29B", title: "HD ভিডিও কল",
    desc: "Agora RTC SDK ব্যবহার করে ultra-low latency, 1080p পর্যন্ত ভিডিও কল উপভোগ করুন। নেটওয়ার্ক দুর্বল হলেও adaptive bitrate কাজ করে।",
    mockup: (
      <div className="card p-4 w-full" style={{background:"#0D1117"}}>
        <div className="grid grid-cols-2 gap-2">
          {["#4F8EF7","#A855F7","#F97316","#3DF29B"].map((c,i)=>(
            <div key={i} className="rounded-xl aspect-video flex items-center justify-center text-2xl font-bold text-white font-sora"
              style={{background:`linear-gradient(135deg,${c}22,${c}44)`}}>
              {["র","ক","ত","স"][i]}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {["🎙️","📷","📵"].map(e=><div key={e} className="w-8 h-8 rounded-lg bg-[#1A2330] flex items-center justify-center text-sm">{e}</div>)}
        </div>
      </div>
    ),
  },
  {
    icon: Users, color: "#4F8EF7", title: "বন্ধু সিস্টেম",
    desc: "নাম বা ইমেইল দিয়ে যেকোনো ব্যবহারকারীকে খুঁজুন, friend request পাঠান এবং accept হলেই এক ক্লিকে সরাসরি কল করুন।",
    mockup: (
      <div className="card p-4 w-full space-y-2" style={{background:"#0D1117"}}>
        {[{n:"রাহেলা আক্তার",c:"#4F8EF7",s:"অনলাইন"},{n:"করিম হোসেন",c:"#A855F7",s:"অনলাইন"},{n:"তানভীর",c:"#F97316",s:"অফলাইন"}].map(f=>(
          <div key={f.n} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141B23]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:f.c}}>{f.n[0]}</div>
            <div className="flex-1"><p className="text-[#E9EEF3] text-xs font-semibold font-manrope">{f.n}</p>
              <p className={`text-xs font-manrope ${f.s==="অনলাইন"?"text-[#3DF29B]":"text-[#6B7E93]"}`}>{f.s}</p></div>
            {f.s==="অনলাইন"&&<span className="text-[#3DF29B] text-lg">📞</span>}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Link2, color: "#A855F7", title: "ইনভাইট লিংক",
    desc: "যেকোনো সময় একটি unique room link তৈরি করুন এবং যেকাউকে share করুন। একাউন্ট ছাড়াও join করা যাবে।",
    mockup: (
      <div className="card p-4 w-full" style={{background:"#0D1117"}}>
        <p className="text-[#6B7E93] text-xs font-manrope mb-2">ইনভাইট লিংক</p>
        <div className="flex items-center gap-2 bg-[#141B23] rounded-xl p-3 border border-[#1F2D3D]">
          <span className="text-[#3DF29B] text-xs font-mono truncate flex-1">callkori.vercel.app/room/ck-a3f9b2</span>
          <button className="text-xs bg-[#3DF29B15] text-[#3DF29B] px-2 py-1 rounded-lg font-sora font-bold border border-[#3DF29B33]">Copy</button>
        </div>
        <p className="text-[#6B7E93] text-xs font-manrope mt-3">এই লিংক ৬০ মিনিট active থাকবে</p>
      </div>
    ),
  },
  {
    icon: Bell, color: "#F97316", title: "Direct Call Notification",
    desc: "বন্ধুকে call করলে তার dashboard বা room এ একটি incoming call notification আসে — accept বা decline করতে পারবে।",
    mockup: (
      <div className="card p-4 w-full" style={{background:"#0D1117"}}>
        <div className="rounded-2xl p-4 border border-[#F97316]/30 bg-[#F97316]/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#4F8EF7] flex items-center justify-center text-white font-bold text-lg animate-pulse">র</div>
          <div className="flex-1">
            <p className="text-[#E9EEF3] font-semibold text-sm font-manrope">রাহেলা আক্তার</p>
            <p className="text-[#6B7E93] text-xs font-manrope">ভিডিও কলে আমন্ত্রণ জানাচ্ছেন</p>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF5C5C20] flex items-center justify-center text-lg">📵</div>
            <div className="w-9 h-9 rounded-xl bg-[#3DF29B20] flex items-center justify-center text-lg">📞</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Shield, color: "#EC4899", title: "Token Authentication",
    desc: "প্রতিটি call এর জন্য server-side এ Agora token generate হয়। Certificate কখনো client এ expose হয় না।",
    mockup: (
      <div className="card p-4 w-full" style={{background:"#0D1117"}}>
        <div className="space-y-2 font-mono text-xs">
          {["✅ App Certificate — server only","✅ Token expiry: 1 hour","✅ Per-channel token","✅ Better Auth session guard"].map(l=>(
            <div key={l} className="p-2 rounded-lg bg-[#141B23] text-[#3DF29B]">{l}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Zap, color: "#06B6D4", title: "তাৎক্ষণিক সংযোগ",
    desc: "কোনো ডাউনলোড নেই, কোনো plugin নেই। ব্রাউজার খুলুন, link click করুন — সেকেন্ডে HD call এ ঢুকে যান।",
    mockup: (
      <div className="card p-4 w-full flex flex-col items-center gap-3" style={{background:"#0D1117"}}>
        <div className="text-5xl">⚡</div>
        <div className="text-center">
          <p className="text-[#E9EEF3] font-sora font-bold text-lg">&lt; 2 সেকেন্ড</p>
          <p className="text-[#6B7E93] text-sm font-manrope">গড় কানেকশন সময়</p>
        </div>
        <div className="w-full bg-[#1A2330] rounded-full h-2">
          <div className="h-2 rounded-full" style={{width:"85%",background:"linear-gradient(90deg,#3DF29B,#4F8EF7)"}}/>
        </div>
      </div>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <div style={{background:"#0B0F14"}} className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20 fade-up">
            <SectionLabel>All Features</SectionLabel>
            <h1 className="font-sora font-extrabold text-5xl text-[#E9EEF3] mt-5 mb-4">
              প্রতিটি ফিচার,<br />
              <span style={{background:"linear-gradient(90deg,#3DF29B,#4F8EF7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                বিস্তারিতভাবে
              </span>
            </h1>
            <p className="text-[#6B7E93] font-manrope text-lg max-w-xl mx-auto">
              CallKori তে যা আছে সেগুলো শুধু feature নয় — প্রতিটি কাজের ক্ষমতা।
            </p>
          </div>

          {/* Alternating sections */}
          <div className="space-y-24">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isRight = i % 2 === 1;
              return (
                <div key={f.title} className={`grid md:grid-cols-2 gap-12 items-center ${isRight ? "md:[direction:rtl]" : ""}`}>
                  <div className={isRight ? "md:[direction:ltr]" : ""}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{background:`${f.color}18`,border:`1px solid ${f.color}33`}}>
                      <Icon size={22} style={{color:f.color}} />
                    </div>
                    <h2 className="font-sora font-extrabold text-3xl text-[#E9EEF3] mb-4">{f.title}</h2>
                    <p className="text-[#6B7E93] font-manrope text-base leading-relaxed mb-6">{f.desc}</p>
                    <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
                      ব্যবহার করুন →
                    </Link>
                  </div>
                  <div className={isRight ? "md:[direction:ltr]" : ""}>
                    {f.mockup}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center card p-12" style={{background:"#141B23"}}>
            <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mb-4">সব ফিচার বিনামূল্যে</h2>
            <p className="text-[#6B7E93] font-manrope mb-8">কোনো hidden charge নেই। আজই শুরু করুন।</p>
            <Link href="/login" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
              বিনামূল্যে শুরু করুন →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
