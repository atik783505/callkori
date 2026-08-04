"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Logo, GreenDot } from "@/lib/ui";
import { Mic, MicOff, Video as VideoIcon, VideoOff, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";

AgoraRTC.setLogLevel(4);

export default function LobbyPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [name, setName] = useState("");
  const [camStatus, setCamStatus] = useState("checking"); // checking | ok | error
  const [micStatus, setMicStatus] = useState("checking");
  const [joining, setJoining] = useState(false);

  const previewRef = useRef(null);
  const videoTrackRef = useRef(null);
  const audioTrackRef = useRef(null);

  useEffect(() => { if (session?.user?.name) setName(session.user.name); }, [session]);

  useEffect(() => {
    if (isPending || !session) return;
    let mounted = true;

    const setup = async () => {
      try {
        const [aTrack, vTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({}, { encoderConfig: "360p_1" });
        if (!mounted) { aTrack.close(); vTrack.close(); return; }
        audioTrackRef.current = aTrack;
        videoTrackRef.current = vTrack;
        if (previewRef.current) vTrack.play(previewRef.current);
        setCamStatus("ok"); setMicStatus("ok");
      } catch (e) {
        setCamStatus("error"); setMicStatus("error");
      }
    };
    setup();
    return () => {
      mounted = false;
      videoTrackRef.current?.close();
      audioTrackRef.current?.close();
    };
  }, [session, isPending]);

  const toggleMic = () => { audioTrackRef.current?.setEnabled(!micOn); setMicOn(v => !v); };
  const toggleCam = () => { videoTrackRef.current?.setEnabled(!camOn); setCamOn(v => !v); };

  const handleJoin = () => {
    setJoining(true);
    videoTrackRef.current?.close();
    audioTrackRef.current?.close();
    router.push(`/room/${roomId}?name=${encodeURIComponent(name)}&mic=${micOn}&cam=${camOn}`);
  };

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F14" }}>
      <Loader2 size={32} className="text-[#3DF29B] animate-spin" />
    </div>
  );

  if (!session) { router.push("/login"); return null; }

  const StatusIcon = ({ status }) => {
    if (status === "checking") return <Loader2 size={14} className="animate-spin text-[#6B7E93]" />;
    if (status === "ok") return <CheckCircle size={14} className="text-[#3DF29B]" />;
    return <AlertCircle size={14} className="text-[#FF5C5C]" />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={{ background: "#0B0F14" }}>
      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,#3DF29B0A,transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="flex justify-center mb-8"><Logo /></div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera preview */}
          <div>
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-3"
              style={{ background: "#0D1117", border: "1px solid #1F2D3D" }}>
              <div ref={previewRef} className="absolute inset-0 w-full h-full" />
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0D1117" }}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white font-sora mx-auto mb-2"
                      style={{ background: "linear-gradient(135deg,#4F8EF7,#A855F7)" }}>
                      {name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <p className="text-[#6B7E93] text-sm font-manrope">{name || "আপনি"}</p>
                  </div>
                </div>
              )}
              {camStatus === "checking" && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0D1117" }}>
                  <Loader2 size={28} className="text-[#3DF29B] animate-spin" />
                </div>
              )}
              {/* Top badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(11,15,20,.8)" }}>
                <GreenDot />
                <span className="text-[#E9EEF3] text-xs font-manrope">{name || "আপনি"}</span>
              </div>
            </div>

            {/* Mic/Cam toggles */}
            <div className="flex gap-3">
              <button onClick={toggleMic}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-sora font-semibold text-sm transition-all"
                style={micOn
                  ? { background: "#1A2330", border: "1px solid #1F2D3D", color: "#E9EEF3" }
                  : { background: "#FF5C5C15", border: "1px solid #FF5C5C44", color: "#FF5C5C" }}>
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                {micOn ? "মাইক চালু" : "মাইক বন্ধ"}
              </button>
              <button onClick={toggleCam}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-sora font-semibold text-sm transition-all"
                style={camOn
                  ? { background: "#1A2330", border: "1px solid #1F2D3D", color: "#E9EEF3" }
                  : { background: "#FF5C5C15", border: "1px solid #FF5C5C44", color: "#FF5C5C" }}>
                {camOn ? <VideoIcon size={16} /> : <VideoOff size={16} />}
                {camOn ? "ক্যামেরা চালু" : "ক্যামেরা বন্ধ"}
              </button>
            </div>
          </div>

          {/* Join panel */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="font-sora font-extrabold text-2xl text-[#E9EEF3] mb-1">কলে যোগ দিন</h1>
              <p className="text-[#6B7E93] font-manrope text-sm mb-6">
                Room: <span className="text-[#3DF29B] font-mono font-semibold">{roomId}</span>
              </p>

              {/* Name input */}
              <label className="block text-[#6B7E93] text-xs font-sora font-semibold mb-2 uppercase tracking-wider">আপনার নাম</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="নাম লিখুন..."
                className="w-full px-4 py-3 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none mb-6"
                style={{ background: "#141B23", border: "1px solid #1F2D3D" }}
                onFocus={e => e.target.style.borderColor = "#3DF29B55"}
                onBlur={e => e.target.style.borderColor = "#1F2D3D"} />

              {/* Device check */}
              <div className="card p-4 space-y-2.5 mb-6" style={{ background: "#141B23" }}>
                <p className="font-sora font-semibold text-[#E9EEF3] text-xs uppercase tracking-wider mb-3">ডিভাইস চেক</p>
                {[
                  { label: "ক্যামেরা", status: camStatus },
                  { label: "মাইক্রোফোন", status: micStatus },
                  { label: "নেটওয়ার্ক", status: "ok" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[#6B7E93] text-sm font-manrope">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={item.status} />
                      <span className="text-xs font-manrope" style={{
                        color: item.status === "ok" ? "#3DF29B" : item.status === "error" ? "#FF5C5C" : "#6B7E93"
                      }}>
                        {item.status === "ok" ? "প্রস্তুত" : item.status === "error" ? "পাওয়া যায়নি" : "চেক করছে..."}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleJoin} disabled={joining || !name.trim()}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50">
              {joining ? <Loader2 size={18} className="animate-spin" /> : <>কলে যোগ দিন <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
