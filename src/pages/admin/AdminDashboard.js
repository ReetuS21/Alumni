import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getCountFromServer, query } from "firebase/firestore";
import { Building2, Check, CheckCircle2, Clock, FileText, GraduationCap, MessagesSquare, Presentation } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { PersonAvatar } from "../../context/PeopleContext";
import { reviewUser } from "../../services/api";
import { useLiveQuery } from "../../hooks/useLive";
import { formatDate } from "../../utils/format";
import { EmailBadge, ReviewActions, UserDetailsModal, detailLines, useAllUsers, useRegistrationDetails } from "../../components/admin/AdminUserTools";
import { Alert, EmptyState, PageHeader, RoleBadge, Spinner, StatCard } from "../../components/ui";

const PendingRow = ({ user, onOpen, checked, onCheck }) => {
  const details = useRegistrationDetails(user);
  const summary = detailLines(user, details)
    .filter(([, v]) => v)
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <input type="checkbox" className="hidden h-4 w-4 rounded border-slate-300 sm:block" checked={checked} onChange={(e) => onCheck(e.target.checked)} aria-label={`Select ${user.name}`} />
      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => onOpen(user)}>
        <PersonAvatar uid={user.uid} name={user.name} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium text-slate-900">{user.name}</span>
            <RoleBadge role={user.role} />
            <EmailBadge verified={user.emailVerified} />
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
  const { user: admin } = useAuth();
  const [checked, setChecked] = useState({});
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState("");

  useEffect(() => {
    getCountFromServer(collection(db, "chatMessages"))
      .then((s) => setMessages(s.data().count))
      .catch(() => setMessages("–"));
  }, []);

  const pending = users.filter((u) => u.status === "pending");
  const approved = (role) => users.filter((u) => u.role === role && u.status === "approved").length;
  const current = selected && users.find((u) => u.uid === selected.uid);
  const chosen = pending.filter((u) => checked[u.uid]);

  const approveChosen = async () => {
    if (!window.confirm(`Approve ${chosen.length} account${chosen.length === 1 ? "" : "s"}?`)) return;
    setBulkBusy(true);
    setBulkError("");
    try {
      await Promise.all(chosen.map((u) => reviewUser(admin, u, "approved")));
      setChecked({});
    } catch (e) {
      setBulkError("Some accounts could not be approved. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={chosen.length === pending.length}
                  onChange={(e) => setChecked(e.target.checked ? Object.fromEntries(pending.map((u) => [u.uid, true])) : {})}
                />
                Select all
              </label>
              {chosen.length > 0 && (
                <button className="btn btn-success btn-sm" disabled={bulkBusy} onClick={approveChosen}>
                  <Check className="h-3.5 w-3.5" /> Approve {chosen.length}
                </button>
              )}
              <Link to="/admin/users?status=pending" className="text-sm font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>
          )}
        </div>
        <Alert tone="error">{bulkError}</Alert>
        {loading ? (
          <Spinner />
        ) : pending.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All caught up" text="New registrations will appear here for you to verify." />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {pending.map((u) => (
              <PendingRow key={u.uid} user={u} onOpen={setSelected} checked={Boolean(checked[u.uid])} onCheck={(on) => setChecked((c) => ({ ...c, [u.uid]: on }))} />
            ))}
          </ul>
        )}
      </section>

      <UserDetailsModal user={current} onClose={() => setSelected(null)} />
    </>
  );
};
