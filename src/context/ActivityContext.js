import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useLiveQuery } from "../hooks/useLive";
import { millis } from "../utils/format";
import { useAuth } from "./AuthContext";

const ActivityContext = createContext(null);

const seenKey = (uid) => `alumnihub:postsSeen:${uid}`;
const readSeen = (uid) => {
  try {
    return Number(localStorage.getItem(seenKey(uid))) || 0;
  } catch {
    return 0;
  }
};
const writeSeen = (uid, value) => {
  try {
    localStorage.setItem(seenKey(uid), String(value));
  } catch {
    /* private mode — the badge simply resets next visit */
  }
};

/**
 * Everything that drives the badges in the navigation:
 * personal notifications, new posts since the last visit, and unread direct messages.
 */
export const ActivityProvider = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid;
  const isAdmin = user?.role === "admin";

  const { data: notifications, loading: notificationsLoading } = useLiveQuery(
    () =>
      uid
        ? query(collection(db, "notifications"), where("toUid", "in", isAdmin ? [uid, "admin"] : [uid]), orderBy("createdAt", "desc"), limit(50))
        : null,
    [uid, isAdmin]
  );

  // New posts since the last time the notifications page was opened (first visit starts "now").
  const [postsSeenAt, setPostsSeenAt] = useState(() => (uid ? readSeen(uid) : 0));
  useEffect(() => {
    if (!uid) return;
    let seen = readSeen(uid);
    if (!seen) {
      seen = Date.now();
      writeSeen(uid, seen);
    }
    setPostsSeenAt(seen);
  }, [uid]);

  const { data: recentPosts } = useLiveQuery(
    () => (uid ? query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20)) : null),
    [uid]
  );
  const newPosts = useMemo(
    () => recentPosts.filter((p) => p.authorUid !== uid && millis(p.createdAt, 0) > postsSeenAt),
    [recentPosts, uid, postsSeenAt]
  );

  const markPostsSeen = useCallback(() => {
    if (!uid) return;
    const now = Date.now();
    writeSeen(uid, now);
    setPostsSeenAt(now);
  }, [uid]);

  // Direct messages: unread when the other person wrote last after I last opened the conversation.
  const { data: conversations, loading: conversationsLoading } = useLiveQuery(
    () => (uid ? query(collection(db, "conversations"), where("participants", "array-contains", uid)) : null),
    [uid]
  );
  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => millis(b.updatedAt) - millis(a.updatedAt)),
    [conversations]
  );
  const isUnread = useCallback(
    (c) => Boolean(c.lastSenderUid) && c.lastSenderUid !== uid && millis(c.updatedAt) > millis(c.readAt?.[uid], 0),
    [uid]
  );
  const unreadMessages = sortedConversations.filter(isUnread).length;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value = {
    notifications,
    notificationsLoading,
    unreadNotifications,
    newPosts,
    recentPosts,
    postsSeenAt,
    markPostsSeen,
    conversations: sortedConversations,
    conversationsLoading,
    isUnread,
    unreadMessages,
    bellCount: unreadNotifications + newPosts.length,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivity = () => useContext(ActivityContext);
