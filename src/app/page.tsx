import Link from "next/link";
import {
  Video,
  Users,
  Link2,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
} from "lucide-react";

/* ─── Social icons (lucide removed these) ───────────────── */
function GithubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/70 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Video size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">CallKori</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">ফিচারসমূহ</a>
          <a href="#how" className="hover:text-white transition-colors">কীভাবে কাজ করে</a>
          <a href="#pricing" className="hover:text-white transition-colors">প্ল্যান</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors hidden sm:block"
          >
            লগইন
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
          >
            শুরু করুন <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-800/70 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Video size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">CallKori</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              বন্ধু, পরিবার এবং সহকর্মীদের সাথে HD মানের ভিডিও কলে সংযুক্ত থাকুন।
              সহজ, দ্রুত, নিরাপদ।
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <GithubIcon size={15} />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <TwitterIcon size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">প্রোডাক্ট</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">ফিচারসমূহ</a></li>
              <li><a href="#how" className="hover:text-white transition-colors">কীভাবে কাজ করে</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">ড্যাশবোর্ড</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">একাউন্ট</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">লগইন করুন</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">একাউন্ট খুলুন</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2024 CallKori · সর্বস্বত্ব সংরক্ষিত</p>
          <p>Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Feature Card ───────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 hover:bg-slate-900/80 transition-all group">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Step Card ──────────────────────────────────────────── */
