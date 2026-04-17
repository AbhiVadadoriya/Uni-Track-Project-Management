import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "./DashboardLayout";

// Wrapper for checking Authentication and Roles
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // Not allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children wrapped in DashboardLayout
  return (
    <DashboardLayout userRole={authUser.role?.toLowerCase()}>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedRoute;
