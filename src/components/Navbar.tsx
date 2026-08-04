"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/lib/ui";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const palette = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const avatarBg = session?.user?.name
    ? palette[session.user.name.charCodeAt(0) % palette.length]
    : "#4F8EF7";
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1F2D3D]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-semibold transition-colors font-manrope ${
                path === l.href ? "text-[#3DF29B]" : "text-[#6B7E93] hover:text-[#E9EEF3]"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-[#1F2D3D] animate-pulse" />
          ) : session ? (
            /* Logged in */
            <div className="flex items-center gap-3">
              <Link href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-sora font-semibold transition-all"
                style={{ background: "#141B23", border: "1px solid #1F2D3D", color: "#E9EEF3" }}>
                <LayoutDashboard size={15} className="text-[#3DF29B]" />
                ড্যাশবোর্ড
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-[#1F2D3D]">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white font-sora"
                    style={{ background: avatarBg }}>
                    {initials}
                  </div>
                )}
                <span className="text-sm text-[#E9EEF3] font-manrope max-w-[100px] truncate">
                  {session.user.name}
                </span>
                <button onClick={handleLogout} title="লগআউট"
                  className="p-1.5 rounded-lg text-[#6B7E93] hover:text-[#FF5C5C] hover:bg-[#FF5C5C10] transition-all">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in */
            <>
              <Link href="/login" className="btn-ghost px-4 py-2 text-sm">লগইন</Link>
              <Link href="/login" className="btn-primary px-4 py-2 text-sm">শুরু করুন →</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-[#6B7E93]" onClick={() => setOpen(v => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden glass border-t border-[#1F2D3D] px-5 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-[#6B7E93] hover:text-[#E9EEF3] py-1 font-manrope">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[#1F2D3D] pt-3 flex flex-col gap-2">
            {session ? (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white font-sora shrink-0"
                    style={{ background: avatarBg }}>
                    {initials}
                  </div>
                  <span className="text-sm text-[#E9EEF3] font-manrope truncate">{session.user.name}</span>
                </div>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="btn-primary px-4 py-2 text-sm text-center">
                  ড্যাশবোর্ড
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }}
                  className="btn-ghost px-4 py-2 text-sm flex items-center justify-center gap-2 text-[#FF5C5C]">
                  <LogOut size={14} /> লগআউট
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="btn-ghost px-4 py-2 text-sm flex-1 text-center"
                  onClick={() => setOpen(false)}>লগইন</Link>
                <Link href="/login" className="btn-primary px-4 py-2 text-sm flex-1 text-center"
                  onClick={() => setOpen(false)}>শুরু করুন</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
