import React from "react";
import { Ban, Clock, LogOut, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "./ui";

const CONTENT = {
  pending: {
    icon: Clock,
    tone: "bg-amber-50 text-amber-600",
    title: "Your account is waiting for approval",
    text: "Thanks for registering! The administrator checks every new account to make sure it is genuine. You will be taken to your dashboard automatically as soon as it is approved — you can keep this page open or come back later.",
  },
  rejected: {
    icon: XCircle,
    tone: "bg-rose-50 text-rose-600",
    title: "Your registration was not approved",
    text: "The administrator could not verify this account. If you think this is a mistake, please contact your institute.",
  },
  suspended: {
    icon: Ban,
    tone: "bg-rose-50 text-rose-600",
    title: "Your account has been suspended",
    text: "Access to Alumni Hub has been paused by the administrator. Please contact your institute for help.",
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
