import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Award, Briefcase, Camera, Download, Eye, GraduationCap, Plus, Save, Trash2 } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { saveStudentProfile, uploadProfilePhoto } from "../../services/api";
import { newId, normalizeStudentProfile, profileCompleteness } from "../../utils/profile";
import { exportATSResume } from "../../utils/resumeExporter";
import { friendlyError } from "../../utils/authErrors";
import { TagInput } from "../../components/TagInput";
import { Alert, Avatar, Field, PageHeader, Spinner } from "../../components/ui";

const SKILL_SUGGESTIONS = ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Data Structures", "HTML", "CSS", "Machine Learning"];
const TOOL_SUGGESTIONS = ["Git", "GitHub", "VS Code", "Firebase", "Docker", "Postman", "MongoDB", "MySQL", "Figma", "AWS"];
const LANGUAGE_SUGGESTIONS = ["English", "Hindi"];

const EXPERIENCE_FIELDS = [
  { key: "title", label: "Role / title", placeholder: "Frontend Developer Intern", required: true },
  { key: "organization", label: "Organisation", placeholder: "Company name", required: true },
  { key: "mode", label: "Internship type", type: "select", options: [["onsite", "Onsite internship"], ["virtual", "Virtual internship"]] },
  { key: "startDate", label: "Start", placeholder: "Jun 2025" },
  { key: "endDate", label: "End", placeholder: "Aug 2025 / Present" },
  { key: "description", label: "What you did (one point per line)", type: "textarea", full: true, placeholder: "Built a dashboard in React…\nReduced page load time by 30%…" },
];
const EDUCATION_FIELDS = [
  { key: "degree", label: "Degree", placeholder: "Master of Computer Applications (MCA)", required: true },
  { key: "institution", label: "Institution", placeholder: "College / University", required: true },
  { key: "year", label: "Year", placeholder: "2024 – 2026" },
  { key: "score", label: "CGPA / %", placeholder: "8.4 CGPA" },
];
const CERT_FIELDS = [
  { key: "name", label: "Certificate name", placeholder: "AWS Cloud Practitioner", required: true },
  { key: "issuer", label: "Issued by", placeholder: "Amazon Web Services" },
  { key: "year", label: "Year", placeholder: "2025" },
  { key: "url", label: "Credential link", placeholder: "https://…" },
];

