import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/globals.css';
import './styles/dashboard.css';
import './styles/fileviewer.css';
import './styles/FileIndex.css';
import './styles/CreateFile.css';
import './styles/UploadFile.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)