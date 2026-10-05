import React, { useEffect } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { initials } from "../utils/format";

export const Spinner = ({ label = "Loading…", full = false }) => (
  <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${full ? "min-h-screen" : "py-12"}`}>
    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    <span>{label}</span>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export const StatCard = ({ label, value, icon: Icon, tone = "blue", hint }) => (
  <div className="card flex items-center gap-4 p-4">
    {Icon && (
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value ?? "–"}</p>
      {hint && <p className="truncate text-[11px] text-slate-400">{hint}</p>}
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon = Info, title, text, action }) => (
  <div className="card flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const ALERT_STYLES = {
  error: { cls: "bg-rose-50 text-rose-800 ring-rose-200", Icon: AlertTriangle },
  success: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CheckCircle2 },
  info: { cls: "bg-blue-50 text-blue-800 ring-blue-200", Icon: Info },
  warning: { cls: "bg-amber-50 text-amber-800 ring-amber-200", Icon: AlertTriangle },
};

export const Alert = ({ tone = "info", children, className = "" }) => {
  if (!children) return null;
  const { cls, Icon } = ALERT_STYLES[tone];
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ring-1 ring-inset ${cls} ${className}`} role="alert">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

const AVATAR_SIZES = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };
const AVATAR_COLORS = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];

export const Avatar = ({ name, photoURL, size = "md" }) => {
  const sizeCls = AVATAR_SIZES[size];
  if (photoURL) return <img src={photoURL} alt="" className={`${sizeCls} shrink-0 rounded-full object-cover`} />;
  const color = AVATAR_COLORS[(name || "").length % AVATAR_COLORS.length];
  return (
    <span className={`${sizeCls} ${color} inline-flex shrink-0 items-center justify-center rounded-full font-semibold`} aria-hidden="true">
      {initials(name)}
    </span>
  );
};

const ROLE_STYLES = {
  student: "bg-blue-50 text-blue-700 ring-blue-200",
  teacher: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  alumni: "bg-violet-50 text-violet-700 ring-violet-200",
};
const ROLE_LABEL = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

export const RoleBadge = ({ role }) =>
  role ? <span className={`badge ${ROLE_STYLES[role] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>{ROLE_LABEL[role] || role}</span> : null;

const TYPE_STYLES = {
  hiring: ["Hiring", "bg-blue-50 text-blue-700 ring-blue-200"],
  test: ["Skill Test", "bg-violet-50 text-violet-700 ring-violet-200"],
  notice: ["Notice", "bg-amber-50 text-amber-700 ring-amber-200"],
  poll: ["Poll", "bg-cyan-50 text-cyan-700 ring-cyan-200"],
};

export const PostTypeBadge = ({ type }) => {
  const [label, cls] = TYPE_STYLES[type] || [type, "bg-slate-50 text-slate-600 ring-slate-200"];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const STATUS_STYLES = {
  applied: "bg-slate-50 text-slate-700 ring-slate-200",
  shortlisted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  referred: "bg-violet-50 text-violet-700 ring-violet-200",
};

export const StatusBadge = ({ status }) => (
  <span className={`badge capitalize ${STATUS_STYLES[status] || STATUS_STYLES.applied}`}>{status}</span>
);

export const VerifiedBadge = ({ verification, showScore = false }) => {
  if (verification?.status !== "verified") return null;
  return (
    <span className="badge bg-emerald-50 text-emerald-700 ring-emerald-200" title="Skills verified by the AI Skill Verification Engine">
      <BadgeCheck className="h-3 w-3" />
      Verified{showScore && verification.score != null ? ` · ${verification.score}%` : ""}
    </span>
  );
};

export const Modal = ({ open, onClose, title, children, footer, wide = false }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="btn btn-ghost -mr-2 p-1.5" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

export const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    {label && <span className="label">{label}</span>}
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
  </label>
);

export const SegmentedControl = ({ options, value, onChange }) => (
  <div className="flex rounded-xl bg-slate-100 p-1">
    {options.map((opt) => {
      const Icon = opt.icon;
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
            active ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

export const FilterChips = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition ${
          value === o.value ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);
