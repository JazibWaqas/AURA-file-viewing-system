import React from 'react';
import Header from '../components/Header.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Legend, Dot 
} from 'recharts';
import '../styles/dashboard.css';

const graphData = [
  { year: 2020, income: 85000, expenses: 62000, donations: 95000 },
  { year: 2021, income: 95000, expenses: 70000, donations: 115000 },
  { year: 2022, income: 102000, expenses: 72000, donations: 130000 },
  { year: 2023, income: 110000, expenses: 80000, donations: 155000 },
  { year: 2024, income: 120000, expenses: 85000, donations: 170000 },
];

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

const CustomTooltip = ({ active, payload, label, title, dataKey }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          <p className="intro">{`${title}: ${formatNumber(payload[0].value)}`}</p>
        </div>
      );
    }
  
    return null;
  };
  

function IncomeChart() {
    return (
      <div className="chart-card">
        <h4>Total Income</h4>
        <p>Annual income trend over the past 5 years</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip title="Income" />} />
            <Area type="monotone" dataKey="income" stroke="#8884d8" fillOpacity={1} fill="url(#colorIncome)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  function ExpenseChart() {
    return (
      <div className="chart-card">
        <h4>Total Expense</h4>
        <p>Annual expenses breakdown for transparency</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip title="Expense" />} />
            <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  function DonationsChart() {
    return (
      <div className="chart-card">
        <h4>Total Donations</h4>
        <p>Community support growth over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip title="Donations" />} />
            <Bar dataKey="donations" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
const Home = () => {
  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <h1>Welcome to the AURA File Viewing System</h1>
        </div>
      
      <div className="charts-section">
        <IncomeChart />
        <ExpenseChart />
        <DonationsChart />
      </div>

      <div className="bottom-section">
        <div className="quick-actions">
          <h4>Quick Actions</h4>
          <p>Streamline your workflow with these shortcuts</p>
          <div className="action-buttons">
            <a className="action-button primary" href="/upload-file">
              <span className="icon">⇧</span>
              <span>Upload New Files</span>
              <small>Add documents, images, or reports</small>
            </a>
            <a className="action-button" href="/file-index">
              <span className="icon">📂</span>
              <span>Browse Files</span>
              <small>Explore organized documents</small>
            </a>
          </div>
        </div>

        <div className="recent-activity">
          <h4>Recent Activity</h4>
          <p>Latest updates and file operations</p>
          <ul>
            <li><span>Annual Report 2024.pdf</span><small>Uploaded 2 hours ago</small></li>
            <li><span>Project Proposal.docx</span><small>Updated 5 hours ago</small></li>
            <li><span>Budget Summary.xlsx</span><small>Shared 1 day ago</small></li>
          </ul>
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