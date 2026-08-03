"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Video, LogOut, Search, UserPlus, Check, X, Link2,
  Phone, Users, Bell, ChevronRight, UserCheck,
  Loader2, Hash, ArrowRight, VideoIcon, PhoneCall, PhoneOff,
} from "lucide-react";

/* ─── Avatar ────────────────────────────────────────────── */
function Avatar({ name, image, size = "md" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-indigo-600", "bg-violet-600", "bg-pink-600", "bg-sky-600", "bg-teal-600"];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  if (image) return <img src={image} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

/* ─── Incoming Call Modal ───────────────────────────────── */
function IncomingCallModal({ call, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-pulse-once">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 ring-4 ring-indigo-500/40 ring-offset-4 ring-offset-slate-900 animate-[ping_1.5s_ease-in-out_infinite]">
          {call.fromName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto -mt-20 mb-4 relative z-10">
          {call.fromName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <p className="text-slate-400 text-sm mb-1">ইনকামিং ভিডিও কল</p>
        <p className="text-white text-xl font-bold mb-8">{call.fromName}</p>
        <div className="flex justify-center gap-6">
          <button
            onClick={onDecline}
            className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
          >
            <PhoneOff size={24} />
          </button>
          <button
            onClick={onAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
          >
            <PhoneCall size={24} />
          </button>
        </div>
        <p className="text-slate-500 text-xs mt-5">ডিক্লাইন করুন বা কলে যোগ দিন</p>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────── */
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
  const [inviteLink, setInviteLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const [actionLoading, setActionLoading] = useState({});
  const [sendLoading, setSendLoading] = useState({});
  const [callLoading, setCallLoading] = useState({});

  // Incoming call state
  const [incomingCall, setIncomingCall] = useState(null);
  const pollRef = useRef(null);

  /* auth guard */
  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  /* load friends */
  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      setFriends(data.friends ?? []);
      setIncoming(data.incoming ?? []);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadFriends();
  }, [session, loadFriends]);

  /* Poll for incoming calls every 4 seconds */
  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try {
        const res = await fetch("/api/call");
        const data = await res.json();
        if (data.call) setIncomingCall(data.call);
        else setIncomingCall(null);
      } catch (_) {}
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [session]);

  /* search users */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/friends?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.users ?? []);
      } finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* send friend request */
  const sendRequest = async (toUserId) => {
    setSendLoading((p) => ({ ...p, [toUserId]: true }));
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
    setSendLoading((p) => ({ ...p, [toUserId]: false }));
    setSearchResults((prev) =>
      prev.map((u) => (u.id === toUserId ? { ...u, status: "pending", direction: "sent" } : u))
    );
  };

  /* accept / decline friend request */
  const handleRequest = async (requestId, action) => {
    setActionLoading((p) => ({ ...p, [requestId]: true }));
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    await loadFriends();
    setActionLoading((p) => ({ ...p, [requestId]: false }));
  };

  /* generate invite link */
  const generateLink = async () => {
    setGeneratingLink(true);
    const res = await fetch("/api/invite", { method: "POST" });
    const data = await res.json();
    setInviteLink(data.link);
    setGeneratingLink(false);
  };

  /* copy invite link */
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* join room by ID */
  const joinRoom = (id) => {
    const target = (id || roomId).trim();
    if (target) router.push(`/room/${target}`);
  };

  /* direct call a friend */
  const callFriend = async (friendId) => {
    setCallLoading((p) => ({ ...p, [friendId]: true }));
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: friendId }),
      });
      const data = await res.json();
      if (data.roomId) router.push(`/room/${data.roomId}`);
    } finally {
      setCallLoading((p) => ({ ...p, [friendId]: false }));
    }
  };

  /* accept incoming call */
  const acceptCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId: incomingCall.id, action: "accept" }),
    });
    router.push(`/room/${incomingCall.roomId}`);
  };

  /* decline incoming call */
  const declineCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId: incomingCall.id, action: "decline" }),
    });
    setIncomingCall(null);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const incomingCount = incoming.length;

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-violet-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Incoming call modal */}
      {incomingCall && (
        <IncomingCallModal call={incomingCall} onAccept={acceptCall} onDecline={declineCall} />
      )}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Video size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CallKori</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1">
            {[
              { id: "home", label: "হোম", icon: VideoIcon },
              { id: "friends", label: "বন্ধু", icon: Users },
              { id: "requests", label: "রিকোয়েস্ট", icon: Bell, badge: incomingCount },
            ].map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar name={session.user.name} image={session.user.image} size="sm" />
              <span className="hidden sm:block text-sm text-slate-300 font-medium">{session.user.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="লগআউট">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* ══ HOME TAB ══ */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create / Join */}
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">ভিডিও কল শুরু করুন</h2>
                <p className="text-slate-400 text-sm mt-0.5">রুম আইডি দিয়ে যোগ দিন বা নতুন লিংক তৈরি করুন</p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="রুম আইডি লিখুন..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
                <button
                  onClick={() => joinRoom()}
                  disabled={!roomId.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
                >
                  যোগ দিন <ArrowRight size={15} />
                </button>
              </div>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-xs">অথবা</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <button
                onClick={generateLink}
                disabled={generatingLink}
                className="w-full bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
              >
                {generatingLink ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                নতুন ইনভাইট লিংক তৈরি করুন
              </button>
              {inviteLink && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-2">
                  <span className="flex-1 text-xs text-slate-300 truncate font-mono">{inviteLink}</span>
                  <button
                    onClick={copyLink}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      copied ? "bg-green-600/30 text-green-400" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    }`}
                  >
                    {copied ? <Check size={13} /> : null}
                    {copied ? "কপি হয়েছে!" : "কপি করুন"}
                  </button>
                </div>
              )}
            </Card>

            {/* Friends quick-call */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">বন্ধুদের কল করুন</h2>
                <button onClick={() => setActiveTab("friends")} className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  সব দেখুন <ChevronRight size={15} />
                </button>
              </div>
              {loadingFriends ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="text-indigo-400 animate-spin" /></div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">এখনো কোনো বন্ধু নেই</p>
                  <button onClick={() => setActiveTab("friends")} className="mt-3 text-indigo-400 text-xs hover:underline">বন্ধু খুঁজুন →</button>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {friends.slice(0, 8).map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 group transition-all">
                      <Avatar name={f.name} image={f.image} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{f.name}</p>
                        <p className="text-slate-500 text-xs truncate">{f.email}</p>
                      </div>
                      <button
                        onClick={() => callFriend(f.id)}
                        disabled={callLoading[f.id]}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-400 hover:text-white text-xs font-medium rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {callLoading[f.id] ? <Loader2 size={13} className="animate-spin" /> : <Phone size={13} />}
                        কল করুন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Incoming requests banner */}
            {incomingCount > 0 && (
              <Card className="md:col-span-2 p-4 border-amber-500/30 bg-amber-500/5">
                <button onClick={() => setActiveTab("requests")} className="w-full flex items-center gap-3 text-left">
                  <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0"><Bell size={18} /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{incomingCount}টি নতুন বন্ধুত্বের রিকোয়েস্ট</p>
                    <p className="text-slate-400 text-xs">ট্যাপ করে দেখুন ও একসেপ্ট করুন</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </button>
              </Card>
            )}
          </div>
        )}

        {/* ══ FRIENDS TAB ══ */}
        {activeTab === "friends" && (
          <div className="max-w-xl mx-auto space-y-5">
            <Card className="p-4">
              <div className="relative">
                {searching
                  ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" size={17} />
                  : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                }
                <input
                  type="text"
                  placeholder="নাম বা ইমেইল দিয়ে বন্ধু খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-all">
                      <Avatar name={u.name} image={u.image} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{u.name}</p>
                        <p className="text-slate-500 text-xs truncate">{u.email}</p>
                      </div>
                      {u.status === "accepted" ? (
                        <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-lg"><UserCheck size={13} /> বন্ধু</span>
                      ) : u.status === "pending" && u.direction === "sent" ? (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">পাঠানো হয়েছে</span>
                      ) : u.status === "pending" && u.direction === "received" ? (
                        <span className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg">রিকোয়েস্ট আছে</span>
                      ) : (
                        <button
                          onClick={() => sendRequest(u.id)}
                          disabled={sendLoading[u.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-400 hover:text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                          {sendLoading[u.id] ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={13} />}
                          যোগ করুন
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={17} className="text-indigo-400" /> আমার বন্ধুরা
                <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{friends.length}</span>
              </h3>
              {loadingFriends ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="text-indigo-400 animate-spin" /></div>
              ) : friends.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">বন্ধু তালিকা ফাঁকা</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {friends.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 group transition-all">
                      <Avatar name={f.name} image={f.image} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{f.name}</p>
                        <p className="text-slate-500 text-xs truncate">{f.email}</p>
                      </div>
                      <button
                        onClick={() => callFriend(f.id)}
                        disabled={callLoading[f.id]}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-400 hover:text-white text-xs font-medium rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {callLoading[f.id] ? <Loader2 size={13} className="animate-spin" /> : <Phone size={13} />}
                        কল করুন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ══ REQUESTS TAB ══ */}
        {activeTab === "requests" && (
          <div className="max-w-xl mx-auto">
            <Card className="p-5">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                <Bell size={17} className="text-amber-400" /> আসা রিকোয়েস্টগুলো
                {incomingCount > 0 && (
                  <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{incomingCount}টি নতুন</span>
                )}
              </h3>
              {loadingFriends ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="text-indigo-400 animate-spin" /></div>
              ) : incoming.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Bell size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incoming.map((r) => (
                    <div key={r.requestId} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <Avatar name={r.name} image={r.image} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{r.name}</p>
                        <p className="text-slate-500 text-xs truncate">{r.email}</p>
                        <p className="text-slate-600 text-xs mt-0.5">বন্ধুত্বের অনুরোধ পাঠিয়েছেন</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleRequest(r.requestId, "accept")}
                          disabled={actionLoading[r.requestId]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600 border border-green-500/30 hover:border-transparent text-green-400 hover:text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                          {actionLoading[r.requestId] ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                          একসেপ্ট
                        </button>
                        <button
                          onClick={() => handleRequest(r.requestId, "decline")}
                          disabled={actionLoading[r.requestId]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/30 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                          <X size={13} /> ডিক্লাইন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
