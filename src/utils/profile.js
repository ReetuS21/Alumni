/** Shape of a student profile (studentProfiles/{uid}). */
export const emptyStudentProfile = () => ({
  designation: "",
  summary: "",
  phone: "",
  location: "",
  photoURL: "",
  skills: [],
  tools: [],
  languages: [],
  experience: [], // { id, title, organization, mode: "onsite" | "virtual", startDate, endDate, description }
  education: [], // { id, degree, institution, year, score }
  certifications: [], // { id, name, issuer, year, url }
  links: { portfolio: "", linkedin: "", github: "", other: "" },
});

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Fills missing fields and upgrades older data shapes (e.g. certifications stored as strings). */
export const normalizeStudentProfile = (raw = {}) => {
  const base = emptyStudentProfile();
  const p = { ...base, ...raw, links: { ...base.links, ...(raw.links || {}) } };
  const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  p.skills = arr(p.skills);
  p.tools = arr(p.tools);
  p.languages = arr(p.languages);
  p.experience = arr(p.experience).map((e) => ({
    id: e.id ? String(e.id) : newId(),
    title: e.title || "",
    organization: e.organization || e.organisation || "",
    mode: e.mode === "virtual" ? "virtual" : "onsite",
    startDate: e.startDate || "",
    endDate: e.endDate || e.duration || "",
    description: e.description || "",
  }));
  p.education = arr(p.education).map((e) => ({ id: e.id ? String(e.id) : newId(), ...e }));
  p.certifications = arr(p.certifications).map((c) =>
    typeof c === "string" ? { id: newId(), name: c, issuer: "", year: "", url: "" } : { id: c.id || newId(), ...c }
  );
  return p;
};

/** Rough completeness score used to nudge students to finish their profile. */
export const profileCompleteness = (p) => {
  const checks = [
    Boolean(p.name),
    Boolean(p.designation),
    (p.summary || "").length >= 40,
    (p.skills || []).length >= 3,
    (p.tools || []).length >= 1,
    (p.experience || []).length >= 1,
    (p.education || []).length >= 1,
    (p.certifications || []).length >= 1,
    (p.languages || []).length >= 1,
    Boolean(p.location),
    Boolean(p.links?.linkedin || p.links?.portfolio || p.links?.github),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

