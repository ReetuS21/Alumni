import React, { useMemo, useState } from "react";
import { Briefcase, Building2, ExternalLink, GraduationCap, Mail, MapPin, Search, Users } from "lucide-react";
import { useAlumni } from "../../hooks/useDirectory";
import { includesText, toUrl } from "../../utils/format";
import { Alert, Avatar, EmptyState, PageHeader, Spinner } from "../../components/ui";

export const FindAlumni = () => {
  const { alumni, loading, error } = useAlumni();
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("all");

  const companies = useMemo(() => [...new Set(alumni.map((a) => a.company).filter(Boolean))].sort(), [alumni]);

  const filtered = alumni.filter(
    (a) =>
      (company === "all" || a.company === company) &&
      (!search.trim() || [a.name, a.company, a.jobRole, a.domain, a.location, a.batch].some((f) => includesText(f, search)))
  );

  return (
    <>
      <PageHeader title="Find Alumni" subtitle="Spot alumni at the companies you are targeting and reach out for guidance or referrals." />

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, company, role, domain or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-56" value={company} onChange={(e) => setCompany(e.target.value)}>
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert tone="error">Could not load alumni: {error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading alumni…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No alumni found" text={alumni.length ? "Try a different search." : "No alumni have registered yet."} />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {filtered.length} alumn{filtered.length === 1 ? "us" : "i"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => (
              <div key={a.uid} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{a.name}</p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" /> {a.jobRole || "Role not added"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-violet-800">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm font-semibold">{a.company || "Company not added"}</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  {a.domain && <p>Domain: {a.domain}</p>}
                  {a.experienceYears && <p>Experience: {a.experienceYears} years</p>}
                  {a.location && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {a.location}
                    </p>
                  )}
                  {a.batch && (
                    <p className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" /> {a.batch}
                    </p>
                  )}
                </div>
                {a.bio && <p className="mt-3 line-clamp-3 text-sm text-slate-600">{a.bio}</p>}
                <div className="mt-auto flex gap-2 pt-4">
                  {a.email && (
                    <a href={`mailto:${a.email}`} className="btn btn-secondary btn-sm">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  )}
                  {a.linkedin && (
                    <a href={toUrl(a.linkedin)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
