import Sidebar from "../components/Sidebar.jsx";
import Dashboard from "../components/Dashboard.jsx";

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <Dashboard />
      </div>
    </div>
  );
}