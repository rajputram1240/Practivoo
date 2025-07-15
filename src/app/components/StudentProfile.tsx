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
import { toast } from "react-toastify"; 


export default function StudentProfile({ student, levels,setStudent,setStudents }: { student: any,levels?: any;setStudent: (student: any) => void; setStudents?: React.Dispatch<React.SetStateAction<any[]>>;
 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);

  const handleSaveProfile = async (updatedUser: any) => {
  try {
    const res = await fetch(`/api/students/${student._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!res.ok) throw new Error("Failed to update student");

    const updatedData = await res.json();
    console.log("Student updated:", updatedData);
    toast.success("Profile updated successfully!"); // ✅ Show popup

    setIsEditing(false);

    // ✅ Update profile display (and table if needed)
    setStudent(updatedData);

    // Update students list in parent
    if (setStudents) {
      setStudents((prev) =>
        prev.map((s) => (s._id === updatedData._id ? updatedData : s))
      );
    }
  } catch (err) {
    console.error("Update error:", err);
  }
};

const handleDeleteStudent = async () => {
  try {
    const res = await fetch(`/api/students/${student._id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete student");

    toast.success(`${student.name} removed successfully!`);
    setShowRemovePopup(false);
    setStudent(null); // Clear profile view

    // Remove student from table
    if (setStudents) {
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
    }
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to remove student");
  }
};

  if (!student) return null;

  if (isEditing && student) {
  return <EditProfile onBack={() => setIsEditing(false)} user={student} levels={levels} onSave={handleSaveProfile} />;
 }


  if (isChatOpen) {
    return <MessageBox onBack={() => setIsChatOpen(false)} user={student} />;
  }
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img
            src={student.avatar || "/avatar5.png"}
            alt={student.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">{student.name}</h2>
            <p className="text-sm text-gray-400">Student ID: {student.studentId}</p>
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
            <p className="text-sm font-bold">{student.points || 0}</p>
          </div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <div className="bg-[#F1F3FB] p-2 rounded-full">
            <BsGraphUpArrow className="text-purple-600 text-lg" />
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Level</p>
            <p className="text-sm font-bold">{student.levelName}</p>
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">{student.name}'s Weekly Report</h3>
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
          <span>{student.name}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm">
          <FiMail className="text-gray-500" />
          <span>{student.email}</span>
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
          🗑 Remove {student.name}
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
  name={student.name}
  onCancel={() => setShowRemovePopup(false)}
  onConfirm={handleDeleteStudent}
/>
        </div>
      )}
    </div>
  );
}