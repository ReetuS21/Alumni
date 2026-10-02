import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentProfiles,
  getAlumniProfiles,
  getPosts,
  createPost,
  getTeacherProfiles
} from "../services/dataService";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import {
  Users,
  Building,
  FileText,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Search,
  CheckCircle2,
  Send,
  X
} from "lucide-react";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // overview | createPost | students | chat
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [posts, setPosts] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Post Form State
  const [postType, setPostType] = useState("notice"); // notice | poll
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [pollOption3, setPollOption3] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const stList = await getStudentProfiles();
    setStudents(stList);

    const alList = await getAlumniProfiles();
    setAlumni(alList);

    const pList = await getPosts();
    setPosts(pList);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    setPosting(true);
    let options = [];
    if (postType === "poll") {
      options = [
        { text: pollOption1 || "Option 1", votes: 0 },
        { text: pollOption2 || "Option 2", votes: 0 }
      ];
      if (pollOption3.trim()) {
        options.push({ text: pollOption3, votes: 0 });
      }
    }

    await createPost({
      authorUid: user.uid,
      authorName: user.name || "Teacher",
      authorRole: "teacher",
      type: postType,
      title: postTitle,
      body: postBody,
      options: options
    });

    setPosting(false);
    setPostSuccess("Notice/Poll published successfully to the student feed!");
    setPostTitle("");
    setPostBody("");
    setPollOption1("");
    setPollOption2("");
    setPollOption3("");
    loadData();
    setTimeout(() => setPostSuccess(""), 3000);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.skills?.some(sk => sk.toLowerCase().includes(studentSearch.toLowerCase())) ||
    s.designation?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-xs text-slate-500">Department of Computer Science & Applications</p>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span>Faculty Member: {user?.name}</span>
          </div>
        </div>

        {/* Summary Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Registered Students</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{students.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Registered Alumni</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{alumni.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Active Posts & Notices</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{posts.length}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "overview" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Create & Manage Posts</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "students" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>View Student Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === "chat" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Global Discussion Box</span>
          </button>
        </div>

        {/* TAB 1: CREATE NOTICE OR POLL */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Post Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Publish Notice or Poll</span>
              </h2>

              {postSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  {postSuccess}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Post Type</label>
                  <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPostType("notice")}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg ${
                        postType === "notice" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      📢 Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType("poll")}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg ${
                        postType === "poll" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      📊 Student Poll
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
                    placeholder="e.g. Placement Drive Announcement"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Body Content / Instructions</label>
                  <textarea
                    rows={3}
                    required
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="Provide detailed description..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {postType === "poll" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Poll Options</label>
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={pollOption1}
                      onChange={(e) => setPollOption1(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={pollOption2}
                      onChange={(e) => setPollOption2(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Option 3 (Optional)"
                      value={pollOption3}
                      onChange={(e) => setPollOption3(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={posting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Student Feed</span>
                </button>
              </form>
            </div>

            {/* List of Published Posts */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-slate-900 text-lg">Active Department & Alumni Posts</h2>
              {posts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{post.authorName} ({post.authorRole})</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {post.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{post.title}</h3>
                  <p className="text-xs text-slate-600">{post.body}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: VIEW STUDENT PROFILES */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Profile Directory</h2>
                <p className="text-xs text-slate-500">Inspect full student profiles & verified skill status</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name or skill..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map(student => (
                <div key={student.uid || student.email} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                        {student.verifiedBadge && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{student.designation}</p>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      View Profile
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {student.skills?.map(sk => (
                      <span key={sk} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center text-xl">
                  {selectedStudent.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.designation}</p>
                </div>
              </div>

              {selectedStudent.summary && (
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase">Summary</h4>
                  <p className="text-xs text-slate-600 mt-1">{selectedStudent.summary}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase">Skills</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedStudent.skills?.map(sk => (
                    <span key={sk} className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase">Location & Tools</h4>
                <p className="text-xs text-slate-600">{selectedStudent.location || "N/A"} | Tools: {selectedStudent.tools?.join(", ") || "N/A"}</p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
