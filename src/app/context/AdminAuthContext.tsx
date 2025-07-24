"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminAuthContext = createContext<any>(null);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  const login = (data: any) => {
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    localStorage.setItem("adminToken", data.token);
    setAdmin(data.user);
    router.push("/admin/dashboard");
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);