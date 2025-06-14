import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload } from 'react-icons/fi';

const FileViewer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const { id } = useParams(); // Get file ID from URL
  const [file, setFile] = useState(null);
  const [allFiles, setAllFiles] = useState([]); // New state for all files
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
          const res = await fetch(`/api/files/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('File not found.');
            } else {
              throw new Error(`Error fetching file: ${res.statusText}`);
            }
          }
          const fileBlob = await res.blob();

          const detailsRes = await fetch(`/api/files/${id}/details`);
          if (!detailsRes.ok) {
            throw new Error(`Error fetching file details: ${detailsRes.statusText}`);
          }
          const fileDetails = await detailsRes.json();

          setFile({
            blob: fileBlob,
            url: URL.createObjectURL(fileBlob),
            ...fileDetails
          });
        } else {
          // Fetch all files for browsing
          const res = await fetch('/api/files');
          if (!res.ok) {
            throw new Error('Failed to fetch files from database.');
          }
          const data = await res.json();
          // Sort files by creation date (most recent first)
          const sortedFiles = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllFiles(sortedFiles);
          console.log('Files fetched for FileViewer (no ID):', sortedFiles);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup for single file URL object
    return () => {
      if (file && file.url) {
        URL.revokeObjectURL(file.url);
      }
    };
  }, [id]); // Depend on 'id' to re-run fetch when navigating between specific file and general view

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

  // Render loading/error states for both scenarios
  if (loading) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <div className="file-viewer-page">
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
            <div className="file-viewer-page">
              <p>Error: {error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render single file view if ID is present and file is loaded
  if (id && file) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <div className="file-viewer-page">
              <div className="file-viewer-content">
                <div className="table-of-contents">
                  <h3>File Details</h3>
                  <ul>
                    <li><strong>File Name:</strong> {file.originalName}</li>
                    <li><strong>Category:</strong> {file.category}</li>
                    <li><strong>Year:</strong> {file.year}</li>
                    <li><strong>Uploaded By:</strong> {file.uploadedBy}</li>
                    <li><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</li>
                    <li><strong>Uploaded At:</strong> {new Date(file.createdAt).toLocaleDateString()}</li>
                  </ul>
                  {file.description && (
                    <div>
                      <h4>Description:</h4>
                      <p>{file.description}</p>
                    </div>
                  )}
                </div>
                <div className="report-content">
                  <div className="report-header">
                    <h2>{file.originalName}</h2>
                    <p>{file.category} | {new Date(file.createdAt).toLocaleDateString()}</p>
                    <div className="report-actions">
                      <a href={file.url} download={file.originalName} className="action-button" title="Download File">
                        <FiDownload />
                      </a>
                    </div>
                  </div>

                  {file.fileType === 'pdf' ? (
                    <iframe src={file.url} title={file.originalName} className="pdf-viewer"></iframe>
                  ) : (file.fileType === 'excel' || file.fileType === 'csv') ? (
                    <div className="file-type-message">
                      <p>This is an {file.fileType} file. Please click the download button to view it.</p>
                      <a href={file.url} download={file.originalName} className="download-button">
                        <FiDownload />
                        Download {file.originalName}
                      </a>
                    </div>
                  ) : (
                    <div className="file-type-message">
                      <p>Unsupported file type: {file.fileType}. Please click the download button to view it.</p>
                      <a href={file.url} download={file.originalName} className="download-button">
                        <FiDownload />
                        Download {file.originalName}
                      </a>
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

  // Render file list if no ID is present and allFiles are loaded
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
                        <p>Category: {f.category}</p>
                        <p>Uploaded: {new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="file-actions">
                        <button className="action-button" title="View" onClick={(e) => { e.stopPropagation(); handleFileClick(f._id); }}>
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
                  <p className="no-files">No files found in the database.</p>
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