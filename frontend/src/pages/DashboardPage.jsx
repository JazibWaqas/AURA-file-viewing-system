import React from 'react';
import Header from '../components/Header.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Legend, Dot, PieChart, Pie, Cell, Label, ComposedChart 
} from 'recharts';
import '../styles/dashboard.css';
import auraLogo from '../assets/aura-logo.png';
import { useInView } from '../hooks/useInView';
import parcoLogo from '../assets/Parco.png';
import icareLogo from '../assets/Icare.png';
import habibMetroLogo from '../assets/HabibMetro.jpg';
import infaqLogo from '../assets/Infaq.jpg';
import toyotaLogo from '../assets/Toyota.jpg';
import psoLogo from '../assets/Pso.jpg';
import soortyLogo from '../assets/Soorty.jpg';
import ngoLogo from '../assets/ngo.jpg';
import bvaLogo from '../assets/Bva.jpg';

const graphData = [
  { year: 2020, income: 18887133, expenses: 23857572, donations: 95000 },
  { year: 2021, income: 14478076, expenses: 18199534, donations: 115000 },
  { year: 2022, income: 21318558, expenses: 20461183, donations: 130000 },
  { year: 2023, income: 24026879, expenses: 26540307, donations: 155000 },
  { year: 2024, income: 33063777, expenses: 33247036, donations: 170000 },
];

const donationsPieData = [
  { name: 'Donations', value: 7183302 },
  { name: 'Zakat', value: 4185445 },
  { name: 'Sponsorship', value: 4247128 },
  { name: 'Fees', value: 5804200 },
  { name: 'Other', value: 11714272 },
];

const PIE_COLORS = [
  '#FFB300', // Donations - dark amber
  '#fE35B1', // Zakat - deep purple
  '#388E3C', // Sponsorship - dark green
  '#1976D2', // Fees - strong blue
  '#F4511E', // Other - deep orange
];

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
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
  

function CombinedIncomeExpenseChart() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`chart-card graph-fade-in${inView ? ' visible' : ''}`}
    >
      <h4>Income vs Expense</h4>
      <p>Annual comparison of income and expenses</p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={12}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={formatNumber} />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="income" name="Income" fill="#2082a6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="expenses" name="Expenses" fill="#01cbae" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function renderPieLabel({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent, index }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      className="pie-label"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name}: ${formatNumber(value)}`}
    </text>
  );
}

function DonationsChart() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`chart-card graph-fade-in${inView ? ' visible' : ''}`}
    >
      <h4 className="donations-title">Donations Breakdown</h4>
      <p className="donations-desc">Distribution of donation sources</p>
      <ResponsiveContainer width="100%" height={340}>
        <PieChart margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
          <Pie
            data={donationsPieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={50}
            paddingAngle={0}
          >
            {donationsPieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
            <Label
              value="Total"
              position="center"
              className="pie-label-center"
            />
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatNumber(value), name]}
            wrapperClassName="pie-tooltip"
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value, entry, index) => {
              const data = donationsPieData.find(d => d.name === value);
              return (
                <span style={{ color: PIE_COLORS[index % PIE_COLORS.length], fontWeight: 500, fontSize: '0.95rem' }}>
                  {value}: {formatNumber(data ? data.value : 0)}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
  
const Home = () => {
  const sponsorLogos = [
    { src: parcoLogo, alt: 'PARCO' },
    { src: icareLogo, alt: 'iCARE' },
    { src: habibMetroLogo, alt: 'HabibMetro' },
    { src: infaqLogo, alt: 'INFAQ' },
    { src: toyotaLogo, alt: 'TOYOTA' },
    { src: psoLogo, alt: 'PSO' },
    { src: soortyLogo, alt: 'Soorty' },
    { src: ngoLogo, alt: 'NGO' },
    { src: bvaLogo, alt: 'BVA' },
  ];
  return (
    <div className="dashboard-page">
      <div className="relative flex flex-col md:flex-row items-start gap-8">
        <section className="dashboard-intro-section flex-1 z-10">
          <div className="dashboard-intro-flex">
            <img src={auraLogo} alt="AURA Logo" className="dashboard-intro-logo" />
            <div className="dashboard-intro-text">
              <h2>Welcome to <span className="aura-highlight">AURA</span>'s File Management System</h2>
              <p>At <span className="aura-highlight">AURA</span> (Al-Umeed Rehabilitation Association), we believe in transparency, accessibility, 
                and trust. This platform is designed to give you open access to our files 
                and records, from reports and policies to activity updates. So you can stay informed about our work and impact.
                All files are publicly available for your convenience and confidence, reflecting 
                our ongoing commitment to accountability and community engagement.</p>
            </div>
          </div>
        </section>
        <div className="flex flex-col items-center justify-center md:ml-8 mt-8 md:mt-0 w-full md:w-auto">
          <div className="sponsor-heading">Our Sponsors</div>
          <div className="sponsor-logo-grid">
            {sponsorLogos.map((logo, idx) => (
              <div key={idx} className="sponsor-logo-circle sponsor-logo-anim" style={{ animationDelay: `${0.1 + idx * 0.12}s` }}>
                <img src={logo.src} alt={logo.alt} className="sponsor-logo-img" />
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="charts-section">
        <CombinedIncomeExpenseChart />
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