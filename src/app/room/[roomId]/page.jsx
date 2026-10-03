"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Logo, GreenDot, Waveform } from "@/lib/ui";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Check, Users, Loader2, Link2, PhoneCall, MessageSquare,
  Monitor, MonitorOff, Wand2, Maximize2, Minimize2,
} from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
AgoraRTC.setLogLevel(3);

/* ─── palette helper ─────────────────────────────────── */
const COLORS = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
const avatarBg = (name) => COLORS[(name?.charCodeAt(0)??0) % COLORS.length];
const initials  = (name) =>
  name ? name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "?";

function LocalTile({ videoTrack, screenTrack, camOn, micOn, status, displayName,
  pinned, onPin, screenSharing }) {

  const camRef    = useRef(null);
  const screenRef = useRef(null);

  // Re-play camera track whenever DOM node mounts or track changes
  useEffect(() => {
    const el    = camRef.current;
    const track = videoTrack;
    if (!el || !track) return;
    try { track.play(el); } catch (_) {}
  }, [videoTrack, camRef.current]); // eslint-disable-line

  // Re-play screen track whenever DOM node mounts or track changes
  useEffect(() => {
    const el    = screenRef.current;
    const track = screenTrack;
    if (!el || !track) return;
    try { track.play(el); } catch (_) {}
  }, [screenTrack, screenRef.current]); // eslint-disable-line

  const showScreen = screenSharing && screenTrack;

  return (
    <div
      onClick={onPin}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group
        transition-all w-full h-full min-h-[110px]
        ${pinned ? "ring-2 ring-[#4F8EF7]" : ""}`}
      style={{ background:"#0D1117", border:"1px solid #1F2D3D" }}>

      {/* camera video — always in DOM */}
      <div ref={camRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: showScreen ? 0 : 1 }} />

      {/* screen share preview */}
      {screenSharing && (
        <div ref={screenRef}
          className="screen-tile absolute inset-0 w-full h-full"
          style={{ zIndex: 2 }} />
      )}

      {/* avatar when cam off */}
      {(!camOn || status !== "connected") && !showScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background:"#0D1117", zIndex:3 }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center
            text-xl font-bold text-white"
            style={{ background: avatarBg(displayName) }}>
            {initials(displayName)}
          </div>
          <p style={{ color:"#6B7E93", fontSize:"12px" }}>{displayName}</p>
        </div>
      )}

      {/* connecting overlay */}
      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background:"rgba(11,15,20,.9)", zIndex:10 }}>
          <Loader2 size={24} className="text-[#3DF29B] animate-spin mb-1" />
          <p style={{ color:"#6B7E93", fontSize:"12px" }}>Connecting...</p>
        </div>
      )}

      {/* bottom label */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center gap-1.5"
        style={{ background:"linear-gradient(to top,rgba(11,15,20,.9),transparent)", zIndex:10 }}>
        <GreenDot />
        <span style={{ color:"#E9EEF3", fontSize:"11px" }} className="truncate">
          You · {displayName}
        </span>
        {screenSharing && (
          <span style={{ color:"#3DF29B", fontSize:"10px", fontWeight:"bold",
            background:"rgba(61,242,155,.1)", padding:"0 4px", borderRadius:"4px",
            marginLeft:"4px" }}>● SCREEN</span>
        )}
      </div>

      {!micOn && (
        <div className="absolute top-2 right-2 p-1 rounded-lg"
          style={{ background:"#FF5C5C90", zIndex:10 }}>
          <MicOff size={11} className="text-white" />
        </div>
      )}

      <button onClick={e => { e.stopPropagation(); onPin(); }}
        className="absolute top-2 left-2 w-6 h-6 rounded-lg items-center
          justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        style={{ background:"rgba(20,27,35,.8)", zIndex:10 }}>
        {pinned
          ? <Minimize2 size={11} className="text-[#4F8EF7]" />
          : <Maximize2 size={11} className="text-[#6B7E93]" />}
      </button>
    </div>
  );
}

/* ─── Remote video tile — ref handled internally ────── */
function RemoteTile({ user, pinned, onPin }) {
  const ref = useRef(null);

  useEffect(() => {
    const el    = ref.current;
    const track = user.videoTrack;
    if (!el || !track) return;
    track.play(el);
    return () => { try { track.stop(); } catch(_) {} };
  }, [user.videoTrack]);

  const name = user.name ?? `User ${user.uid.slice(0,5)}`;

  return (
    <div
      onClick={onPin}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group
        transition-all w-full h-full min-h-[110px]
        ${user.speaking ? "ring-2 ring-[#3DF29B]" : ""}
        ${user.isScreen  ? "ring-2 ring-[#A855F7]"  : ""}
        ${pinned && !user.isScreen ? "ring-2 ring-[#4F8EF7]" : ""}`}
      style={{ background:"#0D1117", border:"1px solid #1F2D3D" }}>

      <div ref={ref} className={`absolute inset-0 w-full h-full ${user.isScreen ? "screen-tile" : ""}`} />

      {/* avatar / screen icon when no video */}
      {!user.videoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background:"#0D1117", zIndex:1 }}>
          {user.isScreen
            ? <Monitor size={28} className="text-[#A855F7]" />
            : <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                  text-xl font-bold text-white font-sora"
                  style={{ background: avatarBg(name) }}>
                  {initials(name)}
                </div>
                <p className="text-[#6B7E93] text-xs font-manrope">{name}</p>
              </>
          }
        </div>
      )}

      {/* bottom label */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 z-10 flex items-center gap-1.5"
        style={{ background:"linear-gradient(to top,rgba(11,15,20,.9),transparent)" }}>
        {user.speaking && <Waveform bars={3} active />}
        {user.isScreen && (
          <span className="text-[#A855F7] text-[10px] font-sora font-bold
            bg-[#A855F720] px-1.5 rounded">SCREEN</span>
        )}
        <span className="text-[#E9EEF3] text-xs font-manrope truncate">{name}</span>
      </div>

      <button onClick={e=>{e.stopPropagation();onPin();}}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg items-center
          justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        style={{ background:"rgba(20,27,35,.8)" }}>
        {pinned
          ? <Minimize2 size={11} className="text-[#4F8EF7]" />
          : <Maximize2 size={11} className="text-[#6B7E93]" />}
      </button>
    </div>
  );
}

