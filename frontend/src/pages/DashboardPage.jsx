import React from 'react';
import Header from '../components/Header.jsx';

const Home = () => {
  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Welcome to the AURA File Management System</h1>
        <p style={{ color: '#555', fontSize: '1.1rem', marginTop: 8 }}>
          Manage, view, and organize your NGO's documents with ease. Use the quick actions below to get started.
        </p>
      </div>

      {/* Quick Actions Section */}
      <div className="content-section" style={{ marginBottom: 32 }}>
        <div className="quick-actions" style={{ flex: 2 }}>
          <h4>Quick Actions</h4>
          <div className="action-buttons">
            <a className="action-button" href="/file-index">Edit File</a>
            <a className="action-button" href="/create-file">Create File</a>
            <a className="action-button" href="/upload-file">Upload File</a>
            <a className="action-button" href="/file-index">View Files</a>
          </div>
        </div>
        <div className="quick-actions" style={{ flex: 1 }}>
          <h4>Categories</h4>
          <div className="action-buttons">
            <a className="action-button" href="/create-category">Create Category</a>
            <a className="action-button" href="/file-index">Edit Categories</a>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-files" style={{ marginBottom: 32 }}>
        <h4>Recent Activity</h4>
        <ul>
          <li>File "Annual Report 2023" uploaded by Admin</li>
          <li>Category "Donations" created</li>
          <li>File "Budget 2024" edited by User1</li>
          <li>Category "Expenses" updated</li>
        </ul>
      </div>

      {/* Categories Overview Section */}
      <div className="categories-overview">
        <h4>Categories Overview</h4>
        <div className="health-metrics">
          <div className="metric-item">
            <h3>Financial Statements</h3>
            <p>All balance sheets, income statements, and more</p>
          </div>
          <div className="metric-item">
            <h3>Donations</h3>
            <p>Donation records and receipts</p>
          </div>
          <div className="metric-item">
            <h3>Expenses</h3>
            <p>Expense reports and bills</p>
          </div>
          <div className="metric-item">
            <h3>Other</h3>
            <p>Miscellaneous documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}