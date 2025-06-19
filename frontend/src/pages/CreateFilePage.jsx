import React from 'react';
import Header from '../components/Header.jsx';

export default function CreateFilePage() {
  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <div className="create-file-page">
          <div className="viewing-system-header">
            <h2>VIEWING SYSTEM</h2>
          </div>

          <div className="create-file-section">
            <h3>CREATE A FILE</h3>
        
            <div className="data-grid">
              {/* Simple grid for data entry */}
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                  {[...Array(5)].map((_, colIndex) => (
                    <input key={colIndex} type="text" className="grid-cell" />
                  ))}
                  
                </div> 
                
              ))}
            </div> <button className="done-button">DONE</button>
          </div>
        </div>
      </main>
    </div>
  );
}