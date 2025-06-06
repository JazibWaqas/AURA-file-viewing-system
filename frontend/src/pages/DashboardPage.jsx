import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-overview">
        <div className="metric-card">
          <h4>Year total revenue</h4>
          <h3>$187,450</h3>
          <p>from all categories</p>
        </div>
        <div className="metric-card">
          <h4>Monthly average expenses</h4>
          <h3>$8,230</h3>
          <p>in the current fiscal year</p>
        </div>
        <div className="metric-card">
          <h4>Current month profit</h4>
          <h3>$15,120</h3>
          <p>3% above target</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h4>Income, Expenses & Profit Trends</h4>
          <div className="chart-placeholder">
            <img src="/placeholder-line-chart.png" alt="Income, Expenses & Profit Trends" />
          </div>
        </div>
        <div className="chart-card">
          <h4>Monthly Expenses by Category</h4>
          <div className="chart-placeholder">
            <img src="/placeholder-bar-chart.png" alt="Monthly Expenses by Category" />
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="recent-files">
          <h4>Recently Viewed Files</h4>
          <ul>
            <li>Q3 2023 Income Statement</li>
            <li>Cashflow Report - Sep 2023</li>
            <li>Balance Sheet - Q4 2022</li>
            <li>Payroll Expenses - Nov 2023</li>
            <li>Annual Budget 2024 Draft</li>
            <li>Tax Filing Documents 2022</li>
          </ul>
        </div>

        <div className="quick-actions">
          <h4>Quick Actions</h4>
          <div className="action-buttons">
            <Link className="action-button" to="/file-index">File Index</Link>
            <Link className="action-button" to="/upload-file">Upload File</Link>
            <Link className="action-button" to="/create-file">Create File</Link>
            <Link className="action-button" to="/reports">View Reports</Link>
          </div>
        </div>
      </div>

      <div className="categories-overview">
        <h4>Account Health at a Glance</h4>
        <div className="health-metrics">
          <div className="metric-item">
            <h3>$12.5M</h3>
            <p>Invoices Paid On Time</p>
          </div>
          <div className="metric-item">
            <h3>Total Assets</h3>
            <p>Current</p>
          </div>
          <div className="metric-item">
            <h3>$-50K</h3>
            <p>Outstanding Liabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 900);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}