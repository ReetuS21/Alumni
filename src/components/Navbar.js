import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, ShieldCheck, Database, Info, Sparkles, MessageSquare } from "lucide-react";

export const Navbar = () => {
  const { user, logout, isFirebaseActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "teacher":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "alumni":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={process.env.PUBLIC_URL + "/alumnihublogo.png"} 
                alt="Alumni Hub Logo" 
                className="w-10 h-10 rounded-xl shadow-md object-cover overflow-hidden" 
              />
              <div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">Alumni Hub</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  MCA Platform
                </span>
              </div>
            </Link>

            {/* Firebase Status Badge */}
            <button
              onClick={() => setShowFirebaseModal(true)}
              className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                isFirebaseActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
              }`}
              title="Click for Firebase configuration details"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isFirebaseActive ? "Firebase Live" : "Demo Mode (Firebase Ready)"}</span>
              <Info className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* User Controls */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-slate-600 font-medium">Signed in as:</span>
                <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                <span
                  className={`capitalize text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>

              {/* Navigation Button to User's Dashboard */}
              <Link
                to={`/${user.role}`}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === `/${user.role}`
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                My Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>

      {/* Firebase Status Info Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Firebase Configuration Status</h3>
                <p className="text-xs text-slate-500">How the database and auth system is currently running</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p>
                <strong>Current Mode:</strong>{" "}
                <span className={isFirebaseActive ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                  {isFirebaseActive ? "Live Cloud Firestore & Firebase Auth" : "Demo Mode (Local Storage Fallback)"}
                </span>
              </p>
              <p>
                {isFirebaseActive
                  ? "Your app is connected live to Firebase. User accounts, posts, applications, and chat messages are synced to Cloud Firestore."
                  : "Firebase API keys in `.env.local` are currently set to placeholders. The app is fully functional using an in-memory & LocalStorage database with pre-populated demo data so you can test all features right away!"}
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
                File location: <code>.env.local</code><br />
                Key name: <code>REACT_APP_FIREBASE_API_KEY</code>
              </div>
            </div>

            <button
              onClick={() => setShowFirebaseModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              Got it, close info
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
