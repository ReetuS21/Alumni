# Alumni Hub

A role-based networking and referral platform for **students, teachers and alumni** (MCA project).
React (Create React App) + Tailwind CSS + Firebase (Auth, Cloud Firestore), deployed on Vercel. Everything runs on free plans.

> "One campus, three roles, one conversation — and a profile that works as a resume."

## Features

| Module | What it does |
|---|---|
| 1. Role-based auth | One register page with a Student / Teacher / Alumni toggle. The role is stored in `users/{uid}`; Firestore rules stop it from ever being changed by the client. Forgot-password email, email verification, change password. |
| 2. Global discussion | One real-time chat shared by all roles, with role badges, profile photos, replies (the person you reply to is notified), delete-own-message and "load earlier messages". |
| 3. Student dashboard | Live feed (hiring, tests, notices, polls) with "load older posts", apply / submit solutions, poll voting, profile builder (skills, tools, onsite/virtual experience, education, certifications with file upload, languages, location, links, photo), one-click **ATS-friendly PDF resume**, alumni directory, application & referral tracking. |
| 4. Teacher dashboard | Student / alumni counters, publish notices and polls, filter and export student profiles, alumni directory with counts per company and CSV export, own profile with photo. |
| 5. Alumni dashboard | Publish hiring posts and skill tests, review applicants (applied → shortlisted / rejected), search students with simple filters, shortlist and mark as referred, private notes. |
| Super admin | Every new account starts **pending** until the super admin approves it. Approve / bulk-approve, reject (with a reason), suspend, reactivate, see whether the email is verified, export users, publish announcements, delete any post or message. The **Roll List** pre-approves known emails (paste or CSV) so genuine members skip the queue. |
| Messages | Private one-to-one conversations between any two approved members, with unread badges. |
| Notifications | In-app notifications for account review, applications, status changes, shortlists, referrals and replies, plus "new posts since your last visit". Optional email alerts. |
| Privacy | Privacy Policy and Terms pages (accepted at sign-up), **Download my data** and **Delete my account** in Settings. |

## Setup

1. **Firebase project** (free Spark plan) — in the [Firebase Console](https://console.firebase.google.com):
   - add a **Web app** and copy its config
   - Authentication → Sign-in method → enable **Email/Password**
   - create a **Cloud Firestore** database
2. **Keys** — copy `.env.example` to `.env` and fill in the `REACT_APP_FIREBASE_*` values.
3. **Security rules and indexes** (requires `npm i -g firebase-tools` and `firebase login`):
   ```bash
   firebase deploy --only firestore --project <your-project-id>
   ```
4. **Install & run**
   ```bash
   npm install
   npm start
   ```
5. **Super admin** — creates `superadmin@gmail.com` (password from `SUPER_ADMIN_PASSWORD`, default `alumni267`):
   ```bash
   npm run seed
   ```
   Sign in and **change the password immediately** (Settings → Change password).

### Optional free services

| Service | Used for | Variables |
|---|---|---|
| [Cloudinary](https://cloudinary.com) (free) | Profile photos and certificate files | `REACT_APP_CLOUDINARY_CLOUD_NAME`, `REACT_APP_CLOUDINARY_UPLOAD_PRESET` (an **unsigned** upload preset). To allow PDF certificates to open, enable *Settings → Security → Allow delivery of PDF and ZIP files*. |
| [EmailJS](https://www.emailjs.com) (free, 200 emails/month) | Email alerts (approval, shortlist, referral, application status, new registration) | `REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY`, `REACT_APP_ADMIN_ALERT_EMAIL`. The template uses `{{to_email}}`, `{{to_name}}`, `{{subject}}`, `{{message}}`, `{{link}}`. |
| Firebase App Check (reCAPTCHA v3, free) | Blocks scripts that call the database without the app | `REACT_APP_RECAPTCHA_SITE_KEY` |
| Google Analytics for Firebase (free) | Usage statistics | `REACT_APP_FIREBASE_MEASUREMENT_ID` |

Without these keys the app still works: photo upload buttons are hidden and email alerts are skipped (in-app notifications always work).

## Deploying on Vercel

- Add every `REACT_APP_*` variable from `.env` under **Project Settings → Environment Variables**, then redeploy.
- In Firebase Console → Authentication → Settings → **Authorized domains**, add your `*.vercel.app` domain.

## Firestore collections

`users`, `studentProfiles`, `teacherProfiles`, `alumniProfiles`, `posts`, `applications` (id `postId_studentUid`),
`pollVotes` (id `postId_uid`), `chatMessages`, `shortlists` and `shortlistNotes` (id `alumniUid_studentUid`),
`notifications`, `conversations/{smallerUid_largerUid}/messages`, `preapproved/{email}`.

## Local development with emulators (optional)

```bash
firebase emulators:start --only auth,firestore --project demo-alumnihub   # needs Java 21+
FIREBASE_EMULATOR=true npm run seed -- --demo     # super admin + 3 demo accounts with sample posts
# .env.development.local: REACT_APP_USE_EMULATOR=true and REACT_APP_FIREBASE_PROJECT_ID=demo-alumnihub
npm start
```
