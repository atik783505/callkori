"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Logo, GreenDot } from "@/lib/ui";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff,
  ArrowRight, Loader2, CheckCircle, AlertCircle, Wand2,
} from "lucide-react";

AgoraRTC.setLogLevel(4);

/* ── device setup — mobile safe ───────────────────────── */
async function setupDevices() {
  // Try mic + camera together first (desktop)
  try {
    const [a, v] = await AgoraRTC.createMicrophoneAndCameraTracks(
      {
        AEC: true,   // Acoustic Echo Cancellation
        ANS: true,   // Automatic Noise Suppression
        AGC: true,   // Automatic Gain Control
      },
      {
        encoderConfig: "360p_1",
        facingMode: "user",        // front camera on mobile
      }
    );
    return { audioTrack: a, videoTrack: v, micOk: true, camOk: true };
  } catch (_) {}

  // Fallback: try mic only
  let audioTrack = null;
  let micOk = false;
  try {
    audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      AEC: true, ANS: true, AGC: true,
    });
    micOk = true;
  } catch (_) {}

  // Fallback: try camera only
  let videoTrack = null;
  let camOk = false;
  try {
    videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: "360p_1",
      facingMode: "user",
    });
    camOk = true;
  } catch (_) {}

  return { audioTrack, videoTrack, micOk, camOk };
}

