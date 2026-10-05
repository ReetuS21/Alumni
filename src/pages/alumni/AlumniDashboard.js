import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, query, where } from "firebase/firestore";
import { Briefcase, ClipboardList, ExternalLink, GraduationCap, Inbox, Star } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveDoc, useLiveQuery } from "../../hooks/useLive";
import { countUsersByRole, setApplicationStatus } from "../../services/api";
import { formatDate, millis, toUrl } from "../../utils/format";
import { CreatePostForm } from "../../components/CreatePostForm";
import { PostCard } from "../../components/PostCard";
import { GlobalDiscussionBox } from "../../components/GlobalDiscussionBox";
import { Alert, Avatar, EmptyState, PageHeader, StatCard } from "../../components/ui";

const Applicants = ({ applicants }) => {
  const [error, setError] = useState("");
  const change = async (id, status) => {
    setError("");
    try {
      await setApplicationStatus(id, status);
    } catch {
      setError("Could not update the status.");
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60">
      <p className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
      </p>
      {applicants.length === 0 ? (
        <p className="px-4 py-3 text-sm text-slate-400">No applications yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {applicants.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={a.studentName} size="xs" />
                <div className="min-w-0">
                  <Link to={`/students/${a.studentUid}`} className="truncate text-sm font-medium text-slate-900 hover:text-blue-700">
                    {a.studentName}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {formatDate(a.appliedAt) || "just now"}
                    {a.submissionLink && (
                      <>
                        {" · "}
                        <a href={toUrl(a.submissionLink)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                          submission <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <select className="input w-full py-1.5 text-xs sm:w-36" value={a.status} onChange={(e) => change(a.id, e.target.value)}>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </li>
          ))}
        </ul>
      )}
      {error && <Alert tone="error" className="m-3">{error}</Alert>}
    </div>
  );
};

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(null);
  const { data: profile } = useLiveDoc(() => doc(db, "alumniProfiles", user.uid), [user.uid]);
  const { data: posts } = useLiveQuery(() => query(collection(db, "posts"), where("authorUid", "==", user.uid)), [user.uid]);
  const { data: apps } = useLiveQuery(() => query(collection(db, "applications"), where("postAuthorUid", "==", user.uid)), [user.uid]);
  const { data: shortlists } = useLiveQuery(() => query(collection(db, "shortlists"), where("alumniUid", "==", user.uid)), [user.uid]);

  useEffect(() => {
    countUsersByRole("student")
      .then(setStudentCount)
      .catch((e) => console.error(e));
  }, []);

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => millis(b.createdAt) - millis(a.createdAt)), [posts]);
  const appsByPost = useMemo(() => {
    const map = {};
    apps.forEach((a) => {
      (map[a.postId] = map[a.postId] || []).push(a);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => millis(b.appliedAt) - millis(a.appliedAt)));
    return map;
  }, [apps]);

  return (
    <>
      <PageHeader
        title="Alumni Dashboard"
        subtitle="Post openings and tests, review applicants, and find juniors to refer."
        actions={
          <Link to="/alumni/search" className="btn btn-primary">
            Search students
          </Link>
        }
      />

      {!profile?.company && (
        <Alert tone="warning">
          Add your company and role in <Link to="/alumni/profile" className="font-semibold underline">My Profile</Link> so students can find you in the alumni directory.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Students on platform" value={studentCount} icon={GraduationCap} tone="blue" />
        <StatCard label="My posts" value={posts.length} icon={Briefcase} tone="violet" />
        <StatCard label="Applications received" value={apps.length} icon={ClipboardList} tone="amber" hint={`${apps.filter((a) => a.status === "applied").length} awaiting review`} />
        <StatCard label="Shortlisted" value={shortlists.length} icon={Star} tone="emerald" hint={`${shortlists.filter((s) => s.status === "referred").length} referred`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <CreatePostForm key={profile?.company || "new"} types={["hiring", "test"]} defaults={{ company: profile?.company || "", jobRole: "", location: profile?.location || "" }} />

          <section className="space-y-4">
            <h2 className="section-title">My posts & applicants</h2>
            {sortedPosts.length === 0 ? (
              <EmptyState icon={Inbox} title="No posts yet" text="Publish a hiring post or a skill test above — applicants will show up here." />
            ) : (
              sortedPosts.map((p) => <PostCard key={p.id} post={p} footer={p.type === "hiring" || p.type === "test" ? <Applicants applicants={appsByPost[p.id] || []} /> : null} />)
            )}
          </section>
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-8">
            <GlobalDiscussionBox />
          </div>
        </div>
      </div>
    </>
  );
};
