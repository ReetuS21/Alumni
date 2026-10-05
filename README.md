# Alumni Hub

A role-based networking and referral platform for **students, teachers and alumni** (MCA project).
React (Create React App) + Tailwind CSS + Firebase (Auth, Cloud Firestore, Storage), deployed on Vercel.

> "One campus, three roles, one conversation — and a profile that works as a resume."

## Features

| Module | What it does |
|---|---|
| 1. Role-based auth | One register page with a Student / Teacher / Alumni toggle. The role is stored in `users/{uid}`; Firestore rules stop it from ever being changed by the client. Login routes each role to its own dashboard. |
| 2. Global discussion | One real-time chat shared by all roles, with role badges, replies and delete-own-message. |
| 3. Student dashboard | Live feed (hiring, tests, notices, polls), apply / submit solutions, poll voting, profile builder (skills, tools, onsite/virtual experience, education, certifications, languages, location, links, photo), one-click **ATS-friendly PDF resume**, alumni directory, application & referral tracking. |
| 4. Teacher dashboard | Student / alumni counters, publish notices and polls, filter and export student profiles, alumni directory with counts per company and CSV export, own short profile. |
| 5. Alumni dashboard | Publish hiring posts and skill tests, review applicants (applied → shortlisted / rejected), search students with simple filters (keyword, skill chips, location, internship experience), shortlist and mark as referred. |
| Super admin | Every new account starts **pending** and cannot use the app until the super admin approves it (pending users see a waiting screen that updates live). The admin can approve, reject (with a reason), suspend and reactivate accounts, export the user list, publish announcements and delete any post or chat message. |

## Setup

1. **Firebase project** — in the [Firebase Console](https://console.firebase.google.com):
   - add a **Web app** and copy its config
   - Authentication → Sign-in method → enable **Email/Password**
   - create a **Cloud Firestore** database
   - (optional) enable **Storage** for profile photos
2. **Keys** — copy `.env.example` to `.env` and fill in the `REACT_APP_FIREBASE_*` values.
3. **Security rules** — deploy them (requires `npm i -g firebase-tools` and `firebase login`):
   ```bash
   firebase deploy --only firestore:rules,storage --project <your-project-id>
   ```
   Or paste `firestore.rules` into Console → Firestore → Rules.
4. **Install & run**
   ```bash
   npm install
   npm start
   ```
5. **Test accounts** — creates the super admin and three approved test logins, plus sample posts and messages.
   It also marks accounts created before the approval system as approved:
   ```bash
   npm run seed
   ```

   | Role | Email | Password |
   |---|---|---|
   | Student | student@gmail.com | alumni267 |
   | Teacher | teacher@gmail.com | alumni267 |
   | Alumni | alumni@gmail.com | alumni267 |
   | Super admin | superadmin@gmail.com | alumni267 |

   The login page shows these as one-click shortcuts. Set `REACT_APP_SHOW_TEST_ACCOUNTS=false` to hide them.

## Deploying on Vercel

- Add every `REACT_APP_*` variable from `.env` under **Project Settings → Environment Variables**, then redeploy.
- In Firebase Console → Authentication → Settings → **Authorized domains**, add your `*.vercel.app` domain.
- Without the Firebase variables the app shows a setup screen (there is no demo mode).

## Firestore collections

`users`, `studentProfiles`, `teacherProfiles`, `alumniProfiles`, `posts`, `applications` (id `postId_studentUid`),
`pollVotes` (id `postId_uid`), `chatMessages`, `shortlists` (id `alumniUid_studentUid`).

## Local development with emulators (optional)

```bash
firebase emulators:start --only auth,firestore --project demo-alumnihub   # needs Java 21+
FIREBASE_EMULATOR=true npm run seed
# .env: REACT_APP_USE_EMULATOR=true and REACT_APP_FIREBASE_PROJECT_ID=demo-alumnihub
npm start
```
