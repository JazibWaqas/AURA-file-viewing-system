import React, { useState, useEffect } from 'react';
import '../styles/UploadFile.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

const UploadFile = () => {
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
          <div className="upload-file-page">
            <div className="income-statement-section">
              <h2>Income Statement</h2>
              <button className="upload-button">
                <i className="fa fa-upload"></i> Upload File
              </button>

              <div className="year-section">
                <h4>2024</h4>
                <div className="upload-slots">
                  <div className="upload-slot"></div>
                  <div className="upload-slot"></div>
                </div>
              </div>

              <div className="year-section">
                <h4>2023</h4>
                <div className="upload-slots">
                  <div className="upload-slot"></div>
                  <div className="upload-slot"></div>
                </div>
              </div>

              <div className="year-section">
                <h4>2022</h4>
                <div className="upload-slots">
                  <div className="upload-slot"></div>
                  <div className="upload-slot"></div>
                </div>
              </div>

              <button className="create-report-button">
                <i className="fa fa-plus"></i> Create Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadFile;