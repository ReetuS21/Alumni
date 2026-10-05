import React from "react";
import { Download, Users } from "lucide-react";
import { useStudents } from "../../hooks/useDirectory";
import { useStudentFilters } from "../../components/StudentFilters";
import { StudentCard } from "../../components/StudentCard";
import { downloadCsv } from "../../utils/csv";
import { Alert, EmptyState, PageHeader, Spinner } from "../../components/ui";

/** Teacher view: every registered student, filterable, each card opens the full profile. */
export const StudentDirectory = () => {
  const { students, loading, error } = useStudents();
  const { filtered, ui, selectedSkills, search } = useStudentFilters(students);

  const exportCsv = () =>
    downloadCsv(
      `students-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Email", "Designation", "Phone", "Location", "Skills", "Tools", "Internships", "Languages"],
      filtered.map((s) => [
        s.name,
        s.email,
        s.designation,
        s.phone,
        s.location,
        (s.skills || []).join("; "),
        (s.tools || []).join("; "),
        (s.experience || []).map((e) => `${e.title} @ ${e.organization} (${e.mode})`).join("; "),
        (s.languages || []).join("; "),
      ])
    );

  return (
    <>
      <PageHeader
        title="Student Profiles"
        subtitle={`${students.length} registered student${students.length === 1 ? "" : "s"}. Open any profile to see full details.`}
        actions={
          <button className="btn btn-secondary" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export CSV ({filtered.length})
          </button>
        }
      />
      {ui}
      {error && <Alert tone="error">Could not load students: {error.message}</Alert>}
      {loading ? (
        <Spinner label="Loading students…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" text={students.length ? "Try removing a filter." : "No students have registered yet."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <StudentCard key={s.uid} student={s} highlight={[...selectedSkills, search].filter(Boolean)} />
          ))}
        </div>
      )}
    </>
  );
};
