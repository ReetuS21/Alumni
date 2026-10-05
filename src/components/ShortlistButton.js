import React, { useState } from "react";
import { doc } from "firebase/firestore";
import { Star } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLiveDoc } from "../hooks/useLive";
import { addToShortlist, removeFromShortlist, shortlistId } from "../services/api";

/** Alumni-only toggle that saves the shortlist in Firestore (shortlists/{alumniUid_studentUid}). */
export const ShortlistButton = ({ student, size = "sm" }) => {
  const { user } = useAuth();
  const id = shortlistId(user.uid, student.uid);
  const { data: entry, loading } = useLiveDoc(() => doc(db, "shortlists", id), [id]);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (entry) {
        if (entry.status === "referred" && !window.confirm("This student is marked as referred. Remove from your shortlist?")) return;
        await removeFromShortlist(id);
      } else {
        await addToShortlist(user, student);
      }
    } catch (e) {
      console.error(e);
      window.alert("Could not update the shortlist. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy || loading}
      className={`btn ${size === "sm" ? "btn-sm" : ""} ${entry ? "btn-success" : "btn-primary"}`}
    >
      <Star className={`h-3.5 w-3.5 ${entry ? "fill-current" : ""}`} />
      {entry ? (entry.status === "referred" ? "Referred" : "Shortlisted") : "Shortlist"}
    </button>
  );
};
