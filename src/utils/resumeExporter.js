import jsPDF from "jspdf";
import { normalizeStudentProfile } from "./profile";

const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
};

const loadFonts = async (pdf) => {
  try {
    const base = process.env.PUBLIC_URL || "";
    const [reg, bold] = await Promise.all([
      fetch(`${base}/fonts/OpenSauceSans-Regular.ttf`),
      fetch(`${base}/fonts/OpenSauceSans-Bold.ttf`),
    ]);
    // A missing file can come back as the SPA's index.html with status 200 — make sure these are real fonts.
    const isFont = (r) => r.ok && !(r.headers.get("content-type") || "").includes("text/html");
    if (!isFont(reg) || !isFont(bold)) return "helvetica";
    pdf.addFileToVFS("OpenSauceSans-Regular.ttf", arrayBufferToBase64(await reg.arrayBuffer()));
    pdf.addFont("OpenSauceSans-Regular.ttf", "OpenSauceSans", "normal");
    pdf.addFileToVFS("OpenSauceSans-Bold.ttf", arrayBufferToBase64(await bold.arrayBuffer()));
    pdf.addFont("OpenSauceSans-Bold.ttf", "OpenSauceSans", "bold");
    return "OpenSauceSans";
  } catch (e) {
    console.warn("Falling back to Helvetica for the resume PDF:", e);
    return "helvetica";
  }
};

/**
 * ATS-friendly resume export (Module 3).
 * Single column, real selectable text, standard section headings.
 * Deliberately no tables, columns, images, icons or text boxes — ATS parsers fail on those.
 */
export const exportATSResume = async (rawProfile) => {
  try {
    await buildResume(rawProfile);
  } catch (e) {
    console.error("Resume export failed:", e);
    window.alert("Sorry, the resume could not be generated. Please try again.");
  }
};

const buildResume = async (rawProfile) => {
  const profile = normalizeStudentProfile(rawProfile);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const font = await loadFonts(pdf);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  let y = margin + 6;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const write = (text, { size = 10.5, bold = false, gap = 3, color = 40 } = {}) => {
    if (!text) return;
    pdf.setFont(font, bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(color, color, color);
    const lineHeight = size * 1.4;
    pdf.splitTextToSize(String(text), maxWidth).forEach((line) => {
      ensureSpace(lineHeight);
      pdf.text(line, margin, y);
      y += lineHeight;
    });
    y += gap;
  };

  // Height of the next text block, so headings and entries are never split from their first lines.
  const blockHeight = (text, size = 10.5) => (text ? pdf.splitTextToSize(String(text), maxWidth).length * size * 1.4 : 0);

  const heading = (title) => {
    ensureSpace(30 + 2 * 10.5 * 1.4);
    y += 10;
    pdf.setFont(font, "bold");
    pdf.setFontSize(11.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(title.toUpperCase(), margin, y);
    y += 5;
    pdf.setDrawColor(120, 120, 120);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 15;
  };

  const clean = (arr) => (arr || []).map((s) => String(s).trim()).filter(Boolean);

  // ---- Header ----
  write(profile.name || "Your Name", { size: 20, bold: true, gap: 2, color: 0 });
  if (profile.designation) write(profile.designation, { size: 11.5, gap: 3 });
  write([profile.email, profile.phone, profile.location].filter(Boolean).join("  |  "), { size: 10, gap: 1 });
  const { links } = profile;
  [
    links.linkedin && `LinkedIn: ${links.linkedin}`,
    links.github && `GitHub: ${links.github}`,
    links.portfolio && `Portfolio: ${links.portfolio}`,
    links.other && `Other: ${links.other}`,
  ]
    .filter(Boolean)
    .forEach((line) => write(line, { size: 10, gap: 0 }));

  // ---- Summary ----
  if (profile.summary) {
    heading("Professional Summary");
    write(profile.summary);
  }

  // ---- Skills ----
  const skills = clean(profile.skills);
  const tools = clean(profile.tools);
  if (skills.length || tools.length) {
    heading("Skills");
    if (skills.length) write(`Technical Skills: ${skills.join(", ")}`);
    if (tools.length) write(`Tools and Technologies: ${tools.join(", ")}`);
  }

  // ---- Experience ----
  const experience = profile.experience.filter((e) => e.title || e.organization);
  if (experience.length) {
    heading("Experience");
    experience.forEach((e) => {
      ensureSpace(blockHeight(`${e.title}, ${e.organization}`) + 2 * 14 + 4);
      write([e.title, e.organization].filter(Boolean).join(", "), { bold: true, gap: 0, color: 0 });
      const mode = e.mode === "virtual" ? "Virtual Internship" : "Onsite Internship";
      const dates = [e.startDate, e.endDate].filter(Boolean).join(" to ");
      write([mode, dates].filter(Boolean).join("  |  "), { size: 10, gap: 2, color: 70 });
      (e.description || "")
        .split("\n")
        .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
        .filter(Boolean)
        .forEach((l) => write(`- ${l}`, { gap: 0 }));
      y += 6;
    });
  }

  // ---- Education ----
  const education = profile.education.filter((e) => e.degree || e.institution);
  if (education.length) {
    heading("Education");
    education.forEach((e) => {
      ensureSpace(blockHeight(`${e.degree}, ${e.institution}`) + 14 + 6);
      write([e.degree, e.institution].filter(Boolean).join(", "), { bold: true, gap: 0, color: 0 });
      write([e.year, e.score && `Score: ${e.score}`].filter(Boolean).join("  |  "), { size: 10, gap: 6, color: 70 });
    });
  }

  // ---- Certifications ----
  const certs = profile.certifications.filter((c) => c.name);
  if (certs.length) {
    heading("Certifications");
    certs.forEach((c) => write(`- ${[c.name, c.issuer, c.year].filter(Boolean).join(", ")}`, { gap: 0 }));
    y += 3;
  }

  // ---- Languages ----
  const languages = clean(profile.languages);
  if (languages.length) {
    heading("Languages");
    write(languages.join(", "));
  }

  pdf.setProperties({ title: `${profile.name || "Resume"} - Resume`, author: profile.name || "" });
  pdf.save(`${(profile.name || "Resume").replace(/[^a-z0-9]+/gi, "_")}_Resume.pdf`);
};
