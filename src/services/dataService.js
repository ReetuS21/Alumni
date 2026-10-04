import { db, isFirebaseConfigured } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

// Initial Mock Seed Data
const MOCK_INITIAL_DATA = {
  users: [
    { uid: "std-1", name: "Aarav Sharma", email: "aarav@student.edu", role: "student", createdAt: new Date().toISOString() },
    { uid: "tch-1", name: "Dr. Sunita Rao", email: "sunita@institute.edu", role: "teacher", createdAt: new Date().toISOString() },
    { uid: "alm-1", name: "Rohan Verma", email: "rohan@techcorp.com", role: "alumni", createdAt: new Date().toISOString() },
    { uid: "alm-2", name: "Priya Patel", email: "priya@innovate.io", role: "alumni", createdAt: new Date().toISOString() }
  ],
  studentProfiles: [
    {
      uid: "std-1",
      name: "Aarav Sharma",
      email: "aarav@student.edu",
      designation: "Final Year MCA Student",
      summary: "Passionate Full-Stack Developer with hands-on experience in React, Node.js, and Cloud Architectures. Eager to solve real-world problems.",
      skills: ["React", "JavaScript", "Node.js", "Python", "MongoDB", "SQL", "Firebase"],
      experience: [
        { id: 1, title: "Frontend Intern", organization: "WebCraft Solutions", mode: "virtual", duration: "6 Months" },
        { id: 2, title: "Full-Stack Trainee", organization: "TechLabs Institute", mode: "onsite", duration: "3 Months" }
      ],
      certifications: ["AWS Certified Developer Associate", "React Advanced Developer Certification"],
      languages: ["English", "Hindi"],
      location: "Bangalore, India",
      tools: ["VS Code", "Git", "Postman", "Docker", "Figma"],
      links: {
        portfolio: "https://aaravsharma.dev",
        linkedin: "https://linkedin.com/in/aaravsharma",
        github: "https://github.com/aaravsharma"
      },
      verifiedBadge: true
    }
  ],
  teacherProfiles: [
    {
      uid: "tch-1",
      name: "Dr. Sunita Rao",
      email: "sunita@institute.edu",
      department: "Department of Computer Science & Applications",
      designation: "Professor & Head of Department"
    }
  ],
  alumniProfiles: [
    {
      uid: "alm-1",
      name: "Rohan Verma",
      company: "TechCorp Systems",
      jobRole: "Senior Software Engineer",
      domain: "Cloud & Distributed Systems",
      experienceYears: "5+",
      location: "Bangalore, India",
      email: "rohan@techcorp.com"
    },
    {
      uid: "alm-2",
      name: "Priya Patel",
      company: "Innovate AI",
      jobRole: "Lead Product Manager",
      domain: "AI & Machine Learning",
      experienceYears: "4",
      location: "Hyderabad, India",
      email: "priya@innovate.io"
    }
  ],
  posts: [
    {
      id: "post-1",
      authorUid: "alm-1",
      authorName: "Rohan Verma",
      authorRole: "alumni",
      type: "hiring",
      title: "Frontend Engineer (React.js) - TechCorp Systems",
      body: "We are looking for enthusiastic MCA graduates with strong React and JavaScript skills. Remote/Hybrid role with competitive package.",
      options: [],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "post-2",
      authorUid: "tch-1",
      authorName: "Dr. Sunita Rao",
      authorRole: "teacher",
      type: "notice",
      title: "Campus Placement Registration Deadline Announcement",
      body: "All final year MCA students are requested to update their Alumni Hub profiles and complete skill verification before Friday 5 PM.",
      options: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "post-3",
      authorUid: "tch-1",
      authorName: "Dr. Sunita Rao",
      authorRole: "teacher",
      type: "poll",
      title: "Poll: Preferred Tech Stack Workshop for Upcoming Hackathon",
      body: "Please select which workshop topic you would like the institute to organize next week.",
      options: [
        { text: "Full Stack Next.js & TypeScript", votes: 14 },
        { text: "Cloud DevOps & Kubernetes", votes: 9 },
        { text: "AI Application Development with Python", votes: 21 }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "post-4",
      authorUid: "alm-2",
      authorName: "Priya Patel",
      authorRole: "alumni",
      type: "test",
      title: "AI & Data Structures Challenge 2026",
      body: "Alumni-sponsored problem solving challenge. Top 3 performers will get direct referral calls for Product Engineering roles.",
      options: [],
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    }
  ],
  chatMessages: [
    {
      id: "msg-1",
      senderUid: "std-1",
      senderName: "Aarav Sharma",
      senderRole: "student",
      text: "Hello everyone! What are the best key skills to highlight for cloud engineer roles?",
      sentAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: "msg-2",
      senderUid: "alm-1",
      senderName: "Rohan Verma",
      senderRole: "alumni",
      text: "Hi Aarav! Focus on Docker, Kubernetes, AWS basics, and CI/CD pipelines. Hands-on projects matter most!",
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "msg-3",
      senderUid: "tch-1",
      senderName: "Dr. Sunita Rao",
      senderRole: "teacher",
      text: "Great advice Rohan! Students, make sure you also get your skills verified using the AI Skill Verifier bridge on your dashboard.",
      sentAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  applications: [
    {
      id: "app-1",
      postId: "post-1",
      studentUid: "std-1",
      studentName: "Aarav Sharma",
      status: "applied",
      appliedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  skillVerifications: [
    {
      id: "ver-1",
      uid: "std-1",
      role: "student",
      score: 92,
      verifiedOn: new Date().toISOString(),
      status: "verified",
      category: "Full Stack Web Development (React & Node.js)"
    }
  ]
};

// LocalStorage Mock Data Utilities
const getLocalData = (key) => {
  const data = localStorage.getItem(`alumnihub_${key}`);
  if (!data) {
    localStorage.setItem(`alumnihub_${key}`, JSON.stringify(MOCK_INITIAL_DATA[key] || []));
    return MOCK_INITIAL_DATA[key] || [];
  }
  return JSON.parse(data);
};

const setLocalData = (key, value) => {
  localStorage.setItem(`alumnihub_${key}`, JSON.stringify(value));
};

// Data Service APIs with Firebase + LocalStorage Fallback

export const getPosts = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getPosts error, falling back to local storage:", e);
    }
  }
  return getLocalData("posts");
};

export const createPost = async (postData) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        ...postData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...postData };
    } catch (e) {
      console.warn("Firestore createPost error, saving locally:", e);
    }
  }
  const posts = getLocalData("posts");
  const newPost = { id: `post-${Date.now()}`, ...postData, createdAt: new Date().toISOString() };
  posts.unshift(newPost);
  setLocalData("posts", posts);
  return newPost;
};

export const getChatMessages = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "chatMessages"), orderBy("sentAt", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getChatMessages error, using local storage:", e);
    }
  }
  return getLocalData("chatMessages");
};

export const sendChatMessage = async (msgData) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, "chatMessages"), {
        ...msgData,
        sentAt: serverTimestamp()
      });
      return { id: docRef.id, ...msgData };
    } catch (e) {
      console.warn("Firestore sendChatMessage error, saving locally:", e);
    }
  }
  const msgs = getLocalData("chatMessages");
  const newMsg = { id: `msg-${Date.now()}`, ...msgData, sentAt: new Date().toISOString() };
  msgs.push(newMsg);
  setLocalData("chatMessages", msgs);
  return newMsg;
};

export const subscribeToChat = (callback) => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "chatMessages"), orderBy("sentAt", "asc"));
      return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(msgs);
      });
    } catch (e) {
      console.warn("Firestore onSnapshot error:", e);
    }
  }
  
  // Local storage polling fallback for live feel
  callback(getLocalData("chatMessages"));
  const interval = setInterval(() => {
    callback(getLocalData("chatMessages"));
  }, 2000);
  return () => clearInterval(interval);
};

export const getStudentProfiles = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "studentProfiles"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getStudentProfiles error, using local storage:", e);
    }
  }
  return getLocalData("studentProfiles");
};

export const getStudentProfileByUid = async (uid) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, "studentProfiles", uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { uid, ...snapshot.data() };
      }
    } catch (e) {
      console.warn("Firestore getDoc error, checking local storage:", e);
    }
  }
  const profiles = getLocalData("studentProfiles");
  return profiles.find(p => p.uid === uid) || null;
};

export const saveStudentProfile = async (profileData) => {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "studentProfiles", profileData.uid), profileData, { merge: true });
    } catch (e) {
      console.warn("Firestore setDoc error, saving locally:", e);
    }
  }
  const profiles = getLocalData("studentProfiles");
  const idx = profiles.findIndex(p => p.uid === profileData.uid);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...profileData };
  } else {
    profiles.push(profileData);
  }
  setLocalData("studentProfiles", profiles);
  return profileData;
};

export const getAlumniProfiles = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "alumniProfiles"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getAlumniProfiles error, using local storage:", e);
    }
  }
  return getLocalData("alumniProfiles");
};

export const getTeacherProfiles = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "teacherProfiles"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getTeacherProfiles error, using local storage:", e);
    }
  }
  return getLocalData("teacherProfiles");
};

export const applyToPost = async (postId, studentUid, studentName) => {
  const appData = {
    postId,
    studentUid,
    studentName,
    status: "applied",
    appliedAt: new Date().toISOString()
  };
  
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, "applications"), appData);
      return { id: docRef.id, ...appData };
    } catch (e) {
      console.warn("Firestore application save error, saving locally:", e);
    }
  }
  
  const apps = getLocalData("applications");
  const newApp = { id: `app-${Date.now()}`, ...appData };
  apps.push(newApp);
  setLocalData("applications", apps);
  return newApp;
};

export const getApplications = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "applications"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore getApplications error:", e);
    }
  }
  return getLocalData("applications");
};

export const saveSkillVerification = async (uid, category, score) => {
  const verData = {
    uid,
    role: "student",
    category,
    score,
    verifiedOn: new Date().toISOString(),
    status: "verified"
  };

  if (isFirebaseConfigured() && db) {
    try {
      await addDoc(collection(db, "skillVerifications"), verData);
      await setDoc(doc(db, "studentProfiles", uid), { verifiedBadge: true }, { merge: true });
    } catch (e) {
      console.warn("Firestore saveSkillVerification error:", e);
    }
  }

  // Update local storage
  const vers = getLocalData("skillVerifications");
  vers.push({ id: `ver-${Date.now()}`, ...verData });
  setLocalData("skillVerifications", vers);

  // Mark profile verified locally
  const profiles = getLocalData("studentProfiles");
  const idx = profiles.findIndex(p => p.uid === uid);
  if (idx >= 0) {
    profiles[idx].verifiedBadge = true;
    setLocalData("studentProfiles", profiles);
  }
  return verData;
};
