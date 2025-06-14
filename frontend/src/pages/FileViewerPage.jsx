import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiArrowLeft, FiInfo, FiCalendar, FiUser, FiFolder } from 'react-icons/fi';

const FileViewer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 900);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          // Fetch specific file details and content
          const [fileRes, detailsRes] = await Promise.all([
            fetch(`/api/files/${id}`),
            fetch(`/api/files/${id}/details`)
          ]);

          if (!fileRes.ok || !detailsRes.ok) {
            throw new Error(fileRes.status === 404 ? 'File not found' : 'Error fetching file');
          }

          const [fileBlob, fileDetails] = await Promise.all([
            fileRes.blob(),
            detailsRes.json()
          ]);

          setFile({
            blob: fileBlob,
            url: URL.createObjectURL(fileBlob),
            ...fileDetails
          });
        } else {
          // Fetch all files for browsing
          const res = await fetch('/api/files');
          if (!res.ok) {
            throw new Error('Failed to fetch files');
          }
          const data = await res.json();
          setAllFiles(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
    };
  }, [id]);

  const handleFileClick = (fileId) => {
    navigate(`/file-viewer/${fileId}`);
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <div className="loading-container">
              <FiLoader className="spinner-icon" />
              <p>Loading content...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <div className="error-container">
              <h2>Error Loading File</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (id && file) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <div className="file-viewer-page">
              <div className="file-viewer-header">
                <button className="back-button" onClick={() => navigate('/file-index')}>
                  <FiArrowLeft /> Back to Files
                </button>
                <h1>{file.originalName}</h1>
              </div>

              <div className="file-viewer-content">
                <div className="file-details-sidebar">
                  <div className="details-section">
                    <h3>File Information</h3>
                    <ul>
                      <li>
                        <FiFolder />
                        <span>Category:</span>
                        <strong>{file.category}</strong>
                      </li>
                      <li>
                        <FiCalendar />
                        <span>Year:</span>
                        <strong>{file.year}</strong>
                      </li>
                      <li>
                        <FiUser />
                        <span>Uploaded By:</span>
                        <strong>{file.uploadedBy}</strong>
                      </li>
                      <li>
                        <FiInfo />
                        <span>Size:</span>
                        <strong>{(file.size / 1024).toFixed(2)} KB</strong>
                      </li>
                      <li>
                        <FiCalendar />
                        <span>Uploaded:</span>
                        <strong>{new Date(file.createdAt).toLocaleDateString()}</strong>
                      </li>
                    </ul>
                  </div>

                  {file.description && (
                    <div className="description-section">
                      <h3>Description</h3>
                      <p>{file.description}</p>
                    </div>
                  )}

                  <div className="actions-section">
                    <button 
                      className="download-button"
                      onClick={() => handleDownload(file._id, file.originalName)}
                    >
                      <FiDownload /> Download File
                    </button>
                  </div>
                </div>

                <div className="file-preview">
                  {file.fileType === 'pdf' ? (
                    <iframe 
                      src={file.url} 
                      title={file.originalName} 
                      className="pdf-viewer"
                    />
                  ) : (file.fileType === 'excel' || file.fileType === 'csv') ? (
                    <div className="file-type-message">
                      <FiFile className="file-type-icon" />
                      <p>This is an {file.fileType} file. Please download it to view the contents.</p>
                      <button 
                        className="download-button"
                        onClick={() => handleDownload(file._id, file.originalName)}
                      >
                        <FiDownload /> Download {file.originalName}
                      </button>
                    </div>
                  ) : (
                    <div className="file-type-message">
                      <FiFile className="file-type-icon" />
                      <p>This file type cannot be previewed. Please download it to view the contents.</p>
                      <button 
                        className="download-button"
                        onClick={() => handleDownload(file._id, file.originalName)}
                      >
                        <FiDownload /> Download {file.originalName}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="file-viewer-page">
            <div className="file-list-section">
              <h2>All Available Files</h2>
              <div className="file-list-grid">
                {allFiles.length > 0 ? (
                  allFiles.map((f) => (
                    <div key={f._id} className="file-card" onClick={() => handleFileClick(f._id)}>
                      <div className="file-icon">
                        <FiFile />
                      </div>
                      <div className="file-info">
                        <h3>{f.originalName}</h3>
                        <p><FiFolder /> {f.category}</p>
                        <p><FiCalendar /> {new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="file-actions">
                        <button 
                          className="action-button" 
                          title="View" 
                          onClick={(e) => { e.stopPropagation(); handleFileClick(f._id); }}
                        >
                          <FiEye />
                        </button>
                        <button 
                          className="action-button" 
                          title="Download" 
                          onClick={(e) => { e.stopPropagation(); handleDownload(f._id, f.originalName); }}
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FiFile className="empty-icon" />
                    <p>No files found in the database.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileViewer;