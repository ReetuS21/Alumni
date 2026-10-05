import React, { useState } from "react";
import { Briefcase, FlaskConical, Megaphone, Plus, Vote, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/api";
import { friendlyError } from "../utils/authErrors";
import { toUrl } from "../utils/format";
import { Alert, Field, SegmentedControl } from "./ui";

const TYPE_OPTIONS = {
  notice: { value: "notice", label: "Notice", icon: Megaphone },
  poll: { value: "poll", label: "Poll", icon: Vote },
  hiring: { value: "hiring", label: "Hiring Post", icon: Briefcase },
  test: { value: "test", label: "Skill Test", icon: FlaskConical },
};

const emptyMeta = { company: "", jobRole: "", location: "", deadline: "", link: "", skills: "" };

/** Teachers: notice / poll. Alumni: hiring post / skill test. (Enforced again in Firestore rules.) */
export const CreatePostForm = ({ types, defaults = {}, onCreated }) => {
  const { user } = useAuth();
  const [type, setType] = useState(types[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [meta, setMeta] = useState({ ...emptyMeta, ...defaults });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const setM = (key) => (e) => setMeta((m) => ({ ...m, [key]: e.target.value }));

  const reset = () => {
    setTitle("");
    setBody("");
    setOptions(["", ""]);
    setMeta({ ...emptyMeta, ...defaults });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const cleanOptions = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
    if (type === "poll" && cleanOptions.length < 2) {
      setMessage({ tone: "error", text: "A poll needs at least two different options." });
      return;
    }
    const pick = (keys) => Object.fromEntries(keys.map((k) => [k, k === "link" ? toUrl(meta[k].trim()) : meta[k].trim()]));
    const postMeta = type === "hiring" ? pick(["company", "jobRole", "location", "deadline", "link"]) : type === "test" ? pick(["skills", "deadline", "link"]) : {};

    setBusy(true);
    try {
      await createPost(user, { type, title, body, options: cleanOptions, meta: postMeta });
      reset();
      setMessage({ tone: "success", text: "Published to the student feed." });
      onCreated?.();
    } catch (err) {
      setMessage({ tone: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <h2 className="section-title">Create a post</h2>
        <p className="text-sm text-slate-500">Posts appear instantly in every student's feed.</p>
      </div>

      {types.length > 1 && (
        <SegmentedControl
          options={types.map((t) => TYPE_OPTIONS[t])}
          value={type}
          onChange={(t) => {
            setType(t);
            setMessage(null);
          }}
        />
      )}

      <Field label={type === "poll" ? "Question" : "Title"}>
        <input required maxLength={150} className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "poll" ? "e.g. Which workshop should we run next?" : type === "hiring" ? "e.g. Frontend Developer (React)" : type === "test" ? "e.g. DSA Challenge — Arrays & Strings" : "e.g. Placement drive registration closes Friday"} />
      </Field>

      {type === "hiring" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <input required className="input" value={meta.company} onChange={setM("company")} />
          </Field>
          <Field label="Job role">
            <input required className="input" value={meta.jobRole} onChange={setM("jobRole")} />
          </Field>
          <Field label="Location">
            <input className="input" value={meta.location} onChange={setM("location")} placeholder="Remote / Hybrid / City" />
          </Field>
          <Field label="Apply by">
            <input type="date" className="input" value={meta.deadline} onChange={setM("deadline")} />
          </Field>
          <Field label="Job description link (optional)" className="sm:col-span-2">
            <input className="input" value={meta.link} onChange={setM("link")} placeholder="https://…" />
          </Field>
        </div>
      )}

      {type === "test" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Skills tested">
            <input required className="input" value={meta.skills} onChange={setM("skills")} placeholder="React, DSA, SQL" />
          </Field>
          <Field label="Due date">
            <input type="date" className="input" value={meta.deadline} onChange={setM("deadline")} />
          </Field>
          <Field label="Test / challenge link (optional)" className="sm:col-span-2" hint="HackerRank, Google Form, GitHub repo…">
            <input className="input" value={meta.link} onChange={setM("link")} placeholder="https://…" />
          </Field>
        </div>
      )}

      <Field label={type === "poll" ? "Details (optional)" : "Description"}>
        <textarea rows={4} required={type !== "poll"} maxLength={5000} className="input" value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>

      {type === "poll" && (
        <div className="space-y-2">
          <span className="label">Options</span>
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input"
                value={o}
                maxLength={100}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => setOptions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
              />
              {options.length > 2 && (
                <button type="button" className="btn btn-ghost px-2" aria-label="Remove option" onClick={() => setOptions((arr) => arr.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOptions((a) => [...a, ""])}>
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          )}
        </div>
      )}

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Publishing…" : "Publish"}
        </button>
      </div>
    </form>
  );
};