const SectionCard = ({ title, description, icon: Icon, children, action }) => (
  <section className="card p-5 sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="section-title">{title}</h2>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const RepeatableList = ({ items, onChange, fields, empty, emptyText }) => {
  const update = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">{emptyText}</p>}
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.key} label={f.label} className={f.full ? "sm:col-span-2" : ""}>
                {f.type === "select" ? (
                  <select className="input" value={item[f.key] || f.options[0][0]} onChange={(e) => update(item.id, f.key, e.target.value)}>
                    {f.options.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea rows={3} className="input" value={item[f.key] || ""} placeholder={f.placeholder} onChange={(e) => update(item.id, f.key, e.target.value)} />
                ) : (
                  <input className="input" required={f.required} value={item[f.key] || ""} placeholder={f.placeholder} onChange={(e) => update(item.id, f.key, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((it) => it.id !== item.id))}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([...items, { ...empty, id: newId() }])}>
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
};

export const ProfileBuilder = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [savedJson, setSavedJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "studentProfiles", user.uid))
      .then((snap) => {
        if (cancelled) return;
        const p = { ...normalizeStudentProfile(snap.exists() ? snap.data() : {}), name: snap.data()?.name || user.name, email: user.email };
        setProfile(p);
        setSavedJson(JSON.stringify(p));
      })
      .catch((e) => !cancelled && setMessage({ tone: "error", text: friendlyError(e) }));
    return () => {
      cancelled = true;
    };
  }, [user.uid, user.name, user.email]);

  const dirty = profile && JSON.stringify(profile) !== savedJson;
  const completeness = useMemo(() => (profile ? profileCompleteness(profile) : 0), [profile]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!profile) return message ? <Alert tone="error">{message.text}</Alert> : <Spinner label="Loading your profile…" />;

  const set = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));
  const setInput = (key) => (e) => set(key)(e.target.value);
  const setLink = (key) => (e) => setProfile((p) => ({ ...p, links: { ...p.links, [key]: e.target.value } }));

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!profile.name.trim()) {
      setMessage({ tone: "error", text: "Please enter your name." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveStudentProfile(user.uid, profile);
      setSavedJson(JSON.stringify(profile));
      setMessage({ tone: "success", text: "Profile saved. Alumni and teachers now see the latest version." });
    } catch (err) {
      setMessage({ tone: "error", text: friendlyError(err) });
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage({ tone: "error", text: "Please choose an image under 5 MB." });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await saveStudentProfile(user.uid, { photoURL: url });
      setProfile((p) => ({ ...p, photoURL: url }));
      setSavedJson((s) => JSON.stringify({ ...JSON.parse(s), photoURL: url }));
    } catch (err) {
      console.error(err);
      setMessage({ tone: "error", text: "Photo upload failed. Make sure Firebase Storage is enabled for this project." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20">
      <PageHeader
        title="Profile & Resume"
        subtitle="Fill this in once — it powers your public profile, alumni search, and your one-click ATS resume."
        actions={
          <>
            <Link to={`/students/${user.uid}`} className="btn btn-secondary">
              <Eye className="h-4 w-4" /> Preview
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => exportATSResume(profile)}>
              <Download className="h-4 w-4" /> Export ATS resume
            </button>
          </>
        }
      />

      <div className="card flex items-center gap-4 p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Profile strength</span>
            <span className="font-semibold text-blue-700">{completeness}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all ${completeness >= 80 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${completeness}%` }} />
          </div>
        </div>
      </div>

      <SectionCard title="Basic details" description="Your name and headline appear at the top of your resume.">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <Avatar name={profile.name} photoURL={profile.photoURL} size="xl" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <button type="button" className="btn btn-ghost btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Change photo"}
            </button>
            <p className="max-w-[9rem] text-center text-[11px] text-slate-400">Shown on your profile only — never on the ATS resume.</p>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input required className="input" value={profile.name} onChange={setInput("name")} />
            </Field>
            <Field label="Designation / headline">
              <input className="input" value={profile.designation} onChange={setInput("designation")} placeholder="MCA Student | Full-Stack Developer" />
            </Field>
            <Field label="Email">
              <input className="input" value={profile.email} disabled />
            </Field>
            <Field label="Phone">
              <input className="input" value={profile.phone} onChange={setInput("phone")} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <input className="input" value={profile.location} onChange={setInput("location")} placeholder="City, State" />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Professional summary" description="2–4 sentences about your strengths and what you are looking for.">
        <textarea rows={4} maxLength={1200} className="input" value={profile.summary} onChange={setInput("summary")} placeholder="MCA student with hands-on experience in…" />
        <p className="mt-1 text-right text-xs text-slate-400">{profile.summary.length}/1200</p>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Skills" description="Press Enter after each skill. Alumni search by these.">
          <TagInput value={profile.skills} onChange={set("skills")} placeholder="e.g. React" suggestions={SKILL_SUGGESTIONS} />
        </SectionCard>
        <SectionCard title="Tools & technologies" description="Software, platforms and frameworks you use.">
          <TagInput value={profile.tools} onChange={set("tools")} placeholder="e.g. Git" suggestions={TOOL_SUGGESTIONS} />
        </SectionCard>
      </div>

      <SectionCard title="Experience" icon={Briefcase} description="Mark each entry as an onsite or virtual internship.">
        <RepeatableList items={profile.experience} onChange={set("experience")} fields={EXPERIENCE_FIELDS} empty={{ title: "", organization: "", mode: "onsite", startDate: "", endDate: "", description: "" }} emptyText="No experience added yet." />
      </SectionCard>

      <SectionCard title="Education" icon={GraduationCap}>
        <RepeatableList items={profile.education} onChange={set("education")} fields={EDUCATION_FIELDS} empty={{ degree: "", institution: "", year: "", score: "" }} emptyText="No education added yet." />
      </SectionCard>

      <SectionCard title="Certifications" icon={Award}>
        <RepeatableList items={profile.certifications} onChange={set("certifications")} fields={CERT_FIELDS} empty={{ name: "", issuer: "", year: "", url: "" }} emptyText="No certifications added yet." />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Languages known">
          <TagInput value={profile.languages} onChange={set("languages")} placeholder="e.g. English" suggestions={LANGUAGE_SUGGESTIONS} />
        </SectionCard>
        <SectionCard title="Links" description="Portfolio, LinkedIn and other profiles.">
          <div className="grid gap-3">
            <Field label="LinkedIn">
              <input className="input" value={profile.links.linkedin} onChange={setLink("linkedin")} placeholder="linkedin.com/in/username" />
            </Field>
            <Field label="GitHub">
              <input className="input" value={profile.links.github} onChange={setLink("github")} placeholder="github.com/username" />
            </Field>
            <Field label="Portfolio">
              <input className="input" value={profile.links.portfolio} onChange={setLink("portfolio")} placeholder="yourname.dev" />
            </Field>
            <Field label="Other">
              <input className="input" value={profile.links.other} onChange={setLink("other")} placeholder="LeetCode, Behance, blog…" />
            </Field>
          </div>
        </SectionCard>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="min-h-[20px] text-sm">
            {message ? <Alert tone={message.tone}>{message.text}</Alert> : <span className="text-slate-500">{dirty ? "You have unsaved changes." : "All changes saved."}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving || !dirty}>
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
};
