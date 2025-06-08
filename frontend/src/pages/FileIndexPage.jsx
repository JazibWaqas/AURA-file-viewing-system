// ... existing imports ...
import React, { useState, useEffect } from 'react';
import '../styles/FileIndex.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const FileIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [recentFiles, setRecentFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recentRes, categoriesRes, allFilesRes] = await Promise.all([
          fetch('/api/files/recent'),
          fetch('/api/categories'),
          fetch('/api/files'),
        ]);
        setRecentFiles(await recentRes.json());
        setCategories(await categoriesRes.json());
        setAllFiles(await allFilesRes.json());
      } catch (err) {
        console.error('Error fetching data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleViewFile = async (fileId) => {
    // Log the view in backend, then navigate to viewer
    await fetch(`/api/files/${fileId}/view`, { method: 'POST' });
    navigate(`/file-viewer/${fileId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="file-index-page">
            <div className="search-filter-bar">
              <input type="text" placeholder="Search files..." className="search-input" />
              <button className="filter-button">Filter by Type</button>
              <button className="filter-button">Filter by Year</button>
            </div>

            {/* Recent Files Scrollbox */}
            <div className="recent-files-grid">
              <h2>Recent Files</h2>
              <div className="file-cards-container" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {recentFiles.length === 0 ? (
                  <p>No recent files.</p>
                ) : (
                  recentFiles.map((file) => (
                    <div key={file._id} className="file-card" style={{ display: 'inline-block', minWidth: 250 }}>
                      <img src={file.image} alt={file.title} className="file-thumbnail" />
                      <div className="file-info">
                        <h4>{file.title}</h4>
                        <p>{file.type}</p>
                        <p>{file.date}</p>
                      </div>
                      <button className="view-file-button" onClick={() => handleViewFile(file._id)}>
                        View File
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Categories Overview Scrollbox */}
            <div className="categories-overview-section">
              <h2>Categories Overview</h2>
              <div className="category-cards-container" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {categories.length === 0 ? (
                  <p>No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.name} className="category-card" style={{ display: 'inline-block', minWidth: 200 }}>
                      <h4>{cat.name}</h4>
                      <p>{cat.count} files in category</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* All Files Scrollbox */}
            <div className="recent-files-grid">
              <h2>All Accounting Files</h2>
              <div className="file-cards-container" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {allFiles.length === 0 ? (
                  <p>No files found.</p>
                ) : (
                  allFiles.map((file) => (
                    <div key={file._id} className="file-card" style={{ display: 'inline-block', minWidth: 250 }}>
                      <img src={file.image} alt={file.title} className="file-thumbnail" />
                      <div className="file-info">
                        <h4>{file.title}</h4>
                        <p>{file.type}</p>
                        <p>{file.date}</p>
                      </div>
                      <button className="view-file-button" onClick={() => handleViewFile(file._id)}>
                        View File
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileIndex;