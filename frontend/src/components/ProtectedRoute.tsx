import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../utils/AuthContext";

type Props = {
  allowedRoles?: string[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, role, loading } = useAuth();

  const roleLoading = !!user && role === null && !!allowedRoles;

  if (loading || roleLoading) return <div className="flex h-screen items-center justify-center text-white/50">Loading...</div>;

  if (!user) return <Navigate to="/signin" replace />;

  if (allowedRoles && !allowedRoles.includes(role ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
