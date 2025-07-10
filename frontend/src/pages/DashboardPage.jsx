import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Label, Legend 
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

// const PIE_COLORS = [
//   '#FFB300', // Donations - dark amber
//   '#fE35B1', // Zakat - deep purple
//   '#388E3C', // Sponsorship - dark green
//   '#1976D2', // Fees - strong blue
//   '#F4511E', // Other - deep orange
// ];

const PIE_COLORS = [
  '#3F51B5', // Indigo – elegant, readable, and professional
  '#C2185B', // Deep Crimson – rich and dramatic, not too loud
  '#1A237E', // Dark Navy Blue – subtle but visible
  '#673AB7', // Deep Purple – luxurious and modern
  '#263238', // Charcoal Black – moody and grounded
];

  





function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num ? num.toLocaleString('en-US') : '0';
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

function AddBarDataModal({ open, onClose, onSubmit }) {
  const [year, setYear] = useState('');
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!year || !income || !expense) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ year, totalRevenue: Number(income), totalExpenses: Number(expense) });
      setYear('');
      setIncome('');
      setExpense('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit data.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Yearly Income & Expense</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Year</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max="2100" required />
          <label>Year's Income</label>
          <input type="number" value={income} onChange={e => setIncome(e.target.value)} min="0" required />
          <label>Year's Expense</label>
          <input type="number" value={expense} onChange={e => setExpense(e.target.value)} min="0" required />
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPieDataModal({ open, onClose, onSubmit }) {
  const [year, setYear] = useState('');
  const [donations, setDonations] = useState('');
  const [zakat, setZakat] = useState('');
  const [sponsorship, setSponsorship] = useState('');
  const [fees, setFees] = useState('');
  const [other, setOther] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!year || !donations || !zakat || !sponsorship || !fees || !other) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        year,
        donations: Number(donations),
        zakat: Number(zakat),
        sponsorship: Number(sponsorship),
        fees: Number(fees),
        other: Number(other)
      });
      setYear('');
      setDonations('');
      setZakat('');
      setSponsorship('');
      setFees('');
      setOther('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit data.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Funding Sources Data</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Year</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max="2100" required />
          <label>Total Donations</label>
          <input type="number" value={donations} onChange={e => setDonations(e.target.value)} min="0" required />
          <label>Total Zakat</label>
          <input type="number" value={zakat} onChange={e => setZakat(e.target.value)} min="0" required />
          <label>Total Sponsorship</label>
          <input type="number" value={sponsorship} onChange={e => setSponsorship(e.target.value)} min="0" required />
          <label>Total Fees</label>
          <input type="number" value={fees} onChange={e => setFees(e.target.value)} min="0" required />
          <label>Total Other</label>
          <input type="number" value={other} onChange={e => setOther(e.target.value)} min="0" required />
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CombinedIncomeExpenseChart({ data, onAddData }) {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`chart-card graph-fade-in${inView ? ' visible' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Income vs Expense</h4>
        {onAddData && (
          <button className="add-data-btn" onClick={onAddData}>Add Data</button>
        )}
      </div>
      <p>Annual comparison of income and expenses</p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={12}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={formatNumber} />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="totalRevenue" name="Income" fill="#2082a6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="totalExpenses" name="Expenses" fill="#01cbae" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonationsChart({ data, year, onAddData }) {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const pieData = [
    { name: 'Donations', value: data.donations || 0 },
    { name: 'Zakat', value: data.zakat || 0 },
    { name: 'Sponsorship', value: data.sponsorship || 0 },
    { name: 'Fees', value: data.fees || 0 },
    { name: 'Other', value: data.other || 0 },
  ];
  return (
    <div
      ref={ref}
      className={`chart-card graph-fade-in${inView ? ' visible' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="donations-title">Donations Breakdown ({year})</h4>
        {onAddData && (
          <button className="add-data-btn" onClick={onAddData}>Add Data</button>
        )}
      </div>
      <p className="donations-desc">Distribution of donation sources</p>
      <ResponsiveContainer width="100%" height={340}>
        <PieChart margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={50}
            paddingAngle={0}
          >
            {pieData.map((entry, index) => (
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
              const d = pieData.find(d => d.name === value);
              return (
                <span style={{ color: PIE_COLORS[index % PIE_COLORS.length], fontWeight: 500, fontSize: '0.95rem' }}>
                  {value}: {formatNumber(d ? d.value : 0)}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

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

const Home = () => {
  const [yearlyData, setYearlyData] = useState([]);
  const [fundingData, setFundingData] = useState({});
  const [latestYear, setLatestYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBarModal, setShowBarModal] = useState(false);
  const [showPieModal, setShowPieModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch yearly summary for bar chart
      const yearlyRes = await fetch('/api/dashboard/yearly-summary');
      const yearly = await yearlyRes.json();
      setYearlyData(yearly);
      // Fetch all funding sources and pick the latest year for pie chart
      const fundingRes = await fetch('/api/dashboard/funding-sources');
      const fundingArr = await fundingRes.json();
      if (fundingArr.length > 0) {
        const latest = fundingArr.reduce((a, b) => (Number(a.year) > Number(b.year) ? a : b));
        setFundingData(latest);
        setLatestYear(Number(latest.year));
      } else {
        setFundingData({});
        setLatestYear('');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAddBarData = async (formData) => {
    const res = await fetch('/api/dashboard/yearly-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed to add data');
    // Refresh data
    const yearlyRes = await fetch('/api/dashboard/yearly-summary');
    const yearly = await yearlyRes.json();
    setYearlyData(yearly);
    // Update latest year if needed
    const years = yearly.map(y => y.year);
    const maxYear = Math.max(...years);
    setLatestYear(maxYear);
  };

  // Add handler for submitting pie data
  const handleAddPieData = async (formData) => {
    const res = await fetch('/api/dashboard/funding-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed to add data');
    // Always fetch all funding sources and pick the latest year
    const allFundingRes = await fetch('/api/dashboard/funding-sources');
    const allFundingArr = await allFundingRes.json();
    if (allFundingArr.length > 0) {
      // Find the entry with the highest year
      const latest = allFundingArr.reduce((a, b) => (Number(a.year) > Number(b.year) ? a : b));
      setFundingData(latest);
      setLatestYear(Number(latest.year));
    } else {
      setFundingData({});
      setLatestYear('');
    }
  };

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
        {loading ? <div>Loading...</div> : <>
          <CombinedIncomeExpenseChart data={yearlyData} onAddData={() => setShowBarModal(true)} />
          <AddBarDataModal open={showBarModal} onClose={() => setShowBarModal(false)} onSubmit={handleAddBarData} />
        </>}
        {loading ? <div>Loading...</div> : <>
          <DonationsChart data={fundingData} year={latestYear} onAddData={() => setShowPieModal(true)} />
          <AddPieDataModal open={showPieModal} onClose={() => setShowPieModal(false)} onSubmit={handleAddPieData} />
        </>}
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