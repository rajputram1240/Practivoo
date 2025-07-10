import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-[#F4F6FF] p-6 overflow-y-auto">
        <Header />
        {children}
      </main>
    </div>
  );
}