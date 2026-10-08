import React from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { doc } from "firebase/firestore";
import { ArrowLeft, Briefcase, Building2, ExternalLink, GraduationCap, Mail, MapPin, UserX } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { PersonAvatar } from "../../context/PeopleContext";
import { useLiveDoc } from "../../hooks/useLive";
import { toUrl } from "../../utils/format";
import { MessageButton } from "../../components/MessageButton";
import { EmptyState, RoleBadge, Spinner } from "../../components/ui";

const PROFILE_COLLECTION = { teacher: "teacherProfiles", alumni: "alumniProfiles" };

/** Read-only profile for teachers and alumni (students use /students/:uid). */
export const PersonProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: account, loading } = useLiveDoc(() => doc(db, "users", uid), [uid]);
  const col = PROFILE_COLLECTION[account?.role];
  const { data: profile, loading: profileLoading } = useLiveDoc(() => (col ? doc(db, col, uid) : null), [col, uid]);

  if (loading || (col && profileLoading)) return <Spinner label="Loading profile…" />;
  if (account?.role === "student") return <Navigate to={`/students/${uid}`} replace />;
  if (!account || !col) {
    return <EmptyState icon={UserX} title="Profile not found" action={<Link to="/" className="btn btn-secondary">Back to dashboard</Link>} />;
  }

  const p = { ...(profile || {}), name: profile?.name || account.name, email: account.email };
  const isAlumni = account.role === "alumni";
  const headline = isAlumni ? [p.jobRole, p.company].filter(Boolean).join(" at ") : [p.designation, p.department].filter(Boolean).join(", ");

  return (
    <>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <section className="card max-w-3xl p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PersonAvatar uid={uid} name={p.name} photoURL={p.photoURL || account.photoURL} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
              <RoleBadge role={account.role} />
            </div>
            {headline && <p className="mt-1 text-slate-600">{headline}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              {isAlumni && p.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {p.company}
                </span>
              )}
              {isAlumni && p.domain && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" /> {p.domain}
                  {p.experienceYears ? ` · ${p.experienceYears} yrs` : ""}
                </span>
              )}
              {p.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {p.location}
                </span>
              )}
              {p.batch && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> {p.batch}
                </span>
              )}
            </div>
            {p.bio && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{p.bio}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <MessageButton person={{ uid, name: p.name, role: account.role, photoURL: account.photoURL }} size="md" className="btn-primary" />
              {uid !== user.uid && p.email && (
                <a href={`mailto:${p.email}`} className="btn btn-secondary">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
              {p.linkedin && (
                <a href={toUrl(p.linkedin)} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
