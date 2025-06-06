import { Link, useLocation } from "react-router-dom";
import { FaHome, FaFolderOpen, FaEye, FaUpload, FaPlus, FaTimes } from "react-icons/fa";
import "../styles/globals.css";

const navLinks = [
  { to: "/", label: "Dashboard", icon: <FaHome /> },
  { to: "/file-index", label: "File Index", icon: <FaFolderOpen /> },
  { to: "/file-viewer", label: "File Viewer", icon: <FaEye /> },
  { to: "/upload-file", label: "Upload File", icon: <FaUpload /> },
  { to: "/create-file", label: "Create File", icon: <FaPlus /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
        <FaTimes />
      </button>
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? "active" : ""}
                onClick={onClose}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-user-profile">
        <div className="sidebar-user-avatar">O</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Olivia Rhye</div>
          <div className="sidebar-user-email">olivia@example.com</div>
        </div>
      </div>
    </aside>
  );
}