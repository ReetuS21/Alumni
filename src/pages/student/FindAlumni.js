import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, Download, ExternalLink, GraduationCap, Mail, MapPin, Search, Users } from "lucide-react";
import { useAlumni } from "../../hooks/useDirectory";
import { includesText, toUrl } from "../../utils/format";
import { downloadCsv } from "../../utils/csv";
import { PersonAvatar } from "../../context/PeopleContext";
import { MessageButton } from "../../components/MessageButton";
import { Alert, EmptyState, PageHeader, Spinner, StatCard } from "../../components/ui";

const distinct = (list) => [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const tally = (list) => {
  const map = new Map();
  list.forEach((v) => {
    const key = v || "Not specified";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

/**
 * Alumni directory. Students use it to find alumni at target companies;
 * teachers (`teacherView`) also get counts and a CSV export.
 */
export const FindAlumni = ({ teacherView = false }) => {
  const { alumni, loading, error } = useAlumni();
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("all");
  const [batch, setBatch] = useState("all");

  const companies = useMemo(() => distinct(alumni.map((a) => a.company)), [alumni]);
  const batches = useMemo(() => distinct(alumni.map((a) => a.batch)), [alumni]);
  const byCompany = useMemo(() => tally(alumni.map((a) => a.company)), [alumni]);

  const filtered = alumni.filter(
    (a) =>
      (company === "all" || a.company === company) &&
      (batch === "all" || a.batch === batch) &&
      (!search.trim() || [a.name, a.email, a.company, a.jobRole, a.domain, a.location, a.batch].some((f) => includesText(f, search)))
  );

  const exportCsv = () =>
    downloadCsv(
      `alumni-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Email", "Company", "Job Role", "Domain", "Experience (years)", "Location", "Batch", "LinkedIn"],
      filtered.map((a) => [a.name, a.email, a.company, a.jobRole, a.domain, a.experienceYears, a.location, a.batch, a.linkedin])
    );

  const exportCompanyCounts = () =>
    downloadCsv(`alumni-by-company-${new Date().toISOString().slice(0, 10)}.csv`, ["Company", "Alumni count"], [...byCompany, ["Total", alumni.length]]);

  return (
    <>
      <PageHeader
        title={teacherView ? "Alumni" : "Find Alumni"}
        subtitle={
          teacherView
            ? "Everyone registered as alumni. Filter the list and export it, or export the count per company."
            : "Spot alumni at the companies you are targeting and reach out for guidance or referrals."
        }
        actions={
          teacherView && (
            <>
              <button className="btn btn-secondary" onClick={exportCompanyCounts} disabled={!alumni.length}>
                <Download className="h-4 w-4" /> Counts by company
              </button>
              <button className="btn btn-primary" onClick={exportCsv} disabled={!filtered.length}>
                <Download className="h-4 w-4" /> Export CSV ({filtered.length})
              </button>
            </>
          )
        }
      />

      {teacherView && !loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Registered alumni" value={alumni.length} icon={Users} tone="violet" />
            <StatCard label="Companies represented" value={companies.length} icon={Building2} tone="blue" />
            <StatCard label="Graduation batches" value={batches.length} icon={GraduationCap} tone="emerald" />
          </div>
          {byCompany.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Alumni by company</h2>
              <div className="flex flex-wrap gap-2">
                {byCompany.map(([name, n]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCompany(name === "Not specified" || company === name ? "all" : name)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-inset transition ${
                      company === name ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {name}
                    <span className={`rounded-md px-1.5 text-xs font-semibold ${company === name ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, company, role, domain or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-52" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company">
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="input sm:w-44" value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch">
          <option value="all">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
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
            Showing {filtered.length} of {alumni.length} alumn{alumni.length === 1 ? "us" : "i"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => (
              <div key={a.uid} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <PersonAvatar uid={a.uid} name={a.name} photoURL={a.photoURL} size="md" />
                  <div className="min-w-0">
                    <Link to={`/profile/${a.uid}`} className="block truncate font-semibold text-slate-900 hover:text-blue-700">
                      {a.name}
                    </Link>
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
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <MessageButton person={{ uid: a.uid, name: a.name, role: "alumni", photoURL: a.photoURL }} className="btn-primary" />
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
