import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { includesText, millis } from "../utils/format";

const EXPERIENCE_OPTIONS = [
  { value: "any", label: "Any experience" },
  { value: "has", label: "Has internship experience" },
  { value: "onsite", label: "Onsite internship" },
  { value: "virtual", label: "Virtual internship" },
  { value: "none", label: "No experience yet" },
];

const SORT_OPTIONS = [
  { value: "match", label: "Best match" },
  { value: "name", label: "Name A–Z" },
  { value: "recent", label: "Recently updated" },
];

const countBy = (lists) => {
  const counts = new Map();
  lists.flat().forEach((raw) => {
    const key = String(raw).trim();
    if (!key) return;
    const lower = key.toLowerCase();
    const prev = counts.get(lower);
    counts.set(lower, { label: prev?.label || key, n: (prev?.n || 0) + 1 });
  });
  return [...counts.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
};

/**
 * Simple student filters: keyword search, clickable skill chips (must match all selected),
 * location, internship experience and sort. Returns the filtered list plus the filter UI.
 */
export const useStudentFilters = (students) => {
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState("all");
  const [experience, setExperience] = useState("any");
  const [sort, setSort] = useState("match");
  const [showAllSkills, setShowAllSkills] = useState(false);

  const skillOptions = useMemo(() => countBy(students.map((s) => [...(s.skills || []), ...(s.tools || [])])), [students]);
  const locationOptions = useMemo(() => countBy(students.map((s) => (s.location ? [s.location] : []))), [students]);

  const filtered = useMemo(() => {
    const selected = skills.map((s) => s.toLowerCase());
    const list = students.filter((s) => {
      const have = [...(s.skills || []), ...(s.tools || [])].map((x) => x.toLowerCase());
      if (!selected.every((sk) => have.includes(sk))) return false;
      if (location !== "all" && (s.location || "").toLowerCase() !== location) return false;
      const exp = s.experience || [];
      if (experience === "has" && exp.length === 0) return false;
      if (experience === "none" && exp.length > 0) return false;
      if ((experience === "onsite" || experience === "virtual") && !exp.some((e) => e.mode === experience)) return false;
      if (search.trim() && ![s.name, s.email, s.designation, s.location, s.summary, ...have].some((f) => includesText(f, search))) return false;
      return true;
    });
    if (sort === "name") return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sort === "recent") return [...list].sort((a, b) => millis(b.updatedAt || 0) - millis(a.updatedAt || 0));
    return [...list].sort(
      (a, b) => (b.skills?.length || 0) + (b.experience?.length || 0) * 2 - ((a.skills?.length || 0) + (a.experience?.length || 0) * 2)
    );
  }, [students, skills, location, experience, search, sort]);

  const active = Boolean(search.trim() || skills.length || location !== "all" || experience !== "any");
  const clear = () => {
    setSearch("");
    setSkills([]);
    setLocation("all");
    setExperience("any");
  };
  const toggleSkill = (label) =>
    setSkills((cur) => (cur.some((s) => s.toLowerCase() === label.toLowerCase()) ? cur.filter((s) => s.toLowerCase() !== label.toLowerCase()) : [...cur, label]));

  const visibleSkills = showAllSkills ? skillOptions : skillOptions.slice(0, 14);

  const ui = (
    <div className="card space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, skill, tool, city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
          <select className="input lg:w-44" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
            <option value="all">All locations</option>
            {locationOptions.map((l) => (
              <option key={l.label} value={l.label.toLowerCase()}>
                {l.label} ({l.n})
              </option>
            ))}
          </select>
          <select className="input lg:w-52" value={experience} onChange={(e) => setExperience(e.target.value)} aria-label="Experience">
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className="input col-span-2 sm:col-span-1 lg:w-40" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {skillOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Skills & tools {skills.length > 0 && "· students must have all selected"}</p>
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((s) => {
              const on = skills.some((x) => x.toLowerCase() === s.label.toLowerCase());
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => toggleSkill(s.label)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition ${
                    on ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s.label} <span className={on ? "text-blue-100" : "text-slate-400"}>{s.n}</span>
                </button>
              );
            })}
            {skillOptions.length > 14 && (
              <button type="button" className="px-2 text-xs font-semibold text-blue-600 hover:underline" onClick={() => setShowAllSkills((v) => !v)}>
                {showAllSkills ? "Show less" : `+${skillOptions.length - 14} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {active && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
          <span className="text-slate-500">
            {filtered.length} of {students.length} students match
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );

  return { filtered, ui, selectedSkills: skills, search };
};
