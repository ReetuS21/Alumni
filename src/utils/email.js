/**
 * Optional email alerts through EmailJS's free plan (sent from the browser, no server needed).
 * Set REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID and REACT_APP_EMAILJS_PUBLIC_KEY to enable.
 *
 * The template should use these variables: {{to_email}}, {{to_name}}, {{subject}}, {{message}}, {{link}}.
 * When the keys are missing every call is a silent no-op — in-app notifications still work.
 */
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/** Where "new registration" alerts for the super admin are sent. */
export const ADMIN_ALERT_EMAIL = process.env.REACT_APP_ADMIN_ALERT_EMAIL || "";

export const appLink = (path = "/") => `${window.location.origin}${path}`;

export const sendEmail = async ({ toEmail, toName = "", subject, message, link = "" }) => {
  if (!isEmailConfigured || !toEmail) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: { to_email: toEmail, to_name: toName, subject, message, link: link ? appLink(link) : appLink() },
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("Email alert not sent:", e);
    return false;
  }
};
