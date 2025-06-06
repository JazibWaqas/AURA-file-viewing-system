import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

const FileViewer = () => {
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
          <div className="file-viewer-page">
            <div className="file-viewer-content">
              <div className="table-of-contents">
                <h3>Table of Contents</h3>
                <ul>
                  <li>Executive Summary</li>
                  <li>Income Statement</li>
                  <li>Balance Sheet</li>
                  <li>Cash Flow Statement</li>
                  <li>Notes to Financials</li>
                  <li>Auditor's Report</li>
                </ul>
              </div>
              <div className="report-content">
                <div className="report-header">
                  <h2>Q3 2024 Financial Report</h2>
                  <p>Income Statement | October 26, 2024</p>
                  <div className="report-actions">
                    {/* Placeholder for action icons */}
                    <span><i className="fa fa-print"></i></span>
                    <span><i className="fa fa-download"></i></span>
                    <span><i className="fa fa-share"></i></span>
                  </div>
                  <input type="text" placeholder="Search in document..." className="search-document" />
                  <select className="zoom-select">
                    <option>100%</option>
                    <option>75%</option>
                    <option>50%</option>
                  </select>
                </div>

                <div className="section">
                  <h3>1. Executive Summary</h3>
                  <p>The third quarter of 2024 saw significant growth in revenue, driven by strong market demand and successful product launches. Net income increased by 15% compared to the previous quarter, reflecting effective cost management and operational efficiencies. We continue to invest in strategic initiatives to expand our market share and enhance our technological capabilities.</p>
                  <p>Key financial metrics demonstrate a healthy and stable performance, positioning the company favorably for continued expansion in the upcoming fiscal year. Our balance sheet remains robust, supporting future growth opportunities.</p>
                </div>

                <div className="section">
                  <h3>2. Income Statement (Q1 - Q4 2024)</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Q1</th>
                        <th>Q2</th>
                        <th>Q3</th>
                        <th>Q4</th>
                        <th>Total Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Revenue</td>
                        <td>$150,000</td>
                        <td>$165,000</td>
                        <td>$180,000</td>
                        <td>$195,000</td>
                        <td>$690,000</td>
                      </tr>
                      <tr>
                        <td>Cost of Goods Sold</td>
                        <td>$50,000</td>
                        <td>$55,000</td>
                        <td>$60,000</td>
                        <td>$65,000</td>
                        <td>$230,000</td>
                      </tr>
                      <tr>
                        <td>Gross Profit</td>
                        <td>$100,000</td>
                        <td>$110,000</td>
                        <td>$120,000</td>
                        <td>$130,000</td>
                        <td>$460,000</td>
                      </tr>
                      <tr>
                        <td>Operating Expenses</td>
                        <td>$30,000</td>
                        <td>$32,000</td>
                        <td>$34,000</td>
                        <td>$36,000</td>
                        <td>$132,000</td>
                      </tr>
                      <tr>
                        <td>Net Income</td>
                        <td>$70,000</td>
                        <td>$78,000</td>
                        <td>$86,000</td>
                        <td>$94,000</td>
                        <td>$328,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileViewer;