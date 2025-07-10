// app/levels/page.tsx
"use client";

import DashboardLayout from "../components/DashboardLayout";
import {
  FiUsers,
  FiUserCheck,
  FiChevronRight,
  FiChevronDown,
  FiEdit2,
} from "react-icons/fi";
import { useState } from "react";

const levels = [
  "Pre A-1", "A1", "A1+", "A2", "A2+",
  "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"
];

const classes = ["Class 1", "Class 2", "Class 3", "Class 4"];
const students = [
  { name: "Jay", score: 40, avatar: "/avatar1.png" },
  { name: "Gabby", score: 36, avatar: "/avatar2.png" },
  { name: "Billy", score: 30, avatar: "/avatar3.png" },
  { name: "Neena", score: 29, avatar: "/avatar4.png" },
  { name: "Kitty", score: 29, avatar: "/avatar5.png" },
];

export default function LevelsPage() {
  const [selectedLevel, setSelectedLevel] = useState("Pre A-1");
  const [selectedTeacher, setSelectedTeacher] = useState("Mr.Hook");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [editValue, setEditValue] = useState(selectedLevel);

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Panel */}
        <div className="w-1/3 bg-[#E8EEFF] p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Levels List</h2>
          <div className="space-y-2">
            {levels.map((level) => (
              <div
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedLevel === level ? "bg-white text-black" : "text-gray-800"
                }`}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-[#EEF3FF] p-6 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="bg-white p-4 rounded-xl flex justify-between items-center">
            <h2 className="font-semibold text-sm">{selectedLevel}</h2>
            <button
              className="text-xs border p-2 rounded-lg"
              onClick={() => setEditPopupOpen(true)}
            >
              ✎
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-white flex-1 p-4 rounded-xl flex items-center gap-2">
              <FiUsers className="text-lg text-[#0047FF]" />
              <div>
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-sm font-semibold">300</p>
              </div>
            </div>
            <div className="bg-white flex-1 p-4 rounded-xl flex items-center gap-2">
              <FiUserCheck className="text-lg text-[#0047FF]" />
              <div>
                <p className="text-xs text-gray-500">Total Teachers</p>
                <p className="text-sm font-semibold">5</p>
              </div>
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Classes</h3>
              <select className="text-xs border px-2 py-1 rounded-lg">
                <option>Mr.Hook</option>
              </select>
            </div>
            <div className="space-y-2">
              {classes.map((cls) => (
                <div key={cls}>
                  <div
                    className="flex justify-between items-center bg-[#F8FAFF] px-4 py-2 rounded-full text-sm cursor-pointer"
                    onClick={() =>
                      setExpandedClass(expandedClass === cls ? null : cls)
                    }
                  >
                    <span>{cls}</span>
                    <FiChevronRight
                      className={`text-gray-500 transition-transform duration-200 ${
                        expandedClass === cls ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {/* Students List */}
                  {expandedClass === cls && (
                    <div className="bg-[#EDF1FF] p-4 mt-2 rounded-xl space-y-2">
                      {students.map((student, i) => (
                        <div
                          key={student.name}
                          className="flex justify-between items-center bg-white px-4 py-2 rounded-full"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">#{i + 1}</span>
                            <img
                              src={student.avatar}
                              className="w-6 h-6 rounded-full"
                              alt="avatar"
                            />
                            <span className="text-sm">{student.name}</span>
                          </div>
                          <div className="text-sm font-semibold px-3 py-1 rounded-full bg-white border">
                            {student.score} ⭐
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Edit Popup */}
          {editPopupOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
              <div className="bg-white rounded-2xl p-6 w-[220px] shadow-lg">
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#EDF1FF] text-sm mb-4"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setEditPopupOpen(false)}
                    className="px-3 py-1 text-sm rounded-full bg-white border"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLevel(editValue);
                      setEditPopupOpen(false);
                    }}
                    className="px-3 py-1 text-sm rounded-full bg-black text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}