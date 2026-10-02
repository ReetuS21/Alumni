import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, Sparkles, ArrowRight, ShieldCheck, Database, CheckCircle } from "lucide-react";

export const AuthPage = () => {
  const { login, register, demoLogin, isFirebaseActive } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student"); // student | teacher | alumni
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, name, selectedRole);
      } else {
        await login(email, password, selectedRole);
      }
      navigate(`/${selectedRole}`);
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = (role) => {
    demoLogin(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100/10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Hub</h1>
          <p className="text-xs text-slate-500 mt-1">Role-Based Networking & Referral Platform</p>
        </div>

        {/* 3-Way Role Toggle */}
        <div className="bg-slate-100 p-1.5 rounded-2xl mb-6 flex space-x-1">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "student"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("teacher")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "teacher"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            👨‍🏫 Teacher
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("alumni")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "alumni"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💼 Alumni
          </button>
        </div>

        {/* Firebase Config Notice */}
        {!isFirebaseActive && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start space-x-2">
            <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Firebase Placeholder Mode Active:</span> You can sign in using any email or use the instant 1-click preview buttons below!
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === "student"
                    ? "student@institute.edu"
                    : selectedRole === "teacher"
                    ? "teacher@institute.edu"
                    : "alumni@company.com"
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{isSignUp ? `Register as ${selectedRole}` : `Sign In as ${selectedRole}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login/SignUp */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-600 hover:underline font-semibold"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Register here"}
          </button>
        </div>

        {/* Quick Demo Preview Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Instant 1-Click Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleInstantDemo("student")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold py-2 rounded-xl border border-blue-200 transition-all text-center"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleInstantDemo("teacher")}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-xl border border-emerald-200 transition-all text-center"
            >
              Demo Teacher
            </button>
            <button
              onClick={() => handleInstantDemo("alumni")}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold py-2 rounded-xl border border-purple-200 transition-all text-center"
            >
              Demo Alumni
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
