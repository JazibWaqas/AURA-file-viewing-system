import { FaRegFileAlt, FaRegCalendarAlt, FaFolderOpen } from "react-icons/fa";

const files = [
  {
    title: "Payroll Summary Mar",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    type: "Payroll Records",
    date: "2024-03-31",
  },
  {
    title: "Internal Audit Report",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    type: "Audit Reports",
    date: "2024-04-10",
  },
  {
    title: "February 2024 Income",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    type: "Income Statement",
    date: "2024-03-05",
  },
  {
    title: "Q1 2024 Balance Sheet",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    type: "Balance Sheet",
    date: "2024-04-10",
  },
  {
    title: "February 2024 Cash",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
    type: "Cash Flow",
    date: "2024-03-08",
  },
  {
    title: "VAT Return Q4 2023",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    type: "Tax Documents",
    date: "2024-01-25",
  },
  {
    title: "Benefits Enrollment",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    type: "Payroll Records",
    date: "2024-02-15",
  },
  {
    title: "Compliance Audit Report",
    image: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
    type: "Audit Reports",
    date: "2023-11-01",
  },
];

export default function FileIndex() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Recent Files</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {files.map((file, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col"
            style={{ minHeight: 320 }}
          >
            <div className="h-24 w-full rounded-t-xl overflow-hidden">
              <img
                src={file.image}
                alt={file.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1">
                  <FaRegFileAlt className="text-indigo-400" />
                  <span className="truncate">{file.title}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <FaFolderOpen className="mr-1" />
                  {file.type}
                </div>
                <div className="flex items-center text-gray-400 text-xs">
                  <FaRegCalendarAlt className="mr-1" />
                  {file.date}
                </div>
              </div>
              <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">
                View File
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}