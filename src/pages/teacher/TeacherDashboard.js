import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query } from "firebase/firestore";
import { Building2, FileText, GraduationCap } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveQuery } from "../../hooks/useLive";
import { countUsersByRole } from "../../services/api";
import { CreatePostForm } from "../../components/CreatePostForm";
import { PostFeed } from "../../components/PostFeed";
import { GlobalDiscussionBox } from "../../components/GlobalDiscussionBox";
import { PageHeader, StatCard } from "../../components/ui";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ student: null, alumni: null });
  const { data: posts } = useLiveQuery(() => query(collection(db, "posts")), []);

  useEffect(() => {
    Promise.all([countUsersByRole("student"), countUsersByRole("alumni")])
      .then(([student, alumni]) => setCounts({ student, alumni }))
      .catch((e) => console.error("Could not load counters:", e));
  }, []);

  const myPosts = posts.filter((p) => p.authorUid === user.uid).length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Notices, polls and your students." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Link to="/teacher/students" className="block rounded-xl transition hover:-translate-y-0.5 hover:shadow-md">
          <StatCard label="Students" value={counts.student} icon={GraduationCap} tone="blue" hint="View & export" />
        </Link>
        <Link to="/teacher/alumni" className="block rounded-xl transition hover:-translate-y-0.5 hover:shadow-md">
          <StatCard label="Alumni" value={counts.alumni} icon={Building2} tone="violet" hint="View & export" />
        </Link>
        <StatCard label="My posts" value={myPosts} icon={FileText} tone="emerald" hint={`${posts.length} in total`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <CreatePostForm types={["notice", "poll"]} />
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
