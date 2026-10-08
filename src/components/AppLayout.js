import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  UserSearch,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ActivityProvider, useActivity } from "../context/ActivityContext";
import { PeopleProvider, PersonAvatar } from "../context/PeopleContext";
import { useAllUsers } from "./admin/AdminUserTools";
import { RoleBadge } from "./ui";

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
    { to: "/teacher/alumni", label: "Alumni", icon: Building2 },
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
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/users", label: "Users & Approvals", icon: ShieldCheck },
    { to: "/admin/roll-list", label: "Roll List", icon: ListChecks },
    { to: "/admin/content", label: "Content", icon: FileText },
    { to: "/discussion", label: "Discussion", icon: MessagesSquare },
  ],
};

// Shown for every role, below the role's own pages.
const COMMON_NAV = [
  { to: "/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: "bell" },
  { to: "/settings", label: "Settings", icon: Settings },
];

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className="ml-auto min-w-[1.25rem] rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

/** Pending-approval count for the admin's "Users & Approvals" link. */
const usePendingCount = (enabled) => {
  const { users } = useAllUsers(enabled);
  return users.filter((u) => u.status === "pending").length;
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

const NavItem = ({ to, label, icon: Icon, end, count, onNavigate }) => (
  <NavLink
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
    <CountBadge count={count} />
  </NavLink>
);

const SidebarContent = ({ user, counts, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col justify-between overflow-y-auto">
    <div className="space-y-6">
      <div className="px-2 pt-1">
        <Brand />
      </div>
      <nav className="space-y-1">
        {(NAV[user?.role] || []).map((item) => (
          <NavItem key={item.to} {...item} count={item.to === "/admin/users" ? counts.pending : 0} onNavigate={onNavigate} />
        ))}
      </nav>
      <nav className="space-y-1 border-t border-slate-100 pt-4">
        {COMMON_NAV.map((item) => (
          <NavItem key={item.to} {...item} count={counts[item.badge] || 0} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>

    {user && (
      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-2">
          <PersonAvatar uid={user.uid} name={user.name} photoURL={user.photoURL} size="sm" />
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

const Shell = () => {
  const { user, logout } = useAuth();
  const { bellCount, unreadMessages } = useActivity();
  const pending = usePendingCount(user?.role === "admin");
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const counts = { bell: bellCount, messages: unreadMessages, pending };
  const total = bellCount + unreadMessages + pending;

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // Unread count in the browser tab title.
  useEffect(() => {
    document.title = total > 0 ? `(${total}) Alumni Hub` : "Alumni Hub";
  }, [total]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        <SidebarContent user={user} counts={counts} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <NavLink to="/notifications" className="btn btn-ghost relative p-2" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {bellCount > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />}
          </NavLink>
          <button className="btn btn-ghost relative p-2" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
            {unreadMessages + pending > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white p-4 shadow-xl">
            <button className="btn btn-ghost absolute right-3 top-3 z-10 p-1.5" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} counts={counts} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppLayout = () => (
  <PeopleProvider>
    <ActivityProvider>
      <Shell />
    </ActivityProvider>
  </PeopleProvider>
);
