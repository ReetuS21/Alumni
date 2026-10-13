/**
 * Email alerts through EmailJS's free plan (sent from the browser, no server needed).
 * Set REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, REACT_APP_EMAILJS_PUBLIC_KEY
 * and REACT_APP_ADMIN_ALERT_EMAIL to enable. Without them every call is a silent no-op.
 *
 * The EmailJS template uses: {{to_email}}, {{to_name}}, {{subject}}, {{message}}, {{link}}.
 */
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/** Inbox that receives "new registration" emails for the Super Admin. */
export const ADMIN_ALERT_EMAIL = process.env.REACT_APP_ADMIN_ALERT_EMAIL || "";

const appLink = (path = "/") => `${window.location.origin}${path}`;

/** Sends one email. Never throws — an email failure must not break the action that triggered it. */
export const sendEmail = async ({ toEmail, toName = "", subject, message, link = "/" }) => {
  if (!isEmailConfigured || !toEmail) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: { to_email: toEmail, to_name: toName, subject, message, link: appLink(link) },
      }),
    });
    if (!res.ok) console.warn("Email not sent:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.warn("Email not sent:", e);
    return false;
  }
};

const ROLE_LABEL = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

/** Super Admin: someone just created an account. */
export const emailAdminNewRegistration = ({ name, email, role }, { preapproved = false } = {}) =>
  sendEmail({
    toEmail: ADMIN_ALERT_EMAIL,
    toName: "Super Admin",
    subject: `New ${ROLE_LABEL[role] || role} registration on Alumni Hub: ${name}`,
    message: preapproved
      ? `${name} (${email}) registered as ${ROLE_LABEL[role] || role}. The email is on the roll list, so the account was approved automatically.`
      : `${name} (${email}) registered as ${ROLE_LABEL[role] || role} and is waiting for your approval.`,
    link: preapproved ? "/admin/users" : "/admin/users?status=pending",
  });

/** The person: their account was approved. */
export const emailAccountApproved = ({ name, email }) =>
  sendEmail({
    toEmail: email,
    toName: name,
    subject: "Your Alumni Hub account is approved",
    message: `Hi ${name}, your Alumni Hub account has been approved. You can now sign in and use every feature of the platform.`,
    link: "/auth",
  });
