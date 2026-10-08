import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const UPDATED = "8 October 2026";
const CONTACT = process.env.REACT_APP_CONTACT_EMAIL || "the Alumni Hub administrator at your institute";

const Shell = ({ title, children }) => (
  <div className="min-h-screen bg-slate-50 px-4 py-10">
    <article className="card mx-auto max-w-3xl p-6 sm:p-10">
      <Link to="/" className="btn btn-ghost btn-sm -ml-2 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Alumni Hub
      </Link>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-400">Last updated {UPDATED}</p>
      <div className="legal mt-8 space-y-6 text-sm leading-relaxed text-slate-700">{children}</div>
    </article>
  </div>
);

const H = ({ children }) => <h2 className="text-base font-semibold text-slate-900">{children}</h2>;

export const PrivacyPage = () => (
  <Shell title="Privacy Policy">
    <p>
      Alumni Hub is a networking and referral platform for the students, teachers and alumni of our institute. This policy explains what we collect, why,
      who can see it and the choices you have. It is written with India's Digital Personal Data Protection Act, 2023 in mind.
    </p>

    <section className="space-y-2">
      <H>1. What we collect</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Account details</strong> — name, email address, role (student, teacher or alumni) and a securely hashed password (handled by Google Firebase
          Authentication; we never see your password).
        </li>
        <li>
          <strong>Profile details you choose to add</strong> — for students: headline, summary, phone, location, skills, tools, languages, experience,
          education, certifications, links and a profile photo; for teachers: department and designation; for alumni: company, job role, domain, experience,
          location, batch, LinkedIn and a short bio.
        </li>
        <li>
          <strong>Activity</strong> — posts, poll votes, discussion messages, private messages, applications, test submissions, shortlists and referrals.
        </li>
        <li>
          <strong>Uploaded files</strong> — profile photos and certificate files, stored with Cloudinary.
        </li>
      </ul>
    </section>

    <section className="space-y-2">
      <H>2. Why we use it</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>To verify that every account belongs to a genuine member of the institute.</li>
        <li>To show your profile to other verified members so alumni can find, mentor and refer students.</li>
        <li>To generate your ATS-friendly resume, which only you download.</li>
        <li>To send you notifications about your account, applications, shortlists and replies.</li>
      </ul>
      <p>We do not sell your data, show advertising, or share your data with recruiters outside the platform.</p>
    </section>

    <section className="space-y-2">
      <H>3. Who can see it</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Your profile, posts and discussion messages are visible only to signed-in, approved members of Alumni Hub.</li>
        <li>Private messages are visible only to the two people in the conversation.</li>
        <li>Applications are visible to you and to the alumnus who posted the opening. An alumnus's private notes about a student are visible only to that alumnus.</li>
        <li>The super administrator can see account and profile details in order to approve accounts and moderate content.</li>
        <li>Accounts waiting for approval cannot see anyone else's data.</li>
      </ul>
    </section>

    <section className="space-y-2">
      <H>4. Where it is stored</H>
      <p>
        Data is stored with Google Firebase (Authentication and Cloud Firestore) and uploaded files with Cloudinary. These providers process data on our
        behalf and may store it on servers outside India.
      </p>
    </section>

    <section className="space-y-2">
      <H>5. Your rights and choices</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Access</strong> — download a copy of your data at any time from <em>Settings → Download my data</em>.
        </li>
        <li>
          <strong>Correction</strong> — edit your profile whenever you like.
        </li>
        <li>
          <strong>Deletion</strong> — delete your account from <em>Settings → Delete account</em>. Your login, profile, posts, messages and applications are
          removed permanently.
        </li>
        <li>
          <strong>Grievances</strong> — contact {CONTACT}.
        </li>
      </ul>
    </section>

    <section className="space-y-2">
      <H>6. Security</H>
      <p>
        Access to every record is enforced by Firebase security rules on the server, not just by the app. Traffic is encrypted with HTTPS. No system is
        perfectly secure, so please use a strong password that you do not use elsewhere.
      </p>
    </section>

    <section className="space-y-2">
      <H>7. Changes</H>
      <p>If we change this policy we will update the date above and, for significant changes, tell members through a notice on the platform.</p>
    </section>
  </Shell>
);

export const TermsPage = () => (
  <Shell title="Terms of Use">
    <p>By creating an account on Alumni Hub you agree to these terms.</p>

    <section className="space-y-2">
      <H>1. Who can join</H>
      <p>
        Alumni Hub is for current students, teachers and alumni of the institute. Every account is reviewed by the administrator, who may refuse, suspend or
        remove any account that cannot be verified or breaks these terms.
      </p>
    </section>

    <section className="space-y-2">
      <H>2. Your account</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Use your real name and keep your details accurate.</li>
        <li>Keep your password private. You are responsible for activity on your account.</li>
        <li>One person, one account.</li>
      </ul>
    </section>

    <section className="space-y-2">
      <H>3. Acceptable use</H>
      <p>Do not:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>harass, threaten or discriminate against anyone;</li>
        <li>post false job openings, ask for money in exchange for referrals, or misrepresent a company;</li>
        <li>share other people's personal data outside the platform without their consent;</li>
        <li>post spam, malware, or content that is illegal or infringes someone else's rights;</li>
        <li>try to access data or features you are not permitted to use.</li>
      </ul>
    </section>

    <section className="space-y-2">
      <H>4. Referrals and opportunities</H>
      <p>
        Alumni share openings and referrals in a personal capacity. Alumni Hub and the institute do not guarantee interviews, jobs or the accuracy of any
        posting. Always check opportunities through the company's official channels.
      </p>
    </section>

    <section className="space-y-2">
      <H>5. Content</H>
      <p>
        You keep ownership of what you post. You allow Alumni Hub to show it to other approved members for the purposes of the platform. The administrator may
        remove content that breaks these terms.
      </p>
    </section>

    <section className="space-y-2">
      <H>6. Leaving</H>
      <p>You can delete your account at any time from Settings. Deleted data cannot be recovered.</p>
    </section>

    <section className="space-y-2">
      <H>7. Contact</H>
      <p>Questions about these terms can be sent to {CONTACT}.</p>
    </section>
  </Shell>
);
