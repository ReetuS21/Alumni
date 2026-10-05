import React, { useMemo, useState } from "react";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { Newspaper } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLiveQuery } from "../hooks/useLive";
import { PostCard } from "./PostCard";
import { Alert, EmptyState, FilterChips, Spinner } from "./ui";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "hiring", label: "Hiring" },
  { value: "test", label: "Skill Tests" },
  { value: "notice", label: "Notices" },
  { value: "poll", label: "Polls" },
];

/** Live feed of posts from teachers and alumni, newest first. */
export const PostFeed = ({ title = "Feed" }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const { data: posts, loading, error } = useLiveQuery(
    () => query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)),
    []
  );
  const { data: myApps } = useLiveQuery(
    () => (user.role === "student" ? query(collection(db, "applications"), where("studentUid", "==", user.uid)) : null),
    [user.uid, user.role]
  );
  const appliedIds = useMemo(() => new Set(myApps.map((a) => a.postId)), [myApps]);
  const visible = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="section-title">{title}</h2>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </div>
      {error && <Alert tone="error">Could not load posts: {error.message}</Alert>}
      {loading ? (
        <Spinner label="Loading posts…" />
      ) : visible.length === 0 ? (
        <EmptyState icon={Newspaper} title="Nothing here yet" text="New notices, polls, openings and tests will appear here." />
      ) : (
        visible.map((p) => <PostCard key={p.id} post={p} applied={appliedIds.has(p.id)} />)
      )}
    </section>
  );
};
