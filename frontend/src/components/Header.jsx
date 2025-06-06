import React from 'react';
import '../styles/globals.css';

const Header = ({ onMenuClick }) => (
  <header className="header">
    <button className="hamburger" onClick={onMenuClick} aria-label="Open sidebar">
      <span />
      <span />
      <span />
    </button>
    <div className="header-content">
      <h1 className="header-title">Al Umeed organisation</h1>
    </div>
  </header>
);

export default Header;