import React, { useMemo, useState } from "react";
import { BadgeCheck, Filter, UserSearch, X } from "lucide-react";
import { useStudents } from "../../hooks/useDirectory";
import { includesText } from "../../utils/format";
import { isVerified } from "../../utils/profile";
import { StudentCard } from "../../components/StudentCard";
import { ShortlistButton } from "../../components/ShortlistButton";
import { Alert, EmptyState, Field, PageHeader, Spinner } from "../../components/ui";

const splitTerms = (s) =>
  s
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

const matchesAll = (list, terms) => terms.every((t) => (list || []).some((item) => item.toLowerCase().includes(t)));

/** Module 5 — search students by skill, tools, location and verification status. */
export const SearchStudents = () => {
  const { students, loading, error } = useStudents();
  const [skills, setSkills] = useState("");
  const [tools, setTools] = useState("");
  const [location, setLocation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState("relevance");

  const skillTerms = splitTerms(skills);
  const toolTerms = splitTerms(tools);
  const hasFilters = skillTerms.length || toolTerms.length || location.trim() || verifiedOnly;

  const results = useMemo(() => {
    const list = students.filter(
      (s) =>
        matchesAll(s.skills, skillTerms) &&
        matchesAll(s.tools, toolTerms) &&
        (!location.trim() || includesText(s.location, location)) &&
        (!verifiedOnly || isVerified(s.verification))
    );
    if (sort === "score") {
      return [...list].sort((a, b) => (b.verification?.score || 0) - (a.verification?.score || 0));
    }
    // relevance: verified first, then by number of skills
    return [...list].sort(
      (a, b) => Number(isVerified(b.verification)) - Number(isVerified(a.verification)) || (b.skills?.length || 0) - (a.skills?.length || 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, skills, tools, location, verifiedOnly, sort]);

  const clear = () => {
    setSkills("");
    setTools("");
    setLocation("");
    setVerifiedOnly(false);
  };

  return (
    <>
      <PageHeader title="Search Students" subtitle="Find juniors by what they can do. Separate multiple terms with commas — students must match all of them." />

      <div className="card space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Skills">
            <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python" />
          </Field>
          <Field label="Tools & technologies">
            <input className="input" value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Git, Docker" />
          </Field>
          <Field label="Location">
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <BadgeCheck className="h-4 w-4 text-emerald-600" /> Verified skills only
          </label>
          <div className="flex items-center gap-2">
            <select className="input w-auto py-1.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevance">Sort: Verified first</option>
              <option value="score">Sort: Verification score</option>
            </select>
            {hasFilters ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error && <Alert tone="error">Could not load students: {error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading students…" />
      ) : results.length === 0 ? (
        <EmptyState icon={UserSearch} title="No matching students" text={students.length ? "Try removing a filter." : "No students have registered yet."} />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {results.length} of {students.length} students
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((s) => (
              <StudentCard key={s.uid} student={s} highlight={skillTerms} actions={<ShortlistButton student={s} />} />
            ))}
          </div>
        </>
      )}
    </>
  );
};
