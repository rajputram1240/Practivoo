"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SchoolData = {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
} | null;

const AuthContext = createContext<{
  school: SchoolData;
  login: (schoolData: any) => void;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [school, setSchool] = useState<SchoolData>(null);
  const router = useRouter();

  // Hydrate school data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("school");
    if (stored) {
      setSchool(JSON.parse(stored));
    }
  }, []);

  const login = (schoolData: any) => {
    setSchool(schoolData);
    localStorage.setItem("school", JSON.stringify(schoolData));
    router.push("/dashboard");
  };

  const logout = () => {
    setSchool(null);
    localStorage.removeItem("school");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ school, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
