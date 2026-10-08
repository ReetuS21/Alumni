import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { collection, doc, limitToLast, orderBy, query } from "firebase/firestore";
import { ArrowLeft, MessageCircle, PenSquare, Search, Send } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import { PersonAvatar, usePeople } from "../../context/PeopleContext";
import { useLiveDoc, useLiveQuery } from "../../hooks/useLive";
import { markConversationRead, openConversation, sendDirectMessage } from "../../services/api";
import { formatDate, formatTime, includesText, timeAgo, toDate } from "../../utils/format";
import { Alert, EmptyState, Modal, RoleBadge, Spinner } from "../../components/ui";

const MAX_LEN = 2000;

const otherOf = (c, uid) => {
  const otherUid = (c.participants || []).find((p) => p !== uid) || "";
  return { uid: otherUid, name: c.names?.[otherUid] || "Alumni Hub member", role: c.roles?.[otherUid] || "", photoURL: c.photos?.[otherUid] || "" };
};

const NewMessageModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const { people, loading } = usePeople();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [busy, setBusy] = useState("");

  const list = people
    .filter((p) => p.uid !== user.uid && (role === "all" || p.role === role))
    .filter((p) => !search.trim() || [p.name, p.email].some((f) => includesText(f, search)))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    .slice(0, 50);

  const start = async (person) => {
    setBusy(person.uid);
    try {
      const id = await openConversation(user, person);
      onClose();
      navigate(`/messages/${id}`);
    } catch (e) {
      console.error(e);
      window.alert("Could not start the conversation.");
    } finally {
      setBusy("");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New message">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input autoFocus className="input pl-9" placeholder="Search people by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-32" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            <option value="all">Everyone</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No one found.</p>
        ) : (
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {list.map((p) => (
              <li key={p.uid}>
                <button className="flex w-full items-center gap-3 px-1 py-2.5 text-left hover:bg-slate-50 disabled:opacity-50" disabled={Boolean(busy)} onClick={() => start(p)}>
                  <PersonAvatar uid={p.uid} name={p.name} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                  <RoleBadge role={p.role} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

const Thread = ({ conversationId }) => {
  const { user } = useAuth();
  const { byUid } = usePeople();
  const { data: convo, loading: convoLoading } = useLiveDoc(() => doc(db, "conversations", conversationId), [conversationId]);
  const { data: messages, loading } = useLiveQuery(
    () => query(collection(db, "conversations", conversationId, "messages"), orderBy("sentAt"), limitToLast(300)),
    [conversationId]
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  // Opening the thread marks it read (and again whenever a new message arrives while it is open).
  const lastUpdate = toDate(convo?.updatedAt)?.getTime();
  useEffect(() => {
    if (convo && convo.lastSenderUid && convo.lastSenderUid !== user.uid) markConversationRead(user, conversationId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastUpdate]);

  if (convoLoading) return <Spinner />;
  if (!convo) return <EmptyState icon={MessageCircle} title="Conversation not found" text="It may have been deleted." />;

  const other = otherOf(convo, user.uid);
  const live = byUid[other.uid];
  const profileLink = (live?.role || other.role) === "student" ? `/students/${other.uid}` : `/profile/${other.uid}`;

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      await sendDirectMessage({ ...user, photoURL: byUid[user.uid]?.photoURL || "" }, convo, body);
      setText("");
    } catch (err) {
      console.error(err);
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  let lastDay = "";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link to="/messages" className="btn btn-ghost -ml-2 p-1.5 md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PersonAvatar uid={other.uid} name={live?.name || other.name} photoURL={live?.photoURL || other.photoURL} size="sm" />
        <div className="min-w-0 flex-1">
          <Link to={profileLink} className="block truncate text-sm font-semibold hover:text-blue-700">
            {live?.name || other.name}
          </Link>
          <RoleBadge role={live?.role || other.role} />
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-4">
        {loading && <Spinner />}
        {!loading && messages.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Say hello 👋</p>}
        {messages.map((m) => {
          const mine = m.senderUid === user.uid;
          const day = formatDate(m.sentAt) || formatDate(new Date());
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <React.Fragment key={m.id}>
              {showDay && (
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  {day}
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-blue-100" : "text-slate-400"}`}>{toDate(m.sentAt) ? formatTime(m.sentAt) : "sending…"}</p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={send} className="space-y-2 border-t border-slate-100 bg-white p-3">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={text}
            maxLength={MAX_LEN}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) send(e);
            }}
            placeholder="Write a message…"
            className="input max-h-32 min-h-[40px] resize-none"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn btn-primary h-10 shrink-0 px-3" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

/** Private one-to-one messages between any two approved members. */
export const MessagesPage = () => {
  const { cid } = useParams();
  const { user } = useAuth();
  const { byUid } = usePeople();
  const { conversations, conversationsLoading, isUnread } = useActivity();
  const [composing, setComposing] = useState(false);
  const [search, setSearch] = useState("");

  const list = useMemo(
    () =>
      conversations
        .map((c) => ({ c, other: otherOf(c, user.uid) }))
        .filter(({ c, other }) => (c.lastMessage || c.id === cid) && (!search.trim() || includesText(byUid[other.uid]?.name || other.name, search))),
    [conversations, user.uid, cid, search, byUid]
  );

  return (
    <div className="card grid h-[calc(100dvh-11rem)] overflow-hidden md:grid-cols-[300px_1fr] lg:h-[calc(100vh-4.5rem)]">
      <aside className={`flex min-h-0 flex-col border-r border-slate-100 ${cid ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h1 className="text-base font-semibold">Messages</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setComposing(true)}>
            <PenSquare className="h-3.5 w-3.5" /> New
          </button>
        </div>
        <div className="border-b border-slate-100 p-3">
          <input className="input py-1.5 text-sm" placeholder="Search conversations…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <Spinner />
          ) : list.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              <MessageCircle className="mx-auto mb-2 h-8 w-8 stroke-1" />
              No conversations yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map(({ c, other }) => {
                const unread = isUnread(c);
                const live = byUid[other.uid];
                return (
                  <li key={c.id}>
                    <Link to={`/messages/${c.id}`} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${c.id === cid ? "bg-blue-50/70" : ""}`}>
                      <PersonAvatar uid={other.uid} name={live?.name || other.name} photoURL={live?.photoURL || other.photoURL} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>{live?.name || other.name}</span>
                          <span className="shrink-0 text-[11px] text-slate-400">{c.lastMessage ? timeAgo(c.updatedAt) : ""}</span>
                        </div>
                        <p className={`truncate text-xs ${unread ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                          {c.lastMessage ? `${c.lastSenderUid === user.uid ? "You: " : ""}${c.lastMessage}` : "New conversation"}
                        </p>
                      </div>
                      {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className={`min-h-0 ${cid ? "flex flex-col" : "hidden md:flex md:flex-col"}`}>
        {cid ? (
          <Thread key={cid} conversationId={cid} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-slate-400">
            <MessageCircle className="mb-2 h-10 w-10 stroke-1" />
            Select a conversation or start a new one.
          </div>
        )}
      </section>

      <NewMessageModal open={composing} onClose={() => setComposing(false)} />
    </div>
  );
};
