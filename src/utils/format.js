/** Accepts a Firestore Timestamp, Date, ISO string or millis. */
export const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Millis for client-side sorting. Missing values use `fallback` (default "now", which suits pending server timestamps). */
export const millis = (value, fallback = Date.now()) => toDate(value)?.getTime() ?? fallback;

export const formatDate = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
};

export const formatTime = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
};

export const timeAgo = (value) => {
  const d = toDate(value);
  if (!d) return "just now";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(d);
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

export const includesText = (haystack, needle) =>
  String(haystack || "")
    .toLowerCase()
    .includes(String(needle || "").toLowerCase().trim());

/** Ensure links have a protocol so they open correctly. */
export const toUrl = (link) => {
  if (!link) return "";
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
};
