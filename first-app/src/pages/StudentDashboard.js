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
  Clock,
  MoreVertical
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
      {/* 1. Compact, Low-Profile Small Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-md shadow-blue-500/15 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-100 font-medium block">Available Openings</span>
            <h3 className="text-xl font-black text-white mt-0.5 tracking-tight">
              {posts.filter(p => p.type === "hiring").length}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">My Applications</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {applications.filter(a => a.studentUid === user?.uid).length}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Alumni Network</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {alumniList.length}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Notices & Updates</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {posts.filter(p => p.type !== "hiring").length}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Main Dual-Column Front Dashboard (Feed/Profile on Left + Global Chat Front and Center on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section (7 Cols): Opportunities Feed & Profile Tabs */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Section Navigation Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 flex space-x-1">
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "feed" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Feed & Opportunities
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "profile" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Profile & ATS Resume
            </button>
            <button
              onClick={() => setActiveTab("alumni")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "alumni" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Alumni Directory
            </button>
          </div>

          {/* TAB 1: FEED */}
          {activeTab === "feed" && (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                        {post.authorName?.[0] || "A"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{post.authorName}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{post.authorRole}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          post.type === "hiring"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : post.type === "notice"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {post.type}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{post.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{post.body}</p>
                  </div>

                  {post.type === "hiring" && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleApply(post.id)}
                        disabled={hasApplied(post.id)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs ${
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
          )}

          {/* TAB 2: PROFILE BUILDER */}
          {activeTab === "profile" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Student Profile & Resume Builder</h3>
                  <p className="text-[11px] text-slate-400">Single source of truth for ATS resume export</p>
                </div>
                <button
                  onClick={() => exportATSResume(profile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export ATS PDF</span>
                </button>
              </div>

              {profileSavedMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  {profileSavedMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={profile.designation}
                      onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                      className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Summary</label>
                  <textarea
                    rows={2}
                    value={profile.summary}
                    onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                    className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Skills</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add skill tag"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                    />
                    <button type="button" onClick={addSkill} className="bg-slate-900 text-white font-bold px-3 rounded-xl text-xs">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <span>{s}</span>
                        <button type="button" onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-900 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all"
                >
                  {savingProfile ? "Saving..." : "Save Details"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ALUMNI DIRECTORY */}
          {activeTab === "alumni" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search alumni by company or role..."
                value={alumniSearch}
                onChange={(e) => setAlumniSearch(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAlumni.map(alumni => (
                  <div key={alumni.uid || alumni.email} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">{alumni.name}</h4>
                    <p className="text-[11px] text-slate-400">{alumni.jobRole} @ <strong className="text-slate-800">{alumni.company}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Section (5 Cols): GLOBAL CHATBOX FRONT AND CENTER */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <GlobalDiscussionBox />
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
