import { createContext, useContext, useEffect, useState } from "react";
import type { UserRole } from "./roles";
import { supabase } from "../lib/supabase";

interface User {
  id: number | string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log(data);
      if (data.session) {
        await loadUserProfile(data.session.user.id);
      }

      setLoading(false);
    };

    initAuth();

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });
  }, []);

  async function loadUserProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", userId)
      .single();

      if (data) {
      setUser(data);
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);