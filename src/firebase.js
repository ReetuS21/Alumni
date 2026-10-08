import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// All keys come from environment variables (.env locally, Project Settings → Environment Variables on Vercel).
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const isPlaceholder = (v) => !v || /^your_|^YOUR_/.test(v);

export const isFirebaseConfigured = !isPlaceholder(firebaseConfig.apiKey) && !isPlaceholder(firebaseConfig.projectId);

const useEmulator = process.env.REACT_APP_USE_EMULATOR === "true";

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Local development against `firebase emulators:start` (set REACT_APP_USE_EMULATOR=true in .env).
  if (useEmulator) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } else {
    // Optional, free extras — only switched on when their keys are set.
    const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      import("firebase/app-check")
        .then(({ initializeAppCheck, ReCaptchaV3Provider }) =>
          initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true })
        )
        .catch((e) => console.warn("App Check not started:", e));
    }
    if (!isPlaceholder(firebaseConfig.measurementId)) {
      import("firebase/analytics")
        .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
        .catch(() => {});
    }
  }
}

export { auth, db };
export default app;
