import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, CalendarClock, CheckCircle2, ExternalLink, FlaskConical, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { applyToPost, deletePost } from "../services/api";
import { formatDate, timeAgo, toUrl } from "../utils/format";
import { friendlyError } from "../utils/authErrors";
import { PersonAvatar } from "../context/PeopleContext";
import { PostTypeBadge, RoleBadge } from "./ui";
import { PollWidget } from "./PollWidget";

const Meta = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
    <Icon className="h-3.5 w-3.5 text-slate-400" />
    {children}
  </span>
);

export const PostCard = ({ post, applied = false, footer }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionLink, setSubmissionLink] = useState("");
  const meta = post.meta || {};
  const isStudent = user.role === "student";
  const isAuthor = post.authorUid === user.uid;
  const canDelete = isAuthor || user.role === "admin";
  const deadlinePassed = meta.deadline && new Date(`${meta.deadline}T23:59:59`) < new Date();

  const apply = async (extra) => {
    setBusy(true);
    setError("");
    try {
      await applyToPost(user, post, extra);
      setSubmitting(false);
    } catch (e) {
      setError(e.code === "permission-denied" ? "You have already applied to this post." : friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(post.id);
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  return (
    <article className="card p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <PersonAvatar uid={post.authorUid} name={post.authorName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.authorRole === "admin" ? (
              <span className="text-sm font-semibold text-slate-900">{post.authorName}</span>
            ) : (
              <Link to={`/profile/${post.authorUid}`} className="text-sm font-semibold text-slate-900 hover:text-blue-700">
                {post.authorName}
              </Link>
            )}
            <RoleBadge role={post.authorRole} />
          </div>
          <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
        </div>
        <PostTypeBadge type={post.type} />
      </header>

      <h3 className="mt-3 text-base font-semibold leading-snug">{post.title}</h3>

      {post.type === "hiring" && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {meta.company && <Meta icon={Building2}>{meta.company}</Meta>}
          {meta.jobRole && <Meta icon={Briefcase}>{meta.jobRole}</Meta>}
          {meta.location && <Meta icon={MapPin}>{meta.location}</Meta>}
          {meta.deadline && <Meta icon={CalendarClock}>Apply by {formatDate(meta.deadline)}</Meta>}
        </div>
      )}
      {post.type === "test" && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {meta.skills && <Meta icon={FlaskConical}>{meta.skills}</Meta>}
          {meta.deadline && <Meta icon={CalendarClock}>Due {formatDate(meta.deadline)}</Meta>}
        </div>
      )}

      {post.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{post.body}</p>}

      {post.type === "poll" && (
        <div className="mt-3">
          <PollWidget post={post} />
        </div>
      )}

      {(post.type === "hiring" || post.type === "test" || canDelete) && (
        <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {post.type === "hiring" && isStudent &&
            (applied ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Applied
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" disabled={busy || deadlinePassed} onClick={() => apply()}>
                {deadlinePassed ? "Applications closed" : busy ? "Applying…" : "Apply now"}
              </button>
            ))}
          {post.type === "hiring" && meta.link && (
            <a className="btn btn-secondary btn-sm" href={toUrl(meta.link)} target="_blank" rel="noreferrer">
              Job details <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {post.type === "test" && meta.link && (
            <a className="btn btn-secondary btn-sm" href={toUrl(meta.link)} target="_blank" rel="noreferrer">
              Open test <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {post.type === "test" && isStudent &&
            (applied ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Solution submitted
              </span>
            ) : submitting ? (
              <form
                className="flex w-full flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  apply({ submissionLink: toUrl(submissionLink.trim()) });
                }}
              >
                <input
                  required
                  className="input"
                  placeholder="Link to your solution (GitHub, Drive, CodePen…)"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" disabled={busy}>
                    Submit
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSubmitting(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-primary btn-sm" disabled={deadlinePassed} onClick={() => setSubmitting(true)}>
                {deadlinePassed ? "Submissions closed" : "Submit solution"}
              </button>
            ))}

          {canDelete && (
            <button className="btn btn-danger btn-sm ml-auto" onClick={remove}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </footer>
      )}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      {footer}
    </article>
  );
};
