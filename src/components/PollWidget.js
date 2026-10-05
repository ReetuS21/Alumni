import React, { useMemo, useState } from "react";
import { collection, query, where } from "firebase/firestore";
import { CheckCircle2 } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLiveQuery } from "../hooks/useLive";
import { castVote } from "../services/api";

/** Poll with one vote per user (pollVotes/{postId_uid}); results appear after voting. */
export const PollWidget = ({ post }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { data: votes } = useLiveQuery(() => query(collection(db, "pollVotes"), where("postId", "==", post.id)), [post.id]);

  const myVote = votes.find((v) => v.uid === user.uid);
  const counts = useMemo(() => {
    const c = {};
    votes.forEach((v) => {
      c[v.selectedOption] = (c[v.selectedOption] || 0) + 1;
    });
    return c;
  }, [votes]);
  const total = votes.length;
  const showResults = Boolean(myVote) || post.authorUid === user.uid;
  const options = (post.options || []).map((o) => (typeof o === "string" ? o : o.text));

  const vote = async (option) => {
    setBusy(true);
    setError("");
    try {
      await castVote(user, post.id, option);
    } catch {
      setError("Your vote could not be recorded. You may have already voted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const n = counts[opt] || 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const mine = myVote?.selectedOption === opt;
        if (!showResults) {
          return (
            <button
              key={opt}
              disabled={busy}
              onClick={() => vote(opt)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-60"
            >
              {opt}
            </button>
          );
        }
        return (
          <div key={opt} className={`relative overflow-hidden rounded-lg border px-3.5 py-2.5 ${mine ? "border-blue-300" : "border-slate-200"}`}>
            <div className={`absolute inset-y-0 left-0 ${mine ? "bg-blue-100" : "bg-slate-100"}`} style={{ width: `${pct}%` }} />
            <div className="relative flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                {opt}
                {mine && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </span>
              <span className="font-semibold text-slate-600">
                {pct}% <span className="font-normal text-slate-400">({n})</span>
              </span>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400">
        {total} vote{total === 1 ? "" : "s"}
        {!showResults && " · results are shown after you vote"}
      </p>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
