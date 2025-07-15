"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [school, setSchool] = useState(null);
  const router = useRouter();

  const login = (schoolData: any) => {
    setSchool(schoolData);
    localStorage.setItem("school", JSON.stringify(schoolData));
    router.push("/dashboard"); // Or /dashboard
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

export const useAuth = () => useContext(AuthContext);