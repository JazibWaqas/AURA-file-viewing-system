import React from 'react';
import '../styles/CreateFile.css'; // Assuming you'll create a CSS file for styling

const CreateFile = () => {
  return (
    <div className="create-file-page">
      <div className="viewing-system-header">
        <h2>VIEWING SYSTEM</h2>
      </div>

      <div className="create-file-section">
        <h3>CREATE A FILE</h3>
        <button className="done-button">DONE</button>
        <div className="data-grid">
          {/* Simple grid for data entry */}
          {[...Array(10)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {[...Array(5)].map((_, colIndex) => (
                <input key={colIndex} type="text" className="grid-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateFile;