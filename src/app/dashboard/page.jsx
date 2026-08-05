"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  Video, LogOut, Search, UserPlus, Check, X,
  Phone, Users, Bell, ChevronRight, UserCheck,
  Loader2, Hash, ArrowRight, PhoneCall, PhoneOff,
  Sun, Moon,
} from "lucide-react";

const PAL = ["#6366F1","#8B5CF6","#A855F7","#F97316","#EC4899","#34D399"];
const avatarBg = n => PAL[(n?.charCodeAt(0)??0) % PAL.length];
const initials  = n => n ? n.split(" ").map(c=>c[0]).join("").slice(0,2).toUpperCase() : "?";

function Av({ name, image, size="md" }) {
  const sz = { sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-12 h-12 text-base" };
  if (image) return <img src={image} alt={name} className={`${sz[size]} rounded-full object-cover shrink-0`}/>;
  return (
    <div className={`${sz[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 text-xs`}
      style={{background:avatarBg(name)}}>{initials(name)}</div>
  );
}

function CallModal({ call, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,.75)"}}>
      <div className="ck-card p-8 w-full max-w-sm text-center" style={{background:"var(--card)"}}>
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{background:"var(--accent)"}}/>
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{background:"var(--accent)"}}>
            {call.fromName?.[0]?.toUpperCase()??"?"}
          </div>
        </div>
        <p className="text-sm mb-1" style={{color:"var(--muted)"}}>Incoming video call</p>
        <p className="font-bold text-xl mb-8" style={{color:"var(--text)"}}>{call.fromName}</p>
        <div className="flex justify-center gap-5">
          <button onClick={onDecline} className="w-16 h-16 rounded-full flex items-center justify-center text-white"
            style={{background:"var(--red)"}}><PhoneOff size={22}/></button>
          <button onClick={onAccept} className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{background:"var(--green)",color:"var(--bg)"}}><PhoneCall size={22}/></button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { t } = useI18n();
  const { theme, toggle } = useTheme();

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
    try {
      const r = await fetch("/api/friends");
      const d = await r.json();
      setFriends(d.friends ?? []);
      setIncoming(d.incoming ?? []);
    } finally { setLoadingFriends(false); }
  }, []);

  useEffect(() => { if (session) loadFriends(); }, [session, loadFriends]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try { const r = await fetch("/api/call"); const d = await r.json(); setIncomingCall(d.call ?? null); } catch (_) {}
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [session]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/friends?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setSearchResults(d.users ?? []);
      } finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sendRequest = async (id) => {
    setSendLoading(p => ({ ...p, [id]: true }));
    await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: id }) });
    setSendLoading(p => ({ ...p, [id]: false }));
    setSearchResults(p => p.map(u => u.id === id ? { ...u, status: "pending", direction: "sent" } : u));
  };

  const handleRequest = async (rId, action) => {
    setActionLoading(p => ({ ...p, [rId]: true }));
    await fetch("/api/friends", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: rId, action }) });
    await loadFriends();
    setActionLoading(p => ({ ...p, [rId]: false }));
  };

  const createMeet = async () => {
    setGeneratingLink(true);
    const r = await fetch("/api/invite", { method: "POST" });
    const d = await r.json();
    setGeneratingLink(false);
    if (d.roomId) router.push(`/lobby/${d.roomId}`);
  };

  const joinRoom = (id) => {
    const target = (id || roomId).trim();
    if (target) router.push(`/lobby/${target}`);
  };

  const callFriend = async (fId) => {
    setCallLoading(p => ({ ...p, [fId]: true }));
    try {
      const r = await fetch("/api/call", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: fId }) });
      const d = await r.json();
      if (d.roomId) router.push(`/lobby/${d.roomId}`);
    } finally { setCallLoading(p => ({ ...p, [fId]: false })); }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callId: incomingCall.id, action: "accept" }) });
    router.push(`/lobby/${incomingCall.roomId}`);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    await fetch("/api/call", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callId: incomingCall.id, action: "decline" }) });
    setIncomingCall(null);
  };

  const handleLogout = async () => { await authClient.signOut(); router.push("/"); };

  if (isPending || !session) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
    </div>
  );

  const tabs = [
    { id: "home", label: t("dash_tab_home"), icon: Video },
    { id: "friends", label: t("dash_tab_friends"), icon: Users },
    { id: "requests", label: t("dash_tab_requests"), icon: Bell, badge: incoming.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {incomingCall && <CallModal call={incomingCall} onAccept={acceptCall} onDecline={declineCall} />}

      {/* ── Nav ── */}
      <nav className="ck-nav sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><span className="font-black text-lg tracking-tight" style={{ color: "var(--text)" }}>callkori</span></Link>

          <div className="flex items-center gap-1 p-1 rounded-full ck-pill">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={activeTab === id ? { background: "var(--accent)", color: "#fff" } : { color: "var(--muted)" }}>
                <Icon size={13} /><span className="hidden sm:inline">{label}</span>
                {badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--red)" }}>{badge}</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--pill-bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Av name={session.user.name} image={session.user.image} size="sm" />
            <span className="hidden sm:block text-sm" style={{ color: "var(--muted)" }}>{session.user.name}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg" style={{ color: "var(--muted)" }} title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-7">
          <h1 className="font-black text-2xl" style={{ color: "var(--text)" }}>
            {t("dash_welcome")} {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            [t("dash_stats_friends"), friends.length, "var(--accent)"],
            [t("dash_stats_requests"), incoming.length, "var(--accent2)"],
            [t("dash_stats_call"), incomingCall ? 1 : 0, "var(--green)"],
          ].map(([label, val, color]) => (
            <div key={label} className="ck-card p-4 text-center" style={{ background: "var(--card)" }}>
              <p className="font-black text-2xl" style={{ color }}>{val}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── HOME ── */}
        {activeTab === "home" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="ck-card p-6 space-y-4" style={{ background: "var(--card)" }}>
              <h2 className="font-bold text-base" style={{ color: "var(--text)" }}>{t("dash_new_meet")}</h2>
              <button onClick={createMeet} disabled={generatingLink}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {generatingLink ? <Loader2 size={15} className="animate-spin" /> : <Video size={15} />}
                {t("dash_new_meet")}
              </button>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--muted)" }} />
                  <input type="text" placeholder={t("dash_join_placeholder")} value={roomId}
                    onChange={e => { const m = e.target.value.match(/\/room\/([\w-]+)/); setRoomId(m ? m[1] : e.target.value); }}
                    onKeyDown={e => e.key === "Enter" && joinRoom()}
                    className="ck-input pl-9 pr-4 py-2.5 text-sm" />
                </div>
                <button onClick={() => joinRoom()} disabled={!roomId.trim()}
                  className="btn-ghost px-4 py-2.5 text-sm disabled:opacity-40 flex items-center gap-1">
                  {t("dash_join_btn")}<ArrowRight size={13} />
                </button>
              </div>
            </div>

            <div className="ck-card p-6" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base" style={{ color: "var(--text)" }}>{t("dash_call_friends")}</h2>
                <button onClick={() => setActiveTab("friends")} className="text-xs flex items-center gap-1"
                  style={{ color: "var(--accent)" }}>
                  {t("dash_see_all")}<ChevronRight size={12} />
                </button>
              </div>
              {loadingFriends
                ? <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} /></div>
                : friends.length === 0
                  ? <div className="text-center py-8">
                      <Users size={32} className="mx-auto mb-2 opacity-20" style={{ color: "var(--muted)" }} />
                      <p className="text-sm" style={{ color: "var(--muted)" }}>{t("dash_no_friends")}</p>
                      <button onClick={() => setActiveTab("friends")} className="mt-2 text-xs hover:underline" style={{ color: "var(--accent)" }}>{t("dash_find_friends")}</button>
                    </div>
                  : <div className="space-y-1 max-h-56 overflow-y-auto">
                      {friends.slice(0, 7).map(f => (
                        <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl group transition-all">
                          <Av name={f.name} image={f.image} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{f.name}</p>
                            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{f.email}</p>
                          </div>
                          <button onClick={() => callFriend(f.id)} disabled={callLoading[f.id]}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                            style={{ background: "var(--glow-a)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                            {callLoading[f.id] ? <Loader2 size={11} className="animate-spin" /> : <Phone size={11} />}{t("dash_call_btn")}
                          </button>
                        </div>
                      ))}
                    </div>
              }
            </div>

            {incoming.length > 0 && (
              <div className="md:col-span-2 ck-card p-4 cursor-pointer"
                style={{ background: "var(--card)", borderColor: "var(--accent2)" }}
                onClick={() => setActiveTab("requests")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--glow-a)", border: "1px solid var(--accent2)" }}>
                    <Bell size={16} style={{ color: "var(--accent2)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{incoming.length} {t("dash_requests_banner")}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Tap to view and accept</p>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--muted)" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FRIENDS ── */}
        {activeTab === "friends" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="ck-card p-4" style={{ background: "var(--card)" }}>
              <div className="relative">
                {searching
                  ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin" size={15} style={{ color: "var(--accent)" }} />
                  : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: "var(--muted)" }} />
                }
                <input type="text" placeholder={t("dash_search_placeholder")} value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} className="ck-input pl-10 pr-4 py-3 text-sm" />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "var(--bg3)" }}>
                      <Av name={u.name} image={u.image} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{u.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{u.email}</p>
                      </div>
                      {u.status === "accepted"
                        ? <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "var(--glow-a)", color: "var(--green)" }}><UserCheck size={11} />{t("dash_friend_badge")}</span>
                        : u.status === "pending" && u.direction === "sent"
                          ? <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--glow-a)", color: "var(--muted)" }}>{t("dash_sent")}</span>
                          : u.status === "pending" && u.direction === "received"
                            ? <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--glow-a)", color: "var(--accent2)" }}>{t("dash_received")}</span>
                            : <button onClick={() => sendRequest(u.id)} disabled={sendLoading[u.id]}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                style={{ background: "var(--glow-a)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                                {sendLoading[u.id] ? <Loader2 size={11} className="animate-spin" /> : <UserPlus size={11} />}{t("dash_add_btn")}
                              </button>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ck-card p-5" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <Users size={15} style={{ color: "var(--accent)" }} />{t("dash_my_friends")}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg3)", color: "var(--muted)" }}>{friends.length}</span>
              </div>
              {loadingFriends
                ? <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} /></div>
                : friends.length === 0
                  ? <div className="text-center py-10"><p className="text-sm" style={{ color: "var(--muted)" }}>{t("dash_empty_friends")}</p></div>
                  : <div className="space-y-1">
                      {friends.map(f => (
                        <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl group transition-all">
                          <Av name={f.name} image={f.image} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{f.name}</p>
                            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{f.email}</p>
                          </div>
                          <button onClick={() => callFriend(f.id)} disabled={callLoading[f.id]}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                            style={{ background: "var(--glow-a)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                            {callLoading[f.id] ? <Loader2 size={11} className="animate-spin" /> : <Phone size={11} />}{t("dash_call_btn")}
                          </button>
                        </div>
                      ))}
                    </div>
              }
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="max-w-lg mx-auto">
            <div className="ck-card p-5" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <Bell size={15} style={{ color: "var(--accent2)" }} />{t("dash_incoming_req")}
                </h3>
                {incoming.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--glow-a)", color: "var(--accent2)" }}>{incoming.length}</span>
                )}
              </div>
              {loadingFriends
                ? <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} /></div>
                : incoming.length === 0
                  ? <div className="text-center py-12"><p className="text-sm" style={{ color: "var(--muted)" }}>{t("dash_no_requests")}</p></div>
                  : <div className="space-y-3">
                      {incoming.map(r => (
                        <div key={r.requestId} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
                          <Av name={r.name} image={r.image} size="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{r.name}</p>
                            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{r.email}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => handleRequest(r.requestId, "accept")} disabled={actionLoading[r.requestId]}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(52,211,153,.15)", border: "1px solid rgba(52,211,153,.4)", color: "var(--green)" }}>
                              {actionLoading[r.requestId] ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}{t("dash_accept")}
                            </button>
                            <button onClick={() => handleRequest(r.requestId, "decline")} disabled={actionLoading[r.requestId]}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "var(--red)" }}>
                              <X size={11} />{t("dash_decline")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
