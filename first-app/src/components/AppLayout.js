import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  Search,
  LogOut,
  Bell,
  Database,
  Info,
  Building,
  Briefcase,
  Users,
  FileText
} from "lucide-react";

export const AppLayout = ({ children, title = "Dashboard" }) => {
  const { user, logout, isFirebaseActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "teacher":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "alumni":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6fa] font-sans overflow-hidden text-slate-800">
      {/* 1. Left Vertical Sidebar (Matching Image 1 Aesthetic) */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 z-30 shrink-0">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div className="hidden lg:block">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Alumni Hub</h1>
              <span className="text-[11px] font-medium text-slate-400">MCA Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              to={user ? `/${user.role}` : "/auth"}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === `/${user?.role}`
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>

            <Link
              to={user ? `/${user.role}?tab=discussion` : "/auth"}
              className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">Discussion Box</span>
            </Link>

            {user?.role === "student" && (
              <Link
                to="/student?tab=profile"
                className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <User className="w-5 h-5 shrink-0" />
                <span className="hidden lg:inline">My Profile & Resume</span>
              </Link>
            )}

            {user?.role === "alumni" && (
              <Link
                to="/alumni?tab=search"
                className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <Users className="w-5 h-5 shrink-0" />
                <span className="hidden lg:inline">Student Directory</span>
              </Link>
            )}

            {user?.role === "teacher" && (
              <Link
                to="/teacher?tab=students"
                className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span className="hidden lg:inline">Student Roster</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Sign Out */}
        {user && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="hidden lg:flex items-center space-x-3 px-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                {user.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded border ${getRoleBadgeStyle(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center lg:justify-start space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Bar Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-20 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>

          {/* Search Input Bar (Matching Image 1 header) */}
          <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for opportunities, posts, members..."
              className="w-full bg-[#f4f6fa] border-none text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFirebaseModal(true)}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                isFirebaseActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFirebaseActive ? "Firebase Live" : "Demo Mode"}</span>
              <Info className="w-3 h-3 text-slate-400" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all">
              <Bell className="w-4 h-4" />
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Content View Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f4f6fa]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Firebase Status Info Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Firebase Connection Status</h3>
                <p className="text-xs text-slate-500">Database and authentication state</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-6">
              <p>
                <strong>Current Mode:</strong>{" "}
                <span className={isFirebaseActive ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {isFirebaseActive ? "Live Cloud Firestore & Firebase Auth" : "Demo Mode (Local Storage Active)"}
                </span>
              </p>
              <p>
                {isFirebaseActive
                  ? "Connected live to Firebase. User accounts, posts, applications, and chat messages are synchronized with Cloud Firestore."
                  : "Operating cleanly using an in-memory & LocalStorage database with sample data so you can test all features immediately before putting in your Firebase keys!"}
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                File: <code>.env.local</code><br />
                Key: <code>REACT_APP_FIREBASE_API_KEY</code>
              </div>
            </div>

            <button
              onClick={() => setShowFirebaseModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Close Info Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
