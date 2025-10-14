// app/levels/page.tsx
"use client";

import DashboardLayout from "../components/DashboardLayout";
import {
  FiUsers,
  FiUserCheck,
  FiChevronRight,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function LevelsPage() {
  const [levelStats, setLevelStats] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    setSchoolId(schoolId);
    console.log(schoolId);
    fetch(`/api/levels/summary?schoolId=${schoolId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setLevelStats(data.levels || []);
        if (data.levels?.length > 0) {
          setSelectedLevel(data.levels[0].levelname);
          setEditValue(data.levels[0].levelname);
        }
      });
  }, []);

  const selectedData = levelStats.find((l) => l.levelname === selectedLevel);

  const handleUpdateLevel = async () => {
    const selected = levelStats.find((l) => l.levelname === selectedLevel);
    if (!selected) return;

    const res = await fetch(`/api/levels/${selected._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ levelname: editValue }),
    });

    if (res.ok) {
      setLevelStats((prev) =>
        prev.map((lvl) =>
          lvl._id === selected._id ? { ...lvl, levelname: editValue } : lvl
        )
      );
      setSelectedLevel(editValue);
      setEditPopupOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Panel */}
        <div className="w-1/3 bg-[#E8EEFF] p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Level List</h2>
          <div className="space-y-2">
            {levelStats.map((levelData) => (
              <div
                key={levelData._id}
                onClick={() => {
                  setSelectedLevel(levelData.levelname);
                  setEditValue(levelData.levelname);
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium ${selectedLevel === levelData.levelname
                  ? "bg-white text-black"
                  : "text-gray-800"
                  }`}
              >
                {levelData.levelname}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-[#EEF3FF] p-6 flex flex-col gap-4 relative">
          {/* Header */}
          <div className="bg-white p-4 rounded-xl flex justify-between items-center">
            <h2 className="font-semibold text-sm">{selectedLevel}</h2>
           {/*  <button
              className="text-xs border p-2 rounded-lg"
              onClick={() => setEditPopupOpen(true)}
            >
              ✎
            </button> */}
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-white flex-1 p-4 rounded-xl flex items-center gap-2">
              <FiUsers className="text-lg text-[#0047FF]" />
              <div>
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-sm font-semibold">{selectedData?.studentCount || 0}</p>
              </div>
            </div>
            <div className="bg-white flex-1 p-4 rounded-xl flex items-center gap-2">
              <FiUserCheck className="text-lg text-[#0047FF]" />
              <div>
                <p className="text-xs text-gray-500">Total Teachers</p>
                <p className="text-sm font-semibold">{selectedData?.teacherCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Classes</h3>
              <select className="text-xs border px-2 py-1 rounded-lg">
                {selectedData?.classes[0]?.teachers.map((t: any) => (
                  <option key={t._id}>{t.name}</option>
                )) || <option>No teacher</option>}
              </select>
            </div>
            <div className="space-y-2">
              {selectedData?.classes.map((cls: any) => (
                <div key={cls.name}>
                  <div
                    className="flex justify-between items-center bg-[#F8FAFF] px-4 py-2 rounded-full text-sm cursor-pointer"
                    onClick={() =>
                      setExpandedClass(expandedClass === cls.name ? null : cls.name)
                    }
                  >
                    <span>{cls.name}</span>
                    <FiChevronRight
                      className={`text-gray-500 transition-transform duration-200 ${expandedClass === cls.name ? "rotate-90" : ""
                        }`}
                    />
                  </div>

                  {/* Students List */}
                  {expandedClass === cls.name && (
                    <div className="bg-[#EDF1FF] p-4 mt-2 rounded-xl space-y-2">
                      {cls.students.map((student: any, i: number) => (
                        <div
                          key={student._id}
                          className="flex justify-between items-center bg-white px-4 py-2 rounded-full"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">#{i + 1}</span>
                            <img
                              src={student.avatar || "/user.png"}
                              className="w-6 h-6 rounded-full"
                              alt="avatar"
                            />
                            <span className="text-sm">{student.name}</span>
                          </div>
                          <div className="text-sm font-semibold px-3 py-1 rounded-full bg-white border">
                            {student.score || 0} ⭐
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
                    onClick={handleUpdateLevel}
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