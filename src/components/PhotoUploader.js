import React, { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { saveProfilePhoto } from "../services/api";
import { avatarUrl, isUploadConfigured, uploadFile } from "../utils/upload";
import { friendlyError } from "../utils/authErrors";
import { Avatar } from "./ui";

/** Profile photo with change / remove buttons. Saves straight away (no need to press Save). */
export const PhotoUploader = ({ name, photoURL, onChange, size = "xl", note }) => {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (url) => {
    await saveProfilePhoto(user, url);
    onChange?.(url);
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadFile(file, { folder: `alumnihub/photos/${user.uid}`, kind: "image" });
      await save(url);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setBusy(true);
    setError("");
    try {
      await save("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar name={name} photoURL={avatarUrl(photoURL, 256)} size={size} />
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pick} />
      {isUploadConfigured ? (
        <div className="flex gap-1">
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Camera className="h-3.5 w-3.5" /> {busy ? "Uploading…" : photoURL ? "Change" : "Add photo"}
          </button>
          {photoURL && !busy && (
            <button type="button" className="btn btn-ghost btn-sm text-rose-600" onClick={remove} aria-label="Remove photo">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <p className="max-w-[10rem] text-center text-[11px] text-slate-400">Photo uploads will be available once the administrator sets them up.</p>
      )}
      {error && <p className="max-w-[12rem] text-center text-xs text-rose-600">{error}</p>}
      {note && <p className="max-w-[10rem] text-center text-[11px] text-slate-400">{note}</p>}
    </div>
  );
};
