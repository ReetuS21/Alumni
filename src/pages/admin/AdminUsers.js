import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Search, Users } from "lucide-react";
import { formatDate, includesText } from "../../utils/format";
import { downloadCsv } from "../../utils/csv";
import { ReviewActions, UserDetailsModal, useAllUsers } from "../../components/admin/AdminUserTools";
import { PersonAvatar } from "../../context/PeopleContext";
import { Alert, EmptyState, FilterChips, PageHeader, RoleBadge, Spinner, StatusBadge } from "../../components/ui";

const STATUSES = ["all", "pending", "approved", "rejected", "suspended"];

/** Every account on the platform with approve / reject / suspend controls. */
export const AdminUsers = () => {
  const { users, loading, error } = useAllUsers();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get("status")) ? params.get("status") : "all";
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = users.filter(
    (u) =>
      (status === "all" || u.status === status) &&
      (role === "all" || u.role === role) &&
      (!search.trim() || [u.name, u.email].some((f) => includesText(f, search)))
  );
  const count = (s) => users.filter((u) => (s === "all" || u.status === s) && (role === "all" || u.role === role)).length;
  const current = selected && users.find((u) => u.uid === selected.uid);

  const exportCsv = () =>
    downloadCsv(
      `users-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Email", "Email verified", "Role", "Status", "Registered", "Reviewed by", "Note"],
      filtered.map((u) => [u.name, u.email, u.emailVerified ? "Yes" : "No", u.role, u.status, formatDate(u.createdAt), u.reviewedBy || "", u.reviewNote || ""])
    );

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Approve, suspend and review accounts."
        actions={
          <button className="btn btn-secondary" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export ({filtered.length})
          </button>
        }
      />

      <div className="card space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-44" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
        <FilterChips
          options={STATUSES.map((s) => ({ value: s, label: `${s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)} (${count(s)})` }))}
          value={status}
          onChange={(s) => setParams(s === "all" ? {} : { status: s })}
        />
      </div>

      {error && <Alert tone="error">Could not load users: {error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading users…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No accounts here" text="Try a different filter." />
      ) : (
        <ul className="card divide-y divide-slate-100">
          {filtered.map((u) => (
            <li key={u.uid} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setSelected(u)}>
                <PersonAvatar uid={u.uid} name={u.name} photoURL={u.photoURL} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 hover:text-blue-700">{u.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {u.email} {u.emailVerified && <span className="text-emerald-600" title="Email verified">✓</span>}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2 md:w-48">
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
              </div>
              <p className="text-xs text-slate-400 md:w-28">{formatDate(u.createdAt) || "—"}</p>
              <div className="flex items-center gap-2 md:w-56 md:justify-end">
                <ReviewActions user={u} />
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(u)}>
                  Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <UserDetailsModal user={current} onClose={() => setSelected(null)} />
    </>
  );
};
