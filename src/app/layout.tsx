"use client";
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Public routes for school panel that don't need authentication
  const publicRoutes = ["/login", "/login/forget-password", "/login/verify-password", "/login/reset-password","/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      // Skip check for admin routes (they have their own layout protection)
      if (pathname.startsWith("/admin")) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Skip protection for public routes
      if (isPublicRoute) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check for school user in localStorage
      const school = localStorage.getItem("school");

      if (!school) {
        // No school found - redirect to login
        router.push("/");
        setIsChecking(false);
      } else {
        // School found - allow access
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  // Show loading spinner while checking authorization
  if (isChecking || (!isAuthorized && !isPublicRoute && !pathname.startsWith("/admin"))) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <div className="flex items-center justify-center min-h-screen bg-[#F1F3FB]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
