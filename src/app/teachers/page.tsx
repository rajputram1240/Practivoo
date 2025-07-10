import DashboardLayout from "../components/DashboardLayout";
import TeachersProfile from "../components/TeachersProfile";
import TeachersTable from "../components/TeachersTable";

export default function TeachersPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Student Table (main content, 8 columns) */}
        <div className="lg:col-span-8">
          <TeachersTable />
        </div>

        {/* Student Profile (side panel, 4 columns) */}
        <div className="lg:col-span-4">
          <TeachersProfile />
        </div>
      </div>
    </DashboardLayout>
  );
}