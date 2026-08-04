import Link from "next/link";
import { Logo } from "@/lib/ui";

export default function Footer() {
  return (
    <footer className="border-t border-[#1F2D3D] bg-[#0B0F14] pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-[#6B7E93] text-sm mt-4 leading-relaxed font-manrope max-w-[220px]">
              বন্ধু, পরিবার ও সহকর্মীদের সাথে HD ভিডিও কলে সংযুক্ত থাকুন।
            </p>
          </div>
          {[
            { title: "Product", items: [["Features","/features"],["Pricing","/pricing"],["Dashboard","/dashboard"]] },
            { title: "Company", items: [["About","/about"],["Contact","/contact"],["Blog","#"]] },
            { title: "Account", items: [["Login","/login"],["Sign Up","/login"],["Support","#"]] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[#E9EEF3] font-sora font-semibold text-sm mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.items.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-[#6B7E93] hover:text-[#3DF29B] text-sm font-manrope transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1F2D3D] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7E93] font-manrope">
          <p>© 2024 CallKori · সর্বস্বত্ব সংরক্ষিত</p>
          <p>Made with ♥ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
