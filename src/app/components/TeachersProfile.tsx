"use client";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiMessageCircle,
  FiChevronRight,
} from "react-icons/fi";
import { useState } from "react";
import EditProfile from "./EditProfile";
import MessageBox from "./MessageBox";
import RemoveConfirmation from "./RemoveConfirmation";
import ClassList from "./ClassList"; // <- make sure this exists

export default function TeachersProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ label: string; count: number } | null>(null);

  if (isEditing) return <EditProfile onBack={() => setIsEditing(false)} />;
  if (isChatOpen) return <MessageBox onBack={() => setIsChatOpen(false)} />;
 if (selectedClass) {
  return (
    <ClassList
      className={selectedClass.label}
      levelName={selectedClass.count}
      onBack={() => setSelectedClass(null)}
    />
  );
}



  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img
            src="/avatar5.png"
            alt="Mr.Hook"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">Mr.Hook</h2>
            <p className="text-sm text-gray-400">Teacher ID:1234</p>
          </div>
        </div>
        <FiMessageCircle
          className="text-gray-500 cursor-pointer"
          onClick={() => setIsChatOpen(true)}
        />
      </div>

       {/* Classes Overview */}
<div className="grid grid-cols-2 gap-3">
  {[
    { label: "Class 1", count: 26 },
    { label: "Class 2", count: 23 },
    { label: "Class 3", count: 18 },
    { label: "Class 4", count: 18 },
  ].map(({ label, count }) => (
    <button
      key={label}
     onClick={() => setSelectedClass({ label, count })}
      className="flex items-center justify-between bg-[#EDF1FF] text-sm px-4 py-2 rounded-full text-gray-800 font-medium w-full"
    >
      <span>
        {label}- <span className="font-bold">{count}</span>
      </span>
      <div className="flex items-center justify-center">
        <FiChevronRight className="text-gray-500 text-base" />
      </div>
    </button>
  ))}
</div>

      {/* Personal Info */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">Personal Details</h4>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiUser className="text-gray-500" />
          <span>Mr.Hook</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiMail className="text-gray-500" />
          <span>alex234@gmail.com</span>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Password</h4>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiLock className="text-gray-500" />
          <span>************</span>
          <FiEye className="ml-auto text-gray-500" />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowRemovePopup(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#F6F8FF] py-2 rounded-full text-sm text-black border border-gray-300"
        >
          🗑 Remove Hook
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#F6F8FF] py-2 rounded-full text-sm text-black border border-gray-300"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Popup */}
      {showRemovePopup && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded-2xl">
          <RemoveConfirmation
            name="Mr. Hook"
            onCancel={() => setShowRemovePopup(false)}
            onConfirm={() => {
              setShowRemovePopup(false);
              console.log("Removed");
            }}
          />
        </div>
      )}
    </div>
  );
}