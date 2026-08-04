"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Logo, GreenDot, Waveform } from "@/lib/ui";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Check, Users, Loader2, Link2, PhoneCall, MessageSquare, MoreHorizontal,
} from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
AgoraRTC.setLogLevel(3);

/* ── Avatar tile (when cam off) ────────────────────────── */
function AvatarTile({ name }) {
  const palettes = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const bg = palettes[(name?.charCodeAt(0)??0)%palettes.length];
  const initials = name?name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase():"?";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{background:"#0D1117"}}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white font-sora shadow-2xl" style={{background:bg}}>{initials}</div>
      <p className="text-[#6B7E93] text-sm font-manrope">{name}</p>
    </div>
  );
}

/* ── Remote video card ─────────────────────────────────── */
function RemoteCard({ user }) {
  const ref = useRef(null);
  useEffect(() => {
    const el=ref.current; const track=user.videoTrack;
    if(!el||!track) return;
    track.play(el);
    return ()=>{try{track.stop();}catch(_){}};
  }, [user.videoTrack]);

  return (
    <div className={`relative rounded-2xl overflow-hidden min-h-[200px] transition-all ${user.speaking?"ring-2 ring-[#3DF29B] glow-green scale-[1.01]":""}`}
      style={{background:"#0D1117",border:"1px solid #1F2D3D"}}>
      <div ref={ref} className="absolute inset-0 w-full h-full"/>
      {!user.videoTrack&&<AvatarTile name={user.name??`User ${String(user.uid).slice(0,5)}`}/>}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{background:"rgba(11,15,20,.85)"}}>
        {user.speaking&&<Waveform bars={3} active/>}
        <span className="text-[#E9EEF3] text-xs font-manrope">{user.name??`User ${String(user.uid).slice(0,5)}`}</span>
      </div>
    </div>
  );
}

