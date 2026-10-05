import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Search,
  Star,
  UserRound,
  UserSearch,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, RoleBadge } from "./ui";
import { VerifyBanner } from "./VerifyBanner";

const NAV = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/student/profile", label: "Profile & Resume", icon: UserRound },
    { to: "/student/alumni", label: "Find Alumni", icon: Search },
    { to: "/student/applications", label: "My Applications", icon: ClipboardList },
    { to: "/discussion", label: "Discussion", icon: MessagesSquare },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/teacher/students", label: "Student Profiles", icon: Users },
    { to: "/discussion", label: "Discussion", icon: MessagesSquare },
    { to: "/teacher/profile", label: "My Profile", icon: UserRound },
  ],
  alumni: [
    { to: "/alumni", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/alumni/search", label: "Search Students", icon: UserSearch },
    { to: "/alumni/shortlist", label: "Shortlist & Referrals", icon: Star },
    { to: "/discussion", label: "Discussion", icon: MessagesSquare },
    { to: "/alumni/profile", label: "My Profile", icon: UserRound },
  ],
};

const Brand = () => (
  <div className="flex items-center gap-3">
    <img src={`${process.env.PUBLIC_URL}/alumnihublogo.png`} alt="" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
    <div>
      <p className="text-base font-bold leading-tight tracking-tight text-slate-900">Alumni Hub</p>
      <p className="text-[11px] font-medium text-slate-400">Students · Teachers · Alumni</p>
    </div>
  </div>
);

const SidebarContent = ({ user, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col justify-between">
    <div className="space-y-8">
      <div className="px-2 pt-1">
        <Brand />
      </div>
      <nav className="space-y-1">
        {(NAV[user?.role] || []).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>

    {user && (
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <RoleBadge role={user.role} />
        </div>
        <button onClick={onLogout} className="btn btn-ghost w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    )}
  </div>
);

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button className="btn btn-ghost p-2" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white p-4 shadow-xl">
            <button className="btn btn-ghost absolute right-3 top-3 p-1.5" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {user?.role === "student" && <VerifyBanner />}
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
