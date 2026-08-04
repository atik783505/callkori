"use client";
import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function HeroCTA() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="h-12 w-44 rounded-xl bg-[#1F2D3D] animate-pulse" />
        <div className="h-12 w-36 rounded-xl bg-[#1F2D3D] animate-pulse" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard"
          className="btn-primary px-7 py-3.5 text-base inline-flex items-center gap-2">
          <LayoutDashboard size={18} />
          ড্যাশবোর্ডে যান
        </Link>
        <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl font-manrope text-sm"
          style={{ background: "#141B23", border: "1px solid #1F2D3D", color: "#6B7E93" }}>
          স্বাগতম, <span className="text-[#3DF29B] font-semibold ml-1">{session.user.name?.split(" ")[0]}</span> 👋
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Link href="/login"
        className="btn-primary px-7 py-3.5 text-base inline-flex items-center gap-2">
        মিট শুরু করুন <ChevronRight size={18} />
      </Link>
      <Link href="/features"
        className="btn-ghost px-7 py-3.5 text-base inline-flex items-center gap-2">
        ফিচার দেখুন
      </Link>
    </div>
  );
}
