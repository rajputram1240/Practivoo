// src/app/admin/layout.tsx
"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AdminAuthProvider } from "@/app/context/AdminAuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;

  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen bg-[#F1F3FB]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}