/* ─── Control button ─────────────────────────────────── */
function CtrlBtn({ onClick, active, danger, icon:Icon, offIcon:Off, label }) {
  const D = (!danger && !active && Off) ? Off : Icon;
  const s = danger
    ? { background:"#FF5C5C", color:"#fff" }
    : active
      ? { background:"#1A2330", border:"1px solid #1F2D3D", color:"#E9EEF3" }
      : { background:"#FF5C5C15", border:"1px solid #FF5C5C44", color:"#FF5C5C" };
  return (
    <div className="flex flex-col items-center gap-1 group">
      <button onClick={onClick} title={label}
        className="w-11 h-11 rounded-2xl flex items-center justify-center
          transition-all hover:scale-105 active:scale-95" style={s}>
        <D size={18} />
      </button>
      <span className="text-[9px] text-[#6B7E93] group-hover:text-[#E9EEF3]
        transition-colors whitespace-nowrap font-manrope">{label}</span>
    </div>
  );
}

/* ─── Incoming call banner ───────────────────────────── */
function InCallBanner({ call, onAccept, onDecline }) {
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="card p-4 flex items-center gap-3 shadow-2xl"
        style={{ background:"#141B23", borderColor:"#3DF29B44" }}>
        <div className="w-10 h-10 rounded-full bg-[#4F8EF7] flex items-center justify-center
          text-white font-bold font-sora animate-pulse shrink-0">
          {call.fromName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#E9EEF3] font-sora font-semibold text-sm truncate">{call.fromName}</p>
          <p className="text-[#6B7E93] text-xs font-manrope">ভিডিও কলে আমন্ত্রণ</p>
        </div>
        <button onClick={onDecline} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background:"#FF5C5C20", color:"#FF5C5C" }}><PhoneOff size={15}/></button>
        <button onClick={onAccept} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background:"#3DF29B20", color:"#3DF29B" }}><PhoneCall size={15}/></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ROOM PAGE
