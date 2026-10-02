import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/AppLayout";
import {
  getPosts,
  getStudentProfileByUid,
  saveStudentProfile,
  applyToPost,
  getAlumniProfiles,
  getApplications
} from "../services/dataService";
import { exportATSResume } from "../utils/resumeExporter";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Search,
  CheckCircle,
  Download,
  Building,
  User,
  MessageSquare,
  Clock,
  Send,
  MoreVertical,
  Plus
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "feed";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [alumniSearch, setAlumniSearch] = useState("");

  // Profile Form State
  const [profile, setProfile] = useState({
    uid: user?.uid || "",
    name: user?.name || "",
    email: user?.email || "",
    designation: "Final Year MCA Student",
    summary: "",
    skills: ["React", "JavaScript", "Python", "SQL"],
    experience: [
      { id: 1, title: "Software Intern", organization: "Tech Solutions", mode: "virtual", duration: "3 Months" }
    ],
    certifications: ["React Advanced Certification"],
    languages: ["English", "Hindi"],
    location: "Bangalore, India",
    tools: ["VS Code", "Git", "Postman"],
    links: {
      portfolio: "",
      linkedin: "",
      github: ""
    }
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "feed");
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);

    const fetchedAlumni = await getAlumniProfiles();
    setAlumniList(fetchedAlumni);

    const fetchedApps = await getApplications();
    setApplications(fetchedApps);

    if (user?.uid) {
      const existingProfile = await getStudentProfileByUid(user.uid);
      if (existingProfile) {
        setProfile(prev => ({ ...prev, ...existingProfile }));
      }
    }
  };

  const handleApply = async (postId) => {
    if (!user) return;
    await applyToPost(postId, user.uid, user.name || "Student");
    const updatedApps = await getApplications();
    setApplications(updatedApps);
  };

  const hasApplied = (postId) => {
    return applications.some(a => a.postId === postId && a.studentUid === user?.uid);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await saveStudentProfile({ ...profile, uid: user.uid });
    setSavingProfile(false);
    setProfileSavedMsg("Profile details saved!");
    setTimeout(() => setProfileSavedMsg(""), 3000);
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const filteredAlumni = alumniList.filter(a =>
    a.company?.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.jobRole?.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.name?.toLowerCase().includes(alumniSearch.toLowerCase())
  );

  return (
    <AppLayout title="Student Dashboard">
      {/* 1. Dashboard Top Summary Cards (Matching Image 1 Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Primary Highlight Metric Card (Solid Royal Blue matching Image 1) */}
        <div className="bg-blue-600 text-white p-5 rounded-[20px] shadow-lg shadow-blue-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <button className="text-white/70 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-blue-100 font-medium">Available Openings</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {posts.filter(p => p.type === "hiring").length}
            </h3>
          </div>
        </div>

        {/* Metric Card 2: Applications */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">My Applications</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {applications.filter(a => a.studentUid === user?.uid).length}
            </h3>
          </div>
        </div>

        {/* Metric Card 3: Alumni Directory */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Alumni Network</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {alumniList.length}
            </h3>
          </div>
        </div>

        {/* Metric Card 4: Notices & Polls */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Notices & Updates</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {posts.filter(p => p.type !== "hiring").length}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Section Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "feed"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Feed & Opportunities
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Profile & ATS Resume Builder
        </button>

        <button
          onClick={() => setActiveTab("alumni")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "alumni"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Find Alumni Directory
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Global Discussion Box
        </button>
      </div>

      {/* TAB 1: FEED */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-slate-900">Opportunities & Announcements</h2>
          </div>

          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-[20px] border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                      {post.authorName?.[0] || "A"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{post.authorName}</h4>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">{post.authorRole}</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        post.type === "hiring"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : post.type === "notice"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {post.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{post.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{post.body}</p>
                </div>

                {post.type === "hiring" && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleApply(post.id)}
                      disabled={hasApplied(post.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs ${
                        hasApplied(post.id)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {hasApplied(post.id) ? "✓ Applied" : "Apply Now"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & RESUME */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-[20px] border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Profile & ATS Resume Exporter</h2>
              <p className="text-xs text-slate-400">Single source of truth for your resume credentials</p>
            </div>

            <button
              onClick={() => exportATSResume(profile)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export One-Click ATS PDF Resume</span>
            </button>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              {profileSavedMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skills</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill tag"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                />
                <button type="button" onClick={addSkill} className="bg-slate-900 text-white font-bold px-4 rounded-xl text-xs">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <span>{s}</span>
                    <button type="button" onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-900 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: FIND ALUMNI */}
      {activeTab === "alumni" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-base font-bold text-slate-900">Alumni Directory</h2>
            <input
              type="text"
              placeholder="Filter by company, role..."
              value={alumniSearch}
              onChange={(e) => setAlumniSearch(e.target.value)}
              className="w-full sm:w-64 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAlumni.map(alumni => (
              <div key={alumni.uid || alumni.email} className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {alumni.name?.[0] || "A"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{alumni.name}</h4>
                    <p className="text-xs text-slate-400">{alumni.jobRole} @ <strong className="text-slate-800">{alumni.company}</strong></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCUSSION */}
      {activeTab === "chat" && (
        <GlobalDiscussionBox />
      )}
    </AppLayout>
  );
};
