import React, { useState } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { FileText, MessagesSquare, Search, Trash2 } from "lucide-react";
import { db } from "../../firebase";
import { useLiveQuery } from "../../hooks/useLive";
import { deleteChatMessage, deletePost } from "../../services/api";
import { formatDate, formatTime, includesText } from "../../utils/format";
import { friendlyError } from "../../utils/authErrors";
import { CreatePostForm } from "../../components/CreatePostForm";
import { Alert, EmptyState, PageHeader, PostTypeBadge, RoleBadge, SegmentedControl, Spinner } from "../../components/ui";

/** Moderation: remove any post or chat message, and publish announcements. */
export const AdminContent = () => {
  const [tab, setTab] = useState("posts");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const { data: posts, loading: lp } = useLiveQuery(() => query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(300)), []);
  const { data: messages, loading: lm } = useLiveQuery(() => query(collection(db, "chatMessages"), orderBy("sentAt", "desc"), limit(300)), []);

  const remove = async (what, fn) => {
    if (!window.confirm(`Delete this ${what}? This cannot be undone.`)) return;
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  const shownPosts = posts.filter((p) => !search.trim() || [p.title, p.body, p.authorName].some((f) => includesText(f, search)));
  const shownMessages = messages.filter((m) => !search.trim() || [m.text, m.senderName].some((f) => includesText(f, search)));

  return (
    <>
      <PageHeader title="Content" subtitle="Announcements and moderation." />

      <CreatePostForm types={["notice", "poll"]} />

      <div className="card space-y-3 p-4">
        <SegmentedControl
          options={[
            { value: "posts", label: `Posts (${posts.length})`, icon: FileText },
            { value: "messages", label: `Messages (${messages.length})`, icon: MessagesSquare },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder={tab === "posts" ? "Search posts…" : "Search messages…"} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Alert tone="error">{error}</Alert>

      {tab === "posts" &&
        (lp ? (
          <Spinner />
        ) : shownPosts.length === 0 ? (
          <EmptyState icon={FileText} title="No posts" />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {shownPosts.map((p) => (
              <li key={p.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <PostTypeBadge type={p.type} />
                    <span className="font-medium text-slate-900">{p.title}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{p.body}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    {p.authorName} <RoleBadge role={p.authorRole} /> · {formatDate(p.createdAt) || "just now"}
                  </p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => remove("post", () => deletePost(p.id))}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </li>
            ))}
          </ul>
        ))}

      {tab === "messages" &&
        (lm ? (
          <Spinner />
        ) : shownMessages.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="No messages" />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {shownMessages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{m.senderName}</span> <RoleBadge role={m.senderRole} /> · {formatDate(m.sentAt)} {formatTime(m.sentAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{m.text}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => remove("message", () => deleteChatMessage(m.id))}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </li>
            ))}
          </ul>
        ))}
    </>
  );
};
