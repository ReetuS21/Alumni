import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, doc, query, where } from "firebase/firestore";
import { Briefcase, Building2, ClipboardList, UserRound } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveDoc, useLiveQuery } from "../../hooks/useLive";
import { normalizeStudentProfile, profileCompleteness } from "../../utils/profile";
import { PostFeed } from "../../components/PostFeed";
import { GlobalDiscussionBox } from "../../components/GlobalDiscussionBox";
import { PageHeader, StatCard } from "../../components/ui";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { data: profileDoc } = useLiveDoc(() => doc(db, "studentProfiles", user.uid), [user.uid]);
  const { data: apps } = useLiveQuery(() => query(collection(db, "applications"), where("studentUid", "==", user.uid)), [user.uid]);
  const { data: hiring } = useLiveQuery(() => query(collection(db, "posts"), where("type", "==", "hiring")), []);
  const { data: referrals } = useLiveQuery(() => query(collection(db, "shortlists"), where("studentUid", "==", user.uid)), [user.uid]);

  const completeness = useMemo(() => profileCompleteness({ ...normalizeStudentProfile(profileDoc || {}), name: user.name }), [profileDoc, user.name]);
  const firstName = (user.name || "").split(" ")[0];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="Latest openings, notices and tests." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Openings" value={hiring.length} icon={Briefcase} tone="blue" />
        <StatCard label="Applications" value={apps.length} icon={ClipboardList} tone="violet" hint={`${apps.filter((a) => a.status === "shortlisted").length} shortlisted`} />
        <StatCard label="Alumni interest" value={referrals.length} icon={Building2} tone="amber" hint="shortlists & referrals" />
        <StatCard label="Profile" value={`${completeness}%`} icon={UserRound} tone={completeness >= 80 ? "emerald" : "rose"} hint="aim for 80%+" />
      </div>

      {completeness < 80 && (
        <div className="card flex items-center gap-4 p-4 sm:p-5">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:flex">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium sm:text-base">Profile {completeness}% complete</p>
            <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 hidden text-sm text-slate-500 sm:block">Complete profiles show up more in alumni searches.</p>
          </div>
          <Link to="/student/profile" className="btn btn-primary btn-sm sm:px-4 sm:py-2 sm:text-sm">
            Complete
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PostFeed title="Feed" />
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <div className="lg:sticky lg:top-8">
            <GlobalDiscussionBox />
          </div>
        </div>
      </div>
    </>
  );
};
