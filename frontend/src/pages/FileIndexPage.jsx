// ... existing imports ...
import React, { useState, useEffect, useRef } from 'react';
import '../styles/FileIndex.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX } from 'react-icons/fi';

const FileIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [recentFiles, setRecentFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const navigate = useNavigate();

  const debounceTimeout = useRef(null);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (selectedYear) queryParams.append('year', selectedYear);
        
        const queryString = queryParams.toString();
        const filesRes = await fetch(`/api/files${queryString ? `?${queryString}` : ''}`);
        const files = await filesRes.json();
        
        // Filter files based on selected category and year
        let filteredFiles = files;
        if (selectedCategory) {
          filteredFiles = filteredFiles.filter(file => file.category === selectedCategory);
        }
        if (selectedYear) {
          filteredFiles = filteredFiles.filter(file => file.year === selectedYear);
        }
        
        // Sort files by creation date
        const sortedFiles = filteredFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setRecentFiles(sortedFiles.slice(0, 5));
        setAllFiles(sortedFiles);
      } catch (err) {
        console.error('Error fetching files:', err);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchFiles();
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, selectedCategory, selectedYear]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesRes = await fetch('/api/categories');
        setCategories(await categoriesRes.json());
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleViewFile = async (fileId) => {
    try {
      navigate(`/file-viewer/${fileId}`);
    } catch (error) {
      console.error('Error navigating to file viewer:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setShowCategoryFilter(false);
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year === selectedYear ? '' : year);
    setShowYearFilter(false);
  };

  const getUniqueCategories = () => {
    const categories = new Set(allFiles.map(file => file.category));
    return Array.from(categories).filter(Boolean);
  };

  const getUniqueYears = () => {
    const years = new Set(allFiles.map(file => file.year));
    return Array.from(years).filter(Boolean).sort((a, b) => b - a);
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

  return (
    <div className="app-root">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-content-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="file-index-page">
            <div className="search-filter-bar">
              <input 
                type="text" 
                placeholder="Search files..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="filter-container">
                <button 
                  className={`filter-button ${selectedCategory ? 'active' : ''}`}
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                >
                  Filter by Category {selectedCategory && `(${selectedCategory})`}
                </button>
                {showCategoryFilter && (
                  <div className="filter-dropdown">
                    {getUniqueCategories().map(category => (
                      <button
                        key={category}
                        className={`filter-option ${selectedCategory === category ? 'selected' : ''}`}
                        onClick={() => handleCategoryFilter(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="filter-container">
                <button 
                  className={`filter-button ${selectedYear ? 'active' : ''}`}
                  onClick={() => setShowYearFilter(!showYearFilter)}
                >
                  Filter by Year {selectedYear && `(${selectedYear})`}
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

            {/* Recent Files Section */}
            <div className="recent-files-section">
              <h2>Recent Files</h2>
              <div className="recent-files-grid">
                {isLoadingFiles ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading recent files...</p>
                  </div>
                ) : recentFiles.length === 0 ? (
                  <p className="no-files">No recent files found.</p>
                ) : (
                  recentFiles.map((file) => (
                    <div key={file._id} className="file-card">
                      <div className="file-icon">
                        <FiFile />
                      </div>
                      <div className="file-info">
                        <h4>{file.originalName}</h4>
                        <p>Category: {file.category}</p>
                        <p>Year: {file.year}</p>
                      </div>
                      <div className="file-actions">
                        <button className="action-button" onClick={() => handleViewFile(file._id)} title="View">
                          <FiEye />
                        </button>
                        <button 
                          className="action-button" 
                          title="Download"
                          onClick={() => handleDownload(file._id, file.originalName)}
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Categories Overview */}
            <div className="categories-section">
              <h2>Categories Overview</h2>
              <div className="categories-grid">
                {isLoadingCategories ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading categories...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <p className="no-categories">No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat._id} className="category-card">
                      <h4>{cat.name}</h4>
                      <p>{cat.count || 0} files</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* All Files Section */}
            <div className="all-files-section">
              <h2>All Files</h2>
              <div className="files-grid">
                {isLoadingFiles ? (
                  <div className="loading-indicator">
                    <FiLoader className="spinner-icon" />
                    <p>Loading all files...</p>
                  </div>
                ) : allFiles.length === 0 ? (
                  <p className="no-files">No files found.</p>
                ) : (
                  allFiles.map((file) => (
                    <div key={file._id} className="file-card">
                      <div className="file-icon">
                        <FiFile />
                      </div>
                      <div className="file-info">
                        <h4>{file.originalName}</h4>
                        <p>Category: {file.category}</p>
                        <p>Year: {file.year}</p>
                      </div>
                      <div className="file-actions">
                        <button className="action-button" onClick={() => handleViewFile(file._id)} title="View">
                          <FiEye />
                        </button>
                        <button 
                          className="action-button" 
                          title="Download"
                          onClick={() => handleDownload(file._id, file.originalName)}
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileIndex;