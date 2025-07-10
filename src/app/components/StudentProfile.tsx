"use client";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiMessageCircle,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import { BsGraphUpArrow } from "react-icons/bs";
import { useState } from "react";
import EditProfile from "./EditProfile";
import DonutProgress from "./DonutProgress";
import MessageBox from "./MessageBox";
import RemoveConfirmation from "./RemoveConfirmation";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);

  if (isEditing) {
    return <EditProfile onBack={() => setIsEditing(false)} />;
  }

  if (isChatOpen) {
    return <MessageBox onBack={() => setIsChatOpen(false)} />;
  }

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img
            src="/avatar5.png"
            alt="Joy"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">Joy</h2>
            <p className="text-sm text-gray-400">Student ID: 1234</p>
          </div>
        </div>
        <FiMessageCircle
          className="text-gray-500 cursor-pointer"
          onClick={() => setIsChatOpen(true)}
        />
      </div>

      {/* Points + Level */}
      <div className="flex gap-4">
        <div className="flex-1 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <div className="bg-[#F1F3FB] p-2 rounded-full">
            <FiBarChart2 className="text-blue-600 text-lg" />
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Points</p>
            <p className="text-sm font-bold">25</p>
          </div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <div className="bg-[#F1F3FB] p-2 rounded-full">
            <BsGraphUpArrow className="text-purple-600 text-lg" />
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Level</p>
            <p className="text-sm font-bold">A1</p>
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">Joy’s Weekly Report</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button className="px-3 py-1 border rounded-full">Week 1, Term 2</button>
            <FiSettings className="text-gray-400" />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative w-20 h-20">
            <DonutProgress percentage={90} />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-xs text-blue-600 font-bold leading-tight">
              <span>Total Tasks</span>
              <span className="text-lg">90</span>
            </div>
          </div>

          <div className="text-xs text-gray-800 space-y-1">
            <p>
              <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
              Pending <b>8/10</b>
            </p>
            <p>
              <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
              Completed <b>2/10</b>
            </p>
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium text-gray-700">
          <span>Max Score <b>78/100</b></span>
          <span>Min Score <b>50/100</b></span>
        </div>
      </div>

      {/* Personal Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Personal Details</h4>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm mb-2">
          <FiUser className="text-gray-500" />
          <span>Joy</span>
        </div>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm">
          <FiMail className="text-gray-500" />
          <span>alex234@gmail.com</span>
        </div>
      </div>

      {/* Password */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Password</h4>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm">
          <FiLock className="text-gray-500" />
          <span>********</span>
          <FiEye className="ml-auto text-gray-500" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-full text-sm hover:bg-gray-100 transition"
          onClick={() => setShowRemovePopup(true)}
        >
          🗑 Remove Joy
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-[#0046D2] text-white py-2 rounded-full text-sm hover:bg-blue-700 transition"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Popup - within card */}
      {showRemovePopup && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded-2xl">
          <RemoveConfirmation
  name="Joy" // or "Mr. Hook"
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