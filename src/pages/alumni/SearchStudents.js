import React from "react";
import { UserSearch } from "lucide-react";
import { useStudents } from "../../hooks/useDirectory";
import { useStudentFilters } from "../../components/StudentFilters";
import { StudentCard } from "../../components/StudentCard";
import { ShortlistButton } from "../../components/ShortlistButton";
import { Alert, EmptyState, PageHeader, Spinner } from "../../components/ui";

/** Module 5 — search students by skill, tools, location and experience, then shortlist. */
export const SearchStudents = () => {
  const { students, loading, error } = useStudents();
  const { filtered, ui, selectedSkills, search } = useStudentFilters(students);

  return (
    <>
      <PageHeader title="Search Students" subtitle="Filter by skills and shortlist for referrals." />
      {ui}
      {error && <Alert tone="error">Could not load students: {error.message}</Alert>}
      {loading ? (
        <Spinner label="Loading students…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserSearch} title="No matching students" text={students.length ? "Try removing a filter." : "No students have registered yet."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <StudentCard key={s.uid} student={s} highlight={[...selectedSkills, search].filter(Boolean)} actions={<ShortlistButton student={s} />} />
          ))}
        </div>
      )}
    </>
  );
};
