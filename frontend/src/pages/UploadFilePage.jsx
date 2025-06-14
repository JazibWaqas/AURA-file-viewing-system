import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/UploadFile.css';
import { FiUploadCloud, FiFile, FiEye, FiDownload, FiFolderPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function UploadFilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch recent uploads on mount
  React.useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log('Fetching files from database...');
        const res = await fetch('/api/files');
        if (!res.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await res.json();
        console.log('Files from database:', data);
        // Sort files by creation date and take the most recent 5
        const recentFiles = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentUploads(recentFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setRecentUploads([]);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  // Google Drive Picker integration (placeholder)
  const handleGoogleDriveUpload = async () => {
    alert('Google Drive integration coming soon!\n\nYou would trigger the Google Picker here.');
    // Example: After picking a file, setFile and setFileName accordingly
    // setFile(googleDriveFileBlob);
    // setFileName(googleDriveFileName);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !fileName || !category || !year) {
      alert('Please fill all required fields and select a file.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('title', fileName);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('year', year);
    formData.append('month', new Date().getMonth() + 1);
    formData.append('uploadedBy', 'anonymous');
    formData.append('file', file);

    try {
      console.log('Sending request to backend...');
      const res = await fetch('http://localhost:3000/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error response text:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Upload failed');
        } catch (parseError) {
          throw new Error(`Upload failed: ${text}`);
        }
      }
      
      const text = await res.text();
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid server response');
      }
      
      setRecentUploads([data.file, ...recentUploads.slice(0, 4)]);
      setFile(null);
      setFileName('');
      setDescription('');
      setCategory('');
      setYear('');
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Error uploading file.');
    }
    setUploading(false);
  };

  const handleViewFile = (fileId) => {
    navigate(`/file-viewer/${fileId}`);
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
              <button className="google-drive-button" type="button" onClick={handleGoogleDriveUpload}>
                <FiFolderPlus className="google-drive-icon" />
                Upload from Google Drive
              </button>
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
            </div>
            
            {/* Recent Uploads Section */}
            <div className="upload-card">
              <h2 className="upload-title">Recent Uploads</h2>
              {recentUploads.length > 0 ? (
                <div className="recent-files-list">
                  {recentUploads.map((file) => (
                    <div key={file._id} className="recent-file-item">
                      <FiFile className="file-icon" />
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
                        <button className="action-button" title="Download">
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-files">No recent files uploaded yet.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}