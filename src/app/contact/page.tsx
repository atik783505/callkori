"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SectionLabel } from "@/lib/ui";
import { Mail, MessageSquare, Send, MapPin, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none transition-all";
  const inputStyle = { background: "#141B23", border: "1px solid #1F2D3D" };

  return (
    <div style={{ background: "#0B0F14" }} className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 px-5">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16 fade-up">
            <SectionLabel>Contact</SectionLabel>
            <h1 className="font-sora font-extrabold text-5xl text-[#E9EEF3] mt-5 mb-4">আমাদের সাথে কথা বলুন</h1>
            <p className="text-[#6B7E93] font-manrope text-lg">যেকোনো প্রশ্ন বা সমস্যায় আমরা সাহায্য করতে প্রস্তুত।</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Info */}
            <div className="space-y-5">
              {[
                { icon: Mail, color: "#3DF29B", title: "ইমেইল", val: "support@callkori.com" },
                { icon: Clock, color: "#4F8EF7", title: "সাপোর্ট সময়", val: "৯AM–৯PM (বাংলাদেশ সময়)" },
                { icon: MapPin, color: "#A855F7", title: "অফিস", val: "ঢাকা, বাংলাদেশ" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="card p-5 flex items-start gap-4" style={{ background: "#141B23" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}33` }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="font-sora font-semibold text-[#E9EEF3] text-sm">{item.title}</p>
                      <p className="text-[#6B7E93] text-xs font-manrope mt-0.5">{item.val}</p>
                    </div>
                  </div>
                );
              })}

              {/* Social links */}
              <div className="card p-5" style={{ background: "#141B23" }}>
                <p className="font-sora font-semibold text-[#E9EEF3] text-sm mb-3">Social</p>
                <div className="flex gap-3">
                  {["𝕏", "fb", "in"].map(s => (
                    <button key={s} className="w-9 h-9 rounded-xl font-bold text-sm font-sora flex items-center justify-center text-[#6B7E93] hover:text-[#3DF29B] hover:border-[#3DF29B44] transition-all"
                      style={{ background: "#1A2330", border: "1px solid #1F2D3D" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {sent ? (
                <div className="card p-10 flex flex-col items-center justify-center text-center h-full" style={{ background: "#141B23" }}>
                  <CheckCircle size={52} className="text-[#3DF29B] mb-4" />
                  <h3 className="font-sora font-bold text-[#E9EEF3] text-xl mb-2">মেসেজ পাঠানো হয়েছে!</h3>
                  <p className="text-[#6B7E93] font-manrope text-sm">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
                </div>
              ) : (
                <div className="card p-7" style={{ background: "#141B23" }}>
                  <h2 className="font-sora font-bold text-[#E9EEF3] text-xl mb-6">মেসেজ পাঠান</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input placeholder="আপনার নাম" required value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className={inputClass} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                        onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
                      <input type="email" placeholder="ইমেইল" required value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className={inputClass} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                        onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
                    </div>
                    <input placeholder="বিষয়" value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className={inputClass} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                      onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
                    <textarea placeholder="আপনার মেসেজ লিখুন..." required rows={5} value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className={`${inputClass} resize-none`} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                      onBlur={e => e.target.style.borderColor = "#1F2D3D"} />
                    <button type="submit" className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
                      <Send size={16} /> মেসেজ পাঠান
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
