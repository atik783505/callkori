"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Logo, GreenDot } from "@/lib/ui";
import {
  Video, LogOut, Search, UserPlus, Check, X, Link2,
  Phone, Users, Bell, ChevronRight, UserCheck,
  Loader2, Hash, ArrowRight, VideoIcon, PhoneCall, PhoneOff,
} from "lucide-react";

/* ── Avatar ─────────────────────────────────────────────── */
function Av({ name, image, size = "md" }) {
  const sz = { sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-12 h-12 text-base" };
  const initials = name ? name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "?";
  const palette = ["#4F8EF7","#A855F7","#F97316","#EC4899","#3DF29B","#06B6D4"];
  const bg = palette[(name?.charCodeAt(0)??0)%palette.length];
  if (image) return <img src={image} alt={name} className={`${sz[size]} rounded-full object-cover shrink-0`}/>;
  return (
    <div className={`${sz[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 font-sora`}
      style={{background:bg}}>{initials}</div>
  );
}

/* ── Incoming Call Modal ─────────────────────────────────── */
function CallModal({ call, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,.75)"}}>
      <div className="card p-8 w-full max-w-sm text-center" style={{background:"#141B23"}}>
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{background:"#3DF29B"}}/>
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white font-sora"
            style={{background:"linear-gradient(135deg,#4F8EF7,#A855F7)"}}>
            {call.fromName?.[0]?.toUpperCase()??"?"}
          </div>
        </div>
        <p className="text-[#6B7E93] text-sm font-manrope mb-1">ইনকামিং ভিডিও কল</p>
        <p className="font-sora font-bold text-[#E9EEF3] text-xl mb-8">{call.fromName}</p>
        <div className="flex justify-center gap-5">
          <button onClick={onDecline} className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
            style={{background:"#FF5C5C"}}>
            <PhoneOff size={22}/>
          </button>
          <button onClick={onAccept} className="w-16 h-16 rounded-full flex items-center justify-center text-[#0B0F14] transition-all hover:scale-105"
            style={{background:"#3DF29B"}}>
            <PhoneCall size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [sendLoading, setSendLoading] = useState({});
  const [callLoading, setCallLoading] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => { if (!isPending && !session) router.push("/login"); }, [session, isPending, router]);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try { const r = await fetch("/api/friends"); const d = await r.json(); setFriends(d.friends??[]); setIncoming(d.incoming??[]); }
    finally { setLoadingFriends(false); }
  }, []);

  useEffect(() => { if (session) loadFriends(); }, [session, loadFriends]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => { try { const r = await fetch("/api/call"); const d = await r.json(); setIncomingCall(d.call??null); } catch(_){} };
    poll(); pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [session]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { const r = await fetch(`/api/friends?search=${encodeURIComponent(searchQuery)}`); const d = await r.json(); setSearchResults(d.users??[]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const sendRequest = async (id) => {
    setSendLoading(p=>({...p,[id]:true}));
    await fetch("/api/friends",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toUserId:id})});
    setSendLoading(p=>({...p,[id]:false}));
    setSearchResults(p=>p.map(u=>u.id===id?{...u,status:"pending",direction:"sent"}:u));
  };

  const handleRequest = async (requestId, action) => {
    setActionLoading(p=>({...p,[requestId]:true}));
    await fetch("/api/friends",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId,action})});
    await loadFriends(); setActionLoading(p=>({...p,[requestId]:false}));
  };

  const createMeet = async () => {
    setGeneratingLink(true);
    const r = await fetch("/api/invite",{method:"POST"}); const d = await r.json();
    setGeneratingLink(false); if (d.roomId) router.push(`/lobby/${d.roomId}`);
  };

  const joinRoom = (id) => { const t=(id||roomId).trim(); if(t) router.push(`/lobby/${t}`); };

  const callFriend = async (friendId) => {
    setCallLoading(p=>({...p,[friendId]:true}));
    try { const r=await fetch("/api/call",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({toUserId:friendId})}); const d=await r.json(); if(d.roomId) router.push(`/lobby/${d.roomId}`); }
    finally { setCallLoading(p=>({...p,[friendId]:false})); }
  };

  const acceptCall = async () => {
    if(!incomingCall) return;
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({callId:incomingCall.id,action:"accept"})});
    router.push(`/lobby/${incomingCall.roomId}`);
  };

  const declineCall = async () => {
    if(!incomingCall) return;
    await fetch("/api/call",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({callId:incomingCall.id,action:"decline"})});
    setIncomingCall(null);
  };

  const handleLogout = async () => { await authClient.signOut(); router.push("/login"); };

  const tabs = [
    {id:"home", label:"হোম", icon:VideoIcon},
    {id:"friends", label:"বন্ধু", icon:Users},
    {id:"requests", label:"রিকোয়েস্ট", icon:Bell, badge:incoming.length},
  ];

  if (isPending || !session) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#0B0F14"}}>
      <Loader2 size={32} className="text-[#3DF29B] animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:"#0B0F14"}}>
      {incomingCall && <CallModal call={incomingCall} onAccept={acceptCall} onDecline={declineCall}/>}

      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-[#1F2D3D]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo/>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{background:"#141B23",border:"1px solid #1F2D3D"}}>
            {tabs.map(({id,label,icon:Icon,badge})=>(
              <button key={id} onClick={()=>setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-sora font-semibold transition-all ${activeTab===id?"bg-[#3DF29B] text-[#0B0F14]":"text-[#6B7E93] hover:text-[#E9EEF3]"}`}>
                <Icon size={14}/><span className="hidden sm:inline">{label}</span>
                {badge>0&&<span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5C5C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Av name={session.user.name} image={session.user.image} size="sm"/>
            <span className="hidden sm:block text-sm text-[#6B7E93] font-manrope">{session.user.name}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg text-[#6B7E93] hover:text-[#FF5C5C] transition-colors" title="লগআউট"><LogOut size={17}/></button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* HOME TAB */}
        {activeTab==="home" && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Start call card */}
            <div className="card p-6 space-y-4" style={{background:"#141B23"}}>
              <div>
                <h2 className="font-sora font-bold text-[#E9EEF3] text-lg">ভিডিও কল শুরু করুন</h2>
                <p className="text-[#6B7E93] text-sm font-manrope mt-0.5">নতুন মিট খুলুন বা Room ID দিয়ে যোগ দিন</p>
              </div>
              <button onClick={createMeet} disabled={generatingLink}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {generatingLink?<Loader2 size={16} className="animate-spin"/>:<VideoIcon size={16}/>}
                নতুন মিট শুরু করুন
              </button>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-[#1F2D3D]"/><span className="text-[#6B7E93] text-xs font-manrope">অথবা</span><div className="flex-1 h-px bg-[#1F2D3D]"/></div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7E93]" size={15}/>
                  <input type="text" placeholder="Room ID বা লিংক..." value={roomId}
                    onChange={e=>{const m=e.target.value.match(/\/room\/([\w-]+)/);setRoomId(m?m[1]:e.target.value);}}
                    onKeyDown={e=>e.key==="Enter"&&joinRoom()}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none"
                    style={{background:"#1A2330",border:"1px solid #1F2D3D"}}/>
                </div>
                <button onClick={()=>joinRoom()} disabled={!roomId.trim()}
                  className="btn-ghost px-4 py-2.5 text-sm disabled:opacity-40 flex items-center gap-1">
                  যোগ <ArrowRight size={14}/>
                </button>
              </div>
            </div>

            {/* Friends quick call */}
            <div className="card p-6" style={{background:"#141B23"}}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sora font-bold text-[#E9EEF3] text-lg">বন্ধুদের কল করুন</h2>
                <button onClick={()=>setActiveTab("friends")} className="text-[#3DF29B] text-xs font-manrope flex items-center gap-1 hover:opacity-80">সব দেখুন<ChevronRight size={13}/></button>
              </div>
              {loadingFriends ? <div className="flex justify-center py-8"><Loader2 size={22} className="text-[#3DF29B] animate-spin"/></div>
              : friends.length===0 ? (
                <div className="text-center py-8">
                  <Users size={36} className="mx-auto mb-2 text-[#1F2D3D]"/>
                  <p className="text-[#6B7E93] text-sm font-manrope">এখনো কোনো বন্ধু নেই</p>
                  <button onClick={()=>setActiveTab("friends")} className="mt-2 text-[#3DF29B] text-xs font-manrope hover:underline">বন্ধু খুঁজুন →</button>
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {friends.slice(0,7).map(f=>(
                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1A2330] group transition-all">
                      <Av name={f.name} image={f.image}/>
                      <div className="flex-1 min-w-0"><p className="text-[#E9EEF3] text-sm font-semibold font-manrope truncate">{f.name}</p><p className="text-[#6B7E93] text-xs font-manrope truncate">{f.email}</p></div>
                      <button onClick={()=>callFriend(f.id)} disabled={callLoading[f.id]}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        style={{background:"#3DF29B15",border:"1px solid #3DF29B33",color:"#3DF29B"}}>
                        {callLoading[f.id]?<Loader2 size={12} className="animate-spin"/>:<Phone size={12}/>} কল
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming friend requests banner */}
            {incoming.length>0 && (
              <div className="md:col-span-2 card p-4 cursor-pointer hover:border-[#F97316]/40 transition-all"
                style={{background:"#141B23",borderColor:"#F9731633"}} onClick={()=>setActiveTab("requests")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:"#F9731615",border:"1px solid #F9731633"}}><Bell size={17} style={{color:"#F97316"}}/></div>
                  <div className="flex-1"><p className="font-sora font-semibold text-[#E9EEF3] text-sm">{incoming.length}টি নতুন বন্ধুত্বের রিকোয়েস্ট</p><p className="text-[#6B7E93] text-xs font-manrope">ট্যাপ করে দেখুন</p></div>
                  <ChevronRight size={17} className="text-[#6B7E93]"/>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab==="friends" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="card p-4" style={{background:"#141B23"}}>
              <div className="relative">
                {searching?<Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3DF29B] animate-spin" size={16}/>
                :<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7E93]" size={16}/>}
                <input type="text" placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-manrope text-[#E9EEF3] placeholder-[#6B7E93] outline-none"
                  style={{background:"#1A2330",border:"1px solid #1F2D3D"}}/>
              </div>
              {searchResults.length>0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map(u=>(
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1A2330] transition-all">
                      <Av name={u.name} image={u.image}/>
                      <div className="flex-1 min-w-0"><p className="text-[#E9EEF3] text-sm font-semibold font-manrope truncate">{u.name}</p><p className="text-[#6B7E93] text-xs font-manrope truncate">{u.email}</p></div>
                      {u.status==="accepted"?<span className="text-xs font-sora font-bold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{background:"#3DF29B15",color:"#3DF29B"}}><UserCheck size={12}/>বন্ধু</span>
                      :u.status==="pending"&&u.direction==="sent"?<span className="text-xs font-manrope px-2.5 py-1 rounded-lg" style={{background:"#F9731615",color:"#F97316"}}>পাঠানো হয়েছে</span>
                      :u.status==="pending"&&u.direction==="received"?<span className="text-xs font-manrope px-2.5 py-1 rounded-lg" style={{background:"#4F8EF715",color:"#4F8EF7"}}>রিকোয়েস্ট আছে</span>
                      :<button onClick={()=>sendRequest(u.id)} disabled={sendLoading[u.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold transition-all disabled:opacity-50"
                        style={{background:"#3DF29B15",border:"1px solid #3DF29B33",color:"#3DF29B"}}>
                        {sendLoading[u.id]?<Loader2 size={11} className="animate-spin"/>:<UserPlus size={12}/>}যোগ
                      </button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-5" style={{background:"#141B23"}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-bold text-[#E9EEF3] flex items-center gap-2"><Users size={16} className="text-[#3DF29B]"/>আমার বন্ধুরা</h3>
                <span className="text-xs font-manrope px-2 py-0.5 rounded-full" style={{background:"#1A2330",color:"#6B7E93"}}>{friends.length}</span>
              </div>
              {loadingFriends?<div className="flex justify-center py-8"><Loader2 size={22} className="text-[#3DF29B] animate-spin"/></div>
              :friends.length===0?<div className="text-center py-10"><Users size={36} className="mx-auto mb-2 text-[#1F2D3D]"/><p className="text-[#6B7E93] text-sm font-manrope">বন্ধু তালিকা ফাঁকা</p></div>
              :<div className="space-y-1">{friends.map(f=>(
                <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1A2330] group transition-all">
                  <Av name={f.name} image={f.image}/>
                  <div className="flex-1 min-w-0"><p className="text-[#E9EEF3] text-sm font-semibold font-manrope truncate">{f.name}</p><p className="text-[#6B7E93] text-xs font-manrope truncate">{f.email}</p></div>
                  <button onClick={()=>callFriend(f.id)} disabled={callLoading[f.id]}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    style={{background:"#3DF29B15",border:"1px solid #3DF29B33",color:"#3DF29B"}}>
                    {callLoading[f.id]?<Loader2 size={12} className="animate-spin"/>:<Phone size={12}/>}কল করুন
                  </button>
                </div>
              ))}</div>}
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab==="requests" && (
          <div className="max-w-lg mx-auto">
            <div className="card p-5" style={{background:"#141B23"}}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-sora font-bold text-[#E9EEF3] flex items-center gap-2"><Bell size={16} style={{color:"#F97316"}}/>আসা রিকোয়েস্ট</h3>
                {incoming.length>0&&<span className="text-xs font-sora font-bold px-2 py-0.5 rounded-full" style={{background:"#F9731620",color:"#F97316"}}>{incoming.length}টি</span>}
              </div>
              {loadingFriends?<div className="flex justify-center py-10"><Loader2 size={22} className="text-[#3DF29B] animate-spin"/></div>
              :incoming.length===0?<div className="text-center py-12"><Bell size={36} className="mx-auto mb-2 text-[#1F2D3D]"/><p className="text-[#6B7E93] text-sm font-manrope">কোনো পেন্ডিং রিকোয়েস্ট নেই</p></div>
              :<div className="space-y-3">{incoming.map(r=>(
                <div key={r.requestId} className="flex items-center gap-3 p-3 rounded-xl" style={{background:"#1A2330",border:"1px solid #1F2D3D"}}>
                  <Av name={r.name} image={r.image} size="lg"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-sora font-semibold text-[#E9EEF3] text-sm">{r.name}</p>
                    <p className="text-[#6B7E93] text-xs font-manrope truncate">{r.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={()=>handleRequest(r.requestId,"accept")} disabled={actionLoading[r.requestId]}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sora font-bold transition-all disabled:opacity-50"
                      style={{background:"#3DF29B20",border:"1px solid #3DF29B44",color:"#3DF29B"}}>
                      {actionLoading[r.requestId]?<Loader2 size={11} className="animate-spin"/>:<Check size={12}/>}একসেপ্ট
                    </button>
                    <button onClick={()=>handleRequest(r.requestId,"decline")} disabled={actionLoading[r.requestId]}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sora font-bold transition-all disabled:opacity-50"
                      style={{background:"#FF5C5C15",border:"1px solid #FF5C5C33",color:"#FF5C5C"}}>
                      <X size={12}/>ডিক্লাইন
                    </button>
                  </div>
                </div>
              ))}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
