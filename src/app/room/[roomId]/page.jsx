"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Check, Users, Loader2, ArrowLeft, Link2,
} from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

/* ─── Avatar fallback ───────────────────────────────────── */
function AvatarTile({ name }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const colors = ["bg-indigo-600", "bg-violet-600", "bg-pink-600", "bg-sky-600", "bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
      <div className={`${color} w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl`}>
        {initials}
      </div>
      <p className="text-slate-400 text-sm font-medium">{name}</p>
    </div>
  );
}

/* ─── Remote video card ─────────────────────────────────── */
function RemoteVideoCard({ user }) {
  const containerRef = useRef(null);

  // Play whenever videoTrack changes or container mounts
  useEffect(() => {
    const el = containerRef.current;
    const track = user.videoTrack;
    if (!el || !track) return;

    track.play(el);
    return () => {
      try { track.stop(); } catch (_) {}
    };
  }, [user.videoTrack]);

  return (
    <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden w-full h-full min-h-[200px]">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {!user.videoTrack && <AvatarTile name={`User ${String(user.uid).slice(0, 5)}`} />}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
        <span className="text-white text-xs font-medium">User {String(user.uid).slice(0, 5)}</span>
      </div>
    </div>
  );
}

/* ─── Control Button ────────────────────────────────────── */
function CtrlBtn({ onClick, active, danger, icon: Icon, offIcon: OffIcon, label }) {
  const DisplayIcon = (!danger && !active && OffIcon) ? OffIcon : Icon;
  return (
    <button onClick={onClick} title={label} className="flex flex-col items-center gap-1 group">
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg ${
        danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : active
            ? "bg-slate-700 hover:bg-slate-600 text-white"
            : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
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
  const { data: session, isPending } = authClient.useSession();

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  // "idle" | "connecting" | "connected" | "error"
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const localVideoElRef = useRef(null);
  const agoraInitialized = useRef(false);

  /* ── Init Agora ── */
  const initAgora = useCallback(async (userId) => {
    if (agoraInitialized.current) return;
    agoraInitialized.current = true;
    setStatus("connecting");

    try {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = agoraClient;

      // Remote user joins and publishes
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteUsers((prev) => {
            const filtered = prev.filter((u) => u.uid !== String(user.uid));
            return [...filtered, { uid: String(user.uid), videoTrack: user.videoTrack }];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) =>
            prev.map((u) =>
              u.uid === String(user.uid) ? { ...u, videoTrack: null } : u
            )
          );
        }
        if (mediaType === "audio") {
          user.audioTrack?.stop();
        }
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== String(user.uid)));
      });

      // Fetch Agora token from server
      const tokenRes = await fetch(`/api/agora-token?channel=${encodeURIComponent(String(roomId))}`);
      const tokenData = await tokenRes.json();
      const agoraToken = tokenData.token ?? null;

      // Join the channel
      await agoraClient.join(APP_ID, String(roomId), agoraToken, userId);

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { encoderConfig: "360p" }
      );
      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;

      // Play local video — wait for DOM ref
      if (localVideoElRef.current) {
        videoTrack.play(localVideoElRef.current);
      }

      // Publish tracks
      await agoraClient.publish([audioTrack, videoTrack]);
      setStatus("connected");
    } catch (err) {
      console.error("Agora init error:", err);
      setErrorMsg(err?.message ?? "ক্যামেরা বা মাইক অ্যাক্সেস করা যায়নি");
      setStatus("error");
      agoraInitialized.current = false;
    }
  }, [roomId]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/login");
      return;
    }
    initAgora(session.user.id);

    return () => {
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]);

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
    await clientRef.current?.leave().catch(() => {});
    router.push("/dashboard");
  };

  const copyLink = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${base}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Layout helpers ── */
  const totalUsers = 1 + remoteUsers.length;
  const gridClass =
    totalUsers === 1
      ? "grid-cols-1"
      : totalUsers === 2
        ? "grid-cols-1 md:grid-cols-2"
        : totalUsers <= 4
          ? "grid-cols-2"
          : "grid-cols-2 md:grid-cols-3";

  /* ── Loading / error screens ── */
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col" style={{ overflow: "hidden" }}>

      {/* ── Top Bar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0a0a0f]/90 backdrop-blur-xl z-20">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">ড্যাশবোর্ড</span>
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${status === "connected" ? "bg-green-400" : status === "error" ? "bg-red-500" : "bg-yellow-400"}`} />
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
              copied ? "bg-green-600/20 text-green-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            <span className="hidden sm:inline">{copied ? "কপি হয়েছে!" : "লিংক শেয়ার"}</span>
          </button>
        </div>
      </header>

      {/* ── Video Grid ── */}
      <div className="flex-1 p-3 min-h-0">
        {status === "error" ? (
          /* Error state */
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <VideoOff size={28} className="text-red-400" />
            </div>
            <p className="text-white font-semibold">সংযোগ ব্যর্থ হয়েছে</p>
            <p className="text-slate-500 text-sm max-w-xs">{errorMsg}</p>
            <button
              onClick={() => { agoraInitialized.current = false; initAgora(session?.user?.id); }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          /* Video tiles */
          <div className={`grid ${gridClass} gap-3 h-full`}>

            {/* ── Local video tile ── */}
            <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden min-h-[200px]">
              {/* Always render the div — Agora needs a stable DOM node */}
              <div
                ref={localVideoElRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: "#0f172a" }}
              />
              {/* Avatar overlay when camera off */}
              {(!cameraOn || status !== "connected") && (
                <AvatarTile name={session?.user?.name ?? "আপনি"} />
              )}
              {/* Connecting overlay */}
              {status === "connecting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/90 z-10">
                  <Loader2 size={32} className="text-indigo-400 animate-spin" />
                  <p className="text-slate-400 text-sm">সংযুক্ত হচ্ছে...</p>
                </div>
              )}
              {/* Name badge */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-medium">আপনি · {session?.user?.name}</span>
              </div>
              {!micOn && (
                <div className="absolute top-3 right-3 z-10 bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg">
                  <MicOff size={13} className="text-white" />
                </div>
              )}
            </div>

            {/* ── Remote video tiles ── */}
            {remoteUsers.map((user) => (
              <RemoteVideoCard key={user.uid} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* ── Control Bar ── */}
      <div className="shrink-0 pb-5 px-4 z-20">
        <div className="max-w-xs mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-8 py-3.5 flex items-center justify-center gap-8 shadow-2xl">
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