═══════════════════════════════════════════════════════ */
export default function RoomPage() {
  const { roomId }      = useParams();
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [micOn,        setMicOn]        = useState(searchParams.get("mic") !== "false");
  const [camOn,        setCamOn]        = useState(searchParams.get("cam") !== "false");
  const [noiseCancel,  setNoiseCancel]  = useState(searchParams.get("nc")  !== "false");
  const [remoteUsers,  setRemoteUsers]  = useState([]);
  const [status,       setStatus]       = useState("idle");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [copied,       setCopied]       = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [pinnedUid,    setPinnedUid]    = useState(null); // uid string, or "local"
  const [screenSharing,setScreenSharing]= useState(false);
  const [chatOpen,     setChatOpen]     = useState(false);
  const [panelOpen,    setPanelOpen]    = useState(false);

  const [localVideoTrack,  setLocalVideoTrack]  = useState(null);
  const [localScreenTrack, setLocalScreenTrack] = useState(null);

  const clientRef       = useRef(null);
  const localAudioRef   = useRef(null);
  const localVideoRef   = useRef(null);
  const localScreenElRef= useRef(null);
  const screenClientRef = useRef(null);
  const screenTrackRef  = useRef(null);
  const initializedRef  = useRef(false);
  const leavingRef      = useRef(false);

  const displayName = searchParams.get("name") || session?.user?.name || "আপনি";

  /* ─── init Agora ──────────────────────────────────── */
  const initAgora = useCallback(async (userId) => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setStatus("connecting");
    const nc = searchParams.get("nc") !== "false";

    try {
      const client = AgoraRTC.createClient({ mode:"rtc", codec:"vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        const uid = String(user.uid);
        const isScreen = uid.endsWith("-screen");
        if (mediaType === "video") {
          setRemoteUsers(prev => [
            ...prev.filter(u => u.uid !== uid),
            { uid, videoTrack: user.videoTrack, name: isScreen ? "স্ক্রিন শেয়ার" : null,
              speaking: false, isScreen },
          ]);
          // auto-pin screen share
          if (isScreen) setPinnedUid(uid);
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      client.on("user-unpublished", (user, mediaType) => {
        const uid = String(user.uid);
        if (mediaType === "video")
          setRemoteUsers(prev =>
            prev.map(u => u.uid === uid ? { ...u, videoTrack: null } : u));
      });

      client.on("user-left", (user) => {
        const uid = String(user.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== uid));
        setPinnedUid(p => p === uid ? null : p);
      });

      const { token } = await fetch(
        `/api/agora-token?channel=${encodeURIComponent(String(roomId))}`
      ).then(r => r.json());

      await client.join(APP_ID, String(roomId), token ?? null, userId);

      // mobile-safe track creation
      let audioTrack = null, videoTrack = null;
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { AEC:true, ANS:nc, AGC:true },
          { encoderConfig:"360p_1", facingMode:"user" }
        );
      } catch (_) {
        try { audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ AEC:true,ANS:nc,AGC:true }); }
        catch(_) {}
        try { videoTrack = await AgoraRTC.createCameraVideoTrack({ encoderConfig:"360p_1",facingMode:"user" }); }
        catch(_) {}
      }

      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;
      if (audioTrack && !micOn)  audioTrack.setEnabled(false);
      if (videoTrack && !camOn)  videoTrack.setEnabled(false);
      // Don't call play() here — LocalTile handles it via useEffect
      setLocalVideoTrack(videoTrack ?? null);

      const toPublish = [audioTrack, videoTrack].filter(Boolean);
      if (toPublish.length) await client.publish(toPublish);
      setStatus("connected");
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message ?? "সংযোগ ব্যর্থ হয়েছে");
      setStatus("error");
      initializedRef.current = false;
    }
  }, [roomId]);

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.push("/login"); return; }
    initAgora(session.user.id);
    return () => {
      if (!leavingRef.current) return;
      screenTrackRef.current?.close();
      screenClientRef.current?.leave().catch(() => {});
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  }, [session, isPending]);

  // poll incoming calls
  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try { const d = await fetch("/api/call").then(r=>r.json()); setIncomingCall(d.call??null); }
      catch(_) {}
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [session]);

  /* ─── controls ───────────────────────────────────── */
  const toggleMic = () => { localAudioRef.current?.setEnabled(!micOn); setMicOn(v=>!v); };
  const toggleCam = () => { localVideoRef.current?.setEnabled(!camOn); setCamOn(v=>!v); };
  const toggleNC  = () => {
    try { localAudioRef.current?.setConfig?.({ ANS: noiseCancel?false:true, AEC:true, AGC:true }); }
    catch(_) {}
    setNoiseCancel(v=>!v);
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenTrackRef.current?.close();
      screenTrackRef.current = null;
      await screenClientRef.current?.leave().catch(()=>{});
      screenClientRef.current = null;
      setLocalScreenTrack(null);
      setScreenSharing(false);
      return;
    }
    try {
      const sc = AgoraRTC.createClient({ mode:"rtc", codec:"vp8" });
      screenClientRef.current = sc;
      const { token } = await fetch(
        `/api/agora-token?channel=${encodeURIComponent(String(roomId))}`
      ).then(r=>r.json());
      await sc.join(APP_ID, String(roomId), token??null, `${session?.user?.id}-screen`);
      const raw = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 15, max: 30 },
          bitrateMax: 2000,
          bitrateMin: 600,
        },
        optimizationMode: "detail", // sharp text/UI instead of motion
      }, "disable");
      const track = Array.isArray(raw) ? raw[0] : raw;
      screenTrackRef.current = track;
      await sc.publish(track);
      // play screen locally so sharer can see their own screen
      if (localScreenElRef.current) track.play(localScreenElRef.current);
      setLocalScreenTrack(track);
      setScreenSharing(true);
      track.on("track-ended", () => {
        track.close();
        sc.leave().catch(()=>{});
        screenClientRef.current = null;
        screenTrackRef.current  = null;
        setLocalScreenTrack(null);
        setScreenSharing(false);
      });
    } catch (err) {
      console.error("screen share:", err);
      screenClientRef.current?.leave().catch(()=>{});
      screenClientRef.current = null;
      screenTrackRef.current  = null;
    }
  };

  const leaveCall = async () => {
    leavingRef.current = true;
    screenTrackRef.current?.close();
    await screenClientRef.current?.leave().catch(()=>{});
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    await clientRef.current?.leave().catch(()=>{});
    router.push("/dashboard");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ callId: incomingCall.id, action:"accept" }) });
    leavingRef.current = true;
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    await clientRef.current?.leave().catch(()=>{});
    router.push(`/lobby/${incomingCall.roomId}`);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ callId: incomingCall.id, action:"decline" }) });
    setIncomingCall(null);
  };

  /* ─── layout ─────────────────────────────────────── */
  // filter own screen-share uid from remote list
  const myScreenUid = session?.user?.id ? `${session.user.id}-screen` : "__none__";
  const visible     = remoteUsers.filter(u => u.uid !== myScreenUid);
  const total       = 1 + visible.length;

  const pinnedRemote = pinnedUid && pinnedUid !== "local"
    ? visible.find(u => u.uid === pinnedUid) ?? null
    : null;
  const localPinned  = pinnedUid === "local";
  const hasPinned    = pinnedUid !== null;

  const sidebarList  = hasPinned
    ? visible.filter(u => u.uid !== pinnedUid)
    : [];

  const gridCols =
    total === 1 ? "grid-cols-1" :
    total === 2 ? "grid-cols-2" :
    total <= 4  ? "grid-cols-2" : "grid-cols-3";

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#0B0F14" }}>
      <Loader2 size={36} className="text-[#3DF29B] animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height:"100dvh", background:"#0B0F14", overflow:"hidden" }}>

      {incomingCall && incomingCall.roomId !== String(roomId) && (
        <InCallBanner call={incomingCall} onAccept={acceptCall} onDecline={declineCall} />
      )}

      {/* top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 z-20"
        style={{ height:"50px", background:"rgba(11,15,20,.92)",
          backdropFilter:"blur(16px)", borderBottom:"1px solid #1F2D3D" }}>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{ background:"#141B23", border:"1px solid #1F2D3D" }}>
            <GreenDot />
            <span className="text-[#E9EEF3] text-xs font-mono">{roomId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B7E93] text-sm font-manrope flex items-center gap-1">
            <Users size={13}/>{total}
          </span>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
              font-sora font-semibold transition-all"
            style={copied
              ? { background:"#3DF29B20", color:"#3DF29B", border:"1px solid #3DF29B44" }
              : { background:"#141B23", border:"1px solid #1F2D3D", color:"#6B7E93" }}>
            {copied ? <Check size={12}/> : <Link2 size={12}/>}
            <span className="hidden sm:inline">{copied ? "কপি!" : "লিংক"}</span>
          </button>
        </div>
      </header>

      {/* video area */}
      <div className="flex-1 min-h-0 p-2 flex gap-2 overflow-hidden">

        {status === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background:"#FF5C5C15" }}>
              <VideoOff size={24} style={{ color:"#FF5C5C" }} />
            </div>
            <p className="font-sora font-bold text-[#E9EEF3]">সংযোগ ব্যর্থ হয়েছে</p>
            <p className="text-[#6B7E93] text-sm font-manrope max-w-xs break-all">{errorMsg}</p>
            <button onClick={()=>{ initializedRef.current=false; initAgora(session?.user?.id); }}
              className="btn-primary px-5 py-2.5 text-sm">আবার চেষ্টা করুন</button>
          </div>

        ) : hasPinned ? (
          /* ─── PINNED layout ─── */
          <div className="flex-1 min-w-0 flex gap-2 overflow-hidden">
            {/* main large tile */}
            <div className="flex-1 min-w-0">
              {localPinned ? (
                <LocalTile
                  videoTrack={localVideoTrack}
                  screenTrack={localScreenTrack}
                  camOn={camOn} micOn={micOn} status={status}
                  displayName={displayName} screenSharing={screenSharing}
                  pinned onPin={() => setPinnedUid(null)}
                />
              ) : pinnedRemote ? (
                <RemoteTile
                  user={pinnedRemote}
                  pinned
                  onPin={()=>setPinnedUid(null)}
                />
              ) : null}
            </div>

            {/* sidebar strip — hidden on mobile */}
            <div className="hidden sm:flex flex-col gap-2 overflow-y-auto shrink-0"
              style={{ width:"140px" }}>
              {/* local in sidebar when a remote is pinned */}
              {!localPinned && (
                <div style={{ height:"90px" }}>
                  <LocalTile
                    videoTrack={localVideoTrack}
                    screenTrack={localScreenTrack}
                    camOn={camOn} micOn={micOn} status={status}
                    displayName={displayName} screenSharing={screenSharing}
                    pinned={false} onPin={() => setPinnedUid("local")}
                  />
                </div>
              )}
              {sidebarList.map(u => (
                <div key={u.uid} style={{ height:"90px" }}>
                  <RemoteTile user={u} pinned={false} onPin={()=>setPinnedUid(u.uid)} />
                </div>
              ))}
            </div>
          </div>

        ) : (
          /* ─── GRID layout — mobile: single column, desktop: multi ─── */
          <div className={`flex-1 overflow-y-auto`}>
            <div className={`grid gap-2 h-full
              ${total === 1 ? "grid-cols-1" :
                total === 2 ? "grid-cols-1 sm:grid-cols-2" :
                total <= 4  ? "grid-cols-2" :
                "grid-cols-2 sm:grid-cols-3"}`}
              style={{ gridAutoRows: total <= 2 ? "1fr" : "minmax(130px,1fr)" }}>
              <LocalTile
                videoTrack={localVideoTrack}
                screenTrack={localScreenTrack}
                camOn={camOn} micOn={micOn} status={status}
                displayName={displayName} screenSharing={screenSharing}
                pinned={false} onPin={() => setPinnedUid("local")}
              />
              {visible.map(u => (
                <RemoteTile key={u.uid} user={u} pinned={false} onPin={()=>setPinnedUid(u.uid)} />
              ))}
            </div>
          </div>
        )}

        {/* participants panel */}
        {panelOpen && (
          <div className="shrink-0 flex flex-col rounded-2xl overflow-hidden"
            style={{ width:"200px", background:"#141B23", border:"1px solid #1F2D3D" }}>
            <div className="flex items-center justify-between p-3 border-b border-[#1F2D3D]">
              <p className="font-sora font-bold text-[#E9EEF3] text-sm">অংশগ্রহণকারীরা ({total})</p>
              <button onClick={()=>setPanelOpen(false)} className="text-[#6B7E93] hover:text-[#E9EEF3] text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background:"#1A2330" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center
                  text-[#0B0F14] font-bold text-xs font-sora" style={{ background:"#3DF29B" }}>
                  {initials(displayName)}
                </div>
                <div>
                  <p className="text-[#E9EEF3] text-xs font-semibold font-manrope">{displayName}</p>
                  <p className="text-[#3DF29B] text-[10px] font-manrope">আপনি</p>
                </div>
              </div>
              {visible.map(u => (
                <div key={u.uid} className="flex items-center gap-2 p-2 rounded-xl"
                  style={{ background:"#1A2330" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center
                    text-white font-bold text-xs font-sora"
                    style={{ background: u.isScreen?"#A855F7":avatarBg(u.name??u.uid) }}>
                    {u.isScreen ? "📺" : initials(u.name??u.uid)}
                  </div>
                  <p className="text-[#E9EEF3] text-xs font-semibold font-manrope truncate">
                    {u.isScreen ? "স্ক্রিন শেয়ার" : u.name ?? `User ${u.uid.slice(0,5)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* chat panel */}
        {chatOpen && (
          <div className="shrink-0 flex flex-col rounded-2xl overflow-hidden"
            style={{ width:"200px", background:"#141B23", border:"1px solid #1F2D3D" }}>
            <div className="flex items-center justify-between p-3 border-b border-[#1F2D3D]">
              <p className="font-sora font-bold text-[#E9EEF3] text-sm">চ্যাট</p>
              <button onClick={()=>setChatOpen(false)} className="text-[#6B7E93] hover:text-[#E9EEF3] text-sm">✕</button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-[#6B7E93] text-xs font-manrope text-center">শীঘ্রই আসছে</p>
            </div>
          </div>
        )}
      </div>

      {/* control bar */}
      <div className="shrink-0 pb-safe px-4 pt-2 z-20"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="max-w-lg mx-auto rounded-2xl px-4 py-2.5 flex items-end
          justify-center gap-2 sm:gap-4 shadow-2xl"
          style={{ background:"rgba(20,27,35,.97)", backdropFilter:"blur(20px)",
            border:"1px solid #1F2D3D" }}>
          <CtrlBtn onClick={toggleMic} active={micOn} icon={Mic} offIcon={MicOff}
            label={micOn?"মাইক":"মাইক"} />
          <CtrlBtn onClick={toggleCam} active={camOn} icon={VideoIcon} offIcon={VideoOff}
            label={camOn?"ক্যামেরা":"ক্যামেরা"} />
          <CtrlBtn onClick={toggleNC} active={noiseCancel} icon={Wand2}
            label="NC" />
          <CtrlBtn onClick={toggleScreenShare} active={!screenSharing}
            icon={Monitor} offIcon={MonitorOff}
            label={screenSharing?"বন্ধ":"স্ক্রিন"} />
          <CtrlBtn onClick={()=>{ setPanelOpen(v=>!v); setChatOpen(false); }}
            active={!panelOpen} icon={Users} label={`${total} জন`} />
          <CtrlBtn onClick={()=>{ setChatOpen(v=>!v); setPanelOpen(false); }}
            active={!chatOpen} icon={MessageSquare} label="চ্যাট" />
          <CtrlBtn onClick={leaveCall} danger active icon={PhoneOff} label="ছেড়ে" />
        </div>
      </div>
    </div>
  );
}
