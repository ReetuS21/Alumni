import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPosts,
  getStudentProfileByUid,
  saveStudentProfile,
  applyToPost,
  getAlumniProfiles,
  getApplications
} from "../services/dataService";
import { exportATSResume } from "../utils/resumeExporter";
import { SkillVerificationModal } from "../components/SkillVerificationModal";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import {
  Sparkles,
  FileText,
  Briefcase,
  Search,
  CheckCircle,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Building,
  User,
  MessageSquare,
  Clock,
  Layers
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feed"); // feed | profile | alumni | chat
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [alumniSearch, setAlumniSearch] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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
    },
    verifiedBadge: false
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [toolInput, setToolInput] = useState("");

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
    setProfileSavedMsg("Profile saved successfully!");
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

  const addTool = () => {
    if (toolInput.trim() && !profile.tools.includes(toolInput.trim())) {
      setProfile({ ...profile, tools: [...profile.tools, toolInput.trim()] });
      setToolInput("");
    }
  };

  const removeTool = (tool) => {
    setProfile({ ...profile, tools: profile.tools.filter(t => t !== tool) });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "Full-Stack Intern",
      organization: "Acme Corp",
      mode: "onsite",
      duration: "3 Months"
    };
    setProfile({ ...profile, experience: [...profile.experience, newExp] });
  };

  const filteredAlumni = alumniList.filter(a =>
    a.company?.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.jobRole?.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.name?.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.domain?.toLowerCase().includes(alumniSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Module 6: Skill Verification Bridge Fixed Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base flex items-center gap-2">
                Verify your skills with the AI-based Skill Verifier Engine
                {profile.verifiedBadge && (
                  <span className="bg-emerald-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                    ✓ VERIFIED
                  </span>
                )}
              </span>
              <p className="text-xs text-indigo-100">
                Get an Official Verified Skill Card & boost your job referral chances with alumni.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVerificationModal(true)}
            className="bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all shrink-0 flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{profile.verifiedBadge ? "Re-Test / Upgrade Verification" : "Verify Skills Now"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "feed"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Opportunities Feed</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Profile & ATS Resume</span>
          </button>

          <button
            onClick={() => setActiveTab("alumni")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "alumni"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Find Alumni Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Global Discussion Box</span>
          </button>
        </div>

        {/* TAB 1: OPPORTUNITIES FEED */}
        {activeTab === "feed" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Opportunities & Announcement Feed</h2>
                <p className="text-xs text-slate-500">Hiring posts, notices & skill challenges from Teachers & Alumni</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {posts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                  No posts published yet.
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{post.authorName}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            post.authorRole === "teacher"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-purple-100 text-purple-800 border-purple-200"
                          }`}
                        >
                          {post.authorRole}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${
                          post.type === "hiring"
                            ? "bg-blue-100 text-blue-800"
                            : post.type === "notice"
                            ? "bg-amber-100 text-amber-800"
                            : post.type === "poll"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {post.type}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{post.title}</h3>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">{post.body}</p>

                    {/* Poll options view */}
                    {post.type === "poll" && post.options && (
                      <div className="space-y-2 pt-2">
                        {post.options.map((opt, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between text-xs font-semibold text-slate-700">
                            <span>{opt.text}</span>
                            <span className="text-indigo-600">{opt.votes} Votes</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Apply Button for Hiring Posts */}
                    {post.type === "hiring" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleApply(post.id)}
                          disabled={hasApplied(post.id)}
                          className={`text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 ${
                            hasApplied(post.id)
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{hasApplied(post.id) ? "Application Submitted" : "Apply for Job"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE BUILDER & ATS RESUME EXPORT */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Profile & Resume Builder</h2>
                <p className="text-xs text-slate-500">
                  Fill your details once to export a 1-click ATS-friendly PDF resume without tables or parsing errors.
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportATSResume(profile)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
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

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Headline</label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={profile.summary}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills & Core Technical Ability</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. React, Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-indigo-600 text-white font-bold px-4 rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                      <span>{s}</span>
                      <button type="button" onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-indigo-800">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Experience & Internships</label>
                  <button type="button" onClick={addExperience} className="text-xs font-bold text-indigo-600 hover:underline">
                    + Add Experience
                  </button>
                </div>
                <div className="space-y-3">
                  {profile.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{exp.title}</span> - <span className="text-xs text-slate-600">{exp.organization}</span>
                        <span className="ml-2 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {exp.mode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Languages Known</label>
                  <input
                    type="text"
                    value={Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages}
                    onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(",").map(s => s.trim()) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                {savingProfile ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: FIND ALUMNI DIRECTORY */}
        {activeTab === "alumni" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Find Alumni Directory</h2>
                <p className="text-xs text-slate-500">Spot alumni working at your target companies for referral requests</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company, role or name..."
                  value={alumniSearch}
                  onChange={(e) => setAlumniSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlumni.map((alumni) => (
                <div key={alumni.uid || alumni.email} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-base">
                        {alumni.name?.[0] || "A"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{alumni.name}</h3>
                        <p className="text-xs text-slate-500">{alumni.jobRole}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{alumni.company}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <p>Domain: <strong className="text-slate-800">{alumni.domain}</strong></p>
                    <p>Experience: <strong className="text-slate-800">{alumni.experienceYears} Years</strong></p>
                    <p>Location: <strong className="text-slate-800">{alumni.location}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL DISCUSSION */}
        {activeTab === "chat" && (
          <GlobalDiscussionBox />
        )}

      </div>

      {/* Skill Verification Modal */}
      <SkillVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={loadData}
      />
    </div>
  );
};
