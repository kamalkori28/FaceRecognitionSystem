import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { clearStoredSession, getStoredToken, getStoredUser, setStoredSession, api } from "@/lib/api";
import type { User } from "@/lib/types";

const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const response = await api.me();
        setUser(response.user);
      } catch {
        clearStoredSession();
        setUser(null);
        setToken(null);
      } finally {
        setReady(true);
      }
    };

    void bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login: async (email: string, password: string) => {
        const response = await api.login(email, password);
        setStoredSession(response.token, response.user);
        setUser(response.user);
        setToken(response.token);
      },
      logout: async () => {
        try {
          await api.logout();
        } catch {
          // Ignore logout failures on the client and clear local state.
        }
        clearStoredSession();
        setUser(null);
        setToken(null);
      },
    }),
    [ready, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

