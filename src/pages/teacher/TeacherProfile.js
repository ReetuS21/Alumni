import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Save } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { saveTeacherProfile } from "../../services/api";
import { friendlyError } from "../../utils/authErrors";
import { Alert, Avatar, Field, PageHeader, RoleBadge, Spinner } from "../../components/ui";

/** Deliberately short: name, email, department and designation. */
export const TeacherProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "teacherProfiles", user.uid))
      .then((snap) => {
        const d = snap.exists() ? snap.data() : {};
        setForm({ name: d.name || user.name || "", department: d.department || "", designation: d.designation || "" });
      })
      .catch((e) => setMessage({ tone: "error", text: friendlyError(e) }));
  }, [user.uid, user.name]);

  if (!form) return message ? <Alert tone="error">{message.text}</Alert> : <Spinner />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await saveTeacherProfile(user.uid, { ...form, name: form.name.trim(), email: user.email });
      setMessage({ tone: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ tone: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" />
      <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={form.name} size="lg" />
          <div>
            <p className="text-lg font-semibold">{form.name}</p>
            <RoleBadge role="teacher" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input required maxLength={80} className="input" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Email">
            <input className="input" value={user.email} disabled />
          </Field>
          <Field label="Department">
            <input className="input" value={form.department} onChange={set("department")} />
          </Field>
          <Field label="Designation">
            <input className="input" value={form.designation} onChange={set("designation")} />
          </Field>
        </div>
        <Alert tone={message?.tone}>{message?.text}</Alert>
        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={busy}>
            <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </>
  );
};
