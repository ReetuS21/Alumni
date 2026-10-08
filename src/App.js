import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, dashboardPath, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { Spinner } from "./components/ui";

import { AuthPage } from "./pages/AuthPage";
import { NotFound } from "./pages/NotFound";
import { PrivacyPage, TermsPage } from "./pages/LegalPages";
import { DiscussionPage } from "./pages/shared/DiscussionPage";
import { StudentProfilePage } from "./pages/shared/StudentProfilePage";
import { PersonProfilePage } from "./pages/shared/PersonProfilePage";
import { MessagesPage } from "./pages/shared/MessagesPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";
import { SettingsPage } from "./pages/shared/SettingsPage";

import { StudentDashboard } from "./pages/student/StudentDashboard";
import { ProfileBuilder } from "./pages/student/ProfileBuilder";
import { FindAlumni } from "./pages/student/FindAlumni";
import { MyApplications } from "./pages/student/MyApplications";

import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDirectory } from "./pages/teacher/StudentDirectory";
import { TeacherProfile } from "./pages/teacher/TeacherProfile";

import { AlumniDashboard } from "./pages/alumni/AlumniDashboard";
import { SearchStudents } from "./pages/alumni/SearchStudents";
import { Shortlist } from "./pages/alumni/Shortlist";
import { AlumniProfile } from "./pages/alumni/AlumniProfile";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminContent } from "./pages/admin/AdminContent";
import { AdminRollList } from "./pages/admin/AdminRollList";

const HomeRedirect = () => {
  const { authUser, user, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (!authUser) return <Navigate to="/auth" replace />;
  // Signed in but no role / connection problem: ProtectedRoute shows the right message.
  if (!user) return <ProtectedRoute />;
  return <Navigate to={dashboardPath(user.role)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Shared by every role */}
              <Route path="/discussion" element={<DiscussionPage />} />
              <Route path="/students/:uid" element={<StudentProfilePage />} />
              <Route path="/profile/:uid" element={<PersonProfilePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:cid" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route element={<ProtectedRoute role="student" />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<ProfileBuilder />} />
                <Route path="/student/alumni" element={<FindAlumni />} />
                <Route path="/student/applications" element={<MyApplications />} />
              </Route>

              <Route element={<ProtectedRoute role="teacher" />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/students" element={<StudentDirectory />} />
                <Route path="/teacher/alumni" element={<FindAlumni teacherView />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
              </Route>

              <Route element={<ProtectedRoute role="alumni" />}>
                <Route path="/alumni" element={<AlumniDashboard />} />
                <Route path="/alumni/search" element={<SearchStudents />} />
                <Route path="/alumni/shortlist" element={<Shortlist />} />
                <Route path="/alumni/profile" element={<AlumniProfile />} />
              </Route>

              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/roll-list" element={<AdminRollList />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
