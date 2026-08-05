"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard } from "lucide-react";

export default function HeroCTA() {
  const { data: session, isPending } = authClient.useSession();
  const { t } = useI18n();

  if (isPending) {
    return (
      <div className="flex gap-3">
        <div className="h-11 w-40 rounded-xl animate-pulse" style={{ background: "var(--border)" }} />
        <div className="h-11 w-28 rounded-xl animate-pulse" style={{ background: "var(--border)" }} />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
          <LayoutDashboard size={16} /> {t("nav_dashboard")}
        </Link>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Welcome back, <strong style={{ color: "var(--text)" }}>{session.user.name?.split(" ")[0]}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/login" className="btn-white px-6 py-3 text-sm inline-flex items-center gap-2">
        {t("hero_cta")} <ChevronRight size={16} />
      </Link>
      <Link href="/features" className="text-sm font-medium transition-colors"
        style={{ color: "var(--muted2)" }}>
        {t("hero_cta2")} →
      </Link>
    </div>
  );
}
