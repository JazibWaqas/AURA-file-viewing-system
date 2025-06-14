import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/UploadFile.css';
import { FiUploadCloud, FiFile, FiEye, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { initializeGoogleDrive, showGoogleDrivePicker, downloadFile } from '../services/googleDriveService';

export default function UploadFilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleDriveInitialized, setIsGoogleDriveInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('/api/files');
        if (!res.ok) throw new Error('Failed to fetch files');
        const data = await res.json();
        const recentFiles = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentUploads(recentFiles);
      } catch (error) {
        setRecentUploads([]);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    initializeGoogleDrive().then(success => {
      setIsGoogleDriveInitialized(!!success);
    });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleGoogleDriveFileSelect = async () => {
    try {
      await showGoogleDrivePicker(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const pickedFile = data.docs[0];
          if (pickedFile && pickedFile.id && pickedFile.name) {
            try {
              const blob = await downloadFile(pickedFile.id);
              let mimeType = pickedFile.mimeType || blob.type;
              if (!mimeType || mimeType === 'application/octet-stream') {
                if (pickedFile.name.endsWith('.pdf')) mimeType = 'application/pdf';
                else if (pickedFile.name.endsWith('.xlsx')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                else if (pickedFile.name.endsWith('.xls')) mimeType = 'application/vnd.ms-excel';
              }
              const fileObj = new File([blob], pickedFile.name, { type: mimeType });
              setFile(fileObj);
              setFileName(pickedFile.name);
            } catch (err) {
              setError('Failed to download file from Google Drive.');
            }
          }
        }
      });
    } catch (error) {
      setError('Failed to access Google Drive files.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }
    if (!fileName || !category || !year) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('year', year);
      formData.append('month', new Date().getMonth() + 1);
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      const data = await response.json();
      setFile(null);
      setFileName('');
      setDescription('');
      setCategory('');
      setYear('');
      navigate('/file-index');
    } catch (error) {
      setError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = (fileId) => {
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
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="upload-content-row">
            <div className="upload-card large">
              <h2 className="upload-title">Upload New Accounting File</h2>
              <p className="upload-subtitle">
                Select file, category, and year for accurate organization within your accounting hub.
              </p>
              <div
                className="drop-zone blue"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <FiUploadCloud className="upload-icon" />
                <p>
                  <strong>Drag & drop your file here</strong> or click to browse
                </p>
                <p className="supported-formats">
                  Supported formats: PDF, XLSX, DOCX. Max file size: 10MB.
                </p>
                {fileName && <div className="selected-file-name">{fileName}</div>}
              </div>
              <div className="upload-options-row">
                <button
                  className="google-drive-button"
                  onClick={handleGoogleDriveFileSelect}
                  disabled={!isGoogleDriveInitialized}
                >
                  <img
                    src="https://www.google.com/drive/static/images/drive/logo-drive.png"
                    alt="Google Drive"
                    className="google-drive-icon"
                  />
                  <span>Import from Google Drive</span>
                </button>
              </div>
              <form className="file-details-form" onSubmit={handleUpload}>
                <label htmlFor="fileName">File Name</label>
                <input
                  type="text"
                  id="fileName"
                  placeholder="e.g., Q1 2024 Income Statement"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  placeholder="Provide a brief summary or notes about this file..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className="dropdown-row">
                  <div className="dropdown-wrapper">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Income Statement">Income Statement</option>
                      <option value="Balance Sheet">Balance Sheet</option>
                      <option value="Cashflow">Cashflow</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Tax">Tax</option>
                    </select>
                  </div>
                  <div className="dropdown-wrapper">
                    <label htmlFor="year">Year</label>
                    <select
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    >
                      <option value="">Select a year</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileName('');
                      setDescription('');
                      setCategory('');
                      setYear('');
                    }}
                  >
                    Cancel
                  </button>
                  <button className="upload-file-button" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="recent-uploads-card large">
              <h3>Recent Uploads</h3>
              <div className="recent-uploads-list">
                {recentUploads.length > 0 ? (
                  recentUploads.map((file) => (
                    <div key={file._id} className="recent-upload-item">
                      <div className="file-icon-background">
                        <FiFile className="file-icon" />
                      </div>
                      <div className="file-info">
                        <h3>{file.originalName}</h3>
                        <p>Category: {file.category}</p>
                        <p>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="file-actions">
                        <button
                          className="action-button"
                          title="View"
                          onClick={() => handleViewFile(file._id)}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="action-button"
                          title="Download"
                          onClick={() => handleDownload(file._id, file.originalName)}
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-files">No recent files uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}