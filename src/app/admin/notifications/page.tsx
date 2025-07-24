// src/app/admin/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data.notifications);
      setSelectedNotification(data.notifications?.[0] || null);
    };
    fetchData();
  }, []);

  return (
    <div className="flex gap-6">
      {/* Notification List */}
      <div className="w-2/3 bg-[#F1F3FB] p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">🔔 Notifications</h2>
        {notifications.map((n, idx) => (
          <div
            key={idx}
            className={`border-l-4 pl-4 py-3 mb-2 cursor-pointer ${
              selectedNotification?.id === n.id
                ? "border-blue-600 bg-white shadow"
                : "border-transparent"
            }`}
            onClick={() => setSelectedNotification(n)}
          >
            <p className="font-semibold">{n.title}</p>
            <p className="text-xs italic text-gray-500">{n.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Notification Detail */}
      <div className="w-1/3 bg-white p-6 rounded-2xl shadow">
        <h3 className="text-lg font-bold mb-4">Feedback</h3>
        {selectedNotification ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              👤 {selectedNotification.user} | {selectedNotification.role}
            </p>
            <p className="text-sm">🏫 {selectedNotification.school}</p>
            <p className="text-sm">
              📝 <strong>Issue Type:</strong> {selectedNotification.type}
            </p>
            <p className="text-sm italic">"{selectedNotification.message}"</p>
            <p className="text-sm">📘 Topic: {selectedNotification.topic}</p>
            <p className="text-sm">📅 {selectedNotification.date}</p>

            <div className="flex gap-2 mt-4">
              <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-600 hover:text-white">
                View
              </button>
              <button className="border border-green-600 text-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-600 hover:text-white">
                Mark As Resolved
              </button>
              <button className="border border-red-500 text-red-500 px-3 py-1 rounded-full text-sm hover:bg-red-500 hover:text-white">
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Select a notification to view details.</p>
        )}
      </div>
    </div>
  );
}