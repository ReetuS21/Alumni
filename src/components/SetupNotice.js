import React from "react";

const VARS = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
];

/** Shown instead of the app when Firebase keys are missing. */
export const SetupNotice = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <div className="card w-full max-w-xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <img src={`${process.env.PUBLIC_URL}/alumnihublogo.png`} alt="" className="h-11 w-11 rounded-xl" />
        <div>
          <h1 className="text-xl font-bold">Alumni Hub</h1>
          <p className="text-sm text-slate-500">Firebase is not configured yet</p>
        </div>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>
          In the Firebase Console, create a project, add a <strong>Web app</strong>, and enable{" "}
          <strong>Authentication → Email/Password</strong> and <strong>Cloud Firestore</strong>.
        </li>
        <li>
          Add these variables to the <code className="rounded bg-slate-100 px-1">.env</code> file (local) or to{" "}
          <strong>Vercel → Project Settings → Environment Variables</strong>:
          <ul className="mt-2 space-y-1 font-mono text-xs text-slate-500">
            {VARS.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </li>
        <li>Restart the dev server, or redeploy on Vercel.</li>
      </ol>
    </div>
  </div>
);
