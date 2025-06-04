import React from 'react';
import '../styles/FileIndex.css'; // Assuming you'll create a CSS file for styling

const FileIndex = () => {
  const recentFiles = [
    {
      title: 'Q4 2023 Income State',
      type: 'Income Statement',
      date: '2023-12-31',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Income+Statement', // Placeholder image
    },
    {
      title: 'Annual Balance Sheet',
      type: 'Balance Sheet',
      date: '2024-01-15',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Balance+Sheet', // Placeholder image
    },
    {
      title: 'January 2024 Cash F',
      type: 'Cash Flow',
      date: '2024-02-05',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Cash+Flow', // Placeholder image
    },
    {
      title: 'Tax Return FY2023 D',
      type: 'Tax Documents',
      date: '2024-03-20',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Tax+Return', // Placeholder image
    },
    {
      title: 'Payroll Summary Mar',
      type: 'Payroll Records',
      date: '2024-03-31',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Payroll', // Placeholder image
    },
    {
      title: 'Internal Audit Report',
      type: 'Audit Reports',
      date: '2024-04-10',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Audit+Report', // Placeholder image
    },
    {
      title: 'February 2024 Incom',
      type: 'Income Statement',
      date: '2024-03-05',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Income', // Placeholder image
    },
    {
      title: 'Q1 2024 Balance She',
      type: 'Balance Sheet',
      date: '2024-04-10',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Balance+Sheet', // Placeholder image
    },
    {
      title: 'February 2024 Cash',
      type: 'Cash Flow',
      date: '2024-03-08',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Cash+Flow', // Placeholder image
    },
    {
      title: 'VAT Return Q4 2022',
      type: 'Tax Documents',
      date: '2024-01-25',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=VAT+Return', // Placeholder image
    },
    {
      title: 'Benefits Enrollment',
      type: 'Payroll Records',
      date: '2023-02-15',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Benefits', // Placeholder image
    },
    {
      title: 'Compliance Audit Rej',
      type: 'Audit Reports',
      date: '2023-11-01',
      image: 'https://via.placeholder.com/150/f0f0f0/808080?text=Audit+Report', // Placeholder image
    },
  ];

  return (
    <div className="file-index-page">
      <div className="search-filter-bar">
        <input type="text" placeholder="Search files..." className="search-input" />
        <button className="filter-button">Filter by Type</button>
        <button className="filter-button">Filter by Year</button>
      </div>

      <div className="recent-files-grid">
        <h2>Recent Files</h2>
        <div className="file-cards-container">
          {recentFiles.map((file, index) => (
            <div key={index} className="file-card">
              <img src={file.image} alt={file.title} className="file-thumbnail" />
              <div className="file-info">
                <h4>{file.title}</h4>
                <p>{file.type}</p>
                <p>{file.date}</p>
              </div>
              <button className="view-file-button">View File</button>
            </div>
          ))}
        </div>
      </div>

      <div className="categories-overview-section">
        <h2>Categories Overview</h2>
        <div className="category-cards-container">
          <div className="category-card">
            <h4>Income Statement</h4>
            <p>45 files in category</p>
          </div>
          <div className="category-card">
            <h4>Balance Sheet</h4>
            <p>30 files in category</p>
          </div>
          <div className="category-card">
            <h4>Cash Flow</h4>
            <p>38 files in category</p>
          </div>
          <div className="category-card">
            <h4>Tax Documents</h4>
            <p>12 files in category</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileIndex;