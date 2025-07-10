"use client";

import { useState } from "react";
import { FiStar, FiChevronDown, FiChevronUp, FiPaperclip } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";

const notifications = [
  { date: "Today", items: [{ title: "New Assignment published by admin", time: "1h" }] },
  { date: "Yesterday", items: [{ title: "New Assignment published by admin", time: "18h" }] },
];

export default function NotificationPage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Notification List */}
        <div className="w-1/3 border-r p-6 bg-[#F1F4FD] overflow-y-auto">
          <h2 className="text-xl font-semibold text-[#2C2F5A] mb-6">Notification</h2>

          {notifications.map((section) => (
            <div key={section.date} className="mb-4">
              <p className="text-sm font-semibold text-gray-700">{section.date}</p>
              <div className="mt-1 space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-md px-4 py-2 cursor-pointer hover:bg-[#E4EBFF] transition"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FiPaperclip className="text-gray-500" />
                      <p className="text-black">{item.title}</p>
                      <span className="ml-auto text-xs text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-5 mt-1">
                      Ready for your review and evaluation
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Detailed View */}
        <div className="flex-1 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">From: Admin</p>
            </div>
            <div className="text-xs text-gray-500 space-x-2">
              <span>28th June, 2025, 10:30 AM</span>
              <FiStar className="inline text-yellow-400" />
              <button className="ml-2">⋮</button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#2C2F5A]">New Assignment</h2>

          <div className="bg-[#E9EEFF] px-4 py-3 rounded-xl flex justify-between items-center">
            <p className="text-sm font-medium text-[#2C2F5A]">Topic XYZ</p>
            <button className="text-xs font-semibold px-4 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100">
              View Questions
            </button>
          </div>

          <div className="border rounded-xl p-4 bg-white">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              <h3 className="text-sm font-semibold text-gray-700">
                Additional Message
              </h3>
              {expanded ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {expanded && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it to make a
                type specimen book. It has survived not only five...
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}