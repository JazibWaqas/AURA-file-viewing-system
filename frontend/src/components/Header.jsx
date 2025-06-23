import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/globals.css';
import { FaHome, FaFolderOpen, FaEye, FaUpload, FaPlus } from 'react-icons/fa';
import { auth, signInWithGoogle, signOutUser } from '../services/firebase';
import auraLogo from '../assets/aura-logo.png';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/file-index', label: 'File Index', icon: <FaFolderOpen /> },
  { to: '/file-viewer', label: 'File Viewer', icon: <FaEye /> },
  { to: '/upload-file', label: 'Upload File', icon: <FaUpload /> },
];

// Simple auth state hook
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  return user;
}

const Header = () => {
  const location = useLocation();
  const user = useAuth();
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo-container">
          <Link to="/">
            <img src={auraLogo} alt="AURA Logo" className="header-logo" />
          </Link>
        </div>
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
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#333' }}>{user.displayName || user.email}</span>
            <button className="header-login-btn" onClick={signOutUser}>Log Out</button>
          </div>
        ) : (
          <button className="header-login-btn" onClick={signInWithGoogle}>Log In</button>
        )}
      </div>
    </header>
  );
};

export default Header;