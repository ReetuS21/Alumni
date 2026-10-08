import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// ---------- Notifications ----------

/**
 * In-app notification for one person (`toUid` = "admin" reaches the super admin).
 * Never throws: a failed notification must not undo the action that triggered it.
 */
export const notify = async (from, { toUid, type, title, body = "", link = "" }) => {
  if (!toUid || toUid === from.uid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      toUid,
      fromUid: from.uid,
      fromName: from.name || "",
      type,
      title: title.slice(0, 200),
      body: body.slice(0, 500),
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Notification not saved:", e);
  }
};

export const markNotificationRead = (id) => updateDoc(doc(db, "notifications", id), { read: true });

export const markAllNotificationsRead = async (items) => {
  const unread = items.filter((n) => !n.read);
  if (!unread.length) return;
  const batch = writeBatch(db);
  unread.forEach((n) => batch.update(doc(db, "notifications", n.id), { read: true }));
  await batch.commit();
};

export const deleteNotification = (id) => deleteDoc(doc(db, "notifications", id));

/** Tells the super admin about a new registration. */
export const notifyAdminOfRegistration = (user) =>
  notify(user, {
    toUid: "admin",
    type: "registration",
    title: `New ${user.role} registration: ${user.name}`,
    body: `${user.email} is waiting for approval.`,
    link: "/admin/users?status=pending",
  });

// ---------- Posts (Modules 3, 4, 5) ----------

