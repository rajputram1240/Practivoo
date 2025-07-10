"use client";

import { useState } from "react";
import TermTabs from "../components/TermTabs";
import WeekSelector from "../components/WeekSelector";
import TaskTags from "../components/TaskTags";
import TaskCard from "../components/TaskCard";
import TaskStatsPanel from "../components/TaskStatsPanel";
import DashboardLayout from "../components/DashboardLayout";

export default function TasksPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState(0);

  return (
    <DashboardLayout>
      <div className="flex gap-6 px-6 py-6 bg-[#F6F8FF] min-h-screen">
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#2C2F5A]"></h1>
            <select className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800">
              <option>Pre A1</option>
              <option>A1</option>
            </select>
          </div>

          {/* Term Tabs */}
          <TermTabs selectedTerm={selectedTerm} onSelect={setSelectedTerm} />

          {/* Week Selector */}
          <WeekSelector selected={selectedWeek} onSelect={setSelectedWeek} />

          {/* Week Label + Action Buttons in one row */}
<div className="flex items-center justify-between mt-2">
  <h2 className="text-sm font-semibold text-gray-700">
    Week-{selectedWeek} Tasks
  </h2>

  <div className="flex items-center gap-2">
    <button className="text-xs px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100 flex items-center gap-1">
      ➕ Add Tasks
    </button>
    <button className="text-xs px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100 flex items-center gap-1">
      🗑 Remove Tasks
    </button>
  </div>
</div>


          {/* Task Tags */}
          <TaskTags />

          {/* Task Cards */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((id) => (
              <TaskCard key={id} isOpen={id === 1} />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <TaskStatsPanel />
      </div>
    </DashboardLayout>
  );
}