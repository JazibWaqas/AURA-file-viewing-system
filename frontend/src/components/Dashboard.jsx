export default function Dashboard() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">Year total revenue<br /><span className="text-2xl font-bold">$187,450</span></div>
          <div className="bg-white p-4 rounded shadow">Monthly avg revenue<br /><span className="text-2xl font-bold">$8,230</span></div>
          <div className="bg-white p-4 rounded shadow">Current month profit<br /><span className="text-2xl font-bold">$15,120</span></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow h-48">[Income, Expenses & Profit Trends Chart]</div>
          <div className="bg-white p-4 rounded shadow h-48">[Monthly Expenses by Category Chart]</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Recently Viewed Files</h2>
            <ul>
              <li>Q3 2023 Income Statement</li>
              <li>Cashflow Report - Sep 2023</li>
              <li>Balance Sheet - Q4 2022</li>
              <li>Payroll Expenses - Nov 2023</li>
              <li>Annual Budget 2024 Draft</li>
              <li>Tax Filing Documents 2022</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Quick Actions</h2>
            <ul>
              <li>File Index</li>
              <li>Upload File</li>
              <li>Create File</li>
              <li>View Reports</li>
            </ul>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Account Health at a Glance</h2>
          <div className="flex gap-8">
            <div>
              <div className="text-gray-500">Total Assets</div>
              <div className="text-2xl font-bold text-blue-600">$12.5M</div>
            </div>
            <div>
              <div className="text-gray-500">Outstanding Liabilities</div>
              <div className="text-2xl font-bold text-red-600">-$50K</div>
            </div>
          </div>
        </div>
      </div>
    );
  }