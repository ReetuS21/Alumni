import React from "react";
import { collection, query, where } from "firebase/firestore";
import { ClipboardList, ExternalLink, Star } from "lucide-react";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLiveQuery } from "../../hooks/useLive";
import { withdrawApplication } from "../../services/api";
import { formatDate, millis, toUrl } from "../../utils/format";
import { EmptyState, PageHeader, PostTypeBadge, Spinner, StatusBadge } from "../../components/ui";

export const MyApplications = () => {
  const { user } = useAuth();
  const { data: apps, loading } = useLiveQuery(() => query(collection(db, "applications"), where("studentUid", "==", user.uid)), [user.uid]);
  const { data: shortlists } = useLiveQuery(() => query(collection(db, "shortlists"), where("studentUid", "==", user.uid)), [user.uid]);

  const sorted = [...apps].sort((a, b) => millis(b.appliedAt) - millis(a.appliedAt));

  const withdraw = async (app) => {
    if (!window.confirm(`Withdraw your application for "${app.postTitle}"?`)) return;
    try {
      await withdrawApplication(app.id);
    } catch {
      window.alert("Could not withdraw the application.");
    }
  };

  return (
    <>
      <PageHeader title="Applications" subtitle="Your applications and alumni interest." />

      {shortlists.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">Alumni interest</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {shortlists.map((s) => (
              <div key={s.id} className="card flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.status === "referred" ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p>
                    <strong>{s.alumniName}</strong> {s.status === "referred" ? "referred you" : "shortlisted you"}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(s.updatedAt || s.createdAt)}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title">Applications & submissions</h2>
        {loading ? (
          <Spinner />
        ) : sorted.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No applications yet" text="Apply to openings from your feed." />
        ) : (
          <div className="card divide-y divide-slate-100">
            {sorted.map((a) => (
              <div key={a.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{a.postTitle}</p>
                    <PostTypeBadge type={a.postType} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {[a.company, a.postAuthorName && `posted by ${a.postAuthorName}`, `applied ${formatDate(a.appliedAt) || "just now"}`].filter(Boolean).join(" · ")}
                  </p>
                  {a.submissionLink && (
                    <a href={toUrl(a.submissionLink)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      Your submission <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {a.status === "applied" && (
                    <button className="btn btn-ghost btn-sm" onClick={() => withdraw(a)}>
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};
