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

/* ── Avatar tile ───────────────────────────────────────── */
function AvatarTile({ name }) {
  const p = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const bg = p[(name?.charCodeAt(0)??0)%p.length];
  const i = name?name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase():"?";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
      style={{background:"#0D1117",zIndex:1}}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center
        text-2xl font-bold text-white font-sora" style={{background:bg}}>{i}</div>
      <p className="text-[#6B7E93] text-xs font-manrope">{name}</p>
    </div>
  );
}

/* ── Video tile — used for both local & remote ──────────── */
function VideoTile({ label, isScreen, videoRef, videoTrack, name,
  camOff, speaking, pinned, onPin, statusOverlay }) {

  // play track into div when track or ref changes
  useEffect(() => {
    if (!videoRef?.current || !videoTrack) return;
    videoTrack.play(videoRef.current);
    return () => { try { videoTrack.stop(); } catch(_) {} };
  }, [videoTrack]);

  return (
    <div
      onClick={onPin}
      className={`relative rounded-2xl overflow-hidden cursor-pointer select-none
        transition-all duration-200
        ${speaking ? "ring-2 ring-[#3DF29B]" : "ring-0"}
        ${pinned ? "ring-2 ring-[#4F8EF7]" : ""}
        ${isScreen ? "ring-2 ring-[#A855F7]" : ""}`}
      style={{background:"#0D1117", border:"1px solid #1F2D3D",
        width:"100%", height:"100%", minHeight:"120px"}}>

      {/* video div — always present */}
      <div ref={videoRef} className="absolute inset-0 w-full h-full"
        style={{background:"#0D1117"}} />

      {/* avatar when cam off */}
      {camOff && <AvatarTile name={name} />}

      {/* custom status overlay (connecting...) */}
      {statusOverlay}

      {/* bottom label */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 z-10 flex items-center gap-2"
        style={{background:"linear-gradient(to top,rgba(11,15,20,.9),transparent)"}}>
        {speaking && <Waveform bars={3} active />}
        {isScreen && (
          <span className="text-[#A855F7] text-[10px] font-sora font-bold
            bg-[#A855F720] border border-[#A855F740] px-1.5 py-0.5 rounded">
            SCREEN
          </span>
        )}
        <span className="text-[#E9EEF3] text-xs font-manrope truncate">{label}</span>
      </div>

      {/* pin button (top-right) */}
      <button
        onClick={e=>{e.stopPropagation();onPin();}}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg
          flex items-center justify-center opacity-0 hover:opacity-100
          group-hover:opacity-100 transition-opacity"
        style={{background:"rgba(20,27,35,.8)"}}>
        {pinned ? <Minimize2 size={13} className="text-[#4F8EF7]"/>
                : <Maximize2 size={13} className="text-[#6B7E93]"/>}
      </button>
    </div>
  );
}

/* ── Control Button ─────────────────────────────────────── */
function CtrlBtn({ onClick, active, danger, icon:Icon, offIcon:Off, label }) {
  const D = (!danger&&!active&&Off)?Off:Icon;
  const s = danger
    ? {background:"#FF5C5C",color:"#fff"}
    : active
      ? {background:"#1A2330",border:"1px solid #1F2D3D",color:"#E9EEF3"}
      : {background:"#FF5C5C15",border:"1px solid #FF5C5C44",color:"#FF5C5C"};
  return (
    <div className="flex flex-col items-center gap-1 group">
      <button onClick={onClick} title={label}
        className="w-11 h-11 rounded-2xl flex items-center justify-center
          transition-all hover:scale-105 active:scale-95" style={s}>
        <D size={18}/>
      </button>
      <span className="text-[9px] text-[#6B7E93] group-hover:text-[#E9EEF3]
        transition-colors whitespace-nowrap font-manrope">{label}</span>
    </div>
  );
}

/* ── Incoming call banner ───────────────────────────────── */
function InCallBanner({ call, onAccept, onDecline }) {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="card p-4 flex items-center gap-3 shadow-2xl"
        style={{background:"#141B23",borderColor:"#3DF29B44"}}>
        <div className="w-10 h-10 rounded-full bg-[#4F8EF7] flex items-center justify-center
          text-white font-bold font-sora animate-pulse shrink-0">
          {call.fromName?.[0]?.toUpperCase()??"?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#E9EEF3] font-sora font-semibold text-sm truncate">{call.fromName}</p>
          <p className="text-[#6B7E93] text-xs font-manrope">ভিডিও কলে আমন্ত্রণ</p>
        </div>
        <button onClick={onDecline} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{background:"#FF5C5C20",color:"#FF5C5C"}}><PhoneOff size={15}/></button>
        <button onClick={onAccept} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{background:"#3DF29B20",color:"#3DF29B"}}><PhoneCall size={15}/></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ROOM PAGE
═══════════════════════════════════════════════════════ */
export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [micOn, setMicOn]           = useState(searchParams.get("mic") !== "false");
  const [camOn, setCamOn]           = useState(searchParams.get("cam") !== "false");
  const [noiseCancel, setNoiseCancel] = useState(searchParams.get("nc") !== "false");
  const [remoteUsers, setRemoteUsers] = useState([]); // {uid, videoTrack, name, speaking, isScreen}
  const [status, setStatus]         = useState("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [copied, setCopied]         = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [pinnedUid, setPinnedUid]   = useState(null); // uid of pinned/focused tile
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen]     = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const clientRef      = useRef(null);
  const localAudioRef  = useRef(null);
  const localVideoRef  = useRef(null);
  const localVideoElRef= useRef(null);
  const screenTrackRef = useRef(null);
  const screenClientRef= useRef(null);
  const initializedRef = useRef(false);
  const leavingRef     = useRef(false);

  const displayName = searchParams.get("name") || session?.user?.name || "আপনি";
  const LOCAL_UID   = "local";

  /* ── init Agora ─────────────────────────────────────── */
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
          setRemoteUsers(prev => {
            const filtered = prev.filter(u => u.uid !== uid);
            return [...filtered, { uid, videoTrack: user.videoTrack,
              name: isScreen ? "স্ক্রিন শেয়ার" : null,
              speaking: false, isScreen }];
          });
          // Auto-pin screen share
          if (isScreen) setPinnedUid(uid);
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      client.on("user-unpublished", (user, mediaType) => {
        const uid = String(user.uid);
        if (mediaType === "video")
          setRemoteUsers(prev => prev.map(u =>
            u.uid === uid ? { ...u, videoTrack: null } : u));
      });

      client.on("user-left", (user) => {
        const uid = String(user.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== uid));
        setPinnedUid(p => p === uid ? null : p);
      });

      const tokenRes = await fetch(
        `/api/agora-token?channel=${encodeURIComponent(String(roomId))}`);
      const { token } = await tokenRes.json();
      await client.join(APP_ID, String(roomId), token ?? null, userId);

      // Mobile-safe track creation
      let audioTrack = null, videoTrack = null;
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { AEC:true, ANS:nc, AGC:true },
          { encoderConfig:"360p_1", facingMode:"user" }
        );
      } catch (_) {
        try { audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
          { AEC:true, ANS:nc, AGC:true }); } catch(_) {}
        try { videoTrack = await AgoraRTC.createCameraVideoTrack(
          { encoderConfig:"360p_1", facingMode:"user" }); } catch(_) {}
      }

      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;
      if (audioTrack && !micOn) audioTrack.setEnabled(false);
      if (videoTrack && !camOn) videoTrack.setEnabled(false);
      if (videoTrack && localVideoElRef.current) videoTrack.play(localVideoElRef.current);

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
      if (leavingRef.current) {
        screenTrackRef.current?.close();
        screenClientRef.current?.leave().catch(()=>{});
        localAudioRef.current?.close();
        localVideoRef.current?.close();
        clientRef.current?.leave().catch(()=>{});
      }
    };
  }, [session, isPending]);

  // Poll incoming calls
  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try { const r=await fetch("/api/call"); const d=await r.json();
        setIncomingCall(d.call??null); } catch(_) {}
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [session]);

  /* ── controls ───────────────────────────────────────── */
  const toggleMic = () => { localAudioRef.current?.setEnabled(!micOn); setMicOn(v=>!v); };
  const toggleCam = () => { localVideoRef.current?.setEnabled(!camOn); setCamOn(v=>!v); };

  const toggleNoiseCancel = async () => {
    try { localAudioRef.current?.setConfig?.({ANS:noiseCancel?false:true,AEC:true,AGC:true}); }
    catch(_) {}
    setNoiseCancel(v=>!v);
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenTrackRef.current?.close();
      screenTrackRef.current = null;
      await screenClientRef.current?.leave().catch(()=>{});
      screenClientRef.current = null;
      setScreenSharing(false);
      return;
    }
    try {
      const sc = AgoraRTC.createClient({ mode:"rtc", codec:"vp8" });
      screenClientRef.current = sc;
      const tokenRes = await fetch(
        `/api/agora-token?channel=${encodeURIComponent(String(roomId))}`);
      const { token } = await tokenRes.json();
      await sc.join(APP_ID, String(roomId), token??null, `${session?.user?.id}-screen`);
      const raw = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig:"1080p_1" }, "disable");
      const track = Array.isArray(raw) ? raw[0] : raw;
      screenTrackRef.current = track;
      await sc.publish(track);
      setScreenSharing(true);
      track.on("track-ended", () => {
        track.close(); sc.leave().catch(()=>{});
        screenClientRef.current=null; screenTrackRef.current=null;
        setScreenSharing(false);
      });
    } catch(err) {
      console.error("screen share:", err);
      screenClientRef.current?.leave().catch(()=>{});
      screenClientRef.current=null; screenTrackRef.current=null;
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
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({callId:incomingCall.id,action:"accept"})});
    leavingRef.current=true;
    localAudioRef.current?.close(); localVideoRef.current?.close();
    await clientRef.current?.leave().catch(()=>{});
    router.push(`/lobby/${incomingCall.roomId}`);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({callId:incomingCall.id,action:"decline"})});
    setIncomingCall(null);
  };

  /* ── layout logic ───────────────────────────────────── */
  // All tiles: local + remotes (filter out own screen-share uid from remote list)
  const myScreenUid = session?.user?.id ? `${session.user.id}-screen` : null;
  const visibleRemotes = remoteUsers.filter(u => u.uid !== myScreenUid);

  // pinned tile = the one user clicked, or auto-pinned screen share
  const pinned = pinnedUid
    ? (pinnedUid === LOCAL_UID ? null : visibleRemotes.find(u=>u.uid===pinnedUid))
    : null;
  const localPinned = pinnedUid === LOCAL_UID;

  // sidebar tiles = everything except pinned
  const sidebarRemotes = pinnedUid
    ? visibleRemotes.filter(u=>u.uid!==pinnedUid)
    : [];

  const totalVisible = 1 + visibleRemotes.length;

  // Simple grid when nothing pinned
  const gridCols =
    totalVisible === 1 ? "grid-cols-1" :
    totalVisible === 2 ? "grid-cols-2" :
    totalVisible === 3 ? "grid-cols-2 grid-rows-2" :
    totalVisible <= 4  ? "grid-cols-2" :
    "grid-cols-3";

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{background:"#0B0F14"}}>
      <Loader2 size={36} className="text-[#3DF29B] animate-spin"/>
    </div>
  );

  return (
    <div className="flex flex-col" style={{
      height:"100dvh", background:"#0B0F14", overflow:"hidden" }}>

      {incomingCall && incomingCall.roomId !== String(roomId) && (
        <InCallBanner call={incomingCall} onAccept={acceptCall} onDecline={declineCall}/>
      )}

      {/* ── Top bar ── */}
      <header className="shrink-0 h-13 flex items-center justify-between px-4 z-20"
        style={{height:"52px", background:"rgba(11,15,20,.92)",
          backdropFilter:"blur(16px)", borderBottom:"1px solid #1F2D3D"}}>
        <div className="flex items-center gap-2">
          <Logo size="sm"/>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{background:"#141B23",border:"1px solid #1F2D3D"}}>
            <GreenDot/>
            <span className="text-[#E9EEF3] text-xs font-mono">{roomId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B7E93] text-sm font-manrope flex items-center gap-1">
            <Users size={13}/>{totalVisible}
          </span>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
              font-sora font-semibold transition-all"
            style={copied
              ? {background:"#3DF29B20",color:"#3DF29B",border:"1px solid #3DF29B44"}
              : {background:"#141B23",border:"1px solid #1F2D3D",color:"#6B7E93"}}>
            {copied?<Check size={12}/>:<Link2 size={12}/>}
            <span className="hidden sm:inline">{copied?"কপি!":"লিংক"}</span>
          </button>
        </div>
      </header>

      {/* ── Video area ── */}
      <div className="flex-1 min-h-0 p-2 flex gap-2">

        {status === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{background:"#FF5C5C15"}}>
              <VideoOff size={24} style={{color:"#FF5C5C"}}/>
            </div>
            <p className="font-sora font-bold text-[#E9EEF3]">সংযোগ ব্যর্থ হয়েছে</p>
            <p className="text-[#6B7E93] text-sm font-manrope max-w-xs break-all">{errorMsg}</p>
            <button onClick={()=>{initializedRef.current=false;initAgora(session?.user?.id);}}
              className="btn-primary px-5 py-2.5 text-sm">আবার চেষ্টা করুন</button>
          </div>

        ) : pinnedUid ? (
          /* ── PINNED layout: large main + sidebar strip ── */
          <>
            {/* Main pinned tile */}
            <div className="flex-1 min-w-0">
              {localPinned ? (
                <VideoTile
                  label={`আপনি · ${displayName}`}
                  videoRef={localVideoElRef}
                  videoTrack={null}
                  camOff={!camOn || status !== "connected"}
                  name={displayName}
                  speaking={false}
                  pinned={true}
                  onPin={()=>setPinnedUid(null)}
                  statusOverlay={status==="connecting"?(
                    <div className="absolute inset-0 flex flex-col items-center
                      justify-center z-10" style={{background:"rgba(11,15,20,.9)"}}>
                      <Loader2 size={28} className="text-[#3DF29B] animate-spin mb-2"/>
                      <p className="text-[#6B7E93] text-sm font-manrope">সংযুক্ত হচ্ছে...</p>
                    </div>
                  ):null}
                />
              ) : pinned ? (
                <VideoTile
                  key={pinned.uid}
                  label={pinned.name ?? `User ${pinned.uid.slice(0,5)}`}
                  videoRef={useRef(null)}
                  videoTrack={pinned.videoTrack}
                  camOff={!pinned.videoTrack}
                  name={pinned.name ?? `User ${pinned.uid.slice(0,5)}`}
                  speaking={pinned.speaking}
                  isScreen={pinned.isScreen}
                  pinned={true}
                  onPin={()=>setPinnedUid(null)}
                />
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-2 overflow-y-auto"
              style={{width:"160px", minWidth:"130px"}}>
              {/* Local in sidebar */}
              {!localPinned && (
                <div style={{height:"100px"}}>
                  <VideoTile
                    label={`আপনি`}
                    videoRef={localVideoElRef}
                    videoTrack={null}
                    camOff={!camOn||status!=="connected"}
                    name={displayName}
                    speaking={false}
                    pinned={false}
                    onPin={()=>setPinnedUid(LOCAL_UID)}
                  />
                </div>
              )}
              {sidebarRemotes.map(u=>(
                <div key={u.uid} style={{height:"100px"}}>
                  <VideoTile
                    label={u.name??`User ${u.uid.slice(0,5)}`}
                    videoRef={useRef(null)}
                    videoTrack={u.videoTrack}
                    camOff={!u.videoTrack}
                    name={u.name??`User ${u.uid.slice(0,5)}`}
                    speaking={u.speaking}
                    isScreen={u.isScreen}
                    pinned={false}
                    onPin={()=>setPinnedUid(u.uid)}
                  />
                </div>
              ))}
            </div>
          </>

        ) : (
          /* ── GRID layout ── */
          <div className={`flex-1 grid ${gridCols} gap-2`}>
            {/* Local tile */}
            <div className="relative group">
              <div ref={localVideoElRef} className="absolute inset-0 w-full h-full rounded-2xl"
                style={{background:"#0D1117"}}/>
              <div className="w-full h-full rounded-2xl overflow-hidden relative"
                style={{border:"1px solid #1F2D3D", minHeight:"120px"}}>
                <div ref={localVideoElRef} className="absolute inset-0 w-full h-full"/>
                {(!camOn||status!=="connected") && <AvatarTile name={displayName}/>}
                {status==="connecting" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    style={{background:"rgba(11,15,20,.9)"}}>
                    <Loader2 size={24} className="text-[#3DF29B] animate-spin mb-1"/>
                    <p className="text-[#6B7E93] text-xs font-manrope">সংযুক্ত হচ্ছে...</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 z-10 flex items-center gap-1.5"
                  style={{background:"linear-gradient(to top,rgba(11,15,20,.9),transparent)"}}>
                  <GreenDot/>
                  <span className="text-[#E9EEF3] text-xs font-manrope truncate">
                    আপনি · {displayName}
                  </span>
                  {screenSharing && (
                    <span className="text-[#3DF29B] text-[10px] font-sora font-bold ml-1">● SCREEN</span>
                  )}
                </div>
                {!micOn && (
                  <div className="absolute top-2 right-2 z-10 p-1 rounded-lg"
                    style={{background:"#FF5C5C90"}}>
                    <MicOff size={11} className="text-white"/>
                  </div>
                )}
                {/* Pin button */}
                <button onClick={()=>setPinnedUid(LOCAL_UID)}
                  className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg
                    items-center justify-center opacity-0 group-hover:opacity-100
                    transition-opacity hidden sm:flex"
                  style={{background:"rgba(20,27,35,.8)"}}>
                  <Maximize2 size={11} className="text-[#6B7E93]"/>
                </button>
              </div>
            </div>

            {/* Remote tiles */}
            {visibleRemotes.map(u => (
              <RemoteTile key={u.uid} user={u} onPin={()=>setPinnedUid(u.uid)}/>
            ))}
          </div>
        )}

        {/* Participants drawer */}
        {participantsOpen && (
          <div className="shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col"
            style={{background:"#141B23",border:"1px solid #1F2D3D"}}>
            <div className="flex items-center justify-between p-3 border-b border-[#1F2D3D]">
              <p className="font-sora font-bold text-[#E9EEF3] text-sm">
                অংশগ্রহণকারীরা ({totalVisible})
              </p>
              <button onClick={()=>setParticipantsOpen(false)}
                className="text-[#6B7E93] hover:text-[#E9EEF3] text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="flex items-center gap-2.5 p-2 rounded-xl"
                style={{background:"#1A2330"}}>
                <div className="w-7 h-7 rounded-full bg-[#3DF29B] flex items-center justify-center
                  text-[#0B0F14] font-bold text-xs font-sora">
                  {displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[#E9EEF3] text-xs font-semibold font-manrope">{displayName}</p>
                  <p className="text-[#3DF29B] text-[10px] font-manrope">আপনি</p>
                </div>
              </div>
              {visibleRemotes.map(u=>(
                <div key={u.uid} className="flex items-center gap-2.5 p-2 rounded-xl"
                  style={{background:"#1A2330"}}>
                  <div className="w-7 h-7 rounded-full bg-[#4F8EF7] flex items-center justify-center
                    text-white font-bold text-xs font-sora">
                    {(u.name??u.uid)[0]?.toUpperCase()}
                  </div>
                  <p className="text-[#E9EEF3] text-xs font-semibold font-manrope">
                    {u.isScreen?"স্ক্রিন শেয়ার":u.name??`User ${u.uid.slice(0,5)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat drawer */}
        {chatOpen && (
          <div className="shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col"
            style={{background:"#141B23",border:"1px solid #1F2D3D"}}>
            <div className="flex items-center justify-between p-3 border-b border-[#1F2D3D]">
              <p className="font-sora font-bold text-[#E9EEF3] text-sm">চ্যাট</p>
              <button onClick={()=>setChatOpen(false)}
                className="text-[#6B7E93] hover:text-[#E9EEF3] text-sm">✕</button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-[#6B7E93] text-xs font-manrope text-center">শীঘ্রই আসছে</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Control bar ── */}
      <div className="shrink-0 pb-4 px-4 pt-2 z-20">
        <div className="max-w-lg mx-auto rounded-2xl px-6 py-3 flex items-end
          justify-center gap-4 sm:gap-5 shadow-2xl flex-wrap"
          style={{background:"rgba(20,27,35,.97)",
            backdropFilter:"blur(20px)",border:"1px solid #1F2D3D"}}>
          <CtrlBtn onClick={toggleMic} active={micOn} icon={Mic} offIcon={MicOff}
            label={micOn?"মাইক বন্ধ":"মাইক চালু"}/>
          <CtrlBtn onClick={toggleCam} active={camOn} icon={VideoIcon} offIcon={VideoOff}
            label={camOn?"ক্যামেরা বন্ধ":"ক্যামেরা চালু"}/>
          <CtrlBtn onClick={toggleNoiseCancel} active={noiseCancel} icon={Wand2}
            label={noiseCancel?"NC চালু":"NC বন্ধ"}/>
          <CtrlBtn onClick={toggleScreenShare} active={!screenSharing}
            icon={Monitor} offIcon={MonitorOff}
            label={screenSharing?"শেয়ার বন্ধ":"স্ক্রিন"}/>
          <CtrlBtn onClick={()=>{setParticipantsOpen(v=>!v);setChatOpen(false);}}
            active={!participantsOpen} icon={Users}
            label={`${totalVisible} জন`}/>
          <CtrlBtn onClick={()=>{setChatOpen(v=>!v);setParticipantsOpen(false);}}
            active={!chatOpen} icon={MessageSquare} label="চ্যাট"/>
          <CtrlBtn onClick={leaveCall} danger active icon={PhoneOff} label="ছেড়ে দিন"/>
        </div>
      </div>
    </div>
  );
}

/* ── Remote tile in grid ─────────────────────────────── */
function RemoteTile({ user, onPin }) {
  const ref = useRef(null);
  useEffect(() => {
    const el=ref.current; const track=user.videoTrack;
    if(!el||!track) return;
    track.play(el);
    return ()=>{try{track.stop();}catch(_){}};
  }, [user.videoTrack]);

  const p = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const name = user.name ?? `User ${user.uid.slice(0,5)}`;
  const bg = p[(name.charCodeAt(0)??0)%p.length];
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div onClick={onPin}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group
        transition-all min-h-[120px]
        ${user.speaking?"ring-2 ring-[#3DF29B]":""}
        ${user.isScreen?"ring-2 ring-[#A855F7]":""}`}
      style={{background:"#0D1117",border:"1px solid #1F2D3D"}}>
      <div ref={ref} className="absolute inset-0 w-full h-full"/>
      {!user.videoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{background:"#0D1117"}}>
          {user.isScreen
            ? <Monitor size={28} className="text-[#A855F7]"/>
            : <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                  text-xl font-bold text-white font-sora" style={{background:bg}}>
                  {initials}
                </div>
                <p className="text-[#6B7E93] text-xs font-manrope">{name}</p>
              </>
          }
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 z-10"
        style={{background:"linear-gradient(to top,rgba(11,15,20,.9),transparent)"}}>
        <div className="flex items-center gap-1.5">
          {user.speaking && <Waveform bars={3} active/>}
          {user.isScreen && (
            <span className="text-[#A855F7] text-[10px] font-sora font-bold
              bg-[#A855F720] px-1 rounded">SCREEN</span>
          )}
          <span className="text-[#E9EEF3] text-xs font-manrope truncate">{name}</span>
        </div>
      </div>
      <button onClick={e=>{e.stopPropagation();onPin();}}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg
          items-center justify-center opacity-0 group-hover:opacity-100
          transition-opacity hidden sm:flex"
        style={{background:"rgba(20,27,35,.8)"}}>
        <Maximize2 size={11} className="text-[#6B7E93]"/>
      </button>
    </div>
  );
}
