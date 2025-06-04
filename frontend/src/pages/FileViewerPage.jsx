import Sidebar from "../components/Sidebar.jsx";
import FileViewer from "../components/FileViewer.jsx";

export default function FileViewerPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <FileViewer />
      </div>
    </div>
  );
}
