import React from "react";
import { Award, Briefcase, ExternalLink, GraduationCap, Languages, Mail, MapPin, Phone, Wrench } from "lucide-react";
import { toUrl } from "../utils/format";
import { Avatar } from "./ui";
import { avatarUrl } from "../utils/upload";

const Section = ({ icon: Icon, title, children }) => (
  <section className="card p-4 sm:p-5">
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
      <Icon className="h-4 w-4" /> {title}
    </h2>
    {children}
  </section>
);

const Chips = ({ items, tone = "" }) =>
  items.length ? (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className={`chip ${tone}`}>
          {s}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-400">Not added yet.</p>
  );

const LINK_LABELS = { linkedin: "LinkedIn", github: "GitHub", portfolio: "Portfolio", other: "Other" };

/** Full read-only student profile (used by teachers, alumni and the student themself). */
export const StudentProfileView = ({ profile, actions }) => {
  const p = profile;
  const links = Object.entries(p.links || {}).filter(([, url]) => url);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="card p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={p.name} photoURL={avatarUrl(p.photoURL, 256)} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
              </div>
              <p className="text-slate-600">{p.designation || "Student"}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                {p.email && (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 hover:text-blue-700">
                    <Mail className="h-4 w-4" /> {p.email}
                  </a>
                )}
                {p.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> {p.phone}
                  </span>
                )}
                {p.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {p.location}
                  </span>
                )}
              </div>
              {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
            </div>
          </div>
          {p.summary && <p className="mt-5 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">{p.summary}</p>}
        </section>

        <Section icon={Briefcase} title="Experience">
          {p.experience.length ? (
            <ul className="space-y-4">
              {p.experience.map((e) => (
                <li key={e.id} className="border-l-2 border-blue-100 pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{e.title}</p>
                    <span className={`badge ${e.mode === "virtual" ? "bg-cyan-50 text-cyan-700 ring-cyan-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                      {e.mode === "virtual" ? "Virtual internship" : "Onsite internship"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{e.organization}</p>
                  {(e.startDate || e.endDate) && <p className="text-xs text-slate-400">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</p>}
                  {e.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{e.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No experience added yet.</p>
          )}
        </Section>

        <Section icon={GraduationCap} title="Education">
          {p.education.length ? (
            <ul className="space-y-3">
              {p.education.map((e) => (
                <li key={e.id}>
                  <p className="font-semibold text-slate-900">{e.degree}</p>
                  <p className="text-sm text-slate-600">{e.institution}</p>
                  <p className="text-xs text-slate-400">{[e.year, e.score && `Score: ${e.score}`].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No education added yet.</p>
          )}
        </Section>

        <Section icon={Award} title="Certifications">
          {p.certifications.length ? (
            <ul className="space-y-2">
              {p.certifications.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>
                  </div>
                  {c.url && (
                    <a href={toUrl(c.url)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm shrink-0">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No certifications added yet.</p>
          )}
        </Section>
      </div>

      <div className="space-y-6">
        <Section icon={Wrench} title="Skills">
          <Chips items={p.skills} tone="bg-blue-50 text-blue-700" />
        </Section>
        <Section icon={Wrench} title="Tools & technologies">
          <Chips items={p.tools} />
        </Section>
        <Section icon={Languages} title="Languages">
          <Chips items={p.languages} />
        </Section>
        {links.length > 0 && (
          <Section icon={ExternalLink} title="Links">
            <ul className="space-y-1.5 text-sm">
              {links.map(([key, url]) => (
                <li key={key}>
                  <a href={toUrl(url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 hover:underline">
                    {LINK_LABELS[key] || key} <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
};
