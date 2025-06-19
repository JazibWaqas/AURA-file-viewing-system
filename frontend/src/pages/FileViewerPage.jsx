import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiArrowLeft, FiInfo, FiCalendar, FiUser, FiFolder, FiTrash2 } from 'react-icons/fi';

const FileViewer = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPreviewError(null);
      setPreviewData(null);
      try {
        if (id) {
          // Fetch file details first
          const detailsRes = await fetch(`/api/files/${id}/details`);
          if (!detailsRes.ok) {
            throw new Error(detailsRes.status === 404 ? 'File not found' : 'Error fetching file details');
          }

          const fileDetails = await detailsRes.json();
          setFile(fileDetails);

          // If it's a PDF file, fetch the file for viewing
          if (fileDetails.fileType === 'pdf') {
            const viewResponse = await fetch(`/api/files/${id}/view`);
            if (viewResponse.ok) {
              const blob = await viewResponse.blob();
              fileDetails.url = URL.createObjectURL(blob);
              setFile(fileDetails);
            }
          }
          // If it's a CSV or Excel file, fetch the preview
          else if (fileDetails.fileType === 'csv' || fileDetails.fileType === 'excel') {
            try {
              const previewResponse = await fetch(`/api/files/${id}/preview`);
              if (previewResponse.ok) {
                const previewData = await previewResponse.json();
                setPreviewData(previewData);
                if (!previewData.headers || previewData.headers.length === 0) {
                  setPreviewError('No data found in this file.');
                }
              } else {
                setPreviewError('Failed to load preview data.');
              }
            } catch (err) {
              setPreviewError('Error loading preview data.');
            }
          }
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

  const handleDelete = async () => {
    if (!file || !file._id) return;

    if (window.confirm(`Are you sure you want to delete the file "${file.originalName || file.filename || file.name || 'Untitled'}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const response = await fetch(`/api/files/${file._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete file');
        }

        alert('File deleted successfully!');
        navigate('/file-index'); // Navigate back to the file index page
      } catch (error) {
        console.error('Error deleting file:', error);
        setError(error.message || 'Failed to delete file. Please try again.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Loading content...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-root">
        <Header />
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
    );
  }

  if (id && file) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content" style={{ padding: 0 }}>
          <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <div className="file-viewer-page" style={{ flex: 1, padding: '32px 40px', overflowX: 'auto', maxWidth: 1400, margin: '0 auto' }}>
              <div className="file-viewer-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="back-button" onClick={() => navigate('/file-index')}>
                    <FiArrowLeft /> Back to All Files
                  </button>
                  <h1 style={{ fontSize: '2rem', color: '#2c3e50', margin: 0 }}>{file.originalName || file.filename || file.name || 'Untitled'}</h1>
                </div>
                <button 
                  className="download-button"
                  style={{ maxWidth: 200, minWidth: 120, marginLeft: 'auto' }}
                  onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}
                >
                  <FiDownload /> Download
                </button>
              </div>
              <div className="file-viewer-content" style={{ gap: '0', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="file-details-sidebar" style={{ borderRight: '1.5px solid #ececec', minWidth: 300, maxWidth: 340, background: '#f8f9fa', borderRadius: '12px 0 0 12px', boxShadow: 'none', padding: '2rem 1.5rem' }}>
                  <div className="details-section" style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#6d28d9', marginBottom: '1.2rem', letterSpacing: 0.5 }}>{'File Information'}</h3>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                      <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiFolder />
                        <span>Category:</span>
                        <strong>{file.category || 'Uncategorized'}</strong>
                      </li>
                      <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiCalendar />
                        <span>Year:</span>
                        <strong>{file.year || 'N/A'}</strong>
                      </li>
                      <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiUser />
                        <span>Uploaded By:</span>
                        <strong>{file.uploadedBy || 'Anonymous'}</strong>
                      </li>
                      <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiInfo />
                        <span>Size:</span>
                        <strong>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown'}</strong>
                      </li>
                    </ul>
                  </div>
                  {file.description && (
                    <div className="description-section" style={{ marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.08rem', color: '#6d28d9', marginBottom: 8 }}>Description</h3>
                      <p style={{ color: '#555', fontSize: '0.98rem', lineHeight: 1.6 }}>{file.description}</p>
                    </div>
                  )}
                  <div className="actions-section" style={{ marginTop: '2.5rem' }}>
                    <button 
                      className="delete-button"
                      title="Delete this file permanently"
                      style={{ marginTop: 0 }}
                      onClick={handleDelete}
                    >
                      <FiTrash2 /> Delete File
                    </button>
                  </div>
                </div>
                <div style={{ width: 1, background: '#ececec', minHeight: '100%' }} />
                <div className="file-preview" style={{ padding: '2rem 2.5rem', background: '#fff', borderRadius: '0 12px 12px 0', minHeight: 500 }}>
                  {file.fileType === 'pdf' ? (
                    <iframe 
                      src={file.url} 
                      title={file.originalName || file.filename || file.name || 'Untitled'} 
                      className="pdf-viewer"
                      style={{ border: '1px solid #eee', borderRadius: 8, minHeight: 500 }}
                    />
                  ) : (file.fileType === 'csv' || file.fileType === 'excel') ? (
                    previewError ? (
                      <div className="file-type-message">
                        <FiFile className="file-type-icon" />
                        <p>{previewError}</p>
                      </div>
                    ) : previewData ? (
                      <div className="table-preview">
                        <div className="table-info">
                          <p>Showing {previewData.data ? previewData.data.length : 0} of {previewData.totalRows || 0} rows</p>
                        </div>
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                {previewData.headers && previewData.headers.map((header, index) => (
                                  <th key={index}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.data && previewData.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {previewData.headers && previewData.headers.map((header, colIndex) => (
                                    <td key={colIndex}>{Array.isArray(row) ? row[colIndex] : row[header]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="file-type-message">
                        <FiFile className="file-type-icon" />
                        <p>Loading preview...</p>
                      </div>
                    )
                  ) : (
                    <div className="file-type-message">
                      <FiFile className="file-type-icon" />
                      <p>This file type cannot be previewed. Please download it to view the contents.</p>
                      <button 
                        className="download-button"
                        onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}
                      >
                        <FiDownload /> Download {file.originalName || file.filename || file.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <div style={{height: '100%', minHeight: '100vh', overflowY: 'auto'}}>
          <div className="file-viewer-page">
            <div className="file-list-section">
              <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#2c3e50', marginBottom: '2rem' }}>All Available Files</h2>
              <div className="files-scroll-grid" style={{ maxHeight: 'unset', minHeight: 200, margin: '0 auto', paddingBottom: 32 }}>
                {allFiles.length > 0 ? (
                  allFiles.map((f) => (
                    <div key={f._id} className="file-card" style={{ cursor: 'pointer' }} onClick={() => handleFileClick(f._id)}>
                      <div className="file-info">
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#2c3e50', textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal', minHeight: '2.4em', lineHeight: '1.2' }}>{f.originalName || f.filename || f.name || 'Untitled'}</h4>
                        <div style={{ marginTop: '1.1em', marginBottom: '0.2em' }}>
                          <p style={{ margin: 0, fontSize: '0.92rem', color: '#666', textAlign: 'center' }}><FiFolder /> {f.category || 'Uncategorized'}</p>
                          <p style={{ margin: 0, fontSize: '0.92rem', color: '#666', textAlign: 'center' }}><FiCalendar /> {f.year || 'N/A'}</p>
                        </div>
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
                          onClick={(e) => { e.stopPropagation(); handleDownload(f._id, f.originalName || f.filename || f.name); }}
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
        </div>
      </main>
    </div>
  );
};

export default FileViewer;