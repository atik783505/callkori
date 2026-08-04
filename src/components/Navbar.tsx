"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/lib/ui";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1F2D3D]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-semibold transition-colors font-manrope ${path === l.href ? "text-[#3DF29B]" : "text-[#6B7E93] hover:text-[#E9EEF3]"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm">লগইন</Link>
          <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">শুরু করুন →</Link>
        </div>

        <button className="md:hidden text-[#6B7E93]" onClick={() => setOpen(v => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-[#1F2D3D] px-5 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-[#6B7E93] hover:text-[#E9EEF3] py-1 font-manrope">{l.label}</Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="btn-ghost px-4 py-2 text-sm flex-1 text-center">লগইন</Link>
            <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm flex-1 text-center">শুরু করুন</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
