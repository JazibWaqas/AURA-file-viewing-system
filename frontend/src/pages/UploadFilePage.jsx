import React from 'react';
import '../styles/UploadFile.css'; // Assuming you'll create a CSS file for styling

const UploadFile = () => {
  return (
    <div className="upload-file-page">
      <div className="income-statement-section">
        <h2>Income Statement</h2>
        <button className="upload-button">
          <i className="fa fa-upload"></i> Upload File
        </button>

        <div className="year-section">
          <h4>2024</h4>
          <div className="upload-slots">
            <div className="upload-slot"></div>
            <div className="upload-slot"></div>
          </div>
        </div>

        <div className="year-section">
          <h4>2023</h4>
          <div className="upload-slots">
            <div className="upload-slot"></div>
            <div className="upload-slot"></div>
          </div>
        </div>

        <div className="year-section">
          <h4>2022</h4>
          <div className="upload-slots">
            <div className="upload-slot"></div>
            <div className="upload-slot"></div>
          </div>
        </div>

        <button className="create-report-button">
          <i className="fa fa-plus"></i> Create Report
        </button>
      </div>
    </div>
  );
};

export default UploadFile;