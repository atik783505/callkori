"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Copy, Check, Users, Loader2, ArrowLeft, Link2,
} from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

/* ─── Avatar fallback when camera is off ────────────────── */
function AvatarTile({ name, size = "lg" }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const colors = ["bg-indigo-600", "bg-violet-600", "bg-pink-600", "bg-sky-600", "bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className={`${color} w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl`}>
        {initials}
      </div>
      <p className="text-slate-400 text-sm font-medium">{name}</p>
    </div>
  );
}

/* ─── Video tile ────────────────────────────────────────── */
function VideoTile({ label, videoRef, name, cameraOn = true, isLocal = false }) {
  return (
    <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden min-h-[220px] flex items-center justify-center">
      <div ref={videoRef} className="w-full h-full absolute inset-0" />
      {!cameraOn && <AvatarTile name={name} />}
      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg">
        {isLocal && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        )}
        <span className="text-white text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}

/* ─── Remote video card ─────────────────────────────────── */
function RemoteVideoCard({ user }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && user.videoTrack) {
      user.videoTrack.play(containerRef.current);
    }
  }, [user.videoTrack]);

  return (
    <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden min-h-[220px]">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      {!user.videoTrack && <AvatarTile name={`User ${user.uid.slice(0, 5)}`} />}
      <div className="absolute bottom-3 left-3 bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg">
        <span className="text-white text-xs font-medium">User {user.uid.slice(0, 5)}</span>
      </div>
    </div>
  );
}

/* ─── Control Button ────────────────────────────────────── */
function CtrlBtn({ onClick, active, danger, icon: Icon, offIcon: OffIcon, label }) {
  const DisplayIcon = active ? Icon : (OffIcon ?? Icon);
  return (
    <button
      onClick={onClick}
      title={label}
      className={`group flex flex-col items-center gap-1`}
    >
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg
        ${danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : active
            ? "bg-slate-700 hover:bg-slate-600 text-white"
            : "bg-red-500/20 hover:bg-red-500/40 text-red-400"
        }`}>
        <DisplayIcon size={20} />
      </span>
      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">{label}</span>
    </button>
  );
}

/* ─── Main Room Page ────────────────────────────────────── */
export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const localVideoElRef = useRef(null);

  /* ── Init Agora ── */
  useEffect(() => {
    if (!session) return;

    const initAgora = async () => {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => [
            ...prev.filter((u) => u.uid !== String(user.uid)),
            { uid: String(user.uid), videoTrack: user.videoTrack },
          ]);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      clientRef.current.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) =>
            prev.map((u) => u.uid === String(user.uid) ? { ...u, videoTrack: undefined } : u)
          );
        }
      });

      clientRef.current.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== String(user.uid)));
      });

      await clientRef.current.join(APP_ID, roomId, null, session.user.id);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;

      if (localVideoElRef.current) {
        videoTrack.play(localVideoElRef.current);
      }

      await clientRef.current.publish([audioTrack, videoTrack]);
      setJoined(true);
    };

    initAgora().catch(console.error);

    return () => {
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      clientRef.current?.leave();
    };
  }, [session, roomId]);

  /* ── Controls ── */
  const toggleMic = () => {
    localAudioRef.current?.setEnabled(!micOn);
    setMicOn((v) => !v);
  };

  const toggleCamera = () => {
    localVideoRef.current?.setEnabled(!cameraOn);
    setCameraOn((v) => !v);
  };

  const leaveCall = async () => {
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    await clientRef.current?.leave();
    router.push("/dashboard");
  };

  const copyLink = () => {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    navigator.clipboard.writeText(`${base}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Grid layout ── */
  const totalUsers = 1 + remoteUsers.length; // local + remotes
  const gridCols = totalUsers === 1 ? "grid-cols-1" : totalUsers <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-3";

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">ড্যাশবোর্ড</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-medium font-mono tracking-wider">{roomId}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Users size={15} />
            <span>{totalUsers}</span>
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? "bg-green-600/20 text-green-400"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            {copied ? "কপি হয়েছে!" : "লিংক শেয়ার করুন"}
          </button>
        </div>
      </header>

      {/* ── Video Grid ── */}
      <div className="flex-1 overflow-auto p-4">
        {!joined ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-sm">ক্যামেরা ও মাইক সংযুক্ত হচ্ছে...</p>
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-3 max-w-6xl mx-auto h-full`}>
            {/* Local */}
            <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden min-h-[220px]">
              <div ref={localVideoElRef} className="w-full h-full absolute inset-0" />
              {!cameraOn && <AvatarTile name={session.user.name} />}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-medium">আপনি · {session.user.name}</span>
              </div>
              {!micOn && (
                <div className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm p-1.5 rounded-lg">
                  <MicOff size={13} className="text-white" />
                </div>
              )}
            </div>

            {/* Remote users */}
            {remoteUsers.map((user) => (
              <RemoteVideoCard key={user.uid} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* ── Control Bar ── */}
      <div className="shrink-0 pb-6 px-4">
        <div className="max-w-sm mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-6 py-4 flex items-end justify-center gap-6 shadow-2xl">
          <CtrlBtn
            onClick={toggleMic}
            active={micOn}
            icon={Mic}
            offIcon={MicOff}
            label={micOn ? "মাইক বন্ধ" : "মাইক চালু"}
          />
          <CtrlBtn
            onClick={toggleCamera}
            active={cameraOn}
            icon={VideoIcon}
            offIcon={VideoOff}
            label={cameraOn ? "ক্যামেরা বন্ধ" : "ক্যামেরা চালু"}
          />
          <CtrlBtn
            onClick={leaveCall}
            danger
            active={true}
            icon={PhoneOff}
            label="কল ছেড়ে দিন"
          />
        </div>
      </div>
    </div>
  );
}
