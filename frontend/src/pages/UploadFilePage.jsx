import Sidebar from "../components/Sidebar.jsx";
import FileUploader from "../components/FileUploader.jsx";

export default function UploadFilePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <FileUploader />
      </div>
    </div>
  );
}
