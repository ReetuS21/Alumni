import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Download, KeyRound, MailWarning, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { exportMyData } from "../../services/api";
import { friendlyError } from "../../utils/authErrors";
import { Alert, Field, Modal, PageHeader, RoleBadge } from "../../components/ui";

const Section = ({ icon: Icon, title, description, children, tone = "blue" }) => (
  <section className="card p-4 sm:p-6">
    <div className="mb-4 flex items-start gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

export const EmailVerification = () => {
  const { user, resendVerification, refreshVerification } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (user.emailVerified) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4" /> Email verified
      </p>
    );
  }

  const run = async (fn) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (e) {
      setMessage({ tone: "error", text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-sm text-amber-700">
        <MailWarning className="mt-0.5 h-4 w-4 shrink-0" /> Email not verified yet. Check your inbox (and spam).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-secondary btn-sm"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await resendVerification();
              setMessage({ tone: "success", text: "Verification email sent." });
            })
          }
        >
          Resend email
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const ok = await refreshVerification();
              setMessage(ok ? { tone: "success", text: "Thanks — your email is verified." } : { tone: "warning", text: "Not verified yet. Open the link in the email first." });
            })
          }
        >
          I've verified it
        </button>
      </div>
      <Alert tone={message?.tone}>{message?.text}</Alert>
    </div>
  );
};

export const SettingsPage = () => {
  const { user, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === "admin";

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMessage(null);
    if (pw.next !== pw.confirm) return setPwMessage({ tone: "error", text: "The new passwords do not match." });
    if (pw.next.length < 8) return setPwMessage({ tone: "error", text: "Use at least 8 characters for the new password." });
    setPwBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setPwMessage({ tone: "success", text: "Password changed." });
    } catch (err) {
      setPwMessage({ tone: "error", text: err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" ? "Your current password is incorrect." : friendlyError(err) });
    } finally {
      setPwBusy(false);
    }
  };

  const download = async () => {
    setExporting(true);
    setExportError("");
    try {
      const data = await exportMyData(user);
      const blob = new Blob([JSON.stringify(data, (k, v) => (v && typeof v.toDate === "function" ? v.toDate().toISOString() : v), 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alumnihub-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(friendlyError(e));
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword);
      navigate("/auth", { replace: true });
    } catch (err) {
      setDeleteError(err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" ? "Incorrect password." : friendlyError(err));
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Password, data and account." />

      <div className="max-w-3xl space-y-6">
        <Section icon={ShieldCheck} title="Account">
          <dl className="grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd className="col-span-2 font-medium">{user.name}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd className="col-span-2 break-all">{user.email}</dd>
            <dt className="text-slate-500">Role</dt>
            <dd className="col-span-2">
              <RoleBadge role={user.role} />
            </dd>
          </dl>
          {!isAdmin && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <EmailVerification />
            </div>
          )}
        </Section>

        <Section icon={KeyRound} title="Change password" description="Requires your current password.">
          <form onSubmit={submitPassword} className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password">
              <input required type="password" className="input" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </Field>
            <Field label="New password">
              <input required type="password" minLength={8} className="input" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </Field>
            <Field label="Confirm new password">
              <input required type="password" minLength={8} className="input" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between gap-3 sm:col-span-3">
              <div className="flex-1">
                <Alert tone={pwMessage?.tone}>{pwMessage?.text}</Alert>
              </div>
              <button className="btn btn-primary" disabled={pwBusy}>
                {pwBusy ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </Section>

        {!isAdmin && (
          <>
            <Section icon={Download} title="Download my data" description="Your profile and activity as a JSON file.">
              <button className="btn btn-secondary" onClick={download} disabled={exporting}>
                <Download className="h-4 w-4" /> {exporting ? "Preparing…" : "Download my data"}
              </button>
              <Alert tone="error" className="mt-3">
                {exportError}
              </Alert>
            </Section>

            <Section icon={Trash2} tone="rose" title="Delete account" description="Permanently removes your account and everything you created.">
              <button className="btn btn-danger" onClick={() => setDeleting(true)}>
                <Trash2 className="h-4 w-4" /> Delete my account
              </button>
            </Section>
          </>
        )}
      </div>

      <Modal
        open={deleting}
        onClose={() => !deleteBusy && setDeleting(false)}
        title="Delete your account?"
        footer={
          <>
            <button className="btn btn-ghost" disabled={deleteBusy} onClick={() => setDeleting(false)}>
              Cancel
            </button>
            <button className="btn bg-rose-600 text-white hover:bg-rose-700" disabled={deleteBusy || !deletePassword || deleteConfirm !== "DELETE"} onClick={confirmDelete}>
              {deleteBusy ? "Deleting…" : "Delete forever"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert tone="warning">
            <span className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="h-4 w-4" /> This cannot be undone.
            </span>
            Everything you created on Alumni Hub is deleted, including private conversations with other people.
          </Alert>
          <Field label="Your password">
            <input type="password" className="input" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
          </Field>
          <Field label='Type "DELETE" to confirm'>
            <input className="input" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
          </Field>
          <Alert tone="error">{deleteError}</Alert>
        </div>
      </Modal>
    </>
  );
};
