"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const PLANS = [
  { nameKey:"price_free" as const, descKey:"price_free_desc" as const, ctaKey:"price_cta_free" as const, price:{m:0,y:0}, color:"var(--muted)", href:"/login", popular:false,
    features:["HD video calls","Up to 4 people","Friend system","Invite links","45 min/call"] },
  { nameKey:"price_pro" as const, descKey:"price_pro_desc" as const, ctaKey:"price_cta_pro" as const, price:{m:299,y:249}, color:"var(--accent)", href:"/login", popular:true,
    features:["All Free features","Up to 16 people","Unlimited calls","Screen share","Call recording","Priority support"] },
  { nameKey:"price_biz" as const, descKey:"price_biz_desc" as const, ctaKey:"price_cta_biz" as const, price:{m:799,y:649}, color:"var(--accent2)", href:"/contact", popular:false,
    features:["All Pro features","100+ people","Custom branding","Analytics","SSO/SAML","Dedicated support"] },
];

const FAQS = [
  { q:"Do I need a credit card for the free plan?", a:"No. The free plan is completely free — no card required." },
  { q:"How much do I save with yearly billing?", a:"About 17% per month. For Pro, that's ৳600 saved per year." },
  { q:"Can I upgrade or downgrade my plan?", a:"Yes, anytime. Upgrades are pro-rated for the remaining days." },
  { q:"Where are call recordings saved?", a:"On Pro and Business plans, recordings save to your cloud storage automatically." },
];

export default function PricingPage() {
  const { t } = useI18n();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  return (
    <div style={{background:"var(--bg)"}} className="min-h-screen">
      <Navbar/>
      <div className="pt-28 pb-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>
              {t("price_label")}
            </div>
            <h1 className="font-black text-5xl mb-4" style={{color:"var(--text)"}}>{t("price_h")}</h1>
            <p className="mb-8" style={{color:"var(--muted)"}}>{t("price_sub")}</p>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl"
              style={{background:"var(--bg3)",border:"1px solid var(--border)"}}>
              {[[t("price_monthly"),false],[t("price_yearly"),true]].map(([label,val])=>(
                <button key={String(val)} onClick={()=>setYearly(val as boolean)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  style={yearly===val?{background:"var(--accent)",color:"#fff"}:{color:"var(--muted)"}}>
                  {label}
                  {val&&<span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{background:yearly?"rgba(0,0,0,.2)":"var(--glow-a)",color:yearly?"#fff":"var(--accent)"}}>
                    {t("price_save")}
                  </span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {PLANS.map(p=>{
              const price = yearly ? p.price.y : p.price.m;
              return (
                <div key={p.nameKey} className={`ck-card p-7 flex flex-col relative transition-all ${p.popular?"scale-[1.02]":""}`}
                  style={{background:"var(--card)",borderColor:p.popular?"var(--accent)":undefined}}>
                  {p.popular&&(
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{background:"var(--accent)"}}>
                      {t("price_popular")}
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-bold text-lg mb-1" style={{color:p.color}}>{t(p.nameKey)}</p>
                    <p className="text-sm" style={{color:"var(--muted)"}}>{t(p.descKey)}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-black text-4xl" style={{color:"var(--text)"}}>
                      {price===0?"Free":`৳${price}`}
                    </span>
                    {price>0&&<span className="text-sm ml-1" style={{color:"var(--muted)"}}>{t("price_mo")}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map(f=>(
                      <li key={f} className="flex items-center gap-2.5 text-sm" style={{color:"var(--text)"}}>
                        <Check size={14} style={{color:p.color}} className="shrink-0"/>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href} className={`text-center py-3 rounded-xl text-sm font-bold transition-all ${p.popular?"btn-primary":"btn-ghost"}`}>
                    {t(p.ctaKey)}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-black text-3xl" style={{color:"var(--text)"}}>{t("price_faq_h")}</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((f,i)=>(
                <div key={i} className="ck-card overflow-hidden" style={{background:"var(--card)"}}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                    className="w-full flex items-center justify-between p-5 text-left">
                    <span className="font-semibold text-sm" style={{color:"var(--text)"}}>{f.q}</span>
                    {openFaq===i?<ChevronUp size={16} style={{color:"var(--accent)"}}/>:<ChevronDown size={16} style={{color:"var(--muted)"}}/>}
                  </button>
                  {openFaq===i&&(
                    <div className="px-5 pb-5 text-sm leading-relaxed border-t pt-4"
                      style={{borderColor:"var(--border)",color:"var(--muted)"}}>
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
