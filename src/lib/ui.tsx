/* Shared UI primitives — used across all pages */
import { Video } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? 14 : size === "lg" ? 22 : 17;
  const pad = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${pad} rounded-xl flex items-center justify-center`}
        style={{ background: "linear-gradient(135deg,#3DF29B,#22c97e)" }}>
        <Video size={s} className="text-[#0B0F14]" />
      </div>
      <span className={`font-sora font-bold ${text} text-[#E9EEF3]`}>CallKori</span>
    </div>
  );
}

export function GreenDot() {
  return (
    <span className="relative flex w-2 h-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#3DF29B] opacity-75"
        style={{ animation: "ping-green 1.4s cubic-bezier(0,0,.2,1) infinite" }} />
      <span className="relative inline-flex rounded-full w-2 h-2 bg-[#3DF29B]" />
    </span>
  );
}

export function Waveform({ bars = 5, active = true }: { bars?: number; active?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="waveBar"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationPlayState: active ? "running" : "paused",
            height: active ? undefined : "4px",
          }} />
      ))}
    </div>
  );
}

export function Avatar({
  name, image, size = "md", speaking = false,
}: { name?: string; image?: string; size?: "sm"|"md"|"lg"|"xl"; speaking?: boolean }) {
  const sizes: Record<string, string> = {
    sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl",
  };
  const palettes = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const bg = palettes[(name?.charCodeAt(0) ?? 0) % palettes.length];
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?";

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-all ${speaking ? "glow-green ring-2 ring-[#3DF29B]" : ""}`}
      style={{ background: image ? undefined : bg }}>
      {image ? <img src={image} className="w-full h-full rounded-full object-cover" alt={name} /> : initials}
    </div>
  );
}

export function Badge({ children, color = "green" }: { children: React.ReactNode; color?: "green"|"red"|"blue"|"gray" }) {
  const styles = {
    green: "bg-[#3DF29B1A] text-[#3DF29B] border-[#3DF29B33]",
    red:   "bg-[#FF5C5C1A] text-[#FF5C5C] border-[#FF5C5C33]",
    blue:  "bg-[#4F8EF71A] text-[#4F8EF7] border-[#4F8EF733]",
    gray:  "bg-[#1A2330] text-[#6B7E93] border-[#1F2D3D]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border font-manrope ${styles[color]}`}>
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold font-sora tracking-widest uppercase border"
      style={{ background:"#3DF29B0F", borderColor:"#3DF29B33", color:"#3DF29B" }}>
      {children}
    </div>
  );
}
