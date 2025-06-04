import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import FileIndexPage from "./pages/FileIndexPage";
import FileViewerPage from "./pages/FileViewerPage";
import UploadFilePage from "./pages/UploadFilePage";
import CreateFilePage from "./pages/CreateFilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/file-index" element={<FileIndexPage />} />
        <Route path="/file-viewer" element={<FileViewerPage />} />
        <Route path="/upload-file" element={<UploadFilePage />} />
        <Route path="/create-file" element={<CreateFilePage />} />
      </Routes>
    </Router>
  );
}

export default App;