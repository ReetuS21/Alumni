import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Save } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { saveAlumniProfile } from "../../services/api";
import { friendlyError } from "../../utils/authErrors";
import { PhotoUploader } from "../../components/PhotoUploader";
import { Alert, Field, PageHeader, RoleBadge, Spinner } from "../../components/ui";

const FIELDS = ["name", "company", "jobRole", "domain", "experienceYears", "location", "batch", "linkedin", "bio"];

export const AlumniProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    getDoc(doc(db, "alumniProfiles", user.uid))
      .then((snap) => {
        const d = snap.exists() ? snap.data() : {};
        setPhotoURL(d.photoURL || "");
        setForm(Object.fromEntries(FIELDS.map((k) => [k, d[k] != null ? String(d[k]) : k === "name" ? user.name || "" : ""])));
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
      const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
      await saveAlumniProfile(user.uid, { ...data, email: user.email });
      setMessage({ tone: "success", text: "Profile saved. Students will see these details in the alumni directory." });
    } catch (err) {
      setMessage({ tone: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Shown to students in the alumni directory." />
      <form onSubmit={submit} className="card max-w-3xl space-y-5 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <PhotoUploader name={form.name} photoURL={photoURL} onChange={setPhotoURL} size="lg" />
          <div>
            <p className="text-lg font-semibold">{form.name}</p>
            <p className="text-sm text-slate-500">{[form.jobRole, form.company].filter(Boolean).join(" at ")}</p>
            <RoleBadge role="alumni" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input required maxLength={80} className="input" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Email">
            <input className="input" value={user.email} disabled />
          </Field>
          <Field label="Company / organisation">
            <input required className="input" value={form.company} onChange={set("company")} />
          </Field>
          <Field label="Job role">
            <input required className="input" value={form.jobRole} onChange={set("jobRole")} />
          </Field>
          <Field label="Domain">
            <input className="input" value={form.domain} onChange={set("domain")} placeholder="Cloud, AI/ML, Product…" />
          </Field>
          <Field label="Years of experience">
            <input type="number" min="0" max="60" className="input" value={form.experienceYears} onChange={set("experienceYears")} />
          </Field>
          <Field label="Location">
            <input className="input" value={form.location} onChange={set("location")} />
          </Field>
          <Field label="Graduation batch">
            <input className="input" value={form.batch} onChange={set("batch")} placeholder="MCA 2021" />
          </Field>
          <Field label="LinkedIn" className="sm:col-span-2">
            <input className="input" value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" />
          </Field>
          <Field label="About you" className="sm:col-span-2" hint="e.g. mentoring, referrals, mock interviews">
            <textarea rows={3} maxLength={600} className="input" value={form.bio} onChange={set("bio")} />
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
