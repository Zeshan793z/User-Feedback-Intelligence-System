import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🛡 Role-based protection (if specified)
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}