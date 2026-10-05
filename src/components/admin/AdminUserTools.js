import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, getDoc, query } from "firebase/firestore";
import { Ban, Check, ExternalLink, RotateCcw, X } from "lucide-react";
import { db } from "../../firebase";
import { accountStatus, useAuth } from "../../context/AuthContext";
import { useLiveQuery } from "../../hooks/useLive";
import { reviewUser } from "../../services/api";
import { formatDate, millis, toUrl } from "../../utils/format";
import { friendlyError } from "../../utils/authErrors";
import { Alert, Avatar, Field, Modal, RoleBadge, Spinner, StatusBadge } from "../ui";

/** Every account (admin only), newest first, with the status normalised. */
export const useAllUsers = () => {
  const { data, loading, error } = useLiveQuery(() => query(collection(db, "users")), []);
  const users = data
    .filter((u) => u.role !== "admin")
    .map((u) => ({ ...u, uid: u.uid || u.id, status: accountStatus(u) }))
    .sort((a, b) => millis(b.createdAt, 0) - millis(a.createdAt, 0));
  return { users, loading, error };
};

const PROFILE_COLLECTION = { student: "studentProfiles", teacher: "teacherProfiles", alumni: "alumniProfiles" };

/** The details a person entered at registration — what the admin checks before approving. */
export const useRegistrationDetails = (user) => {
  const [details, setDetails] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    setDetails(undefined);
    const col = PROFILE_COLLECTION[user?.role];
    if (!col) return undefined;
    getDoc(doc(db, col, user.uid))
      .then((s) => !cancelled && setDetails(s.exists() ? s.data() : null))
      .catch(() => !cancelled && setDetails(null));
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.role]);
  return details;
};

export const detailLines = (user, p) => {
  if (!p) return [];
  if (user.role === "teacher") return [["Department", p.department], ["Designation", p.designation]];
  if (user.role === "alumni")
    return [["Company", p.company], ["Job role", p.jobRole], ["Batch", p.batch], ["Location", p.location], ["LinkedIn", p.linkedin]];
  return [["Headline", p.designation], ["Location", p.location], ["Phone", p.phone], ["Skills", (p.skills || []).join(", ")], ["LinkedIn", p.links?.linkedin]];
};

/** Approve / reject / suspend / reactivate buttons with a reason dialog. */
export const ReviewActions = ({ user, size = "sm", onDone }) => {
  const { user: admin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null); // "rejected" | "suspended"
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const btn = `btn ${size === "sm" ? "btn-sm" : ""}`;

  const apply = async (status, reviewNote = "") => {
    setBusy(true);
    setError("");
    try {
      await reviewUser(admin, user.uid, status, reviewNote.trim());
      setDialog(null);
      setNote("");
      onDone?.(status);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {user.status === "pending" && (
          <>
            <button className={`${btn} btn-success`} disabled={busy} onClick={() => apply("approved")}>
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button className={`${btn} btn-secondary text-rose-600`} disabled={busy} onClick={() => setDialog("rejected")}>
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </>
        )}
        {user.status === "approved" && (
          <button className={`${btn} btn-secondary text-rose-600`} disabled={busy} onClick={() => setDialog("suspended")}>
            <Ban className="h-3.5 w-3.5" /> Suspend
          </button>
        )}
        {(user.status === "rejected" || user.status === "suspended") && (
          <button className={`${btn} btn-secondary`} disabled={busy} onClick={() => apply("approved")}>
            <RotateCcw className="h-3.5 w-3.5" /> {user.status === "rejected" ? "Approve" : "Reactivate"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      <Modal
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        title={dialog === "rejected" ? `Reject ${user.name}?` : `Suspend ${user.name}?`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button className="btn bg-rose-600 text-white hover:bg-rose-700" disabled={busy} onClick={() => apply(dialog, note)}>
              {dialog === "rejected" ? "Reject account" : "Suspend account"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          {dialog === "rejected"
            ? "This person will not be able to use Alumni Hub. You can approve them later if needed."
            : "This person will lose access immediately. You can reactivate the account at any time."}
        </p>
        <Field label="Reason (shown to the user, optional)">
          <textarea rows={3} maxLength={300} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Could not verify enrolment with the department." />
        </Field>
      </Modal>
    </>
  );
};

/** Full details of one account for the admin. */
export const UserDetailsModal = ({ user, onClose }) => {
  const details = useRegistrationDetails(user);
  if (!user) return null;
  return (
    <Modal open={Boolean(user)} onClose={onClose} title="Account details" footer={<ReviewActions user={user} size="md" onDone={onClose} />}>
      <div className="flex items-center gap-3">
        <Avatar name={user.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
          <div className="mt-1 flex gap-1.5">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
        <dt className="text-slate-500">Registered</dt>
        <dd className="col-span-2">{formatDate(user.createdAt) || "—"}</dd>
        {user.reviewedAt && (
          <>
            <dt className="text-slate-500">Reviewed</dt>
            <dd className="col-span-2">
              {formatDate(user.reviewedAt)} by {user.reviewedBy}
            </dd>
          </>
        )}
        {user.reviewNote && (
          <>
            <dt className="text-slate-500">Note</dt>
            <dd className="col-span-2">{user.reviewNote}</dd>
          </>
        )}
        {details === undefined ? (
          <dd className="col-span-3">
            <Spinner label="Loading registration details…" />
          </dd>
        ) : details === null ? (
          <dd className="col-span-3 text-slate-400">No profile details yet.</dd>
        ) : (
          detailLines(user, details).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-slate-500">{k}</dt>
              <dd className="col-span-2 break-words">
                {v ? (k === "LinkedIn" ? <a className="text-blue-700 hover:underline" href={toUrl(v)} target="_blank" rel="noreferrer">{v}</a> : v) : "—"}
              </dd>
            </React.Fragment>
          ))
        )}
      </dl>
      {user.role === "student" && (
        <Link to={`/students/${user.uid}`} className="btn btn-ghost btn-sm mt-4" onClick={onClose}>
          Open full student profile <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
      <Alert tone="info" className="mt-4">
        Check that the name and email belong to a real {user.role} of your institute before approving.
      </Alert>
    </Modal>
  );
};
