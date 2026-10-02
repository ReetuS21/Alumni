import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, isFirebaseConfigured, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("alumnihub_current_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync state with localStorage
  const updateCurrentUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("alumnihub_current_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("alumnihub_current_user");
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch role from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const role = userDoc.exists() ? userDoc.data().role : "student";
            const name = userDoc.exists() ? userDoc.data().name : firebaseUser.email.split('@')[0];

            updateCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: name,
              role: role
            });
          } catch (e) {
            console.warn("Error fetching user document from Firestore:", e);
          }
        } else {
          // If explicitly signed out in Firebase, but check if local mock session is active
          if (!localStorage.getItem("alumnihub_current_user")) {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo mode fallback
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (email, password, name, role) => {
    if (isFirebaseConfigured() && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
          uid: res.user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        };
        // Store in Firestore users collection
        if (db) {
          await setDoc(doc(db, "users", res.user.uid), newUser);
        }
        updateCurrentUser(newUser);
        return newUser;
      } catch (err) {
        console.error("Firebase register error:", err);
        throw err;
      }
    } else {
      // Mock registration
      const mockUser = {
        uid: `user-${Date.now()}`,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      };
      updateCurrentUser(mockUser);
      return mockUser;
    }
  };

  // Login function
  const login = async (email, password, role) => {
    if (isFirebaseConfigured() && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        let userRole = role;
        let userName = email.split('@')[0];

        if (db) {
          const uDoc = await getDoc(doc(db, "users", res.user.uid));
          if (uDoc.exists()) {
            userRole = uDoc.data().role;
            userName = uDoc.data().name;
          }
        }

        const userData = {
          uid: res.user.uid,
          email: res.user.email,
          name: userName,
          role: userRole
        };
        updateCurrentUser(userData);
        return userData;
      } catch (err) {
        console.error("Firebase login error:", err);
        throw err;
      }
    } else {
      // Mock login
      const mockUser = {
        uid: role === "student" ? "std-1" : role === "teacher" ? "tch-1" : "alm-1",
        email: email,
        name: role === "student" ? "Aarav Sharma" : role === "teacher" ? "Dr. Sunita Rao" : "Rohan Verma",
        role: role
      };
      updateCurrentUser(mockUser);
      return mockUser;
    }
  };

  // Quick Demo Login for instant testing
  const demoLogin = (role) => {
    const demoUsers = {
      student: { uid: "std-1", name: "Aarav Sharma", email: "aarav@student.edu", role: "student" },
      teacher: { uid: "tch-1", name: "Dr. Sunita Rao", email: "sunita@institute.edu", role: "teacher" },
      alumni: { uid: "alm-1", name: "Rohan Verma", email: "rohan@techcorp.com", role: "alumni" }
    };
    const selected = demoUsers[role] || demoUsers.student;
    updateCurrentUser(selected);
    return selected;
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Signout warning:", e);
      }
    }
    updateCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        demoLogin,
        logout,
        isFirebaseActive: isFirebaseConfigured()
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
