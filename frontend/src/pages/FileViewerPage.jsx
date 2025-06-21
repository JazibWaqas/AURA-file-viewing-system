import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';
import Header from '../components/Header.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiLoader, FiX, FiArrowLeft, FiInfo, FiCalendar, FiUser, FiFolder, FiTrash2, FiEdit } from 'react-icons/fi';
import mammoth from 'mammoth/mammoth.browser';
import * as XLSX from 'xlsx';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';

const FileViewer = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [excelSheets, setExcelSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPreviewError(null);
      setPreviewData(null);
      try {
        if (id) {
          const detailsRes = await fetch(`/api/files/${id}/details`);
          if (!detailsRes.ok) throw new Error(detailsRes.status === 404 ? 'File not found' : 'Error fetching file details');

          const fileDetails = await detailsRes.json();
          setFile(fileDetails);

          if (fileDetails.fileType === 'pdf') {
            const viewResponse = await fetch(`/api/files/${id}/view`);
            if (viewResponse.ok) {
              const blob = await viewResponse.blob();
              fileDetails.url = URL.createObjectURL(blob);
              setFile(fileDetails);
            }
          } else if (fileDetails.fileType === 'csv') {
            const previewResponse = await fetch(`/api/files/${id}/preview`);
            if (previewResponse.ok) {
              const previewData = await previewResponse.json();
              setPreviewData(previewData);
              if (!previewData.headers || previewData.headers.length === 0) {
                setPreviewError('No data found in this file.');
              }
            } else {
              setPreviewError('Failed to load preview data.');
            }
          } else if (fileDetails.fileType === 'excel' || fileDetails.fileType === 'xlsx') {
            try {
              setPreviewData(null);
              setPreviewError(null);
              setLoading(true);
              const viewResponse = await fetch(`/api/files/${id}/view`);
              if (viewResponse.ok) {
                const arrayBuffer = await viewResponse.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                const sheetData = workbook.SheetNames.map((sheetName) => {
                  const sheet = workbook.Sheets[sheetName];
                  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                  return { name: sheetName, data };
                });

                setExcelSheets(sheetData);
                setActiveSheet(sheetData[0]);
              } else {
                setPreviewError('Failed to load Excel file.');
              }
            } catch (err) {
              console.error('Error processing Excel file:', err);
              setPreviewError('Error processing Excel file.');
            } finally {
              setLoading(false);
            }
          } else if (fileDetails.fileType === 'docx' || fileDetails.fileType === 'doc') {
            try {
              setPreviewData(null);
              setPreviewError(null);
              setLoading(true);
              const viewResponse = await fetch(`/api/files/${id}/view`);
              if (viewResponse.ok) {
                const blob = await viewResponse.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setPreviewData(result.value);
              } else {
                setPreviewError('Failed to load document preview.');
              }
            } catch (err) {
              setPreviewError('Error loading document preview.');
            } finally {
              setLoading(false);
            }
          }
        } else {
          const res = await fetch('/api/files');
          if (!res.ok) throw new Error('Failed to fetch files');
          const data = await res.json();
          setAllFiles(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (file?.url) URL.revokeObjectURL(file.url);
    };
  }, [id]);

  const handleFileClick = (fileId) => {
    navigate(`/file-viewer/${fileId}`);
  };

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
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!file || !file._id) return;
    if (window.confirm(`Are you sure you want to delete "${file.originalName || file.filename || file.name}"?`)) {
      try {
        setLoading(true);
        const response = await fetch(`/api/files/${file._id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete file');
        alert('File deleted successfully!');
        navigate('/file-index');
      } catch (error) {
        console.error('Error deleting file:', error);
        setError(error.message);
        setLoading(false);
      }
    }
  };

  const renderSpreadsheet = () => {
    if (previewError) return <div className="spreadsheet-error">{previewError}</div>;
    if (file.fileType === 'excel' || file.fileType === 'xlsx') {
      if (!activeSheet?.data?.length) return <div className="spreadsheet-error">No data found in this sheet.</div>;
      const headers = activeSheet.data[0];
      const tableData = activeSheet.data.slice(1);

      return (
        <div className="spreadsheet-preview-container handsontable-container">
          {excelSheets.length > 1 && (
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="sheetSelect" style={{ marginRight: 8, fontWeight: 'bold' }}>Sheet:</label>
              <select
                id="sheetSelect"
                value={activeSheet.name}
                onChange={(e) =>
                  setActiveSheet(excelSheets.find((s) => s.name === e.target.value))
                }
                style={{ padding: '6px 10px', borderRadius: 6 }}
              >
                {excelSheets.map((sheet) => (
                  <option key={sheet.name} value={sheet.name}>{sheet.name}</option>
                ))}
              </select>
            </div>
          )}

          <HotTable
            data={tableData}
            colHeaders={headers}
            rowHeaders={true}
            width="100%"
            height="70vh"
            autoColumnSize={true}
            licenseKey="non-commercial-and-evaluation"
            contextMenu={true}
            filters={true}
            dropdownMenu={true}
          />
        </div>
      );
    }

    if (file.fileType === 'csv' && previewData?.headers) {
      return (
        <div className="spreadsheet-preview-container">
          <table className="spreadsheet-table">
            <thead>
              <tr>{previewData.headers.map((header, idx) => <th key={idx}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {previewData.rows?.length ? (
                previewData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}</tr>
                ))
              ) : (
                <tr><td colSpan={previewData.headers.length}>No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderDocx = () => {
    if (loading) return <div className="docx-loading"><FiLoader className="spinner-icon" /> Loading document preview...</div>;
    if (previewError) return <div className="docx-error">{previewError}</div>;
    if (previewData) return <div className="docx-preview" dangerouslySetInnerHTML={{ __html: previewData }} />;
    return null;
  };

  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content">
          <div className="loading-container"><FiLoader className="spinner-icon" /><p>Loading content...</p></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content">
          <div className="error-container">
            <h2>Error Loading File</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  if (id && file) {
    return (
      <div className="app-root">
        <Header />
        <main className="main-content">
          <div className="file-viewer-header file-viewer-page">
            <div className="file-viewer-header-left">
              <button className="back-button" onClick={() => navigate('/file-index')}><FiArrowLeft /> Back</button>
              <h1>{file.originalName || file.filename || file.name || 'Untitled'}</h1>
            </div>
            <button className="download-button" onClick={() => handleDownload(file._id, file.originalName || file.filename || file.name)}><FiDownload /> Download</button>
          </div>
          <div className="file-viewer-flex-root">
            <div className="file-details-sidebar">
              <div className="details-section">
                <h3>File Information</h3>
                <ul>
                  <li><FiFolder /><span>Category:</span><strong>{file.category || 'Uncategorized'}</strong></li>
                  <li><FiFolder /><span>SubCategory:</span><strong>{file.subCategory || 'N/A'}</strong></li>
                  <li><FiCalendar /><span>Year:</span><strong>{file.year || 'N/A'}</strong></li>
                  <li><FiUser /><span>Uploaded By:</span><strong>{file.uploadedBy || 'Anonymous'}</strong></li>
                  <li><FiInfo /><span>Size:</span><strong>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown'}</strong></li>
                </ul>
              </div>
              {file.description && <div className="description-section"><h3>Description</h3><p>{file.description}</p></div>}
              <div className="actions-section">
                <button className="edit-button" title="Edit file metadata" onClick={() => navigate(`/file-edit/${file._id}`)}><FiEdit /> Edit File Metadata</button>
                <button className="delete-button" title="Delete this file permanently" onClick={handleDelete}><FiTrash2 /> Delete File</button>
              </div>
            </div>
            <div className="file-viewer-divider" />
            <div className="file-viewer-content">
              <div className="file-preview">
                {file.fileType === 'pdf' && file.url && (
                  <iframe src={file.url} title="PDF Preview" className="pdf-preview-frame" frameBorder="0" width="100%" height="700px" />
                )}
                {(file.fileType === 'csv' || file.fileType === 'excel' || file.fileType === 'xlsx') && (
                  <div className="spreadsheet-preview-wrapper">{renderSpreadsheet()}</div>
                )}
                {(file.fileType === 'docx' || file.fileType === 'doc') && (
                  <div className="docx-preview-wrapper">{renderDocx()}</div>
                )}
                {!['pdf', 'csv', 'excel', 'xlsx', 'docx', 'doc'].includes(file.fileType) && (
                  <div className="unsupported-preview">
                    <FiFile style={{ fontSize: 48, color: '#b3b3b3' }} />
                    <p>Preview not available for this file type.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback: file list page
  return <div className="app-root">{/* your file index view remains here unchanged */}</div>;
};

export default FileViewer;
