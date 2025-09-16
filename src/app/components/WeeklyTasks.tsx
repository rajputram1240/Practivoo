"use client";

import { useState } from "react";
import { FaRegEye } from "react-icons/fa";

const weeks = ["Week-1", "Week-2", "Week-3", "Week-4", "Week-5", "Week-6", "Week-7", "Week-8", "Week-9", "Week-10", "Week-11", "Week-12"];

interface Task {
  _id: string;
  title: string;
  type: string;
  score: string;
  submissions: number;
  status: string;
  questionsCount: number;
  term: number;
  week: number;
}

interface WeeklyTasksProps {
  tasklist: Task[];
  selectedTerm: number;
  onTermChange: (term: number) => void;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  weeklyStats: Record<string, number>;
  termStats: Record<string, { tasks: number; submissions: number }>;
}

export default function WeeklyTasks({
  tasklist,
  selectedTerm,
  onTermChange,
  selectedWeek,
  onWeekChange,
  weeklyStats,
  termStats
}: WeeklyTasksProps) {
  const terms = [
    { value: 1, label: "Term 1" },
    { value: 2, label: "Term 2" },
    { value: 3, label: "Term 3" },
    { value: 4, label: "Term 4" },
  ];

  const getWeekButtonText = (weekNumber: number) => {
    const weekKey = `Week ${weekNumber}`;
    const count = weeklyStats[weekKey] || 0;
    return count > 0 ? `Week-${weekNumber} (${count})` : `Week-${weekNumber}`;
  };

  // Check if current term has any data
  const currentTermStats = termStats[`Term ${selectedTerm}`];
  const hasTermData = currentTermStats && (currentTermStats.tasks > 0 || currentTermStats.submissions > 0);

  // Check if current week has any data
  const currentWeekStats = weeklyStats[`Week ${selectedWeek}`] || 0;
  const hasWeekData = currentWeekStats > 0;

  return (
    <div className="bg-white rounded-[20px] p-6 shadow flex flex-col max-h-[500px]">
      {/* Term Tabs */}
      <div className="flex space-x-6 text-sm font-semibold mb-4">
        {terms.map((term) => {
          const termData = termStats[term.label];
          const hasData = termData && (termData.tasks > 0 || termData.submissions > 0);

          return (
            <button
              key={term.value}
              onClick={() => onTermChange(term.value)}
              className={`pb-2 transition ${selectedTerm === term.value
                ? "border-b-2 border-black text-black"
                : hasData ? "text-gray-700 hover:text-black" : "text-gray-400"
                }`}
            >
              {term.label}
              {termData && termData.submissions > 0 && (
                <span className="ml-1 text-xs">
                  ({termData.submissions})
                </span>
              )}
              {!hasData && (
                <span className="ml-1 text-xs text-gray-400">(0)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Show "No data for term" message if term has no data */}
      {!hasTermData && (
        <div className="text-center text-gray-500 py-8 border-2 border-gray-200 rounded-lg mb-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-lg font-medium">No Data Available</p>
          <p className="text-sm">No tasks or submissions found for Term {selectedTerm}</p>
        </div>
      )}

      {/* Only show rest of component if term has data */}
      {hasTermData && (
        <>
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
            {weeks.map((week, index) => {
              const weekNumber = index + 1;
              const weekCount = weeklyStats[`Week ${weekNumber}`] || 0;
              const hasWeekData = weekCount > 0;

              return (
                <button
                  key={week}
                  onClick={() => onWeekChange(weekNumber)}
                  className={`px-4 py-1 text-sm rounded-full border transition-colors ${selectedWeek === weekNumber
                    ? "bg-[#0046D2] text-white"
                    : hasWeekData
                      ? "bg-white text-black hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!hasWeekData}
                >
                  Week-{weekNumber}
                  {weekCount > 0 && <span className="ml-1">({weekCount})</span>}
                </button>
              );
            })}
          </div>

          {/* Tasks Section */}
          <div className="space-y-4 overflow-y-auto pr-2">
            {!hasWeekData ? (
              <div className="text-center text-gray-500 py-8 border-2 border-gray-200 rounded-lg">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-lg font-medium">No Tasks This Week</p>
                <p className="text-sm">No tasks or submissions found for Week {selectedWeek}</p>
                <p className="text-xs text-gray-400 mt-2">Try selecting a different week</p>
              </div>
            ) : tasklist && tasklist.length > 0 ? (
              tasklist.map((task) => (
                <div
                  key={task._id}
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
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 border-2 border-gray-200 rounded-lg">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-lg font-medium">Tasks Found But No Data</p>
                <p className="text-sm">Week {selectedWeek} has submissions but no task details loaded</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}