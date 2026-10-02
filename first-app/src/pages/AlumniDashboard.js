import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/AppLayout";
import {
  getStudentProfiles,
  getPosts,
  createPost,
  getApplications
} from "../services/dataService";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Users,
  Search,
  PlusCircle,
  MessageSquare,
  Send,
  MoreVertical,
  X
} from "lucide-react";

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "search";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [students, setStudents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);

  // Search & Filter State
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shortlistedUids, setShortlistedUids] = useState([]);

  // Post Form State
  const [postType, setPostType] = useState("hiring");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "search");
  }, [searchParams]);

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
    setPostSuccess("Hiring post published!");
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

  const filteredStudents = students.filter(s =>
    !skillSearch.trim() ||
    s.skills?.some(sk => sk.toLowerCase().includes(skillSearch.toLowerCase())) ||
    s.name?.toLowerCase().includes(skillSearch.toLowerCase()) ||
    s.location?.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <AppLayout title="Alumni Dashboard">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Solid Blue Highlight Card */}
        <div className="bg-blue-600 text-white p-5 rounded-[20px] shadow-lg shadow-blue-500/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <button className="text-white/70 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-blue-100 font-medium">Junior Candidates</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{students.length}</h3>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Shortlisted Candidates</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{shortlistedUids.length}</h3>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Applications Received</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{applications.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 flex space-x-2">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "search" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Search Students & Shortlist
        </button>

        <button
          onClick={() => setActiveTab("createPost")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "createPost" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Post Hiring Job
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "chat" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Global Discussion Box
        </button>
      </div>

      {/* TAB 1: SEARCH STUDENTS */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-[20px] border border-slate-200/80 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search students by skill (React, Python, Node.js) or location..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredStudents.map(student => (
              <div key={student.uid || student.email} className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {student.name?.[0] || "S"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{student.name}</h4>
                      <p className="text-xs text-slate-400">{student.designation}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => toggleShortlist(student.uid)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        shortlistedUids.includes(student.uid)
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {shortlistedUids.includes(student.uid) ? "✓ Shortlisted" : "+ Shortlist"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {student.skills?.map(sk => (
                    <span key={sk} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: POST HIRING JOB */}
      {activeTab === "createPost" && (
        <div className="max-w-xl bg-white p-6 rounded-[20px] border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Post Hiring Opening</h3>

          {postSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              {postSuccess}
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer Opening"
                className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={4}
                required
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Mention requirements..."
                className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={posting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
            >
              Publish Job Post
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DISCUSSION */}
      {activeTab === "chat" && (
        <GlobalDiscussionBox />
      )}

      {/* Student View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-900 text-lg">{selectedStudent.name}</h3>
            <p className="text-xs text-slate-500">{selectedStudent.designation}</p>
            <div className="text-xs text-slate-600 space-y-2">
              <p><strong>Summary:</strong> {selectedStudent.summary || "N/A"}</p>
              <p><strong>Skills:</strong> {selectedStudent.skills?.join(", ") || "N/A"}</p>
              <p><strong>Location:</strong> {selectedStudent.location || "N/A"}</p>
            </div>
            <button
              onClick={() => {
                toggleShortlist(selectedStudent.uid);
                setSelectedStudent(null);
              }}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs"
            >
              {shortlistedUids.includes(selectedStudent.uid) ? "Remove from Shortlist" : "+ Shortlist Candidate"}
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
