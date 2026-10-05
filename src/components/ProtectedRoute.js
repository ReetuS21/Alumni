import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { dashboardPath, useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";
import { AccountStatusScreen } from "./AccountStatusScreen";

/**
 * Without `role`: requires a signed-in user whose role is stored in Firestore.
 * With `role`: the stored role must match, otherwise the user is sent to their own dashboard.
 * The role always comes from the users/{uid} document — never from the browser.
 */
export const ProtectedRoute = ({ role }) => {
  const { authUser, user, loading, connectionError, logout } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner full />;
  if (!authUser) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  if (!user && connectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md p-6 text-center">
          <h2 className="text-lg font-semibold">Can't reach the server</h2>
          <p className="mt-2 text-sm text-slate-500">Please check your internet connection and try again.</p>
          <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md p-6 text-center">
          <h2 className="text-lg font-semibold">Account not set up</h2>
          <p className="mt-2 text-sm text-slate-500">
            This login has no Alumni Hub role assigned. Please register again or contact the administrator.
          </p>
          <button className="btn btn-secondary mt-4" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // New accounts stay here until the super admin approves them (the screen updates live).
  if (user.role !== "admin" && user.status !== "approved") return <AccountStatusScreen />;

  if (role && user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />;
  return <Outlet />;
};
