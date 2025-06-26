import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/globals.css';
import { FaHome, FaFolderOpen, FaEye, FaUpload, FaPlus } from 'react-icons/fa';
import { auth, signInWithGoogle, signOutUser } from '../services/firebase';
import auraLogo from '../assets/aura-logo.png';
import { useIsMobileScreen } from '../services/deviceUtils';

const navLinks = [
  { to: '/', label: 'Dashboard', shortLabel: 'Home', icon: <FaHome /> },
  { to: '/file-index', label: 'File Index', shortLabel: 'Index', icon: <FaFolderOpen /> },
  { to: '/file-viewer', label: 'File Viewer', shortLabel: 'View', icon: <FaEye /> },
  { to: '/upload-file', label: 'Upload File', shortLabel: 'Upload', icon: <FaUpload /> },
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
  const isMobile = useIsMobileScreen();
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
                  <span className="header-nav-text-full">{link.label}</span>
                  <span className="header-nav-text-short">{link.shortLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {!isMobile && (user ? (
          <div className="header-user-info">
            <span className="header-user-name">{user.displayName || user.email}</span>
            <button className="header-login-btn" onClick={signOutUser}>Log Out</button>
          </div>
        ) : (
          <button className="header-login-btn" onClick={signInWithGoogle}>Log In</button>
        ))}
      </div>
    </header>
  );
};

export default Header;