import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/UploadFile.css';
import { FiUploadCloud, FiFile, FiEye, FiDownload, FiFolderPlus } from 'react-icons/fi';

export default function UploadFilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch recent uploads on mount
  React.useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log('Fetching files from database...');
        const res = await fetch('http://localhost:5173/api/files');
        const data = await res.json();
        console.log('Files from database:', data);
        setRecentUploads(data);
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
    formData.append('file', file);
    formData.append('title', fileName);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('year', year);
    formData.append('month', new Date().getMonth() + 1); // Add current month
    formData.append('uploadedBy', 'anonymous'); // Add uploadedBy field

    try {
      console.log('Sending request to backend...');
      const res = await fetch('http://localhost:5173/api/files/upload', {
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
            <div className="recent-uploads-card narrow">
              <h3>Recent Uploads</h3>
              <p className="recent-uploads-subtitle">Files in database:</p>
              <div className="recent-uploads-list">
                {recentUploads.length === 0 ? (
                  <p className="recent-uploads-empty">No files in database.</p>
                ) : (
                  recentUploads.map((item) => (
                    <div className="recent-upload-item" key={item._id}>
                      <div className="file-icon-background">
                        <FiFile className="file-icon" />
                      </div>
                      <div className="file-info">
                        <strong>{item.originalName}</strong>
                        <p className="file-type-date">
                          {item.category} <span className="dot-separator">•</span> {item.year}
                        </p>
                        <p className="file-upload-date">
                          Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="file-actions">
                        <FiEye className="action-icon" />
                        <FiDownload className="action-icon" />
                      </div>
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
}