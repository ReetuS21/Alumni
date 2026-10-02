import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ArrowRight, Database } from "lucide-react";

export const AuthPage = () => {
  const { login, register, demoLogin, isFirebaseActive } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
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
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = (role) => {
    demoLogin(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 shadow-xl border border-slate-200/80">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-xl font-black">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alumni Hub</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Role-Based Networking Platform</p>
        </div>

        {/* 3-Way Role Selector */}
        <div className="bg-[#f4f6fa] p-1.5 rounded-2xl mb-6 flex space-x-1">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "student"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("teacher")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "teacher"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("alumni")}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${
              selectedRole === "alumni"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Alumni
          </button>
        </div>

        {!isFirebaseActive && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Demo Mode Active:</strong> Use 1-click preview buttons below to explore instant accounts!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f4f6fa] text-slate-900 text-xs rounded-xl border-none focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full pl-9 pr-4 py-2.5 bg-[#f4f6fa] text-slate-900 text-xs rounded-xl border-none focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-[#f4f6fa] text-slate-900 text-xs rounded-xl border-none focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20 text-xs transition-all flex items-center justify-center space-x-2"
          >
            <span>{isSignUp ? `Register as ${selectedRole}` : `Sign In as ${selectedRole}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-600 hover:underline font-bold"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Register"}
          </button>
        </div>

        {/* Demo Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            1-Click Account Preview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleInstantDemo("student")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold py-2 rounded-xl border border-blue-200 transition-all text-center"
            >
              Student Account
            </button>
            <button
              onClick={() => handleInstantDemo("teacher")}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold py-2 rounded-xl border border-emerald-200 transition-all text-center"
            >
              Teacher Account
            </button>
            <button
              onClick={() => handleInstantDemo("alumni")}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold py-2 rounded-xl border border-purple-200 transition-all text-center"
            >
              Alumni Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
