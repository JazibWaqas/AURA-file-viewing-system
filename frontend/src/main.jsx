import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/globals.css';
import './styles/sidebar.css';
import './styles/dashboard.css';
import './styles/fileviewer.css';
import './styles/custom-utilities.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
