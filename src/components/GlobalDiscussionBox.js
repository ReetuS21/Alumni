import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { CornerDownRight, MessagesSquare, Reply, Send, Trash2, X } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLiveQuery } from "../hooks/useLive";
import { deleteChatMessage, sendChatMessage } from "../services/api";
import { formatDate, formatTime, toDate } from "../utils/format";
import { PersonAvatar } from "../context/PeopleContext";
import { Alert, RoleBadge } from "./ui";

const MAX_LEN = 1000;
const PAGE = 100;

/**
 * Module 2 — Global Discussion Box.
 * One shared real-time chat for students, teachers and alumni, delivered with Firestore listeners.
 */
export const GlobalDiscussionBox = ({ className = "h-[560px]" }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const stickToBottom = useRef(true);
  const [pageSize, setPageSize] = useState(PAGE);

  const { data, loading } = useLiveQuery(
    () => query(collection(db, "chatMessages"), orderBy("sentAt", "desc"), limit(pageSize)),
    [pageSize]
  );
  const hasMore = data.length >= pageSize;
  const messages = useMemo(() => [...data].reverse(), [data]);
  const byId = useMemo(() => Object.fromEntries(data.map((m) => [m.id, m])), [data]);
  // replyTo is a message id; older messages stored a { senderName, text } object.
  const quoteOf = (replyTo) => {
    if (!replyTo) return null;
    if (typeof replyTo === "object") return replyTo;
    const m = byId[replyTo];
    if (!m) return { senderName: "", text: "an earlier message" };
    return { senderName: m.senderName, text: m.text.length > 140 ? `${m.text.slice(0, 140)}…` : m.text };
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      stickToBottom.current = true;
      await sendChatMessage(user, body, replyTo);
      setText("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteChatMessage(id);
    } catch {
      setError("Could not delete the message.");
    }
  };

  let lastDay = "";

  return (
    <section className={`card flex flex-col overflow-hidden ${className}`}>
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MessagesSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Global Discussion</h2>
            <p className="text-xs text-slate-400">Students, teachers and alumni in one conversation</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-4">
        {loading && !data.length && <p className="py-10 text-center text-sm text-slate-400">Loading messages…</p>}
        {hasMore && (
          <div className="text-center">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                stickToBottom.current = false;
                setPageSize((n) => n + PAGE);
              }}
            >
              Load earlier messages
            </button>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-400">
            <MessagesSquare className="mb-2 h-8 w-8 stroke-1" />
            No messages yet. Ask the first question!
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.senderUid === user.uid;
          const quote = quoteOf(msg.replyTo);
          const day = formatDate(msg.sentAt) || formatDate(new Date());
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <React.Fragment key={msg.id}>
              {showDay && (
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  {day}
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <div className={`group flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                <PersonAvatar uid={msg.senderUid} name={msg.senderName} size="xs" />
                <div className={`flex max-w-[80%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">{mine ? "You" : msg.senderName}</span>
                    <RoleBadge role={msg.senderRole} />
                    <span className="text-[11px] text-slate-400">{toDate(msg.sentAt) ? formatTime(msg.sentAt) : "sending…"}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      mine ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {quote && (
                      <div className={`mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs ${mine ? "border-blue-200 bg-blue-500/40 text-blue-50" : "border-slate-300 bg-slate-50 text-slate-500"}`}>
                        {quote.senderName && <span className="font-semibold">{quote.senderName}: </span>}
                        {quote.text}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <div className="mt-0.5 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600" onClick={() => setReplyTo(msg)}>
                      <Reply className="h-3 w-3" /> Reply
                    </button>
                    {(mine || user.role === "admin") && (
                      <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600" onClick={() => handleDelete(msg.id)}>
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="space-y-2 border-t border-slate-100 bg-white p-3">
        {error && <Alert tone="error">{error}</Alert>}
        {replyTo && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            <span className="flex min-w-0 items-center gap-1.5">
              <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Replying to <strong className="text-slate-700">{replyTo.senderName}</strong>: {replyTo.text}
              </span>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={text}
            maxLength={MAX_LEN}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) handleSend(e);
            }}
            placeholder="Ask a question or share an answer…"
            className="input max-h-32 min-h-[40px] resize-none"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn btn-primary h-10 shrink-0 px-3" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
};
