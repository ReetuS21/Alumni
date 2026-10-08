import React, { useMemo, useRef, useState } from "react";
import { collection, query } from "firebase/firestore";
import { CheckCircle2, Download, ListChecks, Plus, Search, Trash2, Upload } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveQuery } from "../../hooks/useLive";
import { addPreapproved, removePreapproved, reviewUser } from "../../services/api";
import { useAllUsers } from "../../components/admin/AdminUserTools";
import { downloadCsv } from "../../utils/csv";
import { formatDate, includesText } from "../../utils/format";
import { friendlyError } from "../../utils/authErrors";
import { Alert, EmptyState, Field, PageHeader, RoleBadge, Spinner, StatusBadge } from "../../components/ui";

const ROLES = ["student", "teacher", "alumni"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turns pasted text or a CSV file into entries. Accepts one person per line:
 *   email            (uses the default role)
 *   email,role
 *   email,role,name
 * A header row and blank lines are ignored.
 */
export const parseRollList = (text, defaultRole) => {
  const entries = [];
  const invalid = [];
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [rawEmail = "", rawRole = "", ...rest] = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      const email = rawEmail.toLowerCase();
      if (email === "email") return; // header row
      const role = (rawRole || defaultRole).toLowerCase();
      if (!EMAIL_RE.test(email) || !ROLES.includes(role)) {
        invalid.push(line);
        return;
      }
      entries.push({ email, role, name: rest.join(" ").trim() });
    });
  // Last line wins for duplicates.
  const unique = [...new Map(entries.map((e) => [e.email, e])).values()];
  return { entries: unique, invalid };
};

/** The super admin's list of known students, teachers and alumni — they skip the approval queue. */
export const AdminRollList = () => {
  const { user } = useAuth();
  const { data: list, loading } = useLiveQuery(() => query(collection(db, "preapproved")), []);
  const { users } = useAllUsers();
  const [text, setText] = useState("");
  const [defaultRole, setDefaultRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef(null);

  const accounts = useMemo(() => Object.fromEntries(users.map((u) => [String(u.email || "").toLowerCase(), u])), [users]);
  const rows = useMemo(
    () =>
      [...list]
        .sort((a, b) => a.email.localeCompare(b.email))
        .filter((r) => !search.trim() || [r.email, r.name].some((f) => includesText(f, search))),
    [list, search]
  );
  const registered = list.filter((r) => accounts[r.email]).length;

  const add = async (source) => {
    const { entries, invalid } = parseRollList(source, defaultRole);
    if (!entries.length) {
      setMessage({ tone: "error", text: invalid.length ? `No valid lines found. Check: ${invalid.slice(0, 3).join(" | ")}` : "Enter at least one email address." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await addPreapproved(user, entries);
      // People who already registered and are waiting get approved now.
      const waiting = entries.map((e) => accounts[e.email]).filter((a, i) => a && a.status === "pending" && a.role === entries[i].role);
      await Promise.all(waiting.map((a) => reviewUser(user, a, "approved", "On the institute roll list.")));
      setText("");
      setMessage({
        tone: invalid.length ? "warning" : "success",
        text: `${entries.length} email${entries.length === 1 ? "" : "s"} added to the roll list.${waiting.length ? ` ${waiting.length} waiting account(s) approved.` : ""}${invalid.length ? ` ${invalid.length} line(s) skipped: ${invalid.slice(0, 3).join(" | ")}` : ""}`,
      });
    } catch (e) {
      setMessage({ tone: "error", text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) add(await file.text());
  };

  const remove = async (email) => {
    if (!window.confirm(`Remove ${email} from the roll list? (An existing account is not affected.)`)) return;
    try {
      await removePreapproved(email);
    } catch (e) {
      setMessage({ tone: "error", text: friendlyError(e) });
    }
  };

  const template = () => downloadCsv("roll-list-template.csv", ["email", "role", "name"], [["student1@college.edu", "student", "Student Name"], ["teacher1@college.edu", "teacher", "Teacher Name"]]);

  return (
    <>
      <PageHeader
        title="Roll List"
        subtitle="Emails on this list are approved automatically at sign-up."
        actions={
          <button className="btn btn-secondary" onClick={template}>
            <Download className="h-4 w-4" /> CSV template
          </button>
        }
      />

      <section className="card space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <Field label="Emails (one per line — optionally email,role,name)">
            <textarea rows={5} className="input font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder={"student1@college.edu\nteacher1@college.edu,teacher,Dr. Name\nalum@company.com,alumni"} />
          </Field>
          <div className="space-y-3">
            <Field label="Default role" hint="Used when a line has no role.">
              <select className="input" value={defaultRole} onChange={(e) => setDefaultRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r[0].toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <button className="btn btn-primary w-full" disabled={busy || !text.trim()} onClick={() => add(text)}>
              <Plus className="h-4 w-4" /> Add to list
            </button>
            <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={onFile} />
            <button className="btn btn-secondary w-full" disabled={busy} onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload CSV
            </button>
          </div>
        </div>
        <Alert tone={message?.tone}>{message?.text}</Alert>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title">
            {list.length} on the list · {registered} registered
          </h2>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search the list…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={ListChecks} title={list.length ? "No matches" : "The roll list is empty"} text={list.length ? "Try a different search." : "Paste emails or upload a CSV."} />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {rows.map((r) => {
              const account = accounts[r.email];
              return (
                <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{r.email}</p>
                    <p className="text-xs text-slate-400">{[r.name, `added ${formatDate(r.addedAt) || "just now"}`].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={r.role} />
                    {account ? (
                      account.role === r.role ? (
                        <StatusBadge status={account.status} />
                      ) : (
                        <span className="badge bg-amber-50 text-amber-700 ring-amber-200">registered as {account.role}</span>
                      )
                    ) : (
                      <span className="badge bg-slate-50 text-slate-500 ring-slate-200">not registered</span>
                    )}
                    {account?.role === r.role && account.status === "approved" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    <button className="btn btn-ghost btn-sm text-rose-600" onClick={() => remove(r.email)} aria-label={`Remove ${r.email}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
};
