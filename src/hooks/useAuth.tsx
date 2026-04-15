import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface StaffUser {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  staffUser: StaffUser | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffUser = async (userId: string) => {
    const { data } = await supabase
      .from("staff_users")
      .select("*")
      .eq("auth_user_id", userId)
      .eq("is_active", true)
      .single();
    setStaffUser(data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(() => fetchStaffUser(session.user.id), 0);
        } else {
          setStaffUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStaffUser(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setStaffUser(null);
  };

  const hasRole = (role: AppRole) => staffUser?.role === role;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        staffUser,
        role: staffUser?.role ?? null,
        loading,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
