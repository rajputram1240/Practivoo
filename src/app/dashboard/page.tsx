import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import WeeklyTasks from "../components/WeeklyTasks";
import StudentList from "../components/StudentList";
import { FiUsers, FiUser } from "react-icons/fi";

export default function DashboardPage() {
  return (
    <DashboardLayout>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Section: 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Total Students" count={126} icon={<FiUsers />} />
              <StatCard title="Total Teachers" count={26} icon={<FiUser />} />
            </div>

            {/* Weekly Tasks Below Stats */}
            <WeeklyTasks />
          </div>

          {/* Right Section: Student List */}
          <div className="lg:col-span-4">
            <StudentList />
          </div>
        </div>
    </DashboardLayout>
  );
}