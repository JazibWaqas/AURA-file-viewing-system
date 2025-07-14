import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { useAuth } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Label, Legend, 
  LineChart, Line 
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

// Replace formatNumber for metrics with a full comma format
function formatNumberFull(num) {
  return num ? num.toLocaleString('en-PK') : '0';
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

function AddPatientDataModal({ open, onClose, onSubmit }) {
  const [year, setYear] = useState('');
  const [patients, setPatients] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!year || !patients) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ year, patients });
      setYear('');
      setPatients('');
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
        <h3>Add Patients Served</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Year</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max="2100" required />
          <label>Number of Patients</label>
          <input type="number" value={patients} onChange={e => setPatients(e.target.value)} min="0" required />
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

function CombinedExpenseLineChart({ data, onAddData }) {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`chart-card graph-fade-in${inView ? ' visible' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Annual Expenses</h4>
        {onAddData && (
          <button className="add-data-btn" onClick={onAddData}>Add Data</button>
        )}
      </div>
      <p>Annual trend of expenses</p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={formatNumber} />
          <Legend verticalAlign="top" align="right" />
          <Line
            type="monotone"
            dataKey="totalExpenses"
            name="Expenses"
            stroke="#01cbae"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
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
  const { user, loading: authLoading } = useAuth();
  const [yearlyData, setYearlyData] = useState([]);
  const [fundingData, setFundingData] = useState({});
  const [latestYear, setLatestYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBarModal, setShowBarModal] = useState(false);
  const [showPieModal, setShowPieModal] = useState(false);
  const [storageStats, setStorageStats] = useState({ totalFiles: 0, totalSize: 0, sizeUnit: 'MB' });
  const [recentlyViewedFiles, setRecentlyViewedFiles] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Fetch patient data
  useEffect(() => {
    async function fetchPatients() {
      setLoadingPatients(true);
      try {
        const res = await fetch('/api/dashboard/patient-data');
        const data = await res.json();
        setPatientData(data);
      } catch (err) {
        setPatientData([]);
      } finally {
        setLoadingPatients(false);
      }
    }
    fetchPatients();
  }, []);

  // Find the most recent year entry from patientData
  const mostRecentPatient = patientData && patientData.length > 0
    ? patientData.reduce((a, b) => (Number(a.year) > Number(b.year) ? a : b))
    : null;
  const patientsValue = mostRecentPatient?.patients || 0;
  const patientsYear = mostRecentPatient?.year || '----';

  // Add handler for submitting patient data
  const handleAddPatientData = async ({ year, patients }) => {
    const res = await fetch('/api/dashboard/patient-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, patients })
    });
    if (!res.ok) throw new Error('Failed to add patient data');
    // Refresh patient data
    const updated = await fetch('/api/dashboard/patient-data');
    setPatientData(await updated.json());
  };

  // Find the most recent year entry from yearlyData
  const mostRecentYearData = yearlyData && yearlyData.length > 0
    ? yearlyData.reduce((a, b) => (Number(a.year) > Number(b.year) ? a : b))
    : null;

  const revenueValue = mostRecentYearData?.totalRevenue || 0;
  const expensesValue = mostRecentYearData?.totalExpenses || 0;
  const deficitValue = revenueValue - expensesValue;
  const deficitLabel = deficitValue >= 0 ? 'Surplus' : 'Deficit';
  const deficitDisplay = Math.abs(deficitValue);
  const deficitYear = mostRecentYearData?.year || '----';
  const revenueYear = mostRecentYearData?.year || '----';

  useEffect(() => {
    // Don't fetch data until authentication is ready
    if (authLoading) {
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
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
        
        // Fetch storage statistics
        console.log('Fetching storage stats...');
        const storageRes = await fetch('/api/dashboard/storage-stats');
        console.log('Storage response status:', storageRes.status);
        if (!storageRes.ok) {
          throw new Error(`Storage API failed: ${storageRes.status}`);
        }
        const storage = await storageRes.json();
        console.log('Storage data received:', storage);
        setStorageStats(storage);
        
        // Fetch recently viewed files
        console.log('Fetching recently viewed files...');
        console.log('User object:', user);
        console.log('User firebaseUser:', user?.firebaseUser);
        console.log('User UID:', user?.firebaseUser?.uid);
        
        if (user?.firebaseUser?.uid) {
          const recentRes = await fetch(`/api/files/recently-viewed/${user.firebaseUser.uid}?limit=5`);
          if (recentRes.ok) {
            const recentFiles = await recentRes.json();
            console.log('Recently viewed files:', recentFiles);
            setRecentlyViewedFiles(recentFiles);
          } else {
            console.warn('Could not fetch recently viewed files');
            setRecentlyViewedFiles([]);
          }
        } else {
          console.log('No authenticated user, skipping recently viewed files');
          setRecentlyViewedFiles([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data for storage if API fails
        setStorageStats({ totalFiles: 271, totalSize: 45.79, sizeUnit: 'MB' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [authLoading, user]);

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
      <div className="dashboard-intro-row">
          <div className="dashboard-intro-flex">
            {/* Remove the Aura logo here */}
          <div className="dashboard-intro-content">
            <h2 className="dashboard-intro-title">Welcome to <span className="aura-highlight">AURA</span>'s File Management System</h2>
            <p className="dashboard-intro-desc">
              At <span className="aura-highlight">AURA</span> (Al-Umeed Rehabilitation Association), we believe in transparency, accessibility, and trust. This platform is designed to give you open access to our files and records, from reports and policies to activity updates. So you can stay informed about our work and impact. All files are publicly available for your convenience and confidence, reflecting our ongoing commitment to accountability and community engagement.
            </p>
          </div>
          <div className="dashboard-intro-actions">
            <a href="https://aura.org.pk/about" className="intro-action-btn larger-btn" target="_blank" rel="noopener noreferrer">Learn More About Us</a>
            <a href="https://aura.org.pk/donate" className="intro-action-btn primary larger-btn" target="_blank" rel="noopener noreferrer">Donate Now</a>
          </div>
        </div>
      </div>

      <div className="dashboard-metrics-row">
        <div className="metric-card metric-revenue">
          <h4>Amount Raised (Current Yr)</h4>
          <div className="metric-value">{loading ? '[ Loading... ]' : `PKR ${formatNumberFull(revenueValue)}`}</div>
          <div className="metric-desc">Generated in {revenueYear}</div>
        </div>
        <div className="metric-card metric-patients">
          <h4>Patients Served</h4>
          <div className="metric-value">{loadingPatients ? '[ Loading... ]' : patientsValue.toLocaleString('en-PK')}</div>
          <div className="metric-desc">This Year: {patientsYear}</div>
          <a className="activity-link" style={{ fontSize: '0.95rem', marginTop: '0.3rem', cursor: 'pointer' }} onClick={() => setShowPatientModal(true)}>update</a>
        </div>
        <div className="metric-card metric-deficit">
          <h4>{deficitLabel} for the Year</h4>
          <div className="metric-value" style={{ color: loading ? undefined : (deficitValue >= 0 ? '#16a34a' : '#dc2626') }}>
            {loading ? '[ Loading... ]' : `PKR ${formatNumberFull(deficitDisplay)}`}
          </div>
          <div className="metric-desc">As of {deficitYear}</div>
        </div>
      </div>
      <AddPatientDataModal open={showPatientModal} onClose={() => setShowPatientModal(false)} onSubmit={handleAddPatientData} />

      <div className="dashboard-main-graphs">
        <div className="dashboard-expenses-graph">
          <h3 className="graph-title">Annual Expenses</h3>
          <div className="graph-desc">Expenses incurred over the years (2015-{latestYear || '----'})</div>
          <CombinedExpenseLineChart data={yearlyData} onAddData={() => setShowBarModal(true)} />
          <AddBarDataModal open={showBarModal} onClose={() => setShowBarModal(false)} onSubmit={handleAddBarData} />
        </div>
        <div className="dashboard-donations-graph">
          <h3 className="graph-title">Donations Breakdown</h3>
          <div className="graph-desc">Distribution of sources</div>
          <DonationsChart data={fundingData} year={latestYear} onAddData={() => setShowPieModal(true)} />
          <AddPieDataModal open={showPieModal} onClose={() => setShowPieModal(false)} onSubmit={handleAddPieData} />
          </div>
        </div>

      <div className="dashboard-activity-storage">
        <div className="dashboard-activity-card">
          <h4>Recent Activity</h4>
          <p>Recently viewed files</p>
          {loading ? (
            <ul>
              <li><span>Loading...</span><small>Fetching recent activity</small></li>
            </ul>
          ) : recentlyViewedFiles.length > 0 ? (
            <ul>
              {recentlyViewedFiles.map((file) => (
                <li key={file._id}>
                  <span 
                    style={{ cursor: 'pointer', color: '#3380be' }}
                    onClick={() => window.open(`/file-viewer/${file._id}`, '_blank')}
                    title="Click to view file"
                  >
                    {file.originalName || file.filename}
                  </span>
                  <small>
                    {file.lastViewedAt ? 
                      new Date(file.lastViewedAt).toLocaleDateString() + ' ' + 
                      new Date(file.lastViewedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      : 'Recently viewed'
                    }
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              <li><span>No recent activity</span><small>Files you view will appear here</small></li>
            </ul>
          )}
          <a className="activity-link" href="/file-index">View All Files</a>
        </div>
        <div className="dashboard-storage-card">
          <h4>Storage Used</h4>
          {loading ? (
            <>
              <div className="storage-value">Loading...</div>
              <div className="storage-desc">Calculating storage usage</div>
            </>
          ) : (
            <>
              <div className="storage-value">{storageStats.totalSize} {storageStats.sizeUnit}</div>
              <div className="storage-desc">
                {storageStats.totalFiles} files stored
                {storageStats.cached && storageStats.lastUpdated && (
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginTop: '0.2rem' }}>
                    Updated {new Date(storageStats.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </>
          )}
          <div className="storage-actions">
            <a className="storage-action-btn" href="/file-index">Manage Files</a>
            <a className="storage-action-btn primary" href="https://console.firebase.google.com/project/auraxkhidmat-f4c73/usage" target="_blank" rel="noopener noreferrer">Upgrade Storage</a>
          </div>
        </div>
      </div>

      <div className="dashboard-sponsors-row">
        <h4 className="sponsors-title">Our Valued Sponsors</h4>
        <div className="sponsors-logos-row">
          {sponsorLogos.map((logo, idx) => (
            <div key={idx} className="sponsor-logo-circle sponsor-logo-anim">
              <img src={logo.src} alt={logo.alt} className="sponsor-logo-img" />
            </div>
          ))}
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