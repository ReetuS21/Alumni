import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Avatar } from "./ui";

export const StudentCard = ({ student, actions, highlight = [] }) => {
  const skills = student.skills || [];
  const hl = highlight.map((h) => h.toLowerCase());
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Avatar name={student.name} photoURL={student.photoURL} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to={`/students/${student.uid}`} className="truncate font-semibold text-slate-900 hover:text-blue-700">
              {student.name}
            </Link>
          </div>
          <p className="truncate text-sm text-slate-500">{student.designation || "Student"}</p>
          {student.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" /> {student.location}
            </p>
          )}
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 8).map((s) => (
            <span key={s} className={`chip ${hl.some((h) => s.toLowerCase().includes(h)) ? "bg-blue-100 text-blue-800" : ""}`}>
              {s}
            </span>
          ))}
          {skills.length > 8 && <span className="chip text-slate-400">+{skills.length - 8}</span>}
        </div>
      )}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link to={`/students/${student.uid}`} className="btn btn-secondary btn-sm">
          View profile
        </Link>
        {actions}
      </div>
    </div>
  );
};
