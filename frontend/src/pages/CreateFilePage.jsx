import React, { useState, useEffect } from 'react';
import '../styles/CreateFile.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

const CreateFile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 900);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="create-file-page">
            <div className="viewing-system-header">
              <h2>VIEWING SYSTEM</h2>
            </div>

            <div className="create-file-section">
              <h3>CREATE A FILE</h3>
              <button className="done-button">DONE</button>
              <div className="data-grid">
                {/* Simple grid for data entry */}
                {[...Array(10)].map((_, rowIndex) => (
                  <div key={rowIndex} className="grid-row">
                    {[...Array(5)].map((_, colIndex) => (
                      <input key={colIndex} type="text" className="grid-cell" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateFile;