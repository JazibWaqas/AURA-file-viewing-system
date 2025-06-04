import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/dashboard.css'; // Assuming you'll create a CSS file for styling

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
          {/* Placeholder for chart */}
          <div className="chart-placeholder">
            <img src="/placeholder-line-chart.png" alt="Income, Expenses & Profit Trends" />
          </div>
        </div>
        <div className="chart-card">
          <h4>Monthly Expenses by Category</h4>
          {/* Placeholder for chart */}
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
            <button className="action-button">File Index</button>
            <button className="action-button">Upload File</button>
            <button className="action-button">Create File</button>
            <button className="action-button">View Reports</button>
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
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Dashboard />
      </div>
    </div>
  );
}