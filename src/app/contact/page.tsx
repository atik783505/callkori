"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { Mail, Clock, MapPin, CheckCircle, Send } from "lucide-react";

export default function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p=>({...p,[k]:e.target.value}));

  const info = [
    { icon:Mail,    label:t("contact_email_label"),  val:"support@callkori.com" },
    { icon:Clock,   label:t("contact_hours_label"),  val:t("contact_hours_val") },
    { icon:MapPin,  label:t("contact_office_label"), val:t("contact_office_val") },
  ];

  return (
    <div style={{background:"var(--bg)"}} className="min-h-screen">
      <Navbar/>
      <div className="pt-28 pb-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{background:"var(--glow-a)",border:"1px solid var(--accent)",color:"var(--accent)"}}>
              {t("contact_label")}
            </div>
            <h1 className="font-black text-5xl mb-4" style={{color:"var(--text)"}}>{t("contact_h")}</h1>
            <p className="text-base" style={{color:"var(--muted)"}}>{t("contact_sub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              {info.map(i=>{
                const Icon=i.icon;
                return(
                  <div key={i.label} className="ck-card p-5 flex items-start gap-4" style={{background:"var(--card)"}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{background:"var(--glow-a)",border:"1px solid var(--accent)"}}>
                      <Icon size={16} style={{color:"var(--accent)"}}/>
                    </div>
                    <div><p className="font-semibold text-sm" style={{color:"var(--text)"}}>{i.label}</p>
                      <p className="text-xs mt-0.5" style={{color:"var(--muted)"}}>{i.val}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="md:col-span-2">
              {sent?(
                <div className="ck-card p-10 flex flex-col items-center justify-center text-center h-full" style={{background:"var(--card)"}}>
                  <CheckCircle size={48} className="mb-4" style={{color:"var(--green)"}}/>
                  <h3 className="font-bold text-xl mb-2" style={{color:"var(--text)"}}>{t("contact_sent_h")}</h3>
                  <p className="text-sm" style={{color:"var(--muted)"}}>{t("contact_sent_p")}</p>
                </div>
              ):(
                <div className="ck-card p-7" style={{background:"var(--card)"}}>
                  <h2 className="font-bold text-xl mb-6" style={{color:"var(--text)"}}>{t("contact_form_h")}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input placeholder={t("contact_name_ph")} required value={form.name} onChange={set("name")} className="ck-input px-4 py-3 text-sm"/>
                      <input type="email" placeholder={t("contact_email_ph")} required value={form.email} onChange={set("email")} className="ck-input px-4 py-3 text-sm"/>
                    </div>
                    <input placeholder={t("contact_subject_ph")} value={form.subject} onChange={set("subject")} className="ck-input px-4 py-3 text-sm"/>
                    <textarea placeholder={t("contact_msg_ph")} required rows={5} value={form.message} onChange={set("message")} className="ck-input px-4 py-3 text-sm resize-none"/>
                    <button type="submit" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                      <Send size={15}/>{t("contact_send")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
