import React from "react";
import { Ban, Clock, LogOut, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "./ui";
import { EmailVerification } from "../pages/shared/SettingsPage";

const CONTENT = {
  pending: {
    icon: Clock,
    tone: "bg-amber-50 text-amber-600",
    title: "Waiting for approval",
    text: "Every new account is reviewed. You'll be let in automatically once it's approved.",
  },
  rejected: {
    icon: XCircle,
    tone: "bg-rose-50 text-rose-600",
    title: "Registration not approved",
    text: "This account couldn't be verified. Contact your institute if this is a mistake.",
  },
  suspended: {
    icon: Ban,
    tone: "bg-rose-50 text-rose-600",
    title: "Account suspended",
    text: "Access has been paused. Contact your institute for help.",
  },
};

/** Shown instead of the app while an account is pending, rejected or suspended. Updates live. */
export const AccountStatusScreen = () => {
  const { user, logout } = useAuth();
  const c = CONTENT[user.status] || CONTENT.pending;
  const Icon = c.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="card w-full max-w-md p-6 text-center sm:p-8">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${c.tone}`}>
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold">{c.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{c.text}</p>
        {user.reviewNote && user.status !== "pending" && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-slate-600">
            <span className="font-semibold">Note from the administrator:</span> {user.reviewNote}
          </p>
        )}
        {user.status === "pending" && (
          <div className="mt-5 rounded-lg border border-slate-200 p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">While you wait</p>
            <EmailVerification />
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="truncate">{user.email}</span>
          <RoleBadge role={user.role} />
        </div>
        <button className="btn btn-secondary mt-6" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
};
