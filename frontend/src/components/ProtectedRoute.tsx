import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

// Wrapper around routes that require authentication and optional role checks.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but not allowed to view this route.
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};






