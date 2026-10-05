import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where } from "firebase/firestore";
import { Mail, Star, Trash2 } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveQuery } from "../../hooks/useLive";
import { getShortlistNote, removeFromShortlist, saveShortlistNote, updateShortlist } from "../../services/api";
import { formatDate, millis } from "../../utils/format";
import { Alert, Avatar, EmptyState, FilterChips, PageHeader, Spinner, StatusBadge } from "../../components/ui";

const NoteEditor = ({ entry }) => {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("loading"); // loading | saved | dirty | saving | error

  useEffect(() => {
    let cancelled = false;
    getShortlistNote(entry.id)
      .then((n) => {
        if (cancelled) return;
        setNote(n);
        setStatus("saved");
      })
      .catch(() => {
        if (!cancelled) setStatus("saved");
      });
    return () => {
      cancelled = true;
    };
  }, [entry.id]);

  const save = async () => {
    if (status !== "dirty") return;
    setStatus("saving");
    try {
      await saveShortlistNote(entry.id, note.trim());
      setStatus("saved");
    } catch (e) {
      console.error("Could not save note:", e);
      setStatus("error");
    }
  };

  return (
    <div>
      <textarea
        rows={2}
        className="input text-sm"
        disabled={status === "loading"}
        placeholder="Private note — only you can see this (e.g. good fit for SDE-1 role)"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setStatus("dirty");
        }}
        onBlur={save}
      />
      <p className="mt-1 text-[11px] text-slate-400">
        {status === "saving" ? "Saving…" : status === "error" ? "Could not save the note." : status === "dirty" ? "Unsaved — click outside to save" : "Private note · saved"}
      </p>
    </div>
  );
};

/** Shortlisted students and the referral pipeline (shortlisted → referred). */
export const Shortlist = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const { data, loading } = useLiveQuery(() => query(collection(db, "shortlists"), where("alumniUid", "==", user.uid)), [user.uid]);

  const entries = useMemo(() => [...data].sort((a, b) => millis(b.updatedAt) - millis(a.updatedAt)), [data]);
  const visible = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  const run = async (fn) => {
    setError("");
    try {
      await fn();
    } catch {
      setError("Could not update the shortlist. Please try again.");
    }
  };

  return (
    <>
      <PageHeader title="Shortlist & Referrals" subtitle="Students you shortlisted. Mark them as referred once you have submitted a referral." />

      <FilterChips
        options={[
          { value: "all", label: `All (${entries.length})` },
          { value: "shortlisted", label: `Shortlisted (${entries.filter((e) => e.status === "shortlisted").length})` },
          { value: "referred", label: `Referred (${entries.filter((e) => e.status === "referred").length})` },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <Alert tone="error">{error}</Alert>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No students here yet"
          text="Shortlist students from the search page to build your referral pipeline."
          action={
            <Link to="/alumni/search" className="btn btn-primary">
              Search students
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((e) => (
            <div key={e.id} className="card space-y-3 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={e.studentName} size="md" />
                <div className="min-w-0 flex-1">
                  <Link to={`/students/${e.studentUid}`} className="font-semibold text-slate-900 hover:text-blue-700">
                    {e.studentName}
                  </Link>
                  <p className="text-xs text-slate-400">Shortlisted {formatDate(e.createdAt) || "just now"}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <NoteEditor entry={e} />
              <div className="flex flex-wrap gap-2">
                {e.status === "shortlisted" ? (
                  <button className="btn btn-primary btn-sm" onClick={() => run(() => updateShortlist(e.id, { status: "referred" }))}>
                    Mark as referred
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => run(() => updateShortlist(e.id, { status: "shortlisted" }))}>
                    Undo referral
                  </button>
                )}
                {e.studentEmail && (
                  <a href={`mailto:${e.studentEmail}`} className="btn btn-secondary btn-sm">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
                <button
                  className="btn btn-danger btn-sm ml-auto"
                  onClick={() => window.confirm(`Remove ${e.studentName} from your shortlist?`) && run(() => removeFromShortlist(e.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
