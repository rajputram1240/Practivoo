"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";

const levels = ["All", "Pre A-1", "A1", "A1+", "A2", "A2+", "B1", "B2", "B2+"];

export default function AddClassPage() {
  const [className, setClassName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [level, setLevel] = useState("Level");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const newClasses = ["Class 123", "Class 345", "Class 678", "Class 789"];

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Section */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Class</h1>

          {/* Class Name & Level */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-40"
            >
              <option disabled>Level</option>
              {levels.slice(1).map((lvl) => (
                <option key={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Teacher Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Add Teacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Add Another Link */}
          <div className="mb-6 text-sm text-[#0046D2] cursor-pointer flex items-center gap-2">
            <span className="text-lg">➕</span> Add another
          </div>

          {/* Add Class Button */}
          <button className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm">
            Add Class
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">New Classes</h2>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  selectedFilter === lvl
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Class List */}
          <div className="space-y-2 pt-2">
            {newClasses.map((cls, i) => (
              <div
                key={i}
                className="w-full px-4 py-2 border border-black rounded-full text-sm font-semibold text-gray-800"
              >
                {cls}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}