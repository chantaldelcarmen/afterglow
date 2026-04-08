import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../utils/AuthContext";
import { LoadingScreen } from "./LoadingScreen";

type Props = {
  allowedRoles?: string[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, role, loading } = useAuth();

  const roleLoading = !!user && role === null && !!allowedRoles;

  if (loading || roleLoading) return <LoadingScreen />;

  if (!user) return <Navigate to="/signin" replace />;

  if (allowedRoles && !allowedRoles.includes(role ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
