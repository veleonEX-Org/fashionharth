import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import type { UserRole } from "../types/auth";
import { FashionLoader } from "./ui/FashionLoader";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

// Wrapper around routes that require authentication and optional role checks.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FashionLoader message="Verifying your access..." />;
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






