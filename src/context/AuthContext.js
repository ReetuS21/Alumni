import React, { createContext, useContext, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { deleteMyData, isPreapproved, notifyAdminOfRegistration } from "../services/api";
import { emptyStudentProfile } from "../utils/profile";

const AuthContext = createContext(null);

export const ROLES = ["student", "teacher", "alumni"];

export const ADMIN_EMAIL = "superadmin@gmail.com";

export const dashboardPath = (role) => (role === "admin" ? "/admin" : ROLES.includes(role) ? `/${role}` : "/auth");

/** Accounts created before the approval system have no status and count as approved. */
export const accountStatus = (u) => u?.status || "approved";

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
    email = cred.user.email; // Firebase normalises the address (lower-case); rules compare against it

    // Emails on the super admin's roll list are approved straight away; everyone else waits for review.
    const preapproved = await isPreapproved(email, role);
    const status = preapproved ? "approved" : "pending";

    // 1) users doc first — the security rules read the role from here.
    try {
      await setDoc(doc(db, "users", uid), {
        uid,
        name,
        email,
        role,
        status,
        ...(preapproved ? { reviewedBy: "roll list", reviewedAt: serverTimestamp() } : {}),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // Don't leave a login without a role behind — remove it so the person can simply try again.
      await cred.user.delete().catch(() => {});
      throw err;
    }
    updateProfile(cred.user, { displayName: name }).catch(() => {});
    sendEmailVerification(cred.user, { url: `${window.location.origin}/` }).catch(() => {});
    if (!preapproved) notifyAdminOfRegistration({ uid, name, email, role });

    // 2) then the role-specific profile (pages cope with a missing profile, so a failure here is not fatal).
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

  const resetPassword = (email) => sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/auth` });

  const resendVerification = () => sendEmailVerification(auth.currentUser, { url: `${window.location.origin}/` });

  /** Re-reads the login from Firebase; returns true once the email address is verified. */
  const refreshVerification = async () => {
    await auth.currentUser.reload();
    if (!auth.currentUser.emailVerified) return false;
    await auth.currentUser.getIdToken(true); // the new token carries email_verified for the security rules
    await updateDoc(doc(db, "users", auth.currentUser.uid), { emailVerified: true }).catch(() => {});
    setAuthUser({ ...auth.currentUser });
    return true;
  };

  const reauthenticate = (password) =>
    reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, password));

  const changePassword = async (currentPassword, newPassword) => {
    await reauthenticate(currentPassword);
    await updatePassword(auth.currentUser, newPassword);
  };

  /** Deletes all of this person's data and their login. Requires the current password. */
  const deleteAccount = async (password) => {
    await reauthenticate(password);
    const current = auth.currentUser;
    await deleteMyData({ ...userDoc, uid: current.uid });
    await deleteUser(current);
  };

  // Keep users/{uid}.emailVerified in step with Firebase Auth so the super admin can see it.
  useEffect(() => {
    if (authUser?.emailVerified && userDoc && !userDoc.emailVerified) {
      auth.currentUser
        ?.getIdToken(true)
        .then(() => updateDoc(doc(db, "users", authUser.uid), { emailVerified: true }))
        .catch(() => {});
    }
  }, [authUser, userDoc]);

  const user =
    authUser && userDoc
      ? { ...userDoc, uid: authUser.uid, email: authUser.email, emailVerified: Boolean(authUser.emailVerified), status: accountStatus(userDoc) }
      : null;

  return (
    <AuthContext.Provider
      value={{
        authUser,
        user,
        role: user?.role || null,
        loading,
        connectionError,
        register,
        login,
        logout,
        resetPassword,
        resendVerification,
        refreshVerification,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
