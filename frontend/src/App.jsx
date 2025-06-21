import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import FileIndexPage from "./pages/FileIndexPage";
import FileViewerPage from "./pages/FileViewerPage";
import FileEditPage from "./pages/FileEditPage";
import UploadFilePage from "./pages/UploadFilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/file-index" element={<FileIndexPage />} />
        <Route path="/file-viewer" element={<FileViewerPage />} />
        <Route path="/file-viewer/:id" element={<FileViewerPage />} />
        <Route path="/file-edit/:id" element={<FileEditPage />} />
        <Route path="/upload-file" element={<UploadFilePage />} />
      </Routes>
    </Router>
  );
}

export default App;