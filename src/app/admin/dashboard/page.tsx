"use client";

import { useEffect, useState } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSchools: 0, issues: 0 });
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [schools, setSchools] = useState([]);
  const [activePanel, setActivePanel] = useState<"schools" | "issues">("schools");

  const levels = ["All", "Pre A1", "A1", "A1+", "A2", "B1", "B2", "B2+", "C1", "C1+"];

  const issues = [
    {
      user: "Gabby | Class A2 | Student",
      school: "XYZ International School",
      type: "Instruction/Text",
      message: `"Question 2 says ‘enviroment’ instead of ‘environment’. ”`,
      topic: "Grammar Basics | Term 2",
      date: "July 9, 2025",
    },
    {
      user: "Topic: Grammar Basics | Term 2",
      date: "July 9, 2025",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      setStats(data.stats);
      setAllTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setSchools(data.schools);
    };
    fetchData();
  }, []);

  const handleLevelClick = (level: string) => {
    setSelectedLevel(level);
    if (level === "All") {
      setFilteredTasks(allTasks);
    } else {
      setFilteredTasks(allTasks.filter((task: any) => task.level === level));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Main Content */}
      <div className="flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => setActivePanel("schools")}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Total Schools</p>
                <p className="text-3xl font-bold text-[#0046D2]">{stats.totalSchools}</p>
              </div>
              <button className="bg-[#0046D2] text-white w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
          <div
            onClick={() => setActivePanel("issues")}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Issues & Feedbacks</p>
                <p className="text-3xl font-bold text-[#0046D2]">{stats.issues}</p>
              </div>
              <button className="bg-white border border-[#0046D2] text-[#0046D2] w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h3 className="text-[#2D3E50] font-semibold text-lg mb-4">Tasks Assigned</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`text-xs px-3 py-1.5 rounded-full ${
                  selectedLevel === level
                    ? "bg-black text-white"
                    : "bg-white border border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          {filteredTasks.map((task: any, i) => (
            <div
              key={i}
              className="flex justify-between items-center border border-[#0046D2] rounded-full px-5 py-3 mb-3 hover:shadow-sm"
            >
              <div>
                <p className="font-bold text-sm text-[#2D3E50]">
                  {task.title} ({task.questionCount} Ques.)
                </p>
                <p className="text-xs text-[#999]">Type - {task.type}</p>
              </div>
              <button className="text-[#0046D2] border border-[#0046D2] px-4 py-1.5 text-sm rounded-full hover:bg-[#0046D2] hover:text-white transition">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[340px] bg-white p-6 rounded-2xl shadow">
        {activePanel === "schools" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#2D3E50] flex items-center gap-2">
                <span role="img">🏫</span> Schools
              </h3>
              <button className="text-[#2D3E50] text-xl">
                <FiSettings />
              </button>
            </div>
            {schools.map((school, i) => (
              <div
                key={i}
                className="flex justify-between items-center border border-[#D9D9D9] rounded-full px-4 py-3 mb-3 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span className="text-sm font-medium text-[#2D3E50]">{school.name}</span>
                </div>
                <button className="text-[#0046D2] text-xl">→</button>
              </div>
            ))}
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-[#2D3E50] mb-4 flex items-center gap-2">
              <span role="img">🧾</span> Issues & Feedback
            </h3>
            <div className="flex gap-4 mb-4">
              <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm">
                Pending
              </button>
              <button className="px-4 py-1.5 rounded-full border border-black text-sm">
                Resolved
              </button>
            </div>
            {issues.map((issue, i) => (
              <div key={i} className="border border-[#D9D9D9] rounded-2xl p-4 mb-4 shadow-sm">
                <p className="text-sm font-semibold">{issue.user}</p>
                <p className="text-xs text-[#666] mb-1">{issue.school}</p>
                <p className="text-sm font-semibold text-blue-700">📘 Issue Type: {issue.type}</p>
                <p className="text-sm mb-2 text-[#333] italic">“{issue.message}”</p>
                <p className="text-sm font-semibold">⭐ Topic: {issue.topic}</p>
                <p className="text-sm text-[#666] mb-3">📅 {issue.date}</p>
                <div className="flex gap-2">
                  <button className="border border-[#0046D2] text-[#0046D2] px-4 py-1 rounded-full text-sm">
                    View
                  </button>
                  <button className="border border-green-600 text-green-600 px-3 py-1 rounded-full text-sm">
                    ✓ Mark As Resolved
                  </button>
                  <button className="border border-red-500 text-red-500 px-3 py-1 rounded-full text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}