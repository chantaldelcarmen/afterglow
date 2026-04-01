import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import supabase from "./supabase";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

async function fetchRole(userId: string): Promise<string | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  const query = supabase.from("profiles").select("role").eq("id", userId).single()
    .then(({ data, error }) => { console.log("[fetchRole]", { data, error }); return data?.role ?? null; });
  return Promise.race([query, timeout]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      clearTimeout(fallbackTimer);
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setRole(currentUser ? await fetchRole(currentUser.id) : null);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
