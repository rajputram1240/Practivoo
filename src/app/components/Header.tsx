"use client";

import { Route } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSettings, FiBell } from "react-icons/fi";

export default function Header() {
  const rawPath = usePathname();
  const pathname = rawPath ?? "";
  const [image, setimage] = useState<string | null>(null); // Changed to null initially

  const router = useRouter();
  const getPageTitle = () => {
    if (pathname.startsWith("/students")) return "Students";
    if (pathname.startsWith("/teachers")) return "Teachers";
    if (pathname.startsWith("/tasks")) return "Tasks";
    if (pathname.startsWith("/levels")) return "Levels";
    if (pathname.startsWith("/add")) return "Add";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/notifications")) return "Notification";
    if (pathname.startsWith("/profile")) return "School Profile";
    return "Dashboard";
  };

  useEffect(() => {
    const fetchSchoolProfile = async () => {
      try {
        const schoolId = JSON.parse(localStorage.getItem("school") || "{}")._id || "";
        if (!schoolId) return;

        const response = await fetch(`/api/schools/${schoolId}`);
        const schoolData = await response.json();

        if (response.ok) {
          setimage(schoolData.image || "/user.png");
        } else {
          setimage("/user.png"); // Fallback on error
        }
      } catch (error) {
        console.error("Failed to fetch school profile:", error);
        setimage("/user.png"); // Fallback on error
      }
    };

    fetchSchoolProfile();
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white rounded-t-2xl shadow-sm">
      {/* Dynamic Page Title */}
      <h2 className="text-xl font-semibold text-[#2C2F5A]">{getPageTitle()}</h2>

      {/* Icons + Avatar */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <button className="w-9 h-9 cursor-pointer rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiSettings className="text-blue-900 text-base" />
          </button>
        </Link>

        <Link href="/notifications">
          <button className="w-9 h-9  cursor-pointer rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiBell className="text-red-500 text-base" />
          </button>
        </Link>

        {/* Conditionally render image only when it's available */}
        {image && (
          <img onClick={() => router.push("/profile")}
            src={image}
            alt="User Avatar"
            className="w-9 h-9 cursor-pointer rounded-full object-cover border border-gray-200 hover:shadow-lg transition"
          />
        )}
      </div>
    </div>
  );
}
