"use client";

import { useState } from "react";

const students = [
  { name: "Joy", avatar: "/avatar1.png" },
  { name: "Gabby", avatar: "/avatar2.png" },
  { name: "Billy", avatar: "/avatar3.png" },
  { name: "Neena", avatar: "/avatar4.png" },
  { name: "Juliana", avatar: "/avatar5.png" },
  { name: "Juliana", avatar: "/avatar5.png" },
  { name: "Juliana", avatar: "/avatar5.png" },
];

const levels = ["All", "Pre A-1", "A1", "A2", "A2+", "B1"];

export default function StudentList() {
  const [selectedLevel, setSelectedLevel] = useState("All");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Total Students</h3>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-black" />
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="w-3 h-3 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs font-medium">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-3 py-1 rounded-full border ${
              selectedLevel === level
                ? "bg-black text-white"
                : "bg-[#F9FAFF] text-gray-600"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">🔍</span>
      </div>

      {/* Student List */}
      <div className="overflow-y-auto pr-1 space-y-3 flex-1">
        {students.map((student, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-[#F4F6FF] px-4 py-2 rounded-full shadow-sm"
          >
            <div className="flex items-center gap-3">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{student.name}</span>
            </div>
            <button className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700 transition">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}