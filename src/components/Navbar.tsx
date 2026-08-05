"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth-client";

const NAV_LINKS = [
  { key: "nav_home" as const, href: "/" },
  { key: "nav_features" as const, href: "/features" },
  { key: "nav_pricing" as const, href: "/pricing" },
  { key: "nav_about" as const, href: "/about" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const pal = ["#4F8EF7","#A855F7","#F97316","#EC4899","#34D399"];
  const avatarBg = session?.user?.name
    ? pal[session.user.name.charCodeAt(0) % pal.length] : "#6366F1";
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()
    : "?";

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="ck-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="font-black text-lg tracking-tight" style={{ color: "var(--text)" }}>
            callkori
          </span>
        </Link>

        {/* Floating center nav — desktop */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full ck-pill">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                color: path === l.href ? "var(--accent)" : "var(--muted2)",
                background: path === l.href ? "var(--glow-a)" : "transparent",
              }}>
              {t(l.key)}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Lang toggle */}
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            style={{ background:"var(--pill-bg)", border:"1px solid var(--border)",
              color:"var(--muted2)" }}>
            {lang === "en" ? "বাং" : "EN"}
          </button>

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background:"var(--pill-bg)", border:"1px solid var(--border)",
              color:"var(--muted2)" }}>
            {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
          </button>

          {isPending ? (
            <div className="w-8 h-8 rounded-full animate-pulse" style={{background:"var(--border)"}}/>
          ) : session ? (
            <div className="flex items-center gap-2 pl-2" style={{borderLeft:"1px solid var(--border)"}}>
              <Link href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{background:"var(--pill-bg)",border:"1px solid var(--border)",color:"var(--text)"}}>
                <LayoutDashboard size={14} style={{color:"var(--accent)"}}/>
                {t("nav_dashboard")}
              </Link>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                style={{background:avatarBg}} onClick={handleLogout} title="Log out">
                {initials}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-medium transition-colors"
                style={{color:"var(--muted2)"}}>
                {t("nav_login")}
              </Link>
              <Link href="/login"
                className="btn-primary px-4 py-2 text-sm">
                {t("nav_start")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(v=>!v)}
          style={{color:"var(--muted)"}}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-5 py-4 space-y-3 border-t"
          style={{background:"var(--nav-bg)",borderColor:"var(--border)"}}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              className="block text-sm font-medium py-1 transition-colors"
              style={{color: path===l.href?"var(--accent)":"var(--muted2)"}}>
              {t(l.key)}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t" style={{borderColor:"var(--border)"}}>
            <button onClick={()=>setLang(lang==="en"?"bn":"en")}
              className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{background:"var(--pill-bg)",border:"1px solid var(--border)",color:"var(--muted2)"}}>
              {lang==="en"?"বাংলা":"English"}
            </button>
            <button onClick={toggle}
              className="px-3 py-2 rounded-lg flex items-center justify-center"
              style={{background:"var(--pill-bg)",border:"1px solid var(--border)",color:"var(--muted2)"}}>
              {theme==="dark"?<Sun size={15}/>:<Moon size={15}/>}
            </button>
          </div>
          {session ? (
            <div className="space-y-2 pt-1">
              <Link href="/dashboard" onClick={()=>setOpen(false)}
                className="btn-primary w-full py-2 text-sm text-center block">
                {t("nav_dashboard")}
              </Link>
              <button onClick={()=>{handleLogout();setOpen(false);}}
                className="btn-ghost w-full py-2 text-sm flex items-center justify-center gap-2"
                style={{color:"var(--red)"}}>
                <LogOut size={14}/> Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/login" onClick={()=>setOpen(false)}
                className="btn-ghost flex-1 py-2 text-sm text-center">{t("nav_login")}</Link>
              <Link href="/login" onClick={()=>setOpen(false)}
                className="btn-primary flex-1 py-2 text-sm text-center">{t("nav_start")}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
