import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/globals.css';
import { FaHome, FaFolderOpen, FaEye, FaUpload, FaPlus } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/file-index', label: 'File Index', icon: <FaFolderOpen /> },
  { to: '/file-viewer', label: 'File Viewer', icon: <FaEye /> },
  { to: '/upload-file', label: 'Upload File', icon: <FaUpload /> },
  { to: '/create-file', label: 'Create File', icon: <FaPlus /> },
];

const Header = () => {
  const location = useLocation();
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Al Umeed organisation</h1>
        <nav className="header-nav">
          <ul className="header-nav-list">
            {navLinks.map((link) => (
              <li key={link.to} className="header-nav-item">
                <Link
                  to={link.to}
                  className={`header-nav-link${location.pathname === link.to ? ' active' : ''}`}
                >
                  <span className="header-nav-icon">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button className="header-login-btn">Log In</button>
      </div>
    </header>
  );
};

export default Header;