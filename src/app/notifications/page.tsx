"use client";

import { useEffect, useState } from "react";
import { FiStar, FiChevronDown, FiChevronUp, FiPaperclip } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";

interface Notification {
  _id: string;
  receiver: string;
  message: string;
  title: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationGroup {
  [key: string]: Notification[];
}

export default function NotificationPage() {
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState<NotificationGroup>({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const school = JSON.parse(localStorage.getItem("school") || "{}");
        const token = school.token;

        const res = await fetch("/api/auth/notifications", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();

        console.log("Notifications data:", data);
        
        // Access the nested Notifications object
        const notificationsData = data.Notifications || {};
        setNotifications(notificationsData);
        
        // Set the first notification as selected
        const firstGroup = Object.values(notificationsData).find(
          (group) => Array.isArray(group) && group.length > 0
        ) as Notification[];
        
        if (firstGroup && firstGroup.length > 0) {
          setSelectedNotification(firstGroup[0]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Format full date
  const formatFullDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Notification List */}
        <div className="w-1/3 border-r p-6 bg-[#F1F4FD] overflow-y-auto">
          <h2 className="text-xl font-semibold text-[#2C2F5A] mb-6">Notification</h2>

          {Object.keys(notifications).length === 0 ? (
            <p className="text-sm text-gray-500">No notifications available</p>
          ) : (
            Object.entries(notifications).map(([dateGroup, items]) => {
              // Ensure items is an array before mapping
              if (!Array.isArray(items)) return null;
              
              return (
                <div key={dateGroup} className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{dateGroup}</p>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-400 ml-2">No notifications</p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => setSelectedNotification(item)}
                          className={`bg-white rounded-md px-4 py-2 cursor-pointer hover:bg-[#E4EBFF] transition ${
                            selectedNotification?._id === item._id ? "bg-[#E4EBFF] border-l-4 border-blue-500" : ""
                          } ${!item.isRead ? "font-semibold" : ""}`}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <FiPaperclip className="text-gray-500" />
                            <p className="text-black flex-1">{item.title}</p>
                            <span className="text-xs text-gray-500">{formatTime(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-5 mt-1 truncate">
                            {item.message}
                          </p>
                          {!item.isRead && (
                            <div className="ml-5 mt-1">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detailed View */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {selectedNotification ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">From: Admin</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{formatFullDate(selectedNotification.createdAt)}</span>
                  <FiStar className="text-yellow-400 cursor-pointer hover:fill-yellow-400" />
                  <button className="ml-2">⋮</button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2C2F5A]">{selectedNotification.title}</h2>
                {!selectedNotification.isRead && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    New
                  </span>
                )}
              </div>

              <div className="bg-[#E9EEFF] px-4 py-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <p className="text-sm font-medium text-[#2C2F5A]">{selectedNotification.type}</p>
                </div>
            {/*     {selectedNotification.type === "TASK" && (
                  <button className="text-xs font-semibold px-4 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100">
                    View Questions
                  </button>
                )} */}
              </div>

              <div className="border rounded-xl p-4 bg-white">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpanded(!expanded)}
                >
                  <h3 className="text-sm font-semibold text-gray-700">
                    Message Details
                  </h3>
                  {expanded ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expanded && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedNotification.message}
                    </p>
                    <div className="pt-2 border-t mt-2">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Notification ID:</span> {selectedNotification._id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-semibold">Status:</span>{" "}
                        {selectedNotification.isRead ? "Read" : "Unread"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

             
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a notification to view details</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}