import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "./roles";
import type { JSX } from "react";

export function RequireAuth({
  children,
  allowedRoles
}: {
  children: JSX.Element;
  allowedRoles: UserRole[];
}) {
  const { user, loading } = useAuth();

  // 🔒 ESPERA o Supabase responder
  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <h2>Acesso negado</h2>;
  }

  return children;
}
