'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

type AppUser = {
  uid: string;
  email?: string;
  pacienteId?: string;
  nombre?: string;
  apellido?: string;
} | null;

type Ctx = { user: AppUser; loading: boolean };
const AuthContext = createContext<Ctx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        const idToken = await fbUser.getIdToken();
        const res = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const { user: serverUser } = await res.json();
        setUser(serverUser ?? null);  // contiene pacienteId y datos de Mongo
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
