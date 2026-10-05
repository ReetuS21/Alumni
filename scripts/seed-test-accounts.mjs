/**
 * Creates the three test accounts (and some sample content) in your Firebase project.
 *
 *   npm run seed
 *
 * Reads the Firebase keys from .env (same variables the app uses). Safe to run more than once:
 * existing accounts are signed in and updated instead of re-created, and sample posts/messages
 * are only added if that account has none yet.
 */
import { readFileSync, existsSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

const PASSWORD = "alumni267";

// ---------- load .env ----------
const env = { ...process.env };
for (const file of [".env", ".env.local"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const config = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
};
if (!config.apiKey || /^your_/i.test(config.apiKey)) {
  console.error("✖ Firebase keys not found. Copy .env.example to .env and fill in your Firebase web config first.");
  process.exit(1);
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

// Optional: FIREBASE_EMULATOR=true npm run seed  → seeds the local emulators instead of the real project.
if (env.FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  console.log("Using local Firebase emulators.");
}

// ---------- account definitions ----------
const ACCOUNTS = [
  {
    email: "teacher@gmail.com",
    name: "Dr. Sunita Rao",
    role: "teacher",
    profileCollection: "teacherProfiles",
    profile: { department: "Department of Computer Applications", designation: "Professor & Head of Department" },
    posts: [
      {
        type: "notice",
        title: "Campus placement drive — update your profiles",
        body: "All final-year MCA students: complete your Alumni Hub profile before Friday 5 PM. Recruiters and alumni will be shortlisting from the platform.",
      },
      {
        type: "poll",
        title: "Which workshop should we organise next week?",
        body: "Vote for the topic you want most.",
        options: ["Full-stack with React & Node.js", "Cloud & DevOps basics", "AI app development with Python"],
      },
    ],
    message: "Welcome to Alumni Hub! Students, post your questions here — teachers and alumni will answer.",
  },
  {
    email: "alumni@gmail.com",
    name: "Rohan Verma",
    role: "alumni",
    profileCollection: "alumniProfiles",
    profile: {
      company: "TechCorp Systems",
      jobRole: "Senior Software Engineer",
      domain: "Cloud & Distributed Systems",
      experienceYears: "5",
      location: "Bengaluru, India",
      batch: "MCA 2020",
      linkedin: "",
      bio: "Happy to help with referrals, resume reviews and mock interviews for backend and cloud roles.",
    },
    posts: [
      {
        type: "hiring",
        title: "Frontend Engineer (React) — Fresher",
        body: "We are hiring MCA freshers with strong JavaScript and React fundamentals. Hybrid role. Apply here and I will review profiles personally for referral.",
        meta: { company: "TechCorp Systems", jobRole: "Frontend Engineer", location: "Bengaluru / Hybrid", deadline: "", link: "" },
      },
      {
        type: "test",
        title: "DSA Challenge — Arrays & Strings",
        body: "Solve the 3 problems in the linked repo and submit your GitHub link. Top performers get a referral call.",
        meta: { skills: "Data Structures, JavaScript or Python", deadline: "", link: "" },
      },
    ],
    message: "Hi everyone! Rohan here from TechCorp. For cloud roles focus on Docker, basic AWS and CI/CD — hands-on projects matter most.",
  },
  {
    email: "student@gmail.com",
    name: "Aarav Sharma",
    role: "student",
    profileCollection: "studentProfiles",
    profile: {
      designation: "MCA Student | Full-Stack Developer",
      summary: "Final-year MCA student with hands-on experience building React and Node.js applications. Interested in full-stack and cloud roles where I can ship real products.",
      phone: "",
      location: "Bengaluru, India",
      photoURL: "",
      skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Data Structures"],
      tools: ["Git", "GitHub", "VS Code", "Firebase", "Postman"],
      languages: ["English", "Hindi"],
      experience: [
        {
          id: "exp1",
          title: "Frontend Developer Intern",
          organization: "WebCraft Solutions",
          mode: "virtual",
          startDate: "Jun 2025",
          endDate: "Aug 2025",
          description: "Built reusable React components for the client dashboard\nImproved Lighthouse performance score from 62 to 91",
        },
      ],
      education: [{ id: "edu1", degree: "Master of Computer Applications (MCA)", institution: "Your Institute", year: "2024 – 2026", score: "" }],
      certifications: [{ id: "cert1", name: "Responsive Web Design", issuer: "freeCodeCamp", year: "2024", url: "" }],
      links: { portfolio: "", linkedin: "", github: "", other: "" },
    },
    posts: [],
    message: "Thanks Rohan! What projects would you recommend to show cloud skills on a resume?",
  },
];

// ---------- helpers ----------
const signInOrCreate = async (email, name) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    await updateProfile(cred.user, { displayName: name });
    console.log(`  ✓ created ${email}`);
    return cred.user;
  } catch (e) {
    if (e.code !== "auth/email-already-in-use") throw e;
    const cred = await signInWithEmailAndPassword(auth, email, PASSWORD);
    console.log(`  • ${email} already exists — signed in`);
    return cred.user;
  }
};

const run = async () => {
  console.log(`Seeding project "${config.projectId}"…\n`);
  const uids = {};

  for (const acc of ACCOUNTS) {
    console.log(`${acc.role.toUpperCase()}: ${acc.email}`);
    const user = await signInOrCreate(acc.email, acc.name);
    uids[acc.role] = user.uid;

    const userRef = doc(db, "users", user.uid);
    const existing = await getDoc(userRef);
    if (existing.exists() && existing.data().role !== acc.role) {
      console.error(`  ✖ ${acc.email} already has role "${existing.data().role}" — skipping.`);
      await signOut(auth);
      continue;
    }
    if (!existing.exists()) {
      await setDoc(userRef, { uid: user.uid, name: acc.name, email: acc.email, role: acc.role, createdAt: serverTimestamp() });
    }
    await setDoc(doc(db, acc.profileCollection, user.uid), { uid: user.uid, name: acc.name, email: acc.email, ...acc.profile }, { merge: true });
    console.log("  ✓ profile saved");

    if (acc.posts.length) {
      const mine = await getDocs(query(collection(db, "posts"), where("authorUid", "==", user.uid)));
      if (mine.empty) {
        for (const p of acc.posts) {
          const ref = await addDoc(collection(db, "posts"), {
            authorUid: user.uid,
            authorName: acc.name,
            authorRole: acc.role,
            type: p.type,
            title: p.title,
            body: p.body,
            options: p.options || [],
            meta: p.meta || {},
            createdAt: serverTimestamp(),
          });
          await updateDoc(ref, { postId: ref.id });
        }
        console.log(`  ✓ ${acc.posts.length} sample posts added`);
      }
    }

    const msgs = await getDocs(query(collection(db, "chatMessages"), where("senderUid", "==", user.uid)));
    if (msgs.empty && acc.message) {
      await addDoc(collection(db, "chatMessages"), {
        senderUid: user.uid,
        senderName: acc.name,
        senderRole: acc.role,
        text: acc.message,
        replyTo: null,
        sentAt: serverTimestamp(),
      });
      console.log("  ✓ sample discussion message added");
    }

    await signOut(auth);
    console.log("");
  }

  console.log("Done. Log in with any of these (password: alumni267):");
  ACCOUNTS.forEach((a) => console.log(`  ${a.role.padEnd(8)} ${a.email}`));
  process.exit(0);
};

run().catch((e) => {
  console.error("\n✖ Seeding failed:", e.code || "", e.message);
  if (e.code === "auth/operation-not-allowed") console.error("  Enable Email/Password sign-in in Firebase Console → Authentication → Sign-in method.");
  if (e.code === "permission-denied") console.error("  Deploy firestore.rules (firebase deploy --only firestore:rules) or check the Firestore database exists.");
  process.exit(1);
});
