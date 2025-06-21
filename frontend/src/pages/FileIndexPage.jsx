import React, { useState, useEffect, useRef } from 'react';
import '../styles/FileIndex.css';
import Header from '../components/Header.jsx';
import CategorySidebar from '../components/CategorySidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiSearch, FiFilter, FiCalendar, FiPlus } from 'react-icons/fi';

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
  const [visibleFilesCount, setVisibleFilesCount] = useState(16);
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
        // Sort categories: 'Financial Statements' at the top, 'Other' at the end
        const financialStatements = categoriesData.filter(cat => cat === 'Financial Statements');
        const other = categoriesData.filter(cat => cat === 'Other');
        const rest = categoriesData.filter(cat => cat !== 'Financial Statements' && cat !== 'Other');
        setCategories([...financialStatements, ...rest, ...other]);
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
  const visibleFiles = filteredFiles.slice(0, visibleFilesCount);
  const hasMoreFiles = visibleFilesCount < filteredFiles.length;

  // Reset visible files count when filters change
  useEffect(() => {
    setVisibleFilesCount(16);
  }, [searchTerm, selectedCategory, selectedSubCategory, selectedYear]);

  const handleLoadMore = () => {
    setVisibleFilesCount(prev => prev + 16);
  };

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
      <main className="main-content">
        <div className="file-index-flex-root">
          <CategorySidebar onSelect={handleCategorySelect} />
          <div className="file-index-page">
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
              <div className="files-scroll-grid">
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
                    <div key={file._id} className="file-card">
                      <div className="file-info">
                        <h4 title={file.originalName || file.filename || file.name || 'Untitled'}>
                          {file.originalName || file.filename || file.name || 'Untitled'}
                        </h4>
                        <p>Category: {file.category || 'Uncategorized'}</p>
                        <p>Year: {file.year || 'N/A'}</p>
                      </div>
                      <div className="file-actions">
                        <button className="file-view-btn" onClick={() => handleViewFile(file._id)}>View</button>
                        <button className="file-download-btn" onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}>Download</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            {/* All Files Section */}
            <section className="all-files-section">
              <h2 className="all-files-title">All Files</h2>
              <div className="all-files-scroll-grid">
                {isLoadingFiles ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading files...</p>
                  </div>
                ) : visibleFiles.length === 0 ? (
                  <div className="empty-state">
                    <FiFile className="empty-icon" />
                    <p>No files found matching your criteria</p>
                  </div>
                ) : (
                  <>
                    {visibleFiles.map((file) => (
                      <div key={file._id} className="file-card">
                        <div className="file-info">
                          <h4 title={file.originalName || file.filename || file.name || 'Untitled'}>
                            {file.originalName || file.filename || file.name || 'Untitled'}
                          </h4>
                          <p>Category: {file.category || 'Uncategorized'}</p>
                          <p>Year: {file.year || 'N/A'}</p>
                        </div>
                        <div className="file-actions">
                          <button className="file-view-btn" onClick={() => handleViewFile(file._id)}>View</button>
                          <button className="file-download-btn" onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}>Download</button>
                        </div>
                      </div>
                    ))}
                    {hasMoreFiles && (
                      <div className="load-more-container">
                        <button className="load-more-button" onClick={handleLoadMore}>
                          <FiPlus className="load-more-icon" />
                          Load More Files ({filteredFiles.length - visibleFilesCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}