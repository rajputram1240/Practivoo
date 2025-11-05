"use client";
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const publicRoutes = ["/login", "/login/forget-password", "/login/verify-password", "/login/reset-password", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      if (pathname.startsWith("/admin")) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      if (isPublicRoute) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      const school = localStorage.getItem("school");

      if (!school) {
        router.push("/");
        setIsChecking(false);
      } else {
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  if (isChecking || (!isAuthorized && !isPublicRoute && !pathname.startsWith("/admin"))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F3FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <AuthProvider>{children} <ToastContainer /></AuthProvider>
    </div>
  );
}
