import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Briefcase, GraduationCap, MessagesSquare, ShieldCheck, FileText } from "lucide-react";
import { dashboardPath, useAuth } from "../context/AuthContext";
import { friendlyError } from "../utils/authErrors";
import { Alert, Field, SegmentedControl, Spinner } from "../components/ui";

const ROLE_OPTIONS = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "teacher", label: "Teacher", icon: BookOpen },
  { value: "alumni", label: "Alumni", icon: Briefcase },
];

const FEATURES = [
  { icon: MessagesSquare, text: "One live discussion space for students, teachers and alumni" },
  { icon: FileText, text: "Build your profile once and export an ATS-friendly resume" },
  { icon: ShieldCheck, text: "Alumni find juniors by skill and refer them directly" },
];

export const AuthPage = () => {
  const { authUser, user, loading, login, logout, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", department: "", designation: "", company: "", jobRole: "", batch: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  // While submitting, stay on this page so errors from the later registration steps can be shown.
  if (loading && !busy) return <Spinner full />;
  if (authUser && user && !busy) return <Navigate to={dashboardPath(user.role)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isSignUp = mode === "signup";
  const isReset = mode === "reset";
  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (isReset) {
      setBusy(true);
      try {
        await resetPassword(form.email.trim());
        setNotice("If an account exists for this email, a password reset link is on its way. Check your inbox and spam folder.");
      } catch (err) {
        // Don't reveal whether an address is registered.
        if (err.code === "auth/user-not-found") setNotice("If an account exists for this email, a password reset link is on its way. Check your inbox and spam folder.");
        else setError(friendlyError(err));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (isSignUp && !agreed) {
      setError("Please accept the Terms of Use and Privacy Policy to continue.");
      return;
    }
    if (isSignUp && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      let userRole;
      if (isSignUp) {
        userRole = await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role,
          extra: { department: form.department.trim(), designation: form.designation.trim(), company: form.company.trim(), jobRole: form.jobRole.trim(), batch: form.batch.trim() },
        });
      } else {
        userRole = await login(form.email.trim(), form.password);
        if (!userRole) {
          await logout();
          throw new Error("This account has no Alumni Hub role. Please register again or contact the administrator.");
        }
      }
      navigate(dashboardPath(userRole), { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img src={`${process.env.PUBLIC_URL}/alumnihublogo.png`} alt="" className="h-11 w-11 rounded-xl bg-white/10 object-cover" />
          <span className="text-xl font-bold">Alumni Hub</span>
        </div>
        <div className="max-w-md space-y-8">
          <h1 className="text-4xl font-bold leading-tight text-white">One campus, three roles, one conversation.</h1>
          <p className="text-lg text-blue-100">A profile that works as a resume, and a network that turns into referrals.</p>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-blue-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-blue-200">MCA Project · Role-Based Networking and Referral Platform</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={`${process.env.PUBLIC_URL}/alumnihublogo.png`} alt="" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold">Alumni Hub</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">{isReset ? "Reset your password" : isSignUp ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isReset
              ? "Enter the email you registered with and we will send you a link to choose a new password."
              : isSignUp
              ? "Choose your role. New accounts are checked by the administrator before they can be used."
              : "Sign in to continue to your dashboard."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <>
                <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />
                <Field label="Full name">
                  <input required maxLength={80} className="input" autoComplete="name" value={form.name} onChange={set("name")} />
                </Field>
              </>
            )}

            <Field label="Email">
              <input required type="email" className="input" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </Field>
            {!isReset && (
              <Field label="Password">
                <input required type="password" minLength={6} className="input" autoComplete={isSignUp ? "new-password" : "current-password"} value={form.password} onChange={set("password")} />
              </Field>
            )}
            {mode === "signin" && (
              <div className="-mt-2 text-right">
                <button type="button" className="text-xs font-semibold text-blue-600 hover:underline" onClick={() => switchMode("reset")}>
                  Forgot password?
                </button>
              </div>
            )}

            {isSignUp && (
              <Field label="Confirm password">
                <input required type="password" minLength={6} className="input" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
              </Field>
            )}

            {isSignUp && role === "teacher" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Department">
                  <input required className="input" value={form.department} onChange={set("department")} placeholder="Computer Applications" />
                </Field>
                <Field label="Designation">
                  <input required className="input" value={form.designation} onChange={set("designation")} placeholder="Assistant Professor" />
                </Field>
              </div>
            )}
            {isSignUp && role === "alumni" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current company">
                  <input required className="input" value={form.company} onChange={set("company")} />
                </Field>
                <Field label="Job role">
                  <input required className="input" value={form.jobRole} onChange={set("jobRole")} />
                </Field>
                <Field label="Graduation batch" className="sm:col-span-2">
                  <input className="input" value={form.batch} onChange={set("batch")} placeholder="e.g. MCA 2021" />
                </Field>
              </div>
            )}

            {isSignUp && (
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="font-semibold text-blue-600 hover:underline">
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="font-semibold text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}

            <Alert tone="error">{error}</Alert>
            <Alert tone="success">{notice}</Alert>

            <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5">
              {busy ? "Please wait…" : isReset ? "Send reset link" : isSignUp ? `Create ${role} account` : "Sign in"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isReset ? "Remembered it?" : isSignUp ? "Already have an account?" : "New to Alumni Hub?"}{" "}
            <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={() => switchMode(isSignUp || isReset ? "signin" : "signup")}>
              {isSignUp || isReset ? "Sign in" : "Create an account"}
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-slate-400">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            {" · "}
            <Link to="/terms" className="hover:underline">
              Terms of Use
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
