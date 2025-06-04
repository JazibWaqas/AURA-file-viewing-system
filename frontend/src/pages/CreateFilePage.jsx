import Sidebar from "../components/Sidebar.jsx";
import CreateFile from "../components/CreateFile.jsx";

export default function CreateFilePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <CreateFile />
      </div>
    </div>
  );
}
