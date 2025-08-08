"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = { id: string; email: string; role: "admin"; name?: string } | null;

const AdminAuthContext = createContext<{
  admin: AdminUser;
  login: (user: NonNullable<AdminUser>) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser>(null);
  const router = useRouter();

  // hydrate UI from localStorage (not used for auth decisions)
  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  const login = async (user: NonNullable<AdminUser>) => {
    // the /api/admin/login route already set the HttpOnly `token` cookie
    setAdmin(user);
    localStorage.setItem("adminUser", JSON.stringify(user));
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" }); // clears cookie
    } catch (e) {
      console.error("Logout error", e);
    }
    setAdmin(null);
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
