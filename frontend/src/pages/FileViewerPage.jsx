import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiArrowLeft, FiInfo, FiCalendar, FiUser, FiFolder, FiTrash2 } from 'react-icons/fi';
import mammoth from 'mammoth/mammoth.browser';
import * as XLSX from 'xlsx';

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
          // If it's a DOCX or DOC file, fetch and convert to HTML
          else if (fileDetails.fileType === 'docx' || fileDetails.fileType === 'doc') {
            try {
              setPreviewData(null);
              setPreviewError(null);
              setLoading(true);
              const viewResponse = await fetch(`/api/files/${id}/view`);
              if (viewResponse.ok) {
                const blob = await viewResponse.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setPreviewData(result.value);
              } else {
                setPreviewError('Failed to load document preview.');
              }
            } catch (err) {
              setPreviewError('Error loading document preview.');
            } finally {
              setLoading(false);
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

  // Helper to render spreadsheet preview
  const renderSpreadsheet = () => {
    if (!previewData || !previewData.headers) return null;
    return (
      <div className="spreadsheet-preview-container">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              {previewData.headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.rows && previewData.rows.length > 0 ? (
              previewData.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr><td colSpan={previewData.headers.length}>No data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to render DOCX/DOC preview
  const renderDocx = () => {
    if (loading) return <div className="docx-loading"><FiLoader className="spinner-icon" /> Loading document preview...</div>;
    if (previewError) return <div className="docx-error">{previewError}</div>;
    if (previewData) {
      return (
        <div className="docx-preview" dangerouslySetInnerHTML={{ __html: previewData }} />
      );
    }
    return null;
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
        <main className="main-content">
          <div className="file-viewer-header file-viewer-page">
            <div className="file-viewer-header-left">
              <button className="back-button" onClick={() => navigate('/file-index')}>
                <FiArrowLeft /> Back to All Files
              </button>
              <h1>{file.originalName || file.filename || file.name || 'Untitled'}</h1>
            </div>
            <button className="download-button" onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}>
              <FiDownload /> Download
            </button>
          </div>
          <div className="file-viewer-flex-root">
            <div className="file-details-sidebar">
              <div className="details-section">
                <h3>{'File Information'}</h3>
                <ul>
                  <li><FiFolder /><span>Category:</span><strong>{file.category || 'Uncategorized'}</strong></li>
                  <li><FiCalendar /><span>Year:</span><strong>{file.year || 'N/A'}</strong></li>
                  <li><FiUser /><span>Uploaded By:</span><strong>{file.uploadedBy || 'Anonymous'}</strong></li>
                  <li><FiInfo /><span>Size:</span><strong>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown'}</strong></li>
                </ul>
              </div>
              {file.description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p>{file.description}</p>
                </div>
              )}
              <div className="actions-section">
                <button className="delete-button" title="Delete this file permanently" onClick={handleDelete}>
                  <FiTrash2 /> Delete File
                </button>
              </div>
            </div>
            <div className="file-viewer-divider" />
            <div className="file-viewer-content">
              <div className="file-preview">
                {/* File preview logic */}
                {file.fileType === 'pdf' && file.url && (
                  <iframe
                    src={file.url}
                    title="PDF Preview"
                    className="pdf-preview-frame"
                    frameBorder="0"
                    width="100%"
                    height="700px"
                  />
                )}
                {(file.fileType === 'csv' || file.fileType === 'excel') && (
                  <div className="spreadsheet-preview-wrapper">
                    {previewError ? (
                      <div className="spreadsheet-error">{previewError}</div>
                    ) : renderSpreadsheet()}
                  </div>
                )}
                {(file.fileType === 'docx' || file.fileType === 'doc') && (
                  <div className="docx-preview-wrapper">
                    {renderDocx()}
                  </div>
                )}
                {!(file.fileType === 'pdf' || file.fileType === 'csv' || file.fileType === 'excel' || file.fileType === 'docx' || file.fileType === 'doc') && (
                  <div className="unsupported-preview">
                    <FiFile style={{ fontSize: 48, color: '#b3b3b3' }} />
                    <p>Preview not available for this file type.</p>
                  </div>
                )}
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
              <div className="files-scroll-grid" style={{ maxHeight: 'unset', minHeight: 200, margin: '0 auto', paddingBottom: 32, width: '100%' }}>
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
                          
                          onClick={() => handleViewFile(file._id)}
                          className="flex-1 min-w-[80px] max-w-full h-10 px-3 bg-blue-600 text-white text-[0.98rem] font-semibold leading-none rounded-md hover:bg-blue-700 transition-colors duration-200 my-[2px] flex items-center justify-center"
                        >
                          View
                        </button>
                        
                        <button
                          onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}
                          className="flex-1 min-w-[80px] max-w-full h-10 px-3 bg-green-600 text-white text-[0.98rem] font-semibold leading-none rounded-md hover:bg-green-700 transition-colors duration-200 my-[2px] flex items-center justify-center"
                        >
                          Download
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