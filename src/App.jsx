import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Protected Route Component
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitProposal from "./pages/student/SubmitProposal";
import UploadFiles from "./pages/student/UploadFiles";
import SupervisorPage from "./pages/student/SupervisorPage";
import FeedbackPage from "./pages/student/FeedbackPage";
import NotificationsPage from "./pages/student/NotificationsPage";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PendingRequests from "./pages/teacher/PendingRequests";
import AssignedStudents from "./pages/teacher/AssignedStudents";
import TeacherFiles from "./pages/teacher/TeacherFiles";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth, authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect authenticated user depending on role if they try to access login
  const AuthRedirect = ({ children }) => {
    if (authUser) {
      const role = authUser.role?.toLowerCase() || "";
      if (role === "student") return <Navigate to="/student/dashboard" replace />;
      if (role === "professor") return <Navigate to="/teacher/dashboard" replace />;
      if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public API Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
        <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
        <Route path="/reset-password/:token" element={<AuthRedirect><ResetPasswordPage /></AuthRedirect>} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/proposal" element={<SubmitProposal />} />
          <Route path="/student/upload" element={<UploadFiles />} />
          <Route path="/student/supervisor" element={<SupervisorPage />} />
          <Route path="/student/feedback" element={<FeedbackPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/requests" element={<PendingRequests />} />
          <Route path="/teacher/students" element={<AssignedStudents />} />
          <Route path="/teacher/files" element={<TeacherFiles />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/teachers" element={<ManageTeachers />} />
          <Route path="/admin/assign-supervisor" element={<AssignSupervisor />} />
          <Route path="/admin/deadlines" element={<DeadlinesPage />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
        </Route>

        {/* Catch All */}
        <Route path="/unauthorized" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <h1 className="text-4xl tracking-tight text-slate-800 font-extrabold mb-2">403 Unauthorized</h1>
            <p className="text-slate-500 mb-6 font-medium">You do not have access to this page.</p>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition" onClick={() => window.history.back()}>Go Back</button>
          </div>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </BrowserRouter>
  );
};

export default App;
