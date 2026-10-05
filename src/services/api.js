import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";

// ---------- Posts (Modules 3, 4, 5) ----------

export const createPost = async (user, { type, title, body, options = [], meta = {} }) => {
  const docRef = await addDoc(collection(db, "posts"), {
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
  await updateDoc(docRef, { postId: docRef.id });
  return docRef.id;
};

export const deletePost = (postId) => deleteDoc(doc(db, "posts", postId));

// ---------- Applications ----------

export const applyToPost = (user, post, { submissionLink = "" } = {}) => {
  const applicationId = `${post.id}_${user.uid}`;
  return setDoc(doc(db, "applications", applicationId), {
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
};

export const setApplicationStatus = (applicationId, status) =>
  updateDoc(doc(db, "applications", applicationId), { status, updatedAt: serverTimestamp() });

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

export const sendChatMessage = (user, text, replyTo = null) =>
  addDoc(collection(db, "chatMessages"), {
    senderUid: user.uid,
    senderName: user.name || "",
    senderRole: user.role,
    text: text.trim(),
    replyTo: replyTo
      ? { id: replyTo.id, senderName: replyTo.senderName, text: String(replyTo.text).slice(0, 140) }
      : null,
    sentAt: serverTimestamp(),
  });

export const deleteChatMessage = (id) => deleteDoc(doc(db, "chatMessages", id));

// ---------- Profiles ----------

const syncUserName = (uid, name) => (name ? updateDoc(doc(db, "users", uid), { name }) : Promise.resolve());

export const saveStudentProfile = async (uid, profile) => {
  const { id, ...data } = profile;
  await setDoc(doc(db, "studentProfiles", uid), { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
  await syncUserName(uid, data.name);
};

export const saveTeacherProfile = async (uid, profile) => {
  await setDoc(doc(db, "teacherProfiles", uid), { ...profile, uid }, { merge: true });
  await syncUserName(uid, profile.name);
};

export const saveAlumniProfile = async (uid, profile) => {
  await setDoc(doc(db, "alumniProfiles", uid), { ...profile, uid }, { merge: true });
  await syncUserName(uid, profile.name);
};

export const uploadProfilePhoto = async (uid, file) => {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const fileRef = ref(storage, `profilePhotos/${uid}/avatar.${ext}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
};

// ---------- Shortlists & referrals (Module 5) ----------

export const shortlistId = (alumniUid, studentUid) => `${alumniUid}_${studentUid}`;

export const addToShortlist = (alumni, student) =>
  setDoc(doc(db, "shortlists", shortlistId(alumni.uid, student.uid)), {
    alumniUid: alumni.uid,
    alumniName: alumni.name || "",
    studentUid: student.uid,
    studentName: student.name || "",
    studentEmail: student.email || "",
    status: "shortlisted",
    note: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateShortlist = (id, data) =>
  updateDoc(doc(db, "shortlists", id), { ...data, updatedAt: serverTimestamp() });

export const removeFromShortlist = (id) => deleteDoc(doc(db, "shortlists", id));

// ---------- Stats ----------

export const countUsersByRole = async (role) => {
  const snap = await getCountFromServer(query(collection(db, "users"), where("role", "==", role)));
  return snap.data().count;
};
