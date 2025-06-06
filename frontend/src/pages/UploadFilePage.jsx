import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/UploadFile.css';
import { FiUploadCloud, FiFile, FiEye, FiDownload } from 'react-icons/fi';

const recentUploads = [
  {
    title: 'Q4 2023 Income Statement',
    type: 'Income Statement',
    date: '3/1/2024',
  },
  {
    title: '2023 Annual Balance Sheet',
    type: 'Balance Sheet',
    date: '2/28/2024',
  },
  {
    title: 'January 2024 Cashflow',
    type: 'Cashflow Statement',
    date: '2/15/2024',
  },
  {
    title: 'Payroll Records Feb 2024',
    type: 'Payroll Records',
    date: '3/10/2024',
  },
  {
    title: 'FY2023 Tax Declaration',
    type: 'Tax Documents',
    date: '3/15/2024',
  },
];

export default function UploadFilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

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

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="upload-content-row">
            <div className="upload-card">
              <h2 className="upload-title">Upload New Accounting File</h2>
              <p className="upload-subtitle">
                Select file, category, and year for accurate organization within your accounting hub.
              </p>
              <div
                className="drop-zone"
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
              </div>
              <div className="file-details-form">
                <label htmlFor="fileName">File Name</label>
                <input
                  type="text"
                  id="fileName"
                  placeholder="e.g., Q1 2024 Income Statement"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
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
                    <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                      <option value="">Select a year</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>
                  <div className="dropdown-wrapper">
                    <label htmlFor="month">Month</label>
                    <select id="month" value={month} onChange={(e) => setMonth(e.target.value)}>
                      <option value="">Select a month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="cancel-button">Cancel</button>
                  <button className="upload-file-button">Upload File</button>
                </div>
              </div>
            </div>
            <div className="recent-uploads-card">
              <h3>Recent Uploads</h3>
              <p className="recent-uploads-subtitle">Quick access to your latest accounting files.</p>
              <div className="recent-uploads-list">
                {recentUploads.map((item, index) => (
                  <div className="recent-upload-item" key={index}>
                    <div className="file-icon-background">
                      <FiFile className="file-icon" />
                    </div>
                    <div className="file-info">
                      <strong>{item.title}</strong>
                      <p className="file-type-date">
                        {item.type} <span className="dot-separator">•</span> {item.date}
                      </p>
                    </div>
                    <div className="file-actions">
                      <FiEye className="action-icon" />
                      <FiDownload className="action-icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}