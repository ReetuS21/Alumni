import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { normalizeStudentProfile } from "../utils/profile";
import { accountStatus } from "../context/AuthContext";

const isApprovedDoc = (u) => accountStatus(u) === "approved";

const byName = (a, b) => (a.name || "").localeCompare(b.name || "");

/**
 * Every registered student merged with their profile.
 * Firestore has no full-text search, so filtering is done client-side — fine at institute scale.
 */
export const useStudents = () => {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [usersSnap, profilesSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "==", "student"))),
        getDocs(collection(db, "studentProfiles")),
      ]);
      const profiles = Object.fromEntries(profilesSnap.docs.map((d) => [d.id, d.data()]));
      // Only approved accounts appear in directories and searches.
      const list = usersSnap.docs.filter((d) => isApprovedDoc(d.data())).map((d) => {
        const u = d.data();
        return {
          ...normalizeStudentProfile(profiles[d.id] || {}),
          uid: d.id,
          name: profiles[d.id]?.name || u.name,
          email: u.email,
        };
      });
      setStudents(list.sort(byName));
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { students: students || [], loading: students === null, error, reload: load };
};

/** Every registered alumnus merged with their alumni profile. */
export const useAlumni = () => {
  const [alumni, setAlumni] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usersSnap, profilesSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "alumni"))),
          getDocs(collection(db, "alumniProfiles")),
        ]);
        const profiles = Object.fromEntries(profilesSnap.docs.map((d) => [d.id, d.data()]));
        const list = usersSnap.docs.filter((d) => isApprovedDoc(d.data())).map((d) => ({
          ...(profiles[d.id] || {}),
          uid: d.id,
          name: profiles[d.id]?.name || d.data().name,
          email: d.data().email,
        }));
        if (!cancelled) setAlumni(list.sort(byName));
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e);
          setAlumni([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { alumni: alumni || [], loading: alumni === null, error };
};
