import React, { createContext, useContext, useMemo } from "react";
import { collection, query } from "firebase/firestore";
import { db } from "../firebase";
import { useLiveQuery } from "../hooks/useLive";
import { accountStatus, useAuth } from "./AuthContext";
import { Avatar } from "../components/ui";
import { avatarUrl } from "../utils/upload";

const PeopleContext = createContext({ people: [], byUid: {}, loading: true });

/**
 * One live list of approved accounts, shared by the whole app:
 * profile photos next to posts and messages, and the "new message" picker.
 */
export const PeopleProvider = ({ children }) => {
  const { user } = useAuth();
  const canList = Boolean(user && (user.role === "admin" || user.status === "approved"));
  const { data, loading } = useLiveQuery(() => (canList ? query(collection(db, "users")) : null), [canList]);

  const value = useMemo(() => {
    const people = data
      .map((u) => ({ ...u, uid: u.uid || u.id, status: accountStatus(u) }))
      .filter((u) => u.status === "approved");
    return { people, byUid: Object.fromEntries(people.map((p) => [p.uid, p])), loading };
  }, [data, loading]);

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
};

export const usePeople = () => useContext(PeopleContext);

/** Avatar that shows the person's uploaded photo when they have one. */
export const PersonAvatar = ({ uid, name, photoURL, size = "sm" }) => {
  const { byUid } = usePeople();
  const photo = photoURL || byUid[uid]?.photoURL || "";
  return <Avatar name={name || byUid[uid]?.name} photoURL={avatarUrl(photo, size === "xl" || size === "lg" ? 256 : 96)} size={size} />;
};
