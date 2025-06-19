import React, { useState, useEffect, useRef } from 'react';
import '../styles/FileIndex.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import CategorySidebar from '../components/CategorySidebar.jsx';
import { FaChartBar, FaDonate, FaMoneyBill, FaUniversity, FaBalanceScale, FaClipboardCheck, FaFolderOpen, FaBuilding, FaEllipsisH } from "react-icons/fa";

const FileIndex = () => {
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
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFiles(true);
      setError(null);
      try {
        const [filesRes, categoriesRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/categories')
        ]);

        if (!filesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [filesData, categoriesData] = await Promise.all([
          filesRes.json(),
          categoriesRes.json()
        ]);

        const sortedFiles = filesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllFiles(sortedFiles);
        setRecentFiles(sortedFiles.slice(0, 5));
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoadingFiles(false);
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const handleViewFile = (fileId) => {
    navigate(`/file-viewer/${fileId}`);
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
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
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      // Implement search logic here
    }, 300);
  };

  const handleCategoryFilter = (category) => {
    console.log('Selected category:', category);
    setSelectedCategory(category === selectedCategory ? '' : category);
    setShowCategoryFilter(false);
  };

  const handleYearFilter = (year) => {
    console.log('Selected year:', year);
    setSelectedYear(year === selectedYear ? '' : year);
    setShowYearFilter(false);
  };

  const handleCategorySelect = (cat, sub) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(sub);
  };

  const getUniqueCategories = () => {
    return categories.map(category => category.name);
  };

  const getUniqueYears = () => {
    const years = Array.from(new Set(allFiles.map(file => file.year))).filter(Boolean);
    return years.sort((a, b) => b - a);
  };

  const categoryIconMap = {
    "Financial Statements": <FaChartBar />,
    "Income & Donations": <FaDonate />,
    "Expenses": <FaMoneyBill />,
    "Bank & Cash": <FaUniversity />,
    "Tax & Compliance": <FaBalanceScale />,
    "Audit Reports": <FaClipboardCheck />,
    "Budgets": <FaFolderOpen />,
    "Organizational Documents": <FaBuilding />,
    "Other": <FaEllipsisH />,
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

  useEffect(() => {
    console.log('Current filters:', {
      selectedCategory,
      selectedYear,
      searchTerm,
      totalFiles: allFiles.length,
      filteredFilesCount: filteredFiles.length
    });
  }, [selectedCategory, selectedYear, searchTerm, allFiles, filteredFiles]);

  const filteredRecentFiles = filteredFiles.slice(0, 5);

  if (error) {
    return (
      <div className="app-root">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="app-content-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Category Sidebar Toggle Button */}
        {!categorySidebarOpen && (
          <button className="category-sidebar-toggle" onClick={() => setCategorySidebarOpen(true)} aria-label="Open categories">
            &#9776; Categories
          </button>
        )}
        {/* Category Sidebar */}
        {categorySidebarOpen && (
          <aside className="sidebar category-sidebar">
            <button className="category-sidebar-close" onClick={() => setCategorySidebarOpen(false)} aria-label="Close categories">&times;</button>
            <div className="category-toc-title">Categories</div>
            <nav>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <button
                      className={`category-toc-link${selectedCategory === cat.name ? ' active' : ''}`}
                      onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                      aria-expanded={expandedCategory === cat.name}
                    >
                      <span className="category-toc-icon">{categoryIconMap[cat.name] || <FaEllipsisH />}</span>
                      {cat.name}
                    </button>
                    {cat.subCategories && expandedCategory === cat.name && (
                      <ul className="subcategory-list">
                        {cat.subCategories.map((sub) => (
                          <li key={sub}>
                            <button
                              className={`subcategory-link${selectedSubCategory === sub && selectedCategory === cat.name ? ' active' : ''}`}
                              onClick={() => handleCategorySelect(cat.name, sub)}
                            >
                              {sub}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
        <main className="main-content">
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
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                >
                  <FiFilter />
                  Category {selectedCategory && `(${selectedCategory})`}
                </button>
                {showCategoryFilter && (
                  <div className="category-toc-panel">
                    <div className="category-toc-title">Categories</div>
                    <ul>
                      {getUniqueCategories().map((cat) => (
                        <li key={cat}>
                          <button
                            className={`category-toc-link${selectedCategory === cat ? ' active' : ''}`}
                            onClick={() => handleCategoryFilter(cat)}
                          >
                            <span className="category-toc-icon">{categoryIconMap[cat] || <FaEllipsisH />}</span>
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                        onClick={() => handleYearFilter(year)}
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
                    setSelectedYear('');
                  }}
                >
                  <FiX /> Clear Filters
                </button>
              )}
            </div>

            <div className="recent-files-section">
              <h2>Recent Files</h2>
              <div className="recent-files-grid">
                {isLoadingFiles ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading recent files...</p>
                  </div>
                ) : filteredRecentFiles.length === 0 ? (
                  <div className="empty-state">
                    <FiFile className="empty-icon" />
                    <p>No recent files found</p>
                  </div>
                ) : (
                  filteredRecentFiles.map((file) => (
                    <div key={file._id} className="file-card">
                      <div className="file-icon">
                        <FiFile />
                      </div>
                      <div className="file-info">
                        <h4>{file.originalName || file.filename || file.name || 'Untitled'}</h4>
                        <p>Category: {file.category || 'Uncategorized'}</p>
                        <p>Year: {file.year || 'N/A'}</p>
                      </div>
                      <div className="file-actions">
                        <button onClick={() => handleViewFile(file._id)} className="action-button">
                          <FiEye />
                        </button>
                        <button onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)} className="action-button">
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ minWidth: 220 }}>
                <CategorySidebar onSelect={handleCategorySelect} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-list-section">
                  <h2>All Files</h2>
                  <div className="file-list-grid">
                    {isLoadingFiles ? (
                      <div className="loading-indicator">
                        <FiLoader className="spinner-icon" />
                        <p>Loading files...</p>
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className="empty-state">
                        <FiFile className="empty-icon" />
                        <p>No files found matching your criteria</p>
                      </div>
                    ) : (
                      filteredFiles.map((file) => (
                        <div key={file._id} className="file-card">
                          <div className="file-icon">
                            <FiFile />
                          </div>
                          <div className="file-info">
                            <h4>{file.originalName || file.filename || file.name || 'Untitled'}</h4>
                            <p>Category: {file.category || 'Uncategorized'}</p>
                            <p>Year: {file.year || 'N/A'}</p>
                          </div>
                          <div className="file-actions">
                            <button onClick={() => handleViewFile(file._id)} className="action-button">
                              <FiEye />
                            </button>
                            <button onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)} className="action-button">
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileIndex;