import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getCountFromServer, query } from "firebase/firestore";
import { Building2, CheckCircle2, Clock, FileText, GraduationCap, MessagesSquare, Presentation } from "lucide-react";
import { db } from "../../firebase";
import { useLiveQuery } from "../../hooks/useLive";
import { formatDate } from "../../utils/format";
import { ReviewActions, UserDetailsModal, detailLines, useAllUsers, useRegistrationDetails } from "../../components/admin/AdminUserTools";
import { Avatar, EmptyState, PageHeader, RoleBadge, Spinner, StatCard } from "../../components/ui";

const PendingRow = ({ user, onOpen }) => {
  const details = useRegistrationDetails(user);
  const summary = detailLines(user, details)
    .filter(([, v]) => v)
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => onOpen(user)}>
        <Avatar name={user.name} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium text-slate-900">{user.name}</span>
            <RoleBadge role={user.role} />
          </div>
          <p className="truncate text-xs text-slate-500">
            {user.email} · registered {formatDate(user.createdAt) || "just now"}
          </p>
          {summary && <p className="truncate text-xs text-slate-400">{summary}</p>}
        </div>
      </button>
      <ReviewActions user={user} />
    </li>
  );
};

/** Super admin overview: approval queue and platform-wide numbers. */
export const AdminDashboard = () => {
  const { users, loading } = useAllUsers();
  const { data: posts } = useLiveQuery(() => query(collection(db, "posts")), []);
  const [messages, setMessages] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCountFromServer(collection(db, "chatMessages"))
      .then((s) => setMessages(s.data().count))
      .catch(() => setMessages("–"));
  }, []);

  const pending = users.filter((u) => u.status === "pending");
  const approved = (role) => users.filter((u) => u.role === role && u.status === "approved").length;
  const current = selected && users.find((u) => u.uid === selected.uid);

  return (
    <>
      <PageHeader
        title="Super Admin"
        subtitle="Verify new accounts and keep an eye on everything happening on Alumni Hub."
        actions={
          <Link to="/admin/users" className="btn btn-primary">
            Manage users
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Pending" value={loading ? null : pending.length} icon={Clock} tone="amber" />
        <StatCard label="Students" value={loading ? null : approved("student")} icon={GraduationCap} tone="blue" />
        <StatCard label="Teachers" value={loading ? null : approved("teacher")} icon={Presentation} tone="emerald" />
        <StatCard label="Alumni" value={loading ? null : approved("alumni")} icon={Building2} tone="violet" />
        <StatCard label="Posts" value={posts.length} icon={FileText} tone="blue" />
        <StatCard label="Messages" value={messages} icon={MessagesSquare} tone="emerald" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Waiting for approval {pending.length > 0 && `(${pending.length})`}</h2>
          {pending.length > 0 && (
            <Link to="/admin/users?status=pending" className="text-sm font-semibold text-blue-600 hover:underline">
              View all
            </Link>
          )}
        </div>
        {loading ? (
          <Spinner />
        ) : pending.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All caught up" text="New registrations will appear here for you to verify." />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {pending.map((u) => (
              <PendingRow key={u.uid} user={u} onOpen={setSelected} />
            ))}
          </ul>
        )}
      </section>

      <UserDetailsModal user={current} onClose={() => setSelected(null)} />
    </>
  );
};
