import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { openConversation } from "../services/api";

/** Opens (or starts) a private conversation with `person` ({ uid, name, role, photoURL }). */
export const MessageButton = ({ person, size = "sm", label = "Message", className = "btn-secondary" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!person?.uid || person.uid === user.uid) return null;

  const start = async () => {
    setBusy(true);
    try {
      const id = await openConversation(user, person);
      navigate(`/messages/${id}`);
    } catch (e) {
      console.error(e);
      window.alert("Could not open the conversation. Please try again.");
      setBusy(false);
    }
  };

  return (
    <button type="button" className={`btn ${size === "sm" ? "btn-sm" : ""} ${className}`} onClick={start} disabled={busy}>
      <MessageCircle className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} /> {label}
    </button>
  );
};
