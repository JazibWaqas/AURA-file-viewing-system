import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import FileIndexPage from "./pages/FileIndexPage";
import FileViewerPage from "./pages/FileViewerPage";
import FileEditPage from "./pages/FileEditPage";
import UploadFilePage from "./pages/UploadFilePage";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./services/firebase";

const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

function PrivateRoute({ children }) {
  const user = useAuth();
  if (user === undefined) return null; // loading
  return user ? children : <Navigate to="/file-index" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/file-index" element={<FileIndexPage />} />
          <Route path="/file-viewer" element={<FileViewerPage />} />
          <Route path="/file-viewer/:id" element={<FileViewerPage />} />
          <Route path="/file-edit/:id" element={
            <PrivateRoute>
              <FileEditPage />
            </PrivateRoute>
          } />
          <Route path="/upload-file" element={
            <PrivateRoute>
              <UploadFilePage />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;