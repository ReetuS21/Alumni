import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, doc, query, where } from "firebase/firestore";
import { BadgeCheck, Briefcase, Building2, ClipboardList, UserRound } from "lucide-react";
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
  const { data: verification } = useLiveDoc(() => doc(db, "skillVerifications", user.uid), [user.uid]);
  const { data: apps } = useLiveQuery(() => query(collection(db, "applications"), where("studentUid", "==", user.uid)), [user.uid]);
  const { data: hiring } = useLiveQuery(() => query(collection(db, "posts"), where("type", "==", "hiring")), []);
  const { data: referrals } = useLiveQuery(() => query(collection(db, "shortlists"), where("studentUid", "==", user.uid)), [user.uid]);

  const completeness = useMemo(() => profileCompleteness({ ...normalizeStudentProfile(profileDoc || {}), name: user.name }), [profileDoc, user.name]);
  const firstName = (user.name || "").split(" ")[0];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="New openings, notices and tests from your teachers and alumni." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Open positions" value={hiring.length} icon={Briefcase} tone="blue" />
        <StatCard label="My applications" value={apps.length} icon={ClipboardList} tone="violet" hint={`${apps.filter((a) => a.status === "shortlisted").length} shortlisted`} />
        <StatCard label="Alumni interest" value={referrals.length} icon={Building2} tone="amber" hint="shortlists & referrals" />
        <StatCard label="Skill status" value={verification?.status === "verified" ? "Verified" : "Pending"} icon={BadgeCheck} tone={verification?.status === "verified" ? "emerald" : "rose"} />
      </div>

      {completeness < 80 && (
        <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Your profile is {completeness}% complete</p>
            <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Alumni search by skills, tools and location — a complete profile gets found more often.</p>
          </div>
          <Link to="/student/profile" className="btn btn-primary">
            Complete profile
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PostFeed title="Feed" />
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-16">
            <GlobalDiscussionBox />
          </div>
        </div>
      </div>
    </>
  );
};