/* ── Control button ────────────────────────────────────── */
function CtrlBtn({ onClick, active, danger, icon:Icon, offIcon:OffIcon, label, badge }) {
  const DisplayIcon = (!danger&&!active&&OffIcon)?OffIcon:Icon;
  const style = danger
    ? {background:"#FF5C5C",color:"#fff"}
    : active
      ? {background:"#1A2330",border:"1px solid #1F2D3D",color:"#E9EEF3"}
      : {background:"#FF5C5C15",border:"1px solid #FF5C5C44",color:"#FF5C5C"};
  return (
    <div className="relative group flex flex-col items-center gap-1">
      <button onClick={onClick} title={label}
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={style}>
        <DisplayIcon size={20}/>
      </button>
      {badge&&<span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3DF29B] text-[#0B0F14] text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
      <span className="text-[9px] text-[#6B7E93] font-manrope group-hover:text-[#E9EEF3] transition-colors whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ── Incoming call banner ──────────────────────────────── */
function InCallBanner({ call, onAccept, onDecline }) {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="card p-4 flex items-center gap-4 shadow-2xl" style={{background:"#141B23",borderColor:"#3DF29B44"}}>
        <div className="w-10 h-10 rounded-full bg-[#4F8EF7] flex items-center justify-center text-white font-bold font-sora animate-pulse shrink-0">
          {call.fromName?.[0]?.toUpperCase()??"?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#E9EEF3] font-sora font-semibold text-sm truncate">{call.fromName}</p>
          <p className="text-[#6B7E93] text-xs font-manrope">ভিডিও কলে আমন্ত্রণ</p>
        </div>
        <button onClick={onDecline} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{background:"#FF5C5C20",color:"#FF5C5C"}}><PhoneOff size={15}/></button>
        <button onClick={onAccept} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{background:"#3DF29B20",color:"#3DF29B"}}><PhoneCall size={15}/></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ROOM PAGE
═══════════════════════════════════════════════════════════ */
export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [micOn, setMicOn] = useState(searchParams.get("mic") !== "false");
  const [camOn, setCamOn] = useState(searchParams.get("cam") !== "false");
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const localVideoElRef = useRef(null);
  const initializedRef = useRef(false);
  const leavingRef = useRef(false);

  const displayName = searchParams.get("name") || session?.user?.name || "আপনি";

  const initAgora = useCallback(async (userId) => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setStatus("connecting");
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers(prev => [...prev.filter(u=>u.uid!==String(user.uid)), {uid:String(user.uid),videoTrack:user.videoTrack,name:null,speaking:false}]);
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });
      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType==="video") setRemoteUsers(prev=>prev.map(u=>u.uid===String(user.uid)?{...u,videoTrack:null}:u));
      });
      client.on("user-left", (user) => setRemoteUsers(prev=>prev.filter(u=>u.uid!==String(user.uid))));

      const tokenRes = await fetch(`/api/agora-token?channel=${encodeURIComponent(String(roomId))}`);
      const { token } = await tokenRes.json();
      await client.join(APP_ID, String(roomId), token??null, userId);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({}, { encoderConfig:"360p_1" });
      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;

      if (!micOn) audioTrack.setEnabled(false);
      if (!camOn) videoTrack.setEnabled(false);
      if (localVideoElRef.current) videoTrack.play(localVideoElRef.current);

      await client.publish([audioTrack, videoTrack]);
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
        localAudioRef.current?.close();
        localVideoRef.current?.close();
        clientRef.current?.leave().catch(()=>{});
      }
    };
  }, [session, isPending]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try { const r=await fetch("/api/call"); const d=await r.json(); setIncomingCall(d.call??null); } catch(_) {}
    };
    poll();
    const id = setInterval(poll, 5000);
    return ()=>clearInterval(id);
  }, [session]);

  const toggleMic = () => { localAudioRef.current?.setEnabled(!micOn); setMicOn(v=>!v); };
  const toggleCam = () => { localVideoRef.current?.setEnabled(!camOn); setCamOn(v=>!v); };
  const leaveCall = async () => {
    leavingRef.current = true;
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
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({callId:incomingCall.id,action:"accept"})});
    leavingRef.current=true; localAudioRef.current?.close(); localVideoRef.current?.close();
    await clientRef.current?.leave().catch(()=>{});
    router.push(`/lobby/${incomingCall.roomId}`);
  };
  const declineCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({callId:incomingCall.id,action:"decline"})});
    setIncomingCall(null);
  };

  const total = 1 + remoteUsers.length;
  const gridClass = total===1?"grid-cols-1":total===2?"grid-cols-1 md:grid-cols-2":total<=4?"grid-cols-2":"grid-cols-2 md:grid-cols-3";

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#0B0F14"}}>
      <Loader2 size={36} className="text-[#3DF29B] animate-spin"/>
    </div>
  );

  return (
    <div className="h-screen flex flex-col relative" style={{background:"#0B0F14",overflow:"hidden"}}>

      {incomingCall && incomingCall.roomId!==roomId && (
        <InCallBanner call={incomingCall} onAccept={acceptCall} onDecline={declineCall}/>
      )}

      {/* Top bar */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 z-20" style={{background:"rgba(11,15,20,.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid #1F2D3D"}}>
        <div className="flex items-center gap-3">
          <Logo size="sm"/>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg" style={{background:"#141B23",border:"1px solid #1F2D3D"}}>
            <GreenDot/>
            <span className="text-[#E9EEF3] text-xs font-mono font-semibold">{roomId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#6B7E93] text-sm font-manrope">
            <Users size={14}/><span>{total}</span>
          </div>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold transition-all"
            style={copied?{background:"#3DF29B20",color:"#3DF29B",border:"1px solid #3DF29B44"}:{background:"#141B23",border:"1px solid #1F2D3D",color:"#6B7E93"}}>
            {copied?<Check size={12}/>:<Link2 size={12}/>}
            <span className="hidden sm:inline">{copied?"কপি হয়েছে!":"লিংক"}</span>
          </button>
        </div>
      </header>

      {/* Video grid */}
      <div className="flex-1 min-h-0 p-3 overflow-hidden">
        {status==="error" ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:"#FF5C5C15"}}>
              <VideoOff size={28} style={{color:"#FF5C5C"}}/>
            </div>
            <p className="font-sora font-bold text-[#E9EEF3]">সংযোগ ব্যর্থ হয়েছে</p>
            <p className="text-[#6B7E93] text-sm font-manrope max-w-xs break-all">{errorMsg}</p>
            <button onClick={()=>{initializedRef.current=false;initAgora(session?.user?.id);}} className="btn-primary px-6 py-2.5 text-sm">আবার চেষ্টা করুন</button>
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-3 h-full`}>
            {/* Local tile */}
            <div className="relative rounded-2xl overflow-hidden min-h-[180px]" style={{background:"#0D1117",border:"1px solid #1F2D3D"}}>
              <div ref={localVideoElRef} className="absolute inset-0 w-full h-full" style={{background:"#0D1117"}}/>
              {(!camOn||status!=="connected") && <AvatarTile name={displayName}/>}
              {status==="connecting" && (
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{background:"rgba(11,15,20,.9)"}}>
                  <div className="text-center"><Loader2 size={28} className="text-[#3DF29B] animate-spin mx-auto mb-2"/><p className="text-[#6B7E93] text-sm font-manrope">সংযুক্ত হচ্ছে...</p></div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{background:"rgba(11,15,20,.85)"}}>
                <GreenDot/><span className="text-[#E9EEF3] text-xs font-manrope">আপনি · {displayName}</span>
              </div>
              {!micOn && (
                <div className="absolute top-3 right-3 z-10 p-1.5 rounded-lg" style={{background:"#FF5C5C90"}}>
                  <MicOff size={13} className="text-white"/>
                </div>
              )}
            </div>
            {remoteUsers.map(u=><RemoteCard key={u.uid} user={u}/>)}
          </div>
        )}
      </div>

      {/* Floating control bar */}
      <div className="shrink-0 pb-5 px-4 z-20">
        <div className="max-w-md mx-auto rounded-2xl px-8 py-3.5 flex items-end justify-center gap-6 shadow-2xl"
          style={{background:"rgba(20,27,35,.95)",backdropFilter:"blur(20px)",border:"1px solid #1F2D3D"}}>
          <CtrlBtn onClick={toggleMic} active={micOn} icon={Mic} offIcon={MicOff} label={micOn?"মাইক বন্ধ":"মাইক চালু"}/>
          <CtrlBtn onClick={toggleCam} active={camOn} icon={VideoIcon} offIcon={VideoOff} label={camOn?"ক্যামেরা বন্ধ":"ক্যামেরা চালু"}/>
          <CtrlBtn onClick={()=>setParticipantsOpen(v=>!v)} active={true} icon={Users} label={`${total} জন`}/>
          <CtrlBtn onClick={()=>setChatOpen(v=>!v)} active={true} icon={MessageSquare} label="চ্যাট"/>
          <CtrlBtn onClick={leaveCall} danger active={true} icon={PhoneOff} label="ছেড়ে দিন"/>
        </div>
      </div>

      {/* Participants drawer */}
      {participantsOpen && (
        <div className="absolute right-0 top-14 bottom-0 w-72 z-30 border-l border-[#1F2D3D] flex flex-col" style={{background:"#141B23"}}>
          <div className="flex items-center justify-between p-4 border-b border-[#1F2D3D]">
            <p className="font-sora font-bold text-[#E9EEF3] text-sm">অংশগ্রহণকারীরা ({total})</p>
            <button onClick={()=>setParticipantsOpen(false)} className="text-[#6B7E93] hover:text-[#E9EEF3] transition-colors">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:"#1A2330"}}>
              <div className="w-8 h-8 rounded-full bg-[#3DF29B] flex items-center justify-center text-[#0B0F14] font-bold text-sm font-sora">{displayName[0]?.toUpperCase()}</div>
              <div className="flex-1"><p className="text-[#E9EEF3] text-sm font-semibold font-manrope">{displayName}</p><p className="text-[#3DF29B] text-xs font-manrope">আপনি</p></div>
            </div>
            {remoteUsers.map(u=>(
              <div key={u.uid} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:"#1A2330"}}>
                <div className="w-8 h-8 rounded-full bg-[#4F8EF7] flex items-center justify-center text-white font-bold text-sm font-sora">{(u.name??u.uid)[0]?.toUpperCase()}</div>
                <p className="text-[#E9EEF3] text-sm font-semibold font-manrope">{u.name??`User ${String(u.uid).slice(0,5)}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat drawer */}
      {chatOpen && (
        <div className="absolute right-0 top-14 bottom-0 w-72 z-30 border-l border-[#1F2D3D] flex flex-col" style={{background:"#141B23"}}>
          <div className="flex items-center justify-between p-4 border-b border-[#1F2D3D]">
            <p className="font-sora font-bold text-[#E9EEF3] text-sm">চ্যাট</p>
            <button onClick={()=>setChatOpen(false)} className="text-[#6B7E93] hover:text-[#E9EEF3] transition-colors">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-[#6B7E93] text-sm font-manrope text-center">In-call chat শীঘ্রই আসছে।</p>
          </div>
        </div>
      )}
    </div>
  );
}
