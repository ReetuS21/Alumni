import jsPDF from "jspdf";

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * Generates an ATS-Friendly Single-Column PDF Resume rendered with the Open Sauce Sans font.
 */
export const exportATSResume = async (profile) => {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter"
  });

  let fontName = "helvetica";

  try {
    const regFontRes = await fetch('/fonts/OpenSauceSans-Regular.ttf');
    const boldFontRes = await fetch('/fonts/OpenSauceSans-Bold.ttf');
    
    if (regFontRes.ok && boldFontRes.ok) {
      const regBuffer = await regFontRes.arrayBuffer();
      const boldBuffer = await boldFontRes.arrayBuffer();
      
      const regBase64 = arrayBufferToBase64(regBuffer);
      const boldBase64 = arrayBufferToBase64(boldBuffer);
      
      doc.addFileToVFS('OpenSauceSans-Regular.ttf', regBase64);
      doc.addFont('OpenSauceSans-Regular.ttf', 'OpenSauceSans', 'normal');
      
      doc.addFileToVFS('OpenSauceSans-Bold.ttf', boldBase64);
      doc.addFont('OpenSauceSans-Bold.ttf', 'OpenSauceSans', 'bold');
      
      fontName = "OpenSauceSans";
    }
  } catch (e) {
    console.warn("Falling back to standard font for PDF generation:", e);
  }

  const margin = 40;
  let y = 50;
  const pageHeight = doc.internal.pageSize.height;
  const lineSpacing = 16;

  const addHeading = (text) => {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 50;
    }
    doc.setFont(fontName, "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(text.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.line(margin, y, 570, y);
    y += 16;
  };

  const addBodyText = (text, isBold = false) => {
    if (!text) return;
    doc.setFont(fontName, isBold ? "bold" : "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const lines = doc.splitTextToSize(text, 530);
    lines.forEach(line => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, margin, y);
      y += lineSpacing;
    });
  };

  // Header - 1. Name
  doc.setFont(fontName, "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name || "Student Name", margin, y);
  y += 24;

  // Header - 2. Tagline / Designation & Contact Line
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const contactParts = [
    profile.designation,
    profile.email,
    profile.location,
    profile.links?.linkedin,
    profile.links?.portfolio
  ].filter(Boolean);

  addBodyText(contactParts.join(" | "));
  y += 10;

  // 3. Professional Summary
  if (profile.summary) {
    addHeading("Professional Summary");
    addBodyText(profile.summary);
    y += 10;
  }

  // 4. Experience & Internships
  if (profile.experience && profile.experience.length > 0) {
    addHeading("Experience & Internships");
    profile.experience.forEach(exp => {
      addBodyText(`${exp.title} - ${exp.organization}`, true);
      addBodyText(`Duration: ${exp.duration || "N/A"}`);
      y += 4;
    });
    y += 10;
  }

  // 5. Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    addHeading("Certifications");
    const certsText = Array.isArray(profile.certifications) ? profile.certifications.join("\n• ") : profile.certifications;
    addBodyText(`• ${certsText}`);
    y += 10;
  }

  // 6. Skills
  if (profile.skills && profile.skills.length > 0) {
    addHeading("Technical Skills");
    addBodyText(`Skills: ${profile.skills.join(", ")}`);
    if (profile.tools && profile.tools.length > 0) {
      addBodyText(`Tools & Technologies: ${Array.isArray(profile.tools) ? profile.tools.join(", ") : profile.tools}`);
    }
    y += 10;
  }

  // 7. Languages Known
  addHeading("Languages & Education");
  addBodyText("Degree: Master of Computer Applications (MCA)");
  if (profile.languages) {
    const langs = Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages;
    addBodyText(`Languages Known: ${langs}`);
  }

  // Download PDF
  const filename = `${(profile.name || "Resume").replace(/\s+/g, "_")}_ATS_Resume.pdf`;
  doc.save(filename);
};
