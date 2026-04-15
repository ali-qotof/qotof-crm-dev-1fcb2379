import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, staffUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!staffUser) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <p>ليس لديك صلاحية للوصول. تواصل مع المدير.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(staffUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
