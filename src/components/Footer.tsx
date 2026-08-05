"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer style={{ background:"var(--bg2)", borderTop:"1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <span className="font-black text-xl tracking-tight" style={{color:"var(--text)"}}>callkori</span>
            <p className="text-sm mt-3 leading-relaxed max-w-[200px]"
              style={{color:"var(--muted)"}}>
              {t("footer_tagline")}
            </p>
          </div>
          {[
            { title: t("footer_product"), items: [["Features","/features"],["Pricing","/pricing"],["Dashboard","/dashboard"]] },
            { title: t("footer_company"), items: [["About","/about"],["Contact","/contact"]] },
            { title: t("footer_account"), items: [["Log in","/login"],["Sign up","/login"]] },
          ].map(col => (
            <div key={col.title}>
              <p className="font-semibold text-sm mb-4" style={{color:"var(--text)"}}>{col.title}</p>
              <ul className="space-y-2.5">
                {col.items.map(([label,href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm transition-colors hover:opacity-80"
                      style={{color:"var(--muted)"}}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs"
          style={{borderTop:"1px solid var(--border)",color:"var(--muted)"}}>
          <p>{t("footer_copy")}</p>
          <p>{t("footer_made")}</p>
        </div>
      </div>
    </footer>
  );
}
