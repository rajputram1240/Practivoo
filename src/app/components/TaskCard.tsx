"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiEye } from "react-icons/fi";

interface TaskCardProps {
  isOpen: boolean;
  title?: string;
  questionCount?: number;
  taskType?: string;
  averageScore?: number;
  submissions?: number;
}

export default function TaskCard({
  isOpen,
  title = "Topic XYZ",
  questionCount = 20,
  taskType = "Quiz/Test/Assignment",
  averageScore = 75,
  submissions = 20,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div
      className={`rounded-[24px] p-6 bg-white transition-all ${
        expanded ? "border-2 border-[#0047FF]" : "border border-transparent"
      }`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start">
        {/* Left - Title */}
        <div>
          <h3 className="text-xl font-bold text-[#2C2F5A]">
            {title}{" "}
            <span className="text-sm font-normal text-gray-500">
              ({questionCount} Ques.)
            </span>
          </h3>

          {/* Expanded Content */}
          {expanded && (
            <>
              <p className="text-base text-gray-400 mt-1">{taskType}</p>
              <p className="text-sm text-gray-500 mt-2">
                Avg. Score -{" "}
                <span className="font-bold text-black">{averageScore}/100</span>
              </p>
            </>
          )}

          {/* Submissions Button (always shown) */}
          <div className="mt-4 flex items-center gap-2">
            <FiEye className="text-gray-700 text-lg" />
            <button className="border border-black px-4 py-1 rounded-full text-sm font-medium text-black">
              {submissions} Submissions
            </button>
          </div>
        </div>

        {/* Right - View + Toggle */}
        <div className="flex flex-col items-end justify-between h-full gap-2">
          <button onClick={() => setExpanded(!expanded)} className="text-gray-600 text-xl">
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <button className="text-xs px-5 py-2 bg-[#0047FF] text-white rounded-full hover:bg-[#0037cc] transition font-semibold">
            View Submissions
          </button>
        </div>
      </div>
    </div>
  );
}