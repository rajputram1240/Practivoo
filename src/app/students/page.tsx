import DashboardLayout from "../components/DashboardLayout";
import StudentProfile from "../components/StudentProfile";
import StudentTable from "../components/StudentTable";

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Student Table (main content, 8 columns) */}
        <div className="lg:col-span-8">
          <StudentTable />
        </div>

        {/* Student Profile (side panel, 4 columns) */}
        <div className="lg:col-span-4">
          <StudentProfile />
        </div>
      </div>
    </DashboardLayout>
  );
}