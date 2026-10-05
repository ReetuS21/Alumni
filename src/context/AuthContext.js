import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { emptyStudentProfile } from "../utils/profile";

const AuthContext = createContext(null);

export const ROLES = ["student", "teacher", "alumni"];

export const dashboardPath = (role) => (ROLES.includes(role) ? `/${role}` : "/auth");

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null); // Firebase Auth user
  const [userDoc, setUserDoc] = useState(null); // users/{uid} — holds the role
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let unsubDoc = null;
    let timer = null;

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (unsubDoc) unsubDoc();
      unsubDoc = null;
      clearTimeout(timer);
      setAuthUser(fbUser);

      if (!fbUser) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setConnectionError(false);
      // Live listener: the role becomes available the moment registration writes it.
      unsubDoc = onSnapshot(
        doc(db, "users", fbUser.uid),
        { includeMetadataChanges: true },
        (snap) => {
          if (snap.exists()) {
            setUserDoc(snap.data());
            setConnectionError(false);
            clearTimeout(timer);
            setLoading(false);
          } else if (!snap.metadata.fromCache) {
            // The server confirmed there is no users document (yet) — e.g. mid-registration.
            setUserDoc(null);
            clearTimeout(timer);
            setLoading(false);
          }
        },
        (err) => {
          console.error("Could not load user record:", err);
          setConnectionError(true);
          setLoading(false);
        }
      );
      // If the server does not answer at all, show a connection problem instead of spinning forever.
      timer = setTimeout(() => {
        setConnectionError(true);
        setLoading(false);
      }, 12000);
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
      clearTimeout(timer);
    };
  }, []);

  const register = async ({ name, email, password, role, extra = {} }) => {
    if (!ROLES.includes(role)) throw new Error("Please choose a valid role.");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    await updateProfile(cred.user, { displayName: name });

    // 1) users doc first — the security rules read the role from here.
    await setDoc(doc(db, "users", uid), { uid, name, email, role, createdAt: serverTimestamp() });

    // 2) then the role-specific profile.
    if (role === "student") {
      await setDoc(doc(db, "studentProfiles", uid), {
        ...emptyStudentProfile(),
        uid,
        name,
        email,
        updatedAt: serverTimestamp(),
      });
    } else if (role === "teacher") {
      await setDoc(doc(db, "teacherProfiles", uid), {
        uid,
        name,
        email,
        department: extra.department || "",
        designation: extra.designation || "",
      });
    } else {
      await setDoc(doc(db, "alumniProfiles", uid), {
        uid,
        name,
        email,
        company: extra.company || "",
        jobRole: extra.jobRole || "",
        batch: extra.batch || "",
        domain: "",
        experienceYears: "",
        location: "",
        linkedin: "",
        bio: "",
      });
    }
    return role;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    return snap.exists() ? snap.data().role : null;
  };

  const logout = () => signOut(auth);

  const user = authUser && userDoc ? { ...userDoc, uid: authUser.uid, email: authUser.email } : null;

  return (
    <AuthContext.Provider value={{ authUser, user, role: user?.role || null, loading, connectionError, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
