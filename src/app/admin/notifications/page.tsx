"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: number;
  _id: string;
  title: string;
  subtitle: string;
  user: string;
  role: string;
  school: string;
  type: string;
  message: string;
  topic: string;
  date: string;
  status: string;
  className?: string;
  otherTypeText?: string;
  studentId?: string;
  schoolId?: string;
  questionId?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Build URL with filter
      const url = filter === "all" 
        ? "/api/issues" 
        : `/api/issues?status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setSelectedNotification(data.notifications?.[0] || null);
      } else {
        console.error("Failed to fetch notifications:", data.error);
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!selectedNotification) return;
    
    try {
      const res = await fetch(`/api/issues/${selectedNotification._id}`);
      const data = await res.json();
      
      if (data.success) {
        console.log("Full issue details:", data.issue);
        // Open modal or navigate to detail page
        alert("Issue Details:\n\n" + JSON.stringify(data.issue, null, 2));
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error viewing issue:", error);
      alert("Failed to view issue details");
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedNotification) return;
    
    if (selectedNotification.status === "resolved") {
      alert("This issue is already resolved!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${selectedNotification._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" })
      });

      const data = await res.json();
      
      if (data.success) {
        alert("✅ Issue marked as resolved!");
        await fetchNotifications();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error resolving issue:", error);
      alert("Failed to mark as resolved");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    
    if (!confirm(`Are you sure you want to delete this issue?\n\n"${selectedNotification.message}"\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${selectedNotification._id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      
      if (data.success) {
        alert("🗑️ Issue deleted successfully!");
        await fetchNotifications();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Failed to delete issue");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "resolved"
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-yellow-100 text-yellow-700 border-yellow-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Issue Management</h1>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter("all")}
            disabled={loading}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            All Issues ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            disabled={loading}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              filter === "pending"
                ? "bg-yellow-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("resolved")}
            disabled={loading}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              filter === "resolved"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Resolved
          </button>
        </div>

        <div className="flex gap-6">
          {/* Notification List */}
          <div className="w-2/3 bg-[#F1F3FB] p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🔔 Notifications
            </h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            )}
            
            {!loading && notifications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No notifications found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {filter !== "all" ? `No ${filter} issues available` : "All clear!"}
                </p>
              </div>
            )}
            
            {!loading && notifications.map((n) => (
              <div
                key={n._id}
                className={`border-l-4 pl-4 py-3 mb-2 cursor-pointer transition-all rounded-r-lg ${
                  selectedNotification?._id === n._id
                    ? "border-blue-600 bg-white shadow-md"
                    : "border-transparent hover:bg-white/60"
                }`}
                onClick={() => setSelectedNotification(n)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs italic text-gray-500 mt-1">{n.subtitle}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${getStatusBadgeColor(n.status)}`}
                  >
                    {n.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Notification Detail */}
          <div className="w-1/3 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
              📝 Feedback Details
            </h3>
            
            {selectedNotification ? (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="pb-3 border-b">
                  <p className="text-sm font-semibold text-gray-800">
                    👤 {selectedNotification.user}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedNotification.role}
                    {selectedNotification.className && ` • ${selectedNotification.className}`}
                  </p>
                </div>
                
                {/* School */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">SCHOOL</p>
                  <p className="text-sm text-gray-800">🏫 {selectedNotification.school}</p>
                </div>
                
                {/* Issue Type */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">ISSUE TYPE</p>
                  <p className="text-sm text-gray-800">📝 {selectedNotification.type}</p>
                </div>
                
                {/* Other Type Text */}
                {selectedNotification.otherTypeText && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ADDITIONAL DETAILS</p>
                    <p className="text-sm text-gray-800">💬 {selectedNotification.otherTypeText}</p>
                  </div>
                )}
                
                {/* Message */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-2">MESSAGE</p>
                  <p className="text-sm italic text-gray-700">
                    "{selectedNotification.message}"
                  </p>
                </div>
                
                {/* Topic */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">TOPIC</p>
                  <p className="text-sm text-gray-800">📘 {selectedNotification.topic}</p>
                </div>
                
                {/* Date */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">REPORTED ON</p>
                  <p className="text-sm text-gray-600">📅 {selectedNotification.date}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t">
               {/*    <button
                    onClick={handleView}
                    disabled={loading}
                    className="w-full border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    👁️ View Full Details
                  </button> */}
                  <button
                    onClick={handleMarkAsResolved}
                    disabled={loading || selectedNotification.status === "resolved"}
                    className="w-full border-2 border-green-600 text-green-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {selectedNotification.status === "resolved" 
                      ? "✅ Already Resolved" 
                      : "✓ Mark As Resolved"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full border-2 border-red-500 text-red-500 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    🗑️ Delete Issue
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-sm text-gray-400">
                  Select a notification to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}