"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AdminAuthProvider } from "@/app/context/AdminAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const rawPath = usePathname();
  const pathname = rawPath ?? "";
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Public admin routes (only login page)
  const publicRoutes = ["/admin/login","/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Check localStorage for admin authentication
    const checkAuth = () => {
      // Skip check for public routes
      if (isPublicRoute) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if adminUser exists in localStorage
      const adminUser = localStorage.getItem("adminUser");

      if (!adminUser) {
        // No admin user found - redirect to login
        router.push("/admin/login");
        setIsChecking(false);
      } else {
        // Admin user found - allow access
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  // Show nothing while checking authorization (prevents flash of protected content)
  if (isChecking || (!isAuthorized && !isPublicRoute)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F3FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AdminAuthProvider>
      {isPublicRoute ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen bg-[#F1F3FB]">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      )}
    </AdminAuthProvider>
  );
}