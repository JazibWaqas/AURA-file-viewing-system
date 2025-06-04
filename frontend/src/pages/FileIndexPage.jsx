import Sidebar from "../components/Sidebar.jsx";
import FileIndex from "../components/FileIndex.jsx";

export default function FileIndexPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar with fixed width */}
      <div className="w-64 bg-white border-r">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 bg-gray-50 px-6 py-4">
        <FileIndex />
      </main>
    </div>
  );
}
