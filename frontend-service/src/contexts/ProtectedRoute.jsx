// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  // const { auth } = useAuth();
  // const location = useLocation();

  // if (!auth.token) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // if (allowedRoles && !allowedRoles.includes(auth.user?.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  const { auth, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!auth?.user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