export const createPost = async (user, { type, title, body, options = [], meta = {} }) => {
  // One write: the id is generated client-side so postId is stored with the post.
  const docRef = doc(collection(db, "posts"));
  await setDoc(docRef, {
    postId: docRef.id,
    authorUid: user.uid,
    authorName: user.name || "",
    authorRole: user.role,
    type,
    title: title.trim(),
    body: body.trim(),
    options: type === "poll" ? options : [],
    meta,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const deletePost = (postId) => deleteDoc(doc(db, "posts", postId));

// ---------- Applications ----------

export const applyToPost = async (user, post, { submissionLink = "" } = {}) => {
  const applicationId = `${post.id}_${user.uid}`;
  await setDoc(doc(db, "applications", applicationId), {
    applicationId,
    postId: post.id,
    postTitle: post.title || "",
    postType: post.type,
    postAuthorUid: post.authorUid,
    postAuthorName: post.authorName || "",
    company: post.meta?.company || "",
    studentUid: user.uid,
    studentName: user.name || "",
    studentEmail: user.email || "",
    status: "applied",
    submissionLink,
    appliedAt: serverTimestamp(),
  });
  notify(user, {
    toUid: post.authorUid,
    type: "application",
    title: post.type === "test" ? `${user.name} submitted a solution` : `${user.name} applied to your post`,
    body: post.title || "",
    link: "/alumni",
  });
};

const APPLICATION_STATUS_TEXT = {
  shortlisted: "You were shortlisted",
  rejected: "Your application was not selected",
  applied: "Your application is back under review",
};

export const setApplicationStatus = async (actor, application, status) => {
  await updateDoc(doc(db, "applications", application.id), { status, updatedAt: serverTimestamp() });
  notify(actor, {
    toUid: application.studentUid,
    type: "application_status",
    title: `${APPLICATION_STATUS_TEXT[status] || "Application updated"}: ${application.postTitle}`,
    body: `${actor.name} updated your application${application.company ? ` at ${application.company}` : ""}.`,
    link: "/student/applications",
  });
};

export const withdrawApplication = (applicationId) => deleteDoc(doc(db, "applications", applicationId));

// ---------- Polls ----------

export const castVote = (user, postId, selectedOption) => {
  const voteId = `${postId}_${user.uid}`;
  return setDoc(doc(db, "pollVotes", voteId), {
    voteId,
    postId,
    uid: user.uid,
    selectedOption,
    votedAt: serverTimestamp(),
  });
};

// ---------- Global discussion (Module 2) ----------

export const sendChatMessage = async (user, text, replyTo = null) => {
  const body = text.trim();
  await addDoc(collection(db, "chatMessages"), {
    senderUid: user.uid,
    senderName: user.name || "",
    senderRole: user.role,
    text: body,
    replyTo: replyTo ? replyTo.id : null,
    sentAt: serverTimestamp(),
  });
  if (replyTo) {
    notify(user, {
      toUid: replyTo.senderUid,
      type: "reply",
      title: `${user.name} replied to you in the discussion`,
      body: body.slice(0, 200),
      link: "/discussion",
    });
  }
};

export const deleteChatMessage = (id) => deleteDoc(doc(db, "chatMessages", id));

// ---------- Profiles ----------

const syncUser = (uid, fields) => {
  const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  return Object.keys(data).length ? updateDoc(doc(db, "users", uid), data) : Promise.resolve();
};

export const saveStudentProfile = async (uid, profile) => {
  const { id, ...data } = profile;
  await setDoc(doc(db, "studentProfiles", uid), { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
  await syncUser(uid, { name: data.name || undefined, photoURL: data.photoURL });
};

export const saveTeacherProfile = async (uid, profile) => {
  await setDoc(doc(db, "teacherProfiles", uid), { ...profile, uid }, { merge: true });
  await syncUser(uid, { name: profile.name || undefined, photoURL: profile.photoURL });
};

export const saveAlumniProfile = async (uid, profile) => {
  await setDoc(doc(db, "alumniProfiles", uid), { ...profile, uid }, { merge: true });
  await syncUser(uid, { name: profile.name || undefined, photoURL: profile.photoURL });
};

const PROFILE_SAVERS = { student: saveStudentProfile, teacher: saveTeacherProfile, alumni: saveAlumniProfile };

/** Saves a new profile photo URL on the role profile and the users record (used for avatars everywhere). */
export const saveProfilePhoto = (user, photoURL) =>
  PROFILE_SAVERS[user.role] ? PROFILE_SAVERS[user.role](user.uid, { photoURL }) : syncUser(user.uid, { photoURL });

// ---------- Shortlists & referrals (Module 5) ----------

export const shortlistId = (alumniUid, studentUid) => `${alumniUid}_${studentUid}`;

export const addToShortlist = async (alumni, student) => {
  await setDoc(doc(db, "shortlists", shortlistId(alumni.uid, student.uid)), {
    alumniUid: alumni.uid,
    alumniName: alumni.name || "",
    studentUid: student.uid,
    studentName: student.name || "",
    studentEmail: student.email || "",
    status: "shortlisted",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  notify(alumni, {
    toUid: student.uid,
    type: "shortlist",
    title: `${alumni.name} shortlisted you`,
    body: "An alumnus added you to their referral shortlist. Keep your profile up to date!",
    link: "/student/applications",
  });
};

// Private notes live in their own collection so the student cannot read them.
export const getShortlistNote = async (id) => (await getDoc(doc(db, "shortlistNotes", id))).data()?.note || "";

export const saveShortlistNote = (id, note) => setDoc(doc(db, "shortlistNotes", id), { note, updatedAt: serverTimestamp() });

export const updateShortlist = async (actor, entry, data) => {
  await updateDoc(doc(db, "shortlists", entry.id), { ...data, updatedAt: serverTimestamp() });
  if (data.status === "referred") {
    notify(actor, {
      toUid: entry.studentUid,
      type: "referral",
      title: `${actor.name} referred you`,
      body: "Your referral has been submitted. Watch your email for the next steps from the company.",
      link: "/student/applications",
    });
  }
};

export const removeFromShortlist = (id) =>
  Promise.all([deleteDoc(doc(db, "shortlists", id)), deleteDoc(doc(db, "shortlistNotes", id))]);

// ---------- Direct messages ----------

export const conversationId = (a, b) => [a, b].sort().join("_");

/** Creates the conversation document if needed and returns its id. */
export const openConversation = async (me, other) => {
  const id = conversationId(me.uid, other.uid);
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const participants = [me.uid, other.uid].sort();
    await setDoc(ref, {
      participants,
      names: { [me.uid]: me.name || "", [other.uid]: other.name || "" },
      roles: { [me.uid]: me.role || "", [other.uid]: other.role || "" },
      photos: { [me.uid]: me.photoURL || "", [other.uid]: other.photoURL || "" },
      lastMessage: "",
      lastSenderUid: "",
      updatedAt: serverTimestamp(),
      readAt: { [me.uid]: serverTimestamp() },
    });
  }
  return id;
};

export const sendDirectMessage = async (me, conversation, text) => {
  const body = text.trim();
  const msgRef = doc(collection(db, "conversations", conversation.id, "messages"));
  const batch = writeBatch(db);
  batch.set(msgRef, { senderUid: me.uid, text: body, sentAt: serverTimestamp() });
  batch.update(doc(db, "conversations", conversation.id), {
    lastMessage: body.slice(0, 140),
    lastSenderUid: me.uid,
    updatedAt: serverTimestamp(),
    [`readAt.${me.uid}`]: serverTimestamp(),
    [`names.${me.uid}`]: me.name || "",
    [`photos.${me.uid}`]: me.photoURL || "",
  });
  await batch.commit();
};

export const markConversationRead = (me, conversationIdValue) =>
  updateDoc(doc(db, "conversations", conversationIdValue), { [`readAt.${me.uid}`]: serverTimestamp() });

// ---------- Stats ----------

/** Number of approved accounts with this role. */
export const countUsersByRole = async (role) => {
  const snap = await getCountFromServer(query(collection(db, "users"), where("role", "==", role), where("status", "==", "approved")));
  return snap.data().count;
};

// ---------- Super admin ----------

const REVIEW_TEXT = {
  approved: ["Your Alumni Hub account is approved", "Welcome aboard! You can now use every feature of Alumni Hub."],
  rejected: ["Your Alumni Hub registration was not approved", "The administrator could not verify your account."],
  suspended: ["Your Alumni Hub account has been suspended", "Please contact your institute for help."],
};

export const reviewUser = async (admin, target, status, reviewNote = "") => {
  await updateDoc(doc(db, "users", target.uid), { status, reviewNote, reviewedBy: admin.email, reviewedAt: serverTimestamp() });
  const [title, text] = REVIEW_TEXT[status] || [];
  if (title) {
    const body = reviewNote ? `${text} Note: ${reviewNote}` : text;
    notify(admin, { toUid: target.uid, type: "account", title, body, link: "/" });
  }
};

export const deleteApplication = (id) => deleteDoc(doc(db, "applications", id));

/** Pre-approved emails (college roll list): these people skip the approval queue when they register. */
export const addPreapproved = async (admin, entries) => {
  const chunks = [];
  for (let i = 0; i < entries.length; i += 400) chunks.push(entries.slice(i, i + 400));
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(({ email, role, name = "" }) =>
      batch.set(doc(db, "preapproved", email.toLowerCase()), { email: email.toLowerCase(), role, name, addedBy: admin.email, addedAt: serverTimestamp() })
    );
    await batch.commit();
  }
};

export const removePreapproved = (email) => deleteDoc(doc(db, "preapproved", email));

/** True when the super admin added this email (with this role) to the roll list. */
export const isPreapproved = async (email, role) => {
  try {
    const snap = await getDoc(doc(db, "preapproved", email.toLowerCase()));
    return snap.exists() && snap.data().role === role;
  } catch {
    return false;
  }
};

// ---------- Account (Settings) ----------

const deleteWhere = async (col, field, value) => {
  const snap = await getDocs(query(collection(db, col), where(field, "==", value)));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};

// Accounts that were never approved cannot list shared collections — they also have nothing there.
const tolerant = async (fn) => {
  try {
    await fn();
  } catch (e) {
    if (e.code !== "permission-denied") throw e;
  }
};

/**
 * Removes everything this person created, then their users record.
 * The caller deletes the Firebase Auth login afterwards (it needs a recent sign-in).
 */
export const deleteMyData = async (user) => {
  const uid = user.uid;
  // Direct messages: the whole conversation (both sides) goes with the account.
  await tolerant(async () => {
    const convos = await getDocs(query(collection(db, "conversations"), where("participants", "array-contains", uid)));
    for (const c of convos.docs) {
      const msgs = await getDocs(collection(db, "conversations", c.id, "messages"));
      await Promise.all(msgs.docs.map((m) => deleteDoc(m.ref)));
      await deleteDoc(c.ref);
    }
  });
  await tolerant(() => deleteWhere("chatMessages", "senderUid", uid));
  await tolerant(() => deleteWhere("pollVotes", "uid", uid));
  await tolerant(() => deleteWhere("notifications", "toUid", uid));
  if (user.role === "student") {
    await tolerant(() => deleteWhere("applications", "studentUid", uid));
    await tolerant(() => deleteWhere("shortlists", "studentUid", uid));
  }
  if (user.role === "alumni") {
    await tolerant(() => deleteWhere("applications", "postAuthorUid", uid));
    await tolerant(async () => {
      const lists = await getDocs(query(collection(db, "shortlists"), where("alumniUid", "==", uid)));
      await Promise.all(lists.docs.map((d) => removeFromShortlist(d.id)));
    });
  }
  await tolerant(() => deleteWhere("posts", "authorUid", uid));
  const profileCol = { student: "studentProfiles", teacher: "teacherProfiles", alumni: "alumniProfiles" }[user.role];
  if (profileCol) await deleteDoc(doc(db, profileCol, uid));
  await deleteDoc(doc(db, "users", uid));
};

/** Everything stored about this person, for "Download my data". */
export const exportMyData = async (user) => {
  const uid = user.uid;
  const grab = async (col, field) => (await getDocs(query(collection(db, col), where(field, "==", uid)))).docs.map((d) => ({ id: d.id, ...d.data() }));
  const profileCol = { student: "studentProfiles", teacher: "teacherProfiles", alumni: "alumniProfiles" }[user.role];
  const account = (await getDoc(doc(db, "users", uid))).data() || {};
  const profile = profileCol ? (await getDoc(doc(db, profileCol, uid))).data() || null : null;
  return {
    exportedAt: new Date().toISOString(),
    account,
    profile,
    posts: await grab("posts", "authorUid"),
    discussionMessages: await grab("chatMessages", "senderUid"),
    applications: user.role === "student" ? await grab("applications", "studentUid") : await grab("applications", "postAuthorUid"),
    shortlists: user.role === "student" ? await grab("shortlists", "studentUid") : await grab("shortlists", "alumniUid"),
    pollVotes: await grab("pollVotes", "uid"),
  };
};
