import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import FileIndexPage from "./pages/FileIndexPage";
import FileViewerPage from "./pages/FileViewerPage";
import FileEditPage from "./pages/FileEditPage";
import UploadFilePage from "./pages/UploadFilePage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./services/firebase";

const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const response = await fetch(`/api/users/status/${firebaseUser.uid}`);
            const userData = await response.json();
            setUser({ firebaseUser, userData: userData || { status: 'pending' } });
        } catch (error) {
            setUser({ firebaseUser, userData: { status: 'pending' } });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const value = { user, setUser, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        // This could be a dedicated "Please log in to access this page" component
        return <UploadFilePage />; 
    }

    if (user.userData.status === 'pending') {
        return <PendingApprovalPage />;
    }

    if (user.userData.status === 'denied') {
        return <AccessDeniedPage />;
    }

    if (user.userData.status === 'approved') {
        return <Outlet />; // Renders the nested child route (e.g., FileEditPage)
    }

    return <AccessDeniedPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/file-index" element={<FileIndexPage />} />
          <Route path="/file-viewer/:id?" element={<FileViewerPage />} />
          <Route path="/upload-file" element={<UploadFilePage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/file-edit/:id" element={<FileEditPage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;