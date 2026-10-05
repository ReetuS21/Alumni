import React from "react";
import { doc } from "firebase/firestore";
import { BadgeCheck, ExternalLink, Sparkles } from "lucide-react";
import { db, SKILL_VERIFIER_URL } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLiveDoc } from "../hooks/useLive";

export const verifierLink = (uid) =>
  SKILL_VERIFIER_URL ? `${SKILL_VERIFIER_URL}${SKILL_VERIFIER_URL.includes("?") ? "&" : "?"}uid=${encodeURIComponent(uid)}` : "";

/**
 * Module 6 — Skill Verification Bridge.
 * Fixed announcement bar on the student dashboard. The Verified Skill Card itself is written to
 * skillVerifications/{uid} by the AI-Assisted Skill Verification Engine, and shows up here live.
 */
export const VerifyBanner = () => {
  const { user } = useAuth();
  const { data: verification } = useLiveDoc(() => doc(db, "skillVerifications", user.uid), [user.uid]);
  const verified = verification?.status === "verified";
  const link = verifierLink(user.uid);

  return (
    <div
      className={`sticky top-14 z-20 border-b lg:top-0 ${
        verified ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-blue-700 bg-blue-600 text-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm">
          {verified ? <BadgeCheck className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0" />}
          {verified ? (
            <span>
              Your skills are verified{verification.score != null ? ` (score ${verification.score}%)` : ""}. Alumni see a
              Verified badge on your profile.
            </span>
          ) : (
            <span>
              <strong className="font-semibold">Verify your skills with the AI-based Skill Verifier</strong>
              <span className="hidden md:inline"> — verified students stand out in alumni searches.</span>
            </span>
          )}
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className={`btn btn-sm shrink-0 ${verified ? "btn-secondary" : "bg-white text-blue-700 hover:bg-blue-50"}`}
          >
            {verified ? "Re-verify" : "Verify now"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className={`text-xs ${verified ? "text-emerald-700" : "text-blue-100"}`}>Skill Verifier coming soon</span>
        )}
      </div>
    </div>
  );
};
