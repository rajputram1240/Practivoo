"use client";

import { useState } from "react";
import { FaRegEye } from "react-icons/fa";

const weeks = ["Week-1", "Week-2", "Week-3", "Week-4", "Week-5", "Week-6","Week-7","Week-8","Week-9","Week-10","Week-11","Week-12"];
const terms = ["Term 1", "Term 2", "Term 3","Term 4"];
const tasks = [
  {
    title: "Topic XYZ",
    type: "Quiz/Test/Assignment",
    score: "75/100",
    submissions: 20,
  },
  {
    title: "Topic XYZ",
    type: "Quiz/Test/Assignment",
    score: "75/100",
    submissions: 20,
  },
];

export default function WeeklyTasks() {
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedWeek, setSelectedWeek] = useState("Week-1");

  return (
    <div className="bg-white rounded-[20px] p-6 shadow flex flex-col max-h-[500px]">
      {/* Term Tabs */}
      <div className="flex space-x-6 text-sm font-semibold mb-4">
        {terms.map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`pb-2 transition ${
              selectedTerm === term
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Week Filter & Level Selector */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold">Weekly Tasks</h3>
        <select className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none">
          <option>Pre A-1</option>
          <option>A1</option>
          <option>A2</option>
        </select>
      </div>

      {/* Week Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {weeks.map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-4 py-1 text-sm rounded-full border ${
              selectedWeek === week
                ? "bg-[#0046D2] text-white"
                : "bg-white text-black"
            }`}
          >
            {week}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-4 overflow-y-auto pr-2">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="border-2 border-blue-500 rounded-2xl p-5 flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-sm">{task.title}</p>
              <p className="text-xs text-gray-500">
                {task.type} – Score: {task.score}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-2 gap-1">
                <FaRegEye />
                <span>{task.submissions} Submissions</span>
              </div>
            </div>
            <button className="text-blue-600 border border-blue-500 px-4 py-1 rounded-full text-xs font-medium hover:bg-blue-50">
              View Submissions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}