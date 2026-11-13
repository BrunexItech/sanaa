"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DemoUser = {
  name: string;
  email: string;
  avatarInitials: string;
};

type AuthState = {
  user: DemoUser | null;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "sanaa.demo.session";

const DEMO_ACCOUNT = {
  email: "demo@ushanga.africa",
  password: "UshangaDemo2026",
  name: "H.E. William Ruto",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    await new Promise((r) => setTimeout(r, 1400));
    setIsAuthenticating(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail === DEMO_ACCOUNT.email &&
      password === DEMO_ACCOUNT.password
    ) {
      const sessionUser: DemoUser = {
        name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
        avatarInitials: "WR",
      };
      setUser(sessionUser);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      } catch {
        // ignore
      }
      return { ok: true };
    }

    // Any other well-formed email/password combo also succeeds, for demo flexibility.
    if (normalizedEmail.includes("@") && password.length >= 6) {
      const inferredName = normalizedEmail.split("@")[0].replace(/[._]/g, " ");
      const titled = inferredName.replace(/\b\w/g, (c) => c.toUpperCase());
      const initials = titled
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      const sessionUser: DemoUser = {
        name: titled || "Ushanga Collector",
        email: normalizedEmail,
        avatarInitials: initials || "SA",
      };
      setUser(sessionUser);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      } catch {
        // ignore
      }
      return { ok: true };
    }

    return {
      ok: false,
      error: "Enter a valid email and a password of at least 6 characters.",
    };
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ user, isAuthenticating, login, logout }),
    [user, isAuthenticating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { DEMO_ACCOUNT };
