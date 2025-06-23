import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { FiUploadCloud, FiFile, FiEye, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { initializeGoogleDrive, showGoogleDrivePicker, downloadFile } from '../services/googleDriveService';
import '../styles/UploadFile.css';
import { useAuth } from '../App';

const defaultCategories = [
    {
        name: 'Financial Statements',
        description: 'Financial reports and statements',
        subCategories: ['Financial Reports', 'Monthly Accounts', 'Trial Balance', 'Other'],
        isDefault: true
    },
    {
        name: 'Income & Donations',
        description: 'Income and donation records',
        subCategories: ['Donations', 'Fee Records', 'Other Income', 'Other'],
        isDefault: true
    },
    {
        name: 'Expenses',
        description: 'Expense records and bills',
        subCategories: ['Operating Expenses', 'Utility Bills', 'Salary Records', 'Other'],
        isDefault: true
    },
    {
        name: 'Bank & Cash',
        description: 'Bank and cash related documents',
        subCategories: ['Bank Statements', 'Cash Books', 'Bank Reconciliations', 'Other'],
        isDefault: true
    },
    {
        name: 'Tax & Compliance',
        description: 'Tax and compliance related documents',
        subCategories: ['Tax Returns', 'Tax Exemptions', 'Regulatory Filings', 'Other'],
        isDefault: true
    },
    {
        name: 'Audit Reports',
        description: 'Internal and external audit reports',
        subCategories: ['External Audit', 'Internal Audit', 'Other'],
        isDefault: true
    },
    {
        name: 'Budgets',
        description: 'Budget planning and tracking documents',
        subCategories: ['Annual Budgets', 'Other'],
        isDefault: true
    },
    {
        name: 'Organizational Documents',
        description: 'Organization related documents',
        subCategories: ['Board Documents', 'Certificates', 'Constitution', 'General', 'Policies', 'Registration Documents', 'Staff Policies', 'Other'],
        isDefault: true
    },
    {
        name: 'Other',
        description: 'Miscellaneous documents',
        subCategories: ['Other'],
        isDefault: true
    }
];

export default function UploadFilePage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleDriveInitialized, setIsGoogleDriveInitialized] = useState(false);
  const [subCategory, setSubCategory] = useState('');
  const navigate = useNavigate();
  const user = useAuth();

  // Allowed file extensions and MIME types
  const allowedExtensions = [
    '.pdf', '.docx', '.doc', '.csv', '.xls', '.xlsx', '.xlsm', '.xlsb'
  ];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/csv',
    'application/csv',
    'text/x-csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12' // .xlsb
  ];

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('/api/files');
        if (!res.ok) throw new Error('Failed to fetch files');
        const data = await res.json();
        const recentFiles = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
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
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only PDF, DOCX, DOC, CSV, XLS, XLSX, XLSM, and XLSB files are allowed.');
        setFile(null);
        setFileName('');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(droppedFile.type)) {
        setError('Invalid file type. Only PDF, DOCX, DOC, CSV, XLS, XLSX, XLSM, and XLSB files are allowed.');
        setFile(null);
        setFileName('');
        return;
      }
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
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
      formData.append('subCategory', subCategory);
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
      setSubCategory('');
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

  const getSubCategories = () => {
    const cat = defaultCategories.find(c => c.name === category);
    return cat ? cat.subCategories : [];
  };

  return (
    <div className="app-root">
      <Header />
      <main className="main-content" style={{ padding: 0 }}>
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          <div className="upload-content-row" style={{ flex: 1, padding: '32px 40px', overflowX: 'auto' }}>
            {!user && (
              <div className="upload-auth-error-card">
                <FiUploadCloud className="upload-auth-error-icon" />
                <h2 className="upload-auth-error-title">Sign In Required</h2>
                <p className="upload-auth-error-message">
                  You must be signed in to upload files.<br />Please log in to access the upload feature.
                </p>
                <button
                  className="header-login-btn upload-auth-error-btn"
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'}) || document.querySelector('.header-login-btn')?.click()}
                >
                  Log In
                </button>
              </div>
            )}
            <div className="upload-card large">
              <h2 className="upload-title">Upload New Accounting File</h2>
              <p className="upload-subtitle">
                Select file, category, and year for accurate organization within your accounting hub.
              </p>
              {user ? <>
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
                  accept=".pdf,.docx,.doc,.csv,.xls,.xlsx,.xlsm,.xlsb"
                />
                <FiUploadCloud className="upload-icon" />
                <p>
                  <strong>Drag & drop your file here</strong> or click to browse
                </p>
                <p className="supported-formats">
                  Supported formats: PDF, DOCX, DOC, XLSX, XLS, XLSM, XLSB, CSV. Max file size: 10MB.
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
                  placeholder="e.g., Income Statement"
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
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubCategory('');
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {defaultCategories.map((cat, idx) => (
                        <option key={idx} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="dropdown-wrapper">
                    <label htmlFor="year">Year</label>
                    <input
                      type="number"
                      id="year"
                      placeholder="e.g., 2024"
                      value={year}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) setYear(val);
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                </div>
                <div className="dropdown-wrapper">
                  <label htmlFor="subCategory">Sub Category</label>
                  <select
                    id="subCategory"
                    value={subCategory}
                    onChange={e => setSubCategory(e.target.value)}
                    required
                    disabled={!category}
                  >
                    <option value="">Select a sub category</option>
                    {getSubCategories().map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
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
                      setSubCategory('');
                    }}
                  >
                    Cancel
                  </button>
                  <button className="upload-file-button" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
              {error && <div className="error-message" style={{marginTop: '16px'}}>{error}</div>}
              </> : null}
            </div>
            <div className="recent-uploads-card large" style={{ minHeight: 320, padding: '1.5rem 1.2rem' }}>
              <h3>Recent Uploads</h3>
              <div className="recent-uploads-list" style={{ overflowX: 'hidden' }}>
                {recentUploads.length > 0 ? (
                  recentUploads.map((file) => (
                    <div key={file._id} className="recent-upload-item">
                      <div className="file-icon-background">
                        <FiFile className="file-icon" />
                      </div>
                      <div className="file-info">
                        <h3>{file.originalName || file.filename || file.name || 'Untitled'}</h3>
                        <p>Category: {file.category || 'Uncategorized'}</p>
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
                          onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}
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
        </div>
      </main>
    </div>
  );
}