"use client"
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import WeeklyTasks from "../components/WeeklyTasks";
import StudentList from "../components/StudentList";
import { FiUsers, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";

type DashboardData = {
  studentCount: number;
  teacherCount: number;
  tasks: any[]; // Replace 'any' with your actual task type if available
  weeklyStats: Record<string, any>; // Replace 'any' with your actual stats type if available
  termStats: Record<string, any>; // Replace 'any' with your actual stats type if available
  students: any[]; // Replace 'any' with your actual student type if available
  classes: any[]; // Replace 'any' with your actual class type if available
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");


  const [schoolId, setSchoolId] = useState("");

  const fetchDashboardData = async () => {

    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    setSchoolId(schoolId);
    console.log(schoolId);
    try {
      setLoading(true);
      const response = await fetch(
        `/api/schools/${schoolId}/dashboard?term=${selectedTerm}&week=${selectedWeek}&search=${encodeURIComponent(searchQuery)}`
      );
      const res = await response.json();
      setDashboardData(res);
      console.log(res);
    } catch (error) {
      console.error("Error fetching school dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTerm, selectedWeek]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        fetchDashboardData();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Section: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Total Students"
              count={dashboardData?.studentCount || 0}
              icon={<FiUsers />}
            />
            <StatCard
              title="Total Teachers"
              count={dashboardData?.teacherCount || 0}
              icon={<FiUser />}
            />
          </div>

          {/* Weekly Tasks Below Stats */}
          <WeeklyTasks
            tasklist={dashboardData?.tasks || []}
            selectedTerm={selectedTerm}
            onTermChange={setSelectedTerm}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            weeklyStats={dashboardData?.weeklyStats || {}}
            termStats={dashboardData?.termStats || {}}
          />
        </div>

        {/* Right Section: Student List */}
        <div className="lg:col-span-4">
          <StudentList
            studentlist={dashboardData?.students || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            classes={dashboardData?.classes || []}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}