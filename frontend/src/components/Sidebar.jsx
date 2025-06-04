import { Link, useLocation } from "react-router-dom";
import { FaHome, FaFolderOpen, FaEye, FaUpload, FaPlus, FaUser } from "react-icons/fa";

const navLinks = [
  { to: "/", label: "Dashboard", icon: <FaHome /> },
  { to: "/file-index", label: "File Index", icon: <FaFolderOpen /> },
  { to: "/file-viewer", label: "File Viewer", icon: <FaEye /> },
  { to: "/upload-file", label: "Upload File", icon: <FaUpload /> },
  { to: "/create-file", label: "Create File", icon: <FaPlus /> },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar w-64 min-h-screen bg-white border-r flex flex-col shadow-subtle">
      <div className="p-6 font-extrabold text-2xl text-indigo-700 tracking-wide border-b mb-2">
        {/* Logo or App Name */}
        Al Umeed
      </div>
      <div className="px-6 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        Files
      </div>
      <nav className="flex-1">
        <ul className="mt-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center gap-3 px-6 py-2 rounded-l-full transition font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 mb-1 ${
                  location.pathname === link.to
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : ""
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t bg-gray-50 text-gray-500 text-sm flex items-center gap-2">
        <FaUser className="text-lg" />
        User Profile
      </div>
    </aside>
  );
}