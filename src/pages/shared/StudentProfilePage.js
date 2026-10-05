import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc } from "firebase/firestore";
import { ArrowLeft, Download, Mail, UserX } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveDoc } from "../../hooks/useLive";
import { normalizeStudentProfile } from "../../utils/profile";
import { exportATSResume } from "../../utils/resumeExporter";
import { StudentProfileView } from "../../components/StudentProfileView";
import { ShortlistButton } from "../../components/ShortlistButton";
import { EmptyState, Spinner } from "../../components/ui";

export const StudentProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: account, loading: l1 } = useLiveDoc(() => doc(db, "users", uid), [uid]);
  const { data: profileDoc, loading: l2 } = useLiveDoc(() => doc(db, "studentProfiles", uid), [uid]);
  const { data: verification, loading: l3 } = useLiveDoc(() => doc(db, "skillVerifications", uid), [uid]);

  const profile = useMemo(
    () =>
      account
        ? { ...normalizeStudentProfile(profileDoc || {}), uid, name: profileDoc?.name || account.name, email: account.email, verification }
        : null,
    [account, profileDoc, verification, uid]
  );

  if (l1 || l2 || l3) return <Spinner label="Loading profile…" />;

  if (!profile || account.role !== "student") {
    return <EmptyState icon={UserX} title="Student not found" text="This profile does not exist or is not a student account." action={<Link to="/" className="btn btn-secondary">Back to dashboard</Link>} />;
  }

  const isSelf = user.uid === uid;

  return (
    <>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <StudentProfileView
        profile={profile}
        actions={
          <>
            {user.role === "alumni" && <ShortlistButton student={profile} size="md" />}
            {!isSelf && profile.email && (
              <a href={`mailto:${profile.email}`} className="btn btn-secondary">
                <Mail className="h-4 w-4" /> Contact
              </a>
            )}
            <button className="btn btn-secondary" onClick={() => exportATSResume(profile)}>
              <Download className="h-4 w-4" /> Resume PDF
            </button>
            {isSelf && (
              <Link to="/student/profile" className="btn btn-primary">
                Edit profile
              </Link>
            )}
          </>
        }
      />
    </>
  );
};
