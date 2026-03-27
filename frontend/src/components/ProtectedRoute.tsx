import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../utils/AuthContext";

type Props = {
  allowedRoles?: string[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/signin" replace />;

  if (allowedRoles && !allowedRoles.includes(role ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
