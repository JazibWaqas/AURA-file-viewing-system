import React from 'react';
import Header from '../components/Header.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend, LabelList } from 'recharts';

const graphData = [
  { year: 2020, expenses: 12000, donations: 10000, income: 14000 },
  { year: 2021, expenses: 15000, donations: 13000, income: 16000 },
  { year: 2022, expenses: 18000, donations: 16000, income: 20000 },
  { year: 2023, expenses: 17000, donations: 20000, income: 21000 },
  { year: 2024, expenses: 21000, donations: 22000, income: 23000 },
  { year: 2025, expenses: 19500, donations: 25000, income: 26000 },
];

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

const CustomTooltip = ({ active, payload, label, title }) => {
  if (active && payload && payload.length) {
    return (
      <div className="dashboard-tooltip">
        <div className="dashboard-tooltip-title">{title}</div>
        <div className="dashboard-tooltip-label">Year: <b>{label}</b></div>
        <div className="dashboard-tooltip-value">
          {payload[0].name}: <b>{formatNumber(payload[0].value)}</b>
        </div>
      </div>
    );
  }
  return null;
};

function ProfessionalBarChart({ title, dataKey, color }) {
  return (
    <div className="dashboard-bar-chart" style={{ '--bar-color': color }}>
      <h4 className="dashboard-bar-chart-title">{title}</h4>
      <ResponsiveContainer width="100%" height={320} minWidth={340}>
        <BarChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }} barCategoryGap={30} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
          <XAxis dataKey="year" tick={{ fontSize: 15, fill: '#555' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 15, fill: '#555' }} axisLine={false} tickLine={false} width={70} tickFormatter={formatNumber} >
            <Label value="Amount (PKR)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 14, fill: '#888' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip title={title} />} cursor={{ fill: '#ede9fe', opacity: 0.2 }} />
          <Bar dataKey={dataKey} fill={color} radius={[10, 10, 6, 6]} isAnimationActive animationDuration={900} >
            <LabelList dataKey={dataKey} position="top" formatter={formatNumber} style={{ fontSize: 15, fill: color, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const Home = () => {
  return (
    <div className="dashboard-page dashboard-bg">
      {/* Welcome Section */}
      <div className="dashboard-welcome-section">
        <h1 className="dashboard-welcome-title">Welcome to the AURA File Management System</h1>
        <p className="dashboard-welcome-desc">
          Manage, view, and organize your NGO's documents with ease. Use the quick actions below to get started.
        </p>
      </div>

      {/* Graphs Section */}
      <div className="dashboard-graphs-section">
        <ProfessionalBarChart title="Total Expenses by Year" dataKey="expenses" color="#dc2626" />
        <ProfessionalBarChart title="Total Donations by Year" dataKey="donations" color="#16a34a" />
        <ProfessionalBarChart title="Total Income by Year" dataKey="income" color="#2563eb" />
      </div>

      {/* Quick Actions Section */}
      <div className="content-section dashboard-content-section">
        <div className="quick-actions dashboard-quick-actions">
          <h4>Quick Actions</h4>
          <div className="action-buttons">
            <a className="action-button" href="/file-index">Edit File</a>
            <a className="action-button" href="/create-file">Create File</a>
            <a className="action-button" href="/upload-file">Upload File</a>
            <a className="action-button" href="/file-index">View Files</a>
          </div>
        </div>
        <div className="quick-actions dashboard-quick-actions">
          <h4>Categories</h4>
          <div className="action-buttons">
            <a className="action-button" href="/create-category">Create Category</a>
            <a className="action-button" href="/file-index">Edit Categories</a>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-files dashboard-recent-files">
        <h4>Recent Activity</h4>
        <ul>
          <li>File "Annual Report 2023" uploaded by Admin</li>
          <li>Category "Donations" created</li>
          <li>File "Budget 2024" edited by User1</li>
          <li>Category "Expenses" updated</li>
        </ul>
      </div>

      {/* Categories Overview Section */}
      <div className="categories-overview dashboard-categories-overview">
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
      <main className="main-content dashboard-main-content">
        <Home />
      </main>
    </div>
  );
}