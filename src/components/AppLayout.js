import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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

// `short` is the label used in the phone tab bar; `tab` marks the pages that get a tab there.
const NAV = {
  student: [
    { to: "/student", label: "Dashboard", short: "Home", icon: LayoutDashboard, end: true, tab: true },
    { to: "/student/profile", label: "Profile & Resume", short: "Profile", icon: UserRound, tab: true },
    { to: "/student/alumni", label: "Find Alumni", short: "Alumni", icon: Search, tab: true },
    { to: "/student/applications", label: "My Applications", icon: ClipboardList },
    { to: "/discussion", label: "Discussion", short: "Chat", icon: MessagesSquare, tab: true },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", short: "Home", icon: LayoutDashboard, end: true, tab: true },
    { to: "/teacher/students", label: "Students", short: "Students", icon: Users, tab: true },
    { to: "/teacher/alumni", label: "Alumni", short: "Alumni", icon: Building2, tab: true },
    { to: "/discussion", label: "Discussion", short: "Chat", icon: MessagesSquare, tab: true },
    { to: "/teacher/profile", label: "My Profile", icon: UserRound },
  ],
  alumni: [
    { to: "/alumni", label: "Dashboard", short: "Home", icon: LayoutDashboard, end: true, tab: true },
    { to: "/alumni/search", label: "Search Students", short: "Search", icon: UserSearch, tab: true },
    { to: "/alumni/shortlist", label: "Shortlist", short: "Shortlist", icon: Star, tab: true },
    { to: "/discussion", label: "Discussion", short: "Chat", icon: MessagesSquare, tab: true },
    { to: "/alumni/profile", label: "My Profile", icon: UserRound },
  ],
  admin: [
    { to: "/admin", label: "Overview", short: "Overview", icon: LayoutDashboard, end: true, tab: true },
    { to: "/admin/users", label: "Users", short: "Users", icon: ShieldCheck, tab: true, badge: "pending" },
    { to: "/admin/roll-list", label: "Roll List", short: "Roll list", icon: ListChecks, tab: true },
    { to: "/admin/content", label: "Content", short: "Content", icon: FileText, tab: true },
    { to: "/discussion", label: "Discussion", icon: MessagesSquare },
  ],
};

// Shown for every role, below the role's own pages.
const COMMON_NAV = [
  { to: "/messages", label: "Messages", short: "Messages", icon: MessageCircle, badge: "messages" },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: "bell" },
  { to: "/settings", label: "Settings", icon: Settings },
];

const CountBadge = ({ count, className = "ml-auto" }) =>
  count > 0 ? (
    <span className={`min-w-[1.125rem] rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

/** Pending-approval count for the admin's "Users" link. */
const usePendingCount = (enabled) => {
  const { users } = useAllUsers(enabled);
  return users.filter((u) => u.status === "pending").length;
};

const Brand = ({ compact = false }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <img src={`${process.env.PUBLIC_URL}/alumnihublogo.png`} alt="" className={`${compact ? "h-8 w-8" : "h-9 w-9"} rounded-lg object-cover`} />
    <span className="text-[15px] font-semibold tracking-tight text-slate-900">Alumni Hub</span>
  </Link>
);

const NavItem = ({ to, label, icon: Icon, end, count, onNavigate }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-blue-600" : ""}`} />
        {label}
        <CountBadge count={count} />
      </>
    )}
  </NavLink>
);

const SidebarContent = ({ user, counts, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col justify-between overflow-y-auto">
    <div className="space-y-6">
      <div className="px-2 pt-1">
        <Brand />
      </div>
      <nav className="space-y-0.5">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Menu</p>
        {(NAV[user?.role] || []).map((item) => (
          <NavItem key={item.to} {...item} count={counts[item.badge] || 0} onNavigate={onNavigate} />
        ))}
      </nav>
      <nav className="space-y-0.5">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Account</p>
        {COMMON_NAV.map((item) => (
          <NavItem key={item.to} {...item} count={counts[item.badge] || 0} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>

    {user && (
      <div className="mt-6 space-y-1 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-2">
          <PersonAvatar uid={user.uid} name={user.name} photoURL={user.photoURL} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    )}
  </div>
);

/** Phone-only tab bar with the role's main pages plus Messages. */
const TabBar = ({ role, counts }) => {
  const tabs = [...(NAV[role] || []).filter((i) => i.tab), COMMON_NAV[0]].slice(0, 5);
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden" aria-label="Main">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(({ to, short, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${isActive ? "text-blue-600" : "text-slate-400"}`}
          >
            <Icon className="h-[22px] w-[22px]" />
            <span className="max-w-full truncate px-1">{short || label}</span>
            <CountBadge count={counts[badge] || 0} className="absolute left-1/2 top-1 ml-2" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200/80 bg-white px-3 py-4 lg:block">
        <SidebarContent user={user} counts={counts} onLogout={handleLogout} />
      </aside>

      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand compact />
        <div className="-mr-2 flex items-center">
          <NavLink to="/notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell className="h-[22px] w-[22px]" />
            {bellCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />}
          </NavLink>
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu className="h-[22px] w-[22px]" />
            {pending > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />}
          </button>
        </div>
      </header>

      {/* Phone drawer (all pages) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 max-w-[85%] bg-white px-3 py-4 shadow-xl">
            <button className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} counts={counts} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <main className="mx-auto max-w-6xl space-y-5 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:space-y-6 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <TabBar role={user?.role} counts={counts} />
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