export default function LobbyPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [noiseCancel, setNoiseCancel] = useState(true);
  const [name, setName] = useState("");
  const [camStatus, setCamStatus] = useState("checking");
  const [micStatus, setMicStatus] = useState("checking");
  const [netStatus, setNetStatus] = useState("checking");
  const [joining, setJoining] = useState(false);
  const [setupError, setSetupError] = useState("");

  const previewRef = useRef(null);
  const videoTrackRef = useRef(null);
  const audioTrackRef = useRef(null);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  // Network check
  useEffect(() => {
    const check = async () => {
      try {
        await fetch("/api/agora-token?channel=ping", { signal: AbortSignal.timeout(4000) });
        setNetStatus("ok");
      } catch { setNetStatus("error"); }
    };
    check();
  }, []);

  // Device setup
  useEffect(() => {
    if (isPending || !session) return;
    let mounted = true;

    const run = async () => {
      setCamStatus("checking");
      setMicStatus("checking");
      setSetupError("");

      const { audioTrack, videoTrack, micOk, camOk } = await setupDevices();

      if (!mounted) {
        audioTrack?.close();
        videoTrack?.close();
        return;
      }

      audioTrackRef.current = audioTrack;
      videoTrackRef.current = videoTrack;
      setCamStatus(camOk ? "ok" : "error");
      setMicStatus(micOk ? "ok" : "error");

      if (!camOk && !micOk) {
        setSetupError("ক্যামেরা ও মাইক্রোফোনের অনুমতি দিন এবং পেজ reload করুন।");
        return;
      }

      if (videoTrack && previewRef.current) {
        videoTrack.play(previewRef.current);
      }
    };

    run();
    return () => {
      mounted = false;
      videoTrackRef.current?.close();
      audioTrackRef.current?.close();
      videoTrackRef.current = null;
      audioTrackRef.current = null;
    };
  }, [session, isPending]);

  const toggleMic = () => {
    audioTrackRef.current?.setEnabled(!micOn);
    setMicOn(v => !v);
  };

  const toggleCam = () => {
    videoTrackRef.current?.setEnabled(!camOn);
    setCamOn(v => !v);
  };

  const handleJoin = () => {
    if (!name.trim()) return;
    setJoining(true);
    // Close preview tracks — room page will create fresh ones
    videoTrackRef.current?.close();
    audioTrackRef.current?.close();
    videoTrackRef.current = null;
    audioTrackRef.current = null;
    router.push(
      `/room/${roomId}?name=${encodeURIComponent(name)}&mic=${micOn}&cam=${camOn}&nc=${noiseCancel}`
    );
  };

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F14" }}>
      <Loader2 size={32} className="text-[#3DF29B] animate-spin" />
    </div>
  );

  if (!session) { router.push("/login"); return null; }

  const StatusIcon = ({ s }) => {
    if (s === "checking") return <Loader2 size={14} className="animate-spin text-[#6B7E93]" />;
    if (s === "ok") return <CheckCircle size={14} className="text-[#3DF29B]" />;
    return <AlertCircle size={14} className="text-[#FF5C5C]" />;
  };

  const allOk = micStatus !== "error" || camStatus !== "error";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "#0B0F14" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%,#3DF29B06,transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="flex justify-center mb-8"><Logo /></div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* ── Left: Camera preview ── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden mb-3"
              style={{ aspectRatio: "16/9", background: "#0D1117", border: "1px solid #1F2D3D" }}>
              <div ref={previewRef} className="absolute inset-0 w-full h-full" />

              {/* No camera / cam off overlay */}
              {(!camOn || camStatus === "error" || camStatus === "checking") && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "#0D1117" }}>
                  {camStatus === "checking"
                    ? <Loader2 size={28} className="text-[#3DF29B] animate-spin" />
                    : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center
                          text-2xl font-bold text-white font-sora mx-auto mb-2"
                          style={{ background: "linear-gradient(135deg,#4F8EF7,#A855F7)" }}>
                          {name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <p className="text-[#6B7E93] text-sm font-manrope">
                          {camStatus === "error" ? "ক্যামেরা পাওয়া যায়নি" : name || "আপনি"}
                        </p>
                      </div>
                    )
                  }
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(11,15,20,.8)" }}>
                <GreenDot />
                <span className="text-[#E9EEF3] text-xs font-manrope">{name || "আপনি"}</span>
              </div>
            </div>

            {/* Mic / Cam toggles */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={toggleMic} disabled={micStatus === "error"}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                  font-sora font-semibold text-sm transition-all disabled:opacity-40"
                style={micOn
                  ? { background: "#1A2330", border: "1px solid #1F2D3D", color: "#E9EEF3" }
                  : { background: "#FF5C5C15", border: "1px solid #FF5C5C44", color: "#FF5C5C" }}>
                {micOn ? <Mic size={15} /> : <MicOff size={15} />}
                {micOn ? "মাইক চালু" : "মাইক বন্ধ"}
              </button>
              <button onClick={toggleCam} disabled={camStatus === "error"}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                  font-sora font-semibold text-sm transition-all disabled:opacity-40"
                style={camOn
                  ? { background: "#1A2330", border: "1px solid #1F2D3D", color: "#E9EEF3" }
                  : { background: "#FF5C5C15", border: "1px solid #FF5C5C44", color: "#FF5C5C" }}>
                {camOn ? <VideoIcon size={15} /> : <VideoOff size={15} />}
                {camOn ? "ক্যামেরা চালু" : "ক্যামেরা বন্ধ"}
              </button>
            </div>

            {/* Error message */}
            {setupError && (
              <div className="mt-3 px-4 py-3 rounded-xl text-xs font-manrope"
                style={{ background: "#FF5C5C12", border: "1px solid #FF5C5C33", color: "#FF5C5C" }}>
                {setupError}
              </div>
            )}
          </div>

          {/* ── Right: Join panel ── */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-sora font-extrabold text-2xl text-[#E9EEF3] mb-1">
                কলে যোগ দিন
              </h1>
              <p className="text-[#6B7E93] font-manrope text-sm">
                Room:{" "}
                <span className="text-[#3DF29B] font-mono font-semibold">{roomId}</span>
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[#6B7E93] text-xs font-sora font-semibold mb-2
                uppercase tracking-wider">
                আপনার নাম
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="নাম লিখুন..."
                className="w-full px-4 py-3 rounded-xl text-sm font-manrope
                  text-[#E9EEF3] placeholder-[#6B7E93] outline-none transition-all"
                style={{ background: "#141B23", border: "1px solid #1F2D3D" }}
                onFocus={e => (e.target.style.borderColor = "#3DF29B55")}
                onBlur={e => (e.target.style.borderColor = "#1F2D3D")} />
            </div>

            {/* Device check */}
            <div className="rounded-xl p-4 space-y-2.5"
              style={{ background: "#141B23", border: "1px solid #1F2D3D" }}>
              <p className="font-sora font-semibold text-[#E9EEF3] text-xs
                uppercase tracking-wider">ডিভাইস চেক</p>
              {[
                { label: "ক্যামেরা",      s: camStatus },
                { label: "মাইক্রোফোন",   s: micStatus },
                { label: "নেটওয়ার্ক",    s: netStatus },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[#6B7E93] text-sm font-manrope">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon s={item.s} />
                    <span className="text-xs font-manrope" style={{
                      color: item.s === "ok" ? "#3DF29B"
                        : item.s === "error" ? "#FF5C5C" : "#6B7E93",
                    }}>
                      {item.s === "ok" ? "প্রস্তুত"
                        : item.s === "error" ? "পাওয়া যায়নি"
                        : "চেক করছে..."}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Noise cancellation toggle */}
            <button onClick={() => setNoiseCancel(v => !v)}
              className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
              style={noiseCancel
                ? { background: "#3DF29B12", border: "1px solid #3DF29B44" }
                : { background: "#141B23", border: "1px solid #1F2D3D" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: noiseCancel ? "#3DF29B20" : "#1A2330",
                  color: noiseCancel ? "#3DF29B" : "#6B7E93",
                }}>
                <Wand2 size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sora font-semibold text-sm"
                  style={{ color: noiseCancel ? "#3DF29B" : "#E9EEF3" }}>
                  AI Noise Cancellation
                </p>
                <p className="text-[#6B7E93] text-xs font-manrope">
                  {noiseCancel ? "চালু — background noise কমাবে" : "বন্ধ"}
                </p>
              </div>
              {/* Toggle pill */}
              <div className="w-10 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0"
                style={{ background: noiseCancel ? "#3DF29B" : "#1F2D3D" }}>
                <div className="w-4 h-4 rounded-full bg-white transition-all"
                  style={{ transform: noiseCancel ? "translateX(20px)" : "translateX(0)" }} />
              </div>
            </button>

            <button onClick={handleJoin}
              disabled={joining || !name.trim() || !allOk}
              className="btn-primary w-full py-3.5 text-base flex items-center
                justify-center gap-2 disabled:opacity-50 mt-auto">
              {joining
                ? <Loader2 size={18} className="animate-spin" />
                : <>কলে যোগ দিন <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
