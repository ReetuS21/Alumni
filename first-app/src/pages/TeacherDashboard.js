import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/AppLayout";
import {
  getStudentProfiles,
  getAlumniProfiles,
  getPosts,
  createPost
} from "../services/dataService";
import { GlobalDiscussionBox } from "../components/GlobalDiscussionBox";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Building,
  FileText,
  PlusCircle,
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  X
} from "lucide-react";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [posts, setPosts] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Post Form State
  const [postType, setPostType] = useState("notice");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "overview");
  }, [searchParams]);

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
    setPostSuccess("Post published to student feed!");
    setPostTitle("");
    setPostBody("");
    setPollOption1("");
    setPollOption2("");
    loadData();
    setTimeout(() => setPostSuccess(""), 3000);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.skills?.some(sk => sk.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <AppLayout title="Teacher Dashboard">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Solid Blue Highlight Metric Card */}
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
            <span className="text-xs text-blue-100 font-medium">Registered Students</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{students.length}</h3>
          </div>
        </div>

        {/* Metric Card 2 */}
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
            <span className="text-xs text-slate-400 font-medium">Registered Alumni</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{alumni.length}</h3>
          </div>
        </div>

        {/* Metric Card 3 */}
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
            <span className="text-xs text-slate-400 font-medium">Notices & Posts</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{posts.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 flex space-x-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Create & Manage Posts
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Student Roster
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

      {/* TAB 1: CREATE POST */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-white p-6 rounded-[20px] border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Publish Notice or Poll</h3>

            {postSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {postSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs text-slate-900 font-medium"
                >
                  <option value="notice">📢 Notice</option>
                  <option value="poll">📊 Student Poll</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Title..."
                  className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={3}
                  required
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Details..."
                  className="w-full p-2.5 bg-[#f4f6fa] border-none rounded-xl text-xs"
                />
              </div>

              {postType === "poll" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Option 1"
                    value={pollOption1}
                    onChange={(e) => setPollOption1(e.target.value)}
                    className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option 2"
                    value={pollOption2}
                    onChange={(e) => setPollOption2(e.target.value)}
                    className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={posting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
              >
                Publish Post
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Active Notices</h3>
            {posts.map(post => (
              <div key={post.id} className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-bold text-slate-900">{post.authorName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                <p className="text-xs text-slate-600">{post.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ROSTER */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Student Roster</h3>
            <input
              type="text"
              placeholder="Search..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-xs w-64"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredStudents.map(student => (
              <div key={student.uid || student.email} className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {student.name?.[0] || "S"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{student.name}</h4>
                    <p className="text-xs text-slate-400">{student.designation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-blue-100"
                >
                  View
                </button>
              </div>
            ))}
          </div>
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
              onClick={() => setSelectedStudent(null)}
              className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
