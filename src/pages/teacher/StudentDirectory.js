import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { useStudents } from "../../hooks/useDirectory";
import { includesText } from "../../utils/format";
import { isVerified } from "../../utils/profile";
import { StudentCard } from "../../components/StudentCard";
import { Alert, EmptyState, FilterChips, PageHeader, Spinner } from "../../components/ui";

const FILTERS = [
  { value: "all", label: "All students" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Not verified" },
];

/** Teacher view: every registered student, searchable, each card opens the full profile. */
export const StudentDirectory = () => {
  const { students, loading, error } = useStudents();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = students.filter((s) => {
    if (filter === "verified" && !isVerified(s.verification)) return false;
    if (filter === "unverified" && isVerified(s.verification)) return false;
    if (!search.trim()) return true;
    return [s.name, s.email, s.designation, s.location, ...(s.skills || []), ...(s.tools || [])].some((f) => includesText(f, search));
  });

  return (
    <>
      <PageHeader title="Student Profiles" subtitle="Open any student's full profile, skills and verification status." />

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, skill, tool or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {error && <Alert tone="error">Could not load students: {error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading students…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" text={students.length ? "Try a different search." : "No students have registered yet."} />
      ) : (
        <>
          <p className="text-sm text-slate-500">{filtered.length} student{filtered.length === 1 ? "" : "s"}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <StudentCard key={s.uid} student={s} />
            ))}
          </div>
        </>
      )}
    </>
  );
};