function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
        {step}
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Home Page ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-5 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-violet-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-64 h-64 bg-sky-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap size={12} className="fill-current" />
            Agora.io পাওয়ার্ড · রিয়েল-টাইম HD ভিডিও
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            ভিডিও কলে{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              কাছে থাকুন
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            বন্ধু যোগ করুন, ইনভাইট লিংক শেয়ার করুন এবং এক ক্লিকেই HD ভিডিও কল শুরু করুন।
            কোনো ঝামেলা নেই, কোনো ডাউনলোড নেই।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 text-base"
            >
              এখনই শুরু করুন <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all text-base"
            >
              লগইন করুন
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500">
            {["বিনামূল্যে", "কোনো ডাউনলোড নেই", "এন্ড-টু-এন্ড এনক্রিপ্টেড"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-green-500" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero preview card */}
        <div className="max-w-3xl mx-auto mt-16 relative z-10">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-3">
              {/* Fake video tiles */}
              {[
                { name: "রাহেলা", color: "from-indigo-600 to-violet-600", active: true },
                { name: "করিম", color: "from-pink-600 to-rose-600", active: false },
                { name: "তানভীর", color: "from-teal-600 to-sky-600", active: false },
                { name: "সুমাইয়া", color: "from-amber-600 to-orange-600", active: true },
              ].map((u) => (
                <div
                  key={u.name}
                  className={`relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center bg-gradient-to-br ${u.color} opacity-80`}
                >
                  <span className="text-white font-bold text-2xl">
                    {u.name[0]}
                  </span>
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                    <span className="text-white text-xs">{u.name}</span>
                  </div>
                  {u.active && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            {/* Fake control bar */}
            <div className="flex items-center justify-center gap-4 mt-4 pb-1">
              {[
                { bg: "bg-slate-700", icon: "🎤" },
                { bg: "bg-slate-700", icon: "📷" },
                { bg: "bg-red-600", icon: "📵" },
              ].map((b, i) => (
                <div key={i} className={`${b.bg} w-10 h-10 rounded-xl flex items-center justify-center text-base`}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">সব কিছু এক জায়গায়</h2>
            <p className="text-slate-400 text-lg">ভিডিও কলের জন্য যা দরকার সব আছে</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Video}
              color="bg-indigo-600"
              title="HD ভিডিও কল"
              desc="Agora.io এর শক্তিতে লো-লেটেন্সি, হাই-কোয়ালিটি ভিডিও কল উপভোগ করুন।"
            />
            <FeatureCard
              icon={Users}
              color="bg-violet-600"
              title="বন্ধু সিস্টেম"
              desc="বন্ধুদের খুঁজুন, রিকোয়েস্ট পাঠান এবং সংযুক্ত থাকুন। এক ক্লিকে কল করুন।"
            />
            <FeatureCard
              icon={Link2}
              color="bg-pink-600"
              title="ইনভাইট লিংক"
              desc="যেকোনো সময় ইউনিক লিংক তৈরি করুন এবং শেয়ার করুন — একাউন্ট ছাড়াও যোগ দেওয়া যাবে।"
            />
            <FeatureCard
              icon={Shield}
              color="bg-green-600"
              title="নিরাপদ ও এনক্রিপ্টেড"
              desc="আপনার কল এবং তথ্য সম্পূর্ণ নিরাপদ। কোনো তৃতীয় পক্ষের অ্যাক্সেস নেই।"
            />
            <FeatureCard
              icon={Zap}
              color="bg-amber-600"
              title="দ্রুত ও সহজ"
              desc="কোনো ডাউনলোড দরকার নেই। ব্রাউজারেই সবকিছু চলে। সেকেন্ডে কানেক্ট হন।"
            />
            <FeatureCard
              icon={Globe}
              color="bg-sky-600"
              title="যেকোনো ডিভাইস"
              desc="মোবাইল, ট্যাবলেট বা ডেস্কটপ — যেকোনো ডিভাইস থেকে সহজেই ব্যবহার করুন।"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-5 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">কীভাবে কাজ করে?</h2>
            <p className="text-slate-400 text-lg">মাত্র ৩টি ধাপে ভিডিও কল শুরু করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-8">
              <StepCard
                step="১"
                title="একাউন্ট তৈরি করুন"
                desc="ইমেইল ও পাসওয়ার্ড দিয়ে মাত্র কয়েক সেকেন্ডে বিনামূল্যে একাউন্ট খুলুন।"
              />
              <StepCard
                step="২"
                title="বন্ধু যোগ করুন বা লিংক শেয়ার করুন"
                desc="বন্ধুর নাম বা ইমেইল দিয়ে খুঁজুন এবং রিকোয়েস্ট পাঠান। অথবা ইনভাইট লিংক শেয়ার করুন।"
              />
              <StepCard
                step="৩"
                title="ভিডিও কল শুরু করুন"
                desc="এক ক্লিকে রুম তৈরি করুন এবং বন্ধুদের সাথে HD ভিডিও কলে যুক্ত হন।"
              />
            </div>

            {/* Right side illustration */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl">
              {/* Mini dashboard preview */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                  <Video size={12} className="text-white" />
                </div>
                <span className="text-white font-bold text-sm">CallKori</span>
                <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">লাইভ</span>
              </div>

              {/* Mock friends */}
              {[
                { name: "রাহেলা আক্তার", status: "অনলাইন", color: "bg-indigo-600" },
                { name: "করিম হোসেন", status: "অনলাইন", color: "bg-teal-600" },
                { name: "তানভীর আহমেদ", status: "অফলাইন", color: "bg-pink-600" },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                  <div className={`w-8 h-8 ${f.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {f.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-medium">{f.name}</p>
                    <p className={`text-xs ${f.status === "অনলাইন" ? "text-green-400" : "text-slate-500"}`}>{f.status}</p>
                  </div>
                  {f.status === "অনলাইন" && (
                    <button className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                      <Video size={12} />
                    </button>
                  )}
                </div>
              ))}

              <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                <p className="text-indigo-300 text-xs font-medium">ইনভাইট লিংক তৈরি করুন</p>
                <p className="text-slate-500 text-xs mt-0.5">callkori.app/room/ck-a3f9b2</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section id="pricing" className="py-28 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20 pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <Check size={12} />
            সম্পূর্ণ বিনামূল্যে
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            আজই শুরু করুন,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              বিনামূল্যে
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            কোনো ক্রেডিট কার্ড দরকার নেই। কোনো সময়সীমা নেই। এখনই একাউন্ট খুলুন।
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-9 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 text-lg"
          >
            বিনামূল্যে শুরু করুন <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
