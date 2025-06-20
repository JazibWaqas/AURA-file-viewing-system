import React, { useState, useEffect, useRef } from 'react';
import '../styles/FileIndex.css';
import Header from '../components/Header.jsx';
import CategorySidebar from '../components/CategorySidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';

export default function FileIndexPage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [recentFiles, setRecentFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch files and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFiles(true);
      setError(null);
      try {
        const [filesRes, categoriesRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/categories')
        ]);
        if (!filesRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data');
        const [filesData, categoriesData] = await Promise.all([
          filesRes.json(),
          categoriesRes.json()
        ]);
        const sortedFiles = filesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllFiles(sortedFiles);
        setRecentFiles(sortedFiles.slice(0, 5));
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingFiles(false);
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleViewFile = (fileId) => navigate(`/file-viewer/${fileId}`);
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download file. Please try again.');
    }
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {}, 300);
  };
  const handleCategorySelect = (cat, sub) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(sub);
  };

  // Filtering
  const getUniqueYears = () => {
    const years = Array.from(new Set(allFiles.map(file => file.year))).filter(Boolean);
    return years.sort((a, b) => b - a);
  };
  const filteredFiles = allFiles.filter(file => {
    const fileName = file.originalName || file.filename || file.name || '';
    const fileCategory = file.category || '';
    const fileSubCategory = file.subCategory || '';
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || fileCategory === selectedCategory;
    const matchesSubCategory = !selectedSubCategory || fileSubCategory === selectedSubCategory;
    const matchesYear = !selectedYear || file.year === parseInt(selectedYear);
    return matchesSearch && matchesCategory && matchesSubCategory && matchesYear;
  });
  const filteredRecentFiles = filteredFiles.slice(0, 4);

  // Dynamic section title
  const getSectionTitle = () => {
    if (selectedSubCategory) return selectedSubCategory;
    if (selectedCategory) return selectedCategory;
    if (searchTerm) return `Search Results`;
    return 'Recent Files';
  };

  // Error state
  if (error) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content">
          <div className="error-container">
            <h2>Error Loading Files</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />
      <main className="main-content" style={{ padding: 0 }}>
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          <CategorySidebar onSelect={handleCategorySelect} />
          <div className="file-index-page" style={{ flex: 1, padding: '32px 40px', overflowX: 'auto' }}>
            <div className="page-header">
              <h1>File Management</h1>
              <p>Browse and manage all your files in one place</p>
            </div>
            <div className="search-filter-bar">
              <div className="search-container">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="filter-container">
                <button 
                  className={`filter-button ${selectedCategory ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubCategory('');
                  }}
                >
                  <FiFilter />
                  {selectedCategory ? `Category (${selectedCategory})` : 'Category'}
                </button>
              </div>
              <div className="filter-container">
                <button 
                  className={`filter-button ${selectedYear ? 'active' : ''}`}
                  onClick={() => setShowYearFilter(!showYearFilter)}
                >
                  <FiCalendar />
                  Year {selectedYear && `(${selectedYear})`}
                </button>
                {showYearFilter && (
                  <div className="filter-dropdown">
                    {getUniqueYears().map(year => (
                      <button
                        key={year}
                        className={`filter-option ${selectedYear === year ? 'selected' : ''}`}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(selectedCategory || selectedYear) && (
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubCategory('');
                    setSelectedYear('');
                  }}
                >
                  <FiX /> Clear Filters
                </button>
              )}
            </div>
            {/* Filtered/Category Section */}
            <section className="files-section">
              <h2 className="files-section-title">{getSectionTitle()}</h2>
              <div className="files-scroll-grid" style={{ overflowX: 'hidden', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {isLoadingFiles ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading files...</p>
                  </div>
                ) : filteredRecentFiles.length === 0 ? (
                  <div className="empty-state">
                    <FiFile className="empty-icon" />
                    <p>No files found</p>
                  </div>
                ) : (
                  filteredRecentFiles.map((file) => (
                    <div key={file._id} className="file-card" style={{ minHeight: 170, minWidth: 0, padding: '1.2rem 1rem', boxSizing: 'border-box' }}>
                      <div className="file-info">
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#2c3e50', textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal', minHeight: '2.4em', lineHeight: '1.2' }}>{file.originalName || file.filename || file.name || 'Untitled'}</h4>
                        <p>Category: {file.category || 'Uncategorized'}</p>
                        <p>Year: {file.year || 'N/A'}</p>
                      </div>
                      <div className="file-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                        <button onClick={() => handleViewFile(file._id)} style={{ flex: '1 1 45%', minWidth: 80, maxWidth: '100%', padding: '8px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', transition: 'background 0.2s', margin: '2px 0' }}>View</button>
                        <button onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)} style={{ flex: '1 1 45%', minWidth: 8, maxWidth: '100%', padding: '8px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', transition: 'background 0.2s', margin: '2px 0' }}>Download</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            {/* All Files Section */}
<section className="px-6 py-8 bg-white rounded-2xl shadow-md">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">All Files</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {isLoadingFiles ? (
      <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
        <FiLoader className="animate-spin text-3xl mb-2" />
        <p className="text-sm font-medium">Loading files...</p>
      </div>
    ) : filteredFiles.length === 0 ? (
      <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-12">
        <FiFile className="text-4xl mb-2" />
        <p className="text-base font-medium">No files found matching your criteria</p>
      </div>
    ) : (
      filteredFiles.map((file) => (
        <div
          key={file._id}
          className="flex flex-col justify-between bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 min-h-[210px]"
        >
          <div className="text-center mb-4">
            <h4 className="text-base font-semibold text-gray-800 break-words min-h-[2.4em] leading-tight">
              {file.originalName || file.filename || file.name || 'Untitled'}
            </h4>
            <p className="text-sm text-gray-600 mt-1">Category: {file.category || 'Uncategorized'}</p>
            <p className="text-sm text-gray-600">Year: {file.year || 'N/A'}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
          <button
  onClick={() => handleViewFile(file._id)}
  className="flex-1 min-w-[80px] max-w-full h-10 px-3 bg-blue-600 text-white text-[0.98rem] font-semibold leading-none rounded-md hover:bg-blue-700 transition-colors duration-200 my-[2px] flex items-center justify-center"
>
  View
</button>

<button
  onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}
  className="flex-1 min-w-[80px] max-w-full h-10 px-3 bg-green-600 text-white text-[0.98rem] font-semibold leading-none rounded-md hover:bg-green-700 transition-colors duration-200 my-[2px] flex items-center justify-center"
>
  Download
</button>


          </div>
        </div>
      ))
    )}
  </div>
</section>

          </div>
        </div>
      </main>
    </div>
  );
}