"use client";

import { usePathname } from "next/navigation";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { IoChevronBackSharp } from "react-icons/io5";
import { PiGenderIntersex } from "react-icons/pi";
import { LiaBusinessTimeSolid } from "react-icons/lia";

export default function EditProfile({ onBack }: { onBack: () => void }) {
  const pathname = usePathname();
  const isTeacher = pathname.includes("teacher");
  const isStudent = pathname.includes("student");

  return (
    <div className="bg-white w-full max-w-sm p-6 rounded-2xl space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-black font-semibold text-lg mb-4">
        <button onClick={onBack} className="text-xl text-black">
          <IoChevronBackSharp />
        </button>
        <h2>Edit Profile</h2>
      </div>

      {/* Conditional Inputs */}
      <div className="space-y-4">
        {/* Name + Gender (Teacher) */}
        {isTeacher && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <div className="flex items-center border border-black rounded-xl px-4 py-2">
                <FiUser className="text-gray-600 mr-2" />
                <input
                  type="text"
                  defaultValue="Mr.Hook"
                  className="flex-1 outline-none text-sm bg-transparent text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
              <div className="flex items-center border border-black rounded-xl px-4 py-2">
                <PiGenderIntersex className="text-gray-600 mr-2" />
                <input
                  type="text"
                  defaultValue="Male"
                  className="flex-1 outline-none text-sm bg-transparent text-black"
                />
              </div>
            </div>
          </>
        )}

        {/* Name + Level (Student) */}
        {isStudent && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2">
                <FiUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  defaultValue="Joy"
                  className="flex-1 outline-none text-sm bg-transparent text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-[0.6rem] text-sm text-gray-800 bg-white outline-none">
                <option>Pre A1</option>
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
                <option>B2</option>
                <option>C1</option>
              </select>
            </div>
          </>
        )}

        {/* YOE (Teacher only) */}
        {isTeacher && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">YOE</label>
            <div className="flex items-center border border-black rounded-xl px-4 py-2">
              <LiaBusinessTimeSolid className="text-gray-600 mr-2" />
              <input
                type="text"
                defaultValue="4 Years"
                className="flex-1 outline-none text-sm bg-transparent text-black"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">E-Mail</label>
          <div className="flex items-center border border-black rounded-xl px-4 py-2">
            <FiMail className="text-gray-600 mr-2" />
            <input
              type="email"
              defaultValue="alex234@gmail.com"
              className="flex-1 outline-none text-sm bg-transparent text-black"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
          <div className="flex items-center border border-black rounded-xl px-4 py-2">
            <FiLock className="text-gray-600 mr-2" />
            <input
              type="password"
              defaultValue="123456789"
              className="flex-1 outline-none text-sm bg-transparent text-black"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button className="w-full bg-[#EDF1FF] text-black py-3 rounded-full font-semibold text-sm hover:bg-[#dce4ff] transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}