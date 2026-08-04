import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SectionLabel } from "@/lib/ui";
import { Heart, Target, Zap } from "lucide-react";

const team = [
  { name: "আতিক", role: "Founder & Developer", bio: "Full-stack developer। ভিডিও call technology নিয়ে passionate।", color: "#4F8EF7" },
  { name: "রাহেলা", role: "UI/UX Designer", bio: "User experience design এ ৩+ বছরের অভিজ্ঞতা।", color: "#A855F7" },
  { name: "করিম", role: "Backend Engineer", bio: "Distributed systems ও real-time communication এর expert।", color: "#F97316" },
];

const values = [
  { icon: Heart, color: "#EC4899", title: "সততা", desc: "আমরা transparent। কোনো hidden fee বা misleading claim নেই।" },
  { icon: Target, color: "#3DF29B", title: "সরলতা", desc: "Complex technology কে সহজ করাই আমাদের লক্ষ্য।" },
  { icon: Zap, color: "#4F8EF7", title: "গতি", desc: "সেকেন্ডে কানেক্ট — কোনো ডাউনলোড, কোনো ঝামেলা নেই।" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0B0F14" }} className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 px-5">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-20 fade-up">
            <SectionLabel>Our Story</SectionLabel>
            <h1 className="font-sora font-extrabold text-5xl text-[#E9EEF3] mt-5 mb-6">
              কেন CallKori?
            </h1>
            <p className="text-[#6B7E93] font-manrope text-lg max-w-2xl mx-auto leading-relaxed">
              আমরা দেখেছিলাম বাংলাদেশে মানুষ ভিডিও কলের জন্য বিদেশি app এর উপর নির্ভরশীল।
              তাই আমরা বানালাম CallKori — বাংলাদেশের নিজস্ব HD ভিডিও কল platform।
            </p>
          </div>

          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-10 mb-20 items-center">
            <div>
              <SectionLabel>Mission</SectionLabel>
              <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mt-5 mb-4">আমাদের লক্ষ্য</h2>
              <p className="text-[#6B7E93] font-manrope leading-relaxed mb-4">
                প্রযুক্তির মাধ্যমে মানুষে মানুষে দূরত্ব কমানো। আমরা চাই প্রতিটি বাংলাভাষী মানুষ
                সহজে, বিনামূল্যে তাদের প্রিয়জনদের সাথে HD মানের ভিডিও কলে কথা বলতে পারুক।
              </p>
              <p className="text-[#6B7E93] font-manrope leading-relaxed">
                Agora.io এর global infrastructure ব্যবহার করে আমরা নিশ্চিত করছি যে
                call quality সর্বদা সর্বোচ্চ থাকবে — নেটওয়ার্ক যাই হোক।
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {values.map(v => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="card p-5 flex items-start gap-4" style={{ background: "#141B23" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${v.color}18`, border: `1px solid ${v.color}33` }}>
                      <Icon size={18} style={{ color: v.color }} />
                    </div>
                    <div>
                      <h3 className="font-sora font-bold text-[#E9EEF3] mb-1">{v.title}</h3>
                      <p className="text-[#6B7E93] text-sm font-manrope">{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[["১০০+","Active Users"],["৫০০+","Calls Made"],["৯৯.৯%","Uptime"],["<২s","Connect Time"]].map(([n,l]) => (
              <div key={l} className="card p-5 text-center" style={{ background: "#141B23" }}>
                <p className="font-sora font-extrabold text-3xl text-[#3DF29B] mb-1">{n}</p>
                <p className="text-[#6B7E93] text-sm font-manrope">{l}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <SectionLabel>Team</SectionLabel>
              <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mt-4">আমাদের দল</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map(m => (
                <div key={m.name} className="card p-6 text-center hover:border-[#3DF29B33] transition-all" style={{ background: "#141B23" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-sora font-extrabold text-2xl mx-auto mb-4"
                    style={{ background: `linear-gradient(135deg,${m.color},${m.color}88)` }}>
                    {m.name[0]}
                  </div>
                  <h3 className="font-sora font-bold text-[#E9EEF3] text-base">{m.name}</h3>
                  <p className="text-[#3DF29B] text-xs font-semibold font-manrope mb-2">{m.role}</p>
                  <p className="text-[#6B7E93] text-sm font-manrope leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card p-12 text-center" style={{ background: "#141B23" }}>
            <h2 className="font-sora font-extrabold text-4xl text-[#E9EEF3] mb-3">আমাদের সাথে যোগ দিন</h2>
            <p className="text-[#6B7E93] font-manrope mb-8">আজই বিনামূল্যে শুরু করুন।</p>
            <a href="/login" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
              শুরু করুন →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
