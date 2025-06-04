import { useState } from "react";
import { CloudUpload, Eye, Download } from "lucide-react";

export default function FileUploader() {
  const [file, setFile] = useState(null);

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow p-6 flex-1">
        <h1 className="text-xl font-semibold mb-4">Upload New Accounting File</h1>

        <div className="border-2 border-dashed border-blue-500 rounded-lg p-6 text-center cursor-pointer mb-4">
          <CloudUpload className="mx-auto h-10 w-10 text-blue-500 mb-2" />
          <p className="text-sm text-gray-600">
            <strong>Drag & drop your file here</strong><br />
            or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supported formats: PDF, XLSX, DOCX. Max file size: 10MB.
          </p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="e.g., Q1 2024 Income Statement"
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            placeholder="Provide a brief summary or notes about this file..."
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex gap-4">
            <select className="flex-1 border rounded px-3 py-2">
              <option>Select a category</option>
              <option>Income Statement</option>
              <option>Balance Sheet</option>
              <option>Cashflow Statement</option>
              <option>Payroll Records</option>
              <option>Tax Documents</option>
            </select>
            <select className="flex-1 border rounded px-3 py-2">
              <option>Select a year</option>
              {[2021, 2022, 2023, 2024].map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
            <select className="flex-1 border rounded px-3 py-2">
              <option>Select a month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded border">Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white">Upload File</button>
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl shadow p-6 w-full md:w-1/3">
        <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
        <div className="space-y-3">
          {[
            { name: "Q4 2023 Income Statement", category: "Income Statement", date: "3/1/2024" },
            { name: "2023 Annual Balance Sheet", category: "Balance Sheet", date: "2/28/2024" },
            { name: "January 2024 Cashflow", category: "Cashflow Statement", date: "2/15/2024" },
            { name: "Payroll Records Feb 2024", category: "Payroll Records", date: "3/10/2024" },
            { name: "FY2023 Tax Declaration", category: "Tax Documents", date: "3/15/2024" },
          ].map((file, idx) => (
            <div
              key={idx}
              className="border rounded-lg px-4 py-3 flex justify-between items-center hover:shadow-sm"
            >
              <div>
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {file.category} | {file.date}
                </div>
              </div>
              <div className="flex gap-2 text-gray-500">
                <Eye className="h-4 w-4 cursor-pointer" />
                <Download className="h-4 w-4 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
