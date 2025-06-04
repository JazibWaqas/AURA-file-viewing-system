export default function FileViewer() {
    return (
      <div className="p-6">
        <div className="flex">
          <div className="w-1/4 pr-4">
            <h2 className="font-bold mb-2">Table of Contents</h2>
            <ul>
              <li className="mb-1 font-semibold">Executive Summary</li>
              <li>Income Statement</li>
              <li>Balance Sheet</li>
              <li>Cash Flow Statement</li>
              <li>Notes to Financials</li>
              <li>Auditor's Report</li>
            </ul>
          </div>
          <div className="w-3/4 bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-2">Q3 2024 Financial Report</h1>
            <h2 className="text-lg font-bold mb-1">1. Executive Summary</h2>
            <p className="mb-4">The third quarter of 2024 saw significant growth in revenue, driven by strong market demand and successful product launches...</p>
            <h2 className="text-lg font-bold mb-1">2. Income Statement (Q1 - Q4 2024)</h2>
            <table className="w-full border">
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
                  <td>$32,000</td>
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
    );
  }