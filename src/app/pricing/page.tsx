"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SectionLabel } from "@/lib/ui";
import { Check, ChevronDown, ChevronUp, Zap } from "lucide-react";

const plans = [
  {
    name: "Free", price: { monthly: 0, yearly: 0 }, color: "#6B7E93",
    desc: "ব্যক্তিগত ব্যবহারের জন্য",
    features: ["HD ভিডিও কল","৪ জন পর্যন্ত","বন্ধু সিস্টেম","ইনভাইট লিংক","৪৫ মিনিট/কল"],
    cta: "শুরু করুন", href: "/login", popular: false,
  },
  {
    name: "Pro", price: { monthly: 299, yearly: 249 }, color: "#3DF29B",
    desc: "পেশাদার ব্যবহারকারীদের জন্য",
    features: ["সব Free ফিচার","১৬ জন পর্যন্ত","সীমাহীন কল","স্ক্রিন শেয়ার","Call recording","Priority support"],
    cta: "Pro শুরু করুন", href: "/login", popular: true,
  },
  {
    name: "Business", price: { monthly: 799, yearly: 649 }, color: "#4F8EF7",
    desc: "টিম ও ব্যবসার জন্য",
    features: ["সব Pro ফিচার","১০০+ জন পর্যন্ত","Custom branding","Analytics dashboard","SSO/SAML","Dedicated support"],
    cta: "Sales এ যোগাযোগ করুন", href: "/contact", popular: false,
  },
];

const faqs = [
  { q:"Free plan এ কোনো credit card লাগবে?", a:"না। Free plan সম্পূর্ণ বিনামূল্যে — কোনো card information দিতে হবে না।" },
  { q:"Yearly plan এ কত সাশ্রয় হবে?", a:"Yearly plan এ প্রতি মাসে প্রায় ১৭% সাশ্রয় হয়। Pro plan এ বছরে ৬০০ টাকা বাঁচবে।" },
  { q:"Plan upgrade বা downgrade করা যাবে?", a:"হ্যাঁ, যেকোনো সময় plan change করা যাবে। Upgrade এর ক্ষেত্রে বাকি দিনের pro-rata charge হবে।" },
  { q:"Call recording কোথায় সেভ হবে?", a:"Pro ও Business plan এ recording আপনার cloud storage এ automatically সেভ হবে।" },
  { q:"Business plan এ কাস্টম domain ব্যবহার করা যাবে?", a:"হ্যাঁ, Business plan এ custom subdomain এবং white-label solution পাওয়া যাবে।" },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: "#0B0F14" }} className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 px-5">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-14 fade-up">
            <SectionLabel>Pricing</SectionLabel>
            <h1 className="font-sora font-extrabold text-5xl text-[#E9EEF3] mt-5 mb-4">
              সহজ, স্বচ্ছ মূল্য
            </h1>
            <p className="text-[#6B7E93] font-manrope text-lg mb-8">Hidden charge নেই। যেকোনো সময় cancel করুন।</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-xl" style={{ background: "#141B23", border: "1px solid #1F2D3D" }}>
              <button onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold font-sora transition-all ${!yearly ? "bg-[#3DF29B] text-[#0B0F14]" : "text-[#6B7E93] hover:text-[#E9EEF3]"}`}>
                Monthly
              </button>
              <button onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold font-sora transition-all flex items-center gap-2 ${yearly ? "bg-[#3DF29B] text-[#0B0F14]" : "text-[#6B7E93] hover:text-[#E9EEF3]"}`}>
                Yearly
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: yearly ? "#0B0F14" : "#3DF29B1A", color: yearly ? "#0B0F14" : "#3DF29B" }}>
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {plans.map((p) => {
              const price = yearly ? p.price.yearly : p.price.monthly;
              return (
                <div key={p.name} className={`card p-7 flex flex-col relative transition-all ${p.popular ? "scale-[1.03] border-[#3DF29B44]" : "hover:border-[#2A3A4A]"}`}
                  style={{ background: p.popular ? "#141B23" : "#0F161E" }}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-sora text-[#0B0F14]"
                      style={{ background: "#3DF29B" }}>
                      ⭐ Most Popular
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-sora font-bold text-lg mb-1" style={{ color: p.color }}>{p.name}</p>
                    <p className="text-[#6B7E93] text-sm font-manrope">{p.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-sora font-extrabold text-4xl text-[#E9EEF3]">
                      {price === 0 ? "Free" : `৳${price}`}
                    </span>
                    {price > 0 && <span className="text-[#6B7E93] font-manrope text-sm ml-1">/মাস</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-manrope text-[#E9EEF3]">
                        <Check size={15} style={{ color: p.color }} className="shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href}
                    className={`text-center py-3 rounded-xl font-sora font-bold text-sm transition-all ${p.popular ? "btn-primary" : "btn-ghost"}`}>
                    {p.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="font-sora font-extrabold text-3xl text-[#E9EEF3] mt-4">সাধারণ প্রশ্নাবলী</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="card overflow-hidden" style={{ background: "#141B23" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left">
                    <span className="font-sora font-semibold text-[#E9EEF3] text-sm">{f.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={18} className="text-[#3DF29B] shrink-0" />
                      : <ChevronDown size={18} className="text-[#6B7E93] shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-[#6B7E93] font-manrope leading-relaxed border-t border-[#1F2D3D] pt-4">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
