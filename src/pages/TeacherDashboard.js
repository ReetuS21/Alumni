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
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "overview");
  }, [searchParams]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await createPost({
      authorUid: user.uid,
      authorName: user.name || "Teacher",
      authorRole: "teacher",
      type: postType,
      title: postTitle,
      body: postBody,
      options: []
    });

    setPosting(false);
    setPostSuccess("Post published!");
    setPostTitle("");
    setPostBody("");
    loadData();
    setTimeout(() => setPostSuccess(""), 3000);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.skills?.some(sk => sk.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <AppLayout title="Teacher Dashboard">
      {/* 1. Small Compact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-md shadow-blue-500/15 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-100 font-medium block">Registered Students</span>
            <h3 className="text-xl font-black text-white mt-0.5 tracking-tight">{students.length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Registered Alumni</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">{alumni.length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Notices & Posts</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">{posts.length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Main Dual Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Post Publisher / Roster */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 flex space-x-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "overview" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Publish Notice / Poll
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "students" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Student Roster
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Publish Department Announcement</h3>

                {postSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                    {postSuccess}
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Post Type</label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="notice">Department Notice</option>
                      <option value="hiring">Hiring Opportunity</option>
                      <option value="poll">Interactive Poll</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Title..."
                      className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Content</label>
                    <textarea
                      rows={3}
                      required
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      placeholder="Content details..."
                      className="w-full p-2 bg-[#f4f6fa] border-none rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={posting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all"
                  >
                    Publish Post
                  </button>
                </form>
              </div>

              {/* Department Posts Feed */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900">Active Department Notices</h4>
                {posts.map(post => (
                  <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="font-bold text-xs text-slate-900">{post.title}</span>
                    <p className="text-[11px] text-slate-600">{post.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredStudents.map(student => (
                  <div key={student.uid || student.email} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{student.name}</h4>
                      <p className="text-[11px] text-slate-400">{student.designation}</p>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): GLOBAL CHATBOX FRONT AND CENTER */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <GlobalDiscussionBox />
          </div>
        </div>

      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-3 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-900 text-base">{selectedStudent.name}</h3>
            <p className="text-xs text-slate-500">{selectedStudent.designation}</p>
            <p className="text-xs text-slate-600">Skills: {selectedStudent.skills?.join(", ") || "N/A"}</p>
            <button onClick={() => setSelectedStudent(null)} className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs">
              Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
