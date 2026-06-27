"use client";
import { useEffect, useState } from "react";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_admin: boolean;
  is_active: boolean;
  business_name: string | null;
  region: string | null;
  tax_status: string;
  last_sqb_score: number | null;
  badge_verified: boolean;
  created_at: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ff_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem("ff_user");
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

export function saveAuth(token: string, user: User) {
  localStorage.setItem("ff_token", token);
  localStorage.setItem("ff_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("ff_token");
  localStorage.removeItem("ff_user");
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
