import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentProfiles,
  getPosts,
  createPost,
  getApplications
} from "../services/dataService";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import {
  Briefcase,
  Users,
  ShieldCheck,
  Search,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  Send,
  Award,
  Filter,
  X
} from "lucide-react";

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("search"); // search | createPost | chat
  const [students, setStudents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);

  // Search & Filter State
  const [skillSearch, setSkillSearch] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shortlistedUids, setShortlistedUids] = useState([]);

  // Post Form State
  const [postType, setPostType] = useState("hiring"); // hiring | test
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const stList = await getStudentProfiles();
    setStudents(stList);

    const pList = await getPosts();
    setPosts(pList);

    const apps = await getApplications();
    setApplications(apps);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    setPosting(true);
    await createPost({
      authorUid: user.uid,
      authorName: user.name || "Alumni",
      authorRole: "alumni",
      type: postType,
      title: postTitle,
      body: postBody,
      options: []
    });

    setPosting(false);
    setPostSuccess(postType === "hiring" ? "Hiring post published!" : "Skill test challenge published!");
    setPostTitle("");
    setPostBody("");
    loadData();
    setTimeout(() => setPostSuccess(""), 3000);
  };

  const toggleShortlist = (uid) => {
    if (shortlistedUids.includes(uid)) {
      setShortlistedUids(shortlistedUids.filter(id => id !== uid));
    } else {
      setShortlistedUids([...shortlistedUids, uid]);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSkill =
      !skillSearch.trim() ||
      s.skills?.some(sk => sk.toLowerCase().includes(skillSearch.toLowerCase())) ||
      s.tools?.some(t => t.toLowerCase().includes(skillSearch.toLowerCase())) ||
      s.name?.toLowerCase().includes(skillSearch.toLowerCase()) ||
      s.location?.toLowerCase().includes(skillSearch.toLowerCase());

    const matchesVerified = !onlyVerified || s.verifiedBadge;
    return matchesSkill && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alumni Dashboard</h1>
            <p className="text-xs text-slate-500">Hire & Refer Qualified MCA Juniors</p>
          </div>

          <div className="flex items-center space-x-2 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span>Alumnus: {user?.name}</span>
          </div>
        </div>

        {/* Summary Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Junior Candidates</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{students.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Shortlisted Candidates</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{shortlistedUids.length}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Job Applications Received</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{applications.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "search" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Students by Skill & Referral</span>
          </button>

          <button
            onClick={() => setActiveTab("createPost")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "createPost" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Hiring Job / Skill Test</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "chat" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Global Discussion Box</span>
          </button>
        </div>

        {/* TAB 1: SEARCH STUDENTS BY SKILL */}
        {activeTab === "search" && (
          <div className="space-y-6">
            {/* Search Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter students by skill (e.g. React, Python, Node.js, SQL) or location..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Verified Filter Checkbox */}
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500 rounded"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Only AI-Verified Skill Status</span>
              </label>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map(student => (
                <div key={student.uid || student.email} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                        {student.verifiedBadge ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>AI-VERIFIED</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded">Unverified</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{student.designation}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs px-3 py-1.5 rounded-lg border border-purple-200"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => toggleShortlist(student.uid)}
                        className={`font-bold text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          shortlistedUids.includes(student.uid)
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        {shortlistedUids.includes(student.uid) ? "✓ Shortlisted" : "+ Shortlist"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {student.skills?.map(sk => (
                      <span key={sk} className="bg-purple-50 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-100">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 flex justify-between pt-2 border-t border-slate-100">
                    <span>Location: {student.location || "N/A"}</span>
                    <span>Tools: {student.tools?.slice(0, 3).join(", ") || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: POST HIRING JOB OR TEST */}
        {activeTab === "createPost" && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>Post Hiring Opening or Skill Challenge</span>
            </h2>

            {postSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {postSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPostType("hiring")}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg ${
                      postType === "hiring" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    💼 Hiring Job Opening
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("test")}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg ${
                      postType === "test" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    🏆 Skill Challenge / Test
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer Opening at TechCorp"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description / Requirements</label>
                <textarea
                  rows={4}
                  required
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Mention job responsibilities, tech stack, and referral instructions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={posting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Student Feed</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: GLOBAL DISCUSSION */}
        {activeTab === "chat" && (
          <GlobalDiscussionBox />
        )}

        {/* Student Full Profile Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center text-xl">
                  {selectedStudent.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.designation}</p>
                </div>
              </div>

              {selectedStudent.verifiedBadge && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>AI-VERIFIED SKILL STATUS: Endorsed & Tested</span>
                </div>
              )}

              {selectedStudent.summary && (
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase">Professional Summary</h4>
                  <p className="text-xs text-slate-600 mt-1">{selectedStudent.summary}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase">Skills & Tools</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedStudent.skills?.map(sk => (
                    <span key={sk} className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    toggleShortlist(selectedStudent.uid);
                    setSelectedStudent(null);
                  }}
                  className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  {shortlistedUids.includes(selectedStudent.uid) ? "Remove from Shortlist" : "+ Shortlist for Job Referral"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
