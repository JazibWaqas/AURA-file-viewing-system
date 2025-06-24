import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const [user, setUser] = useState(null); // Will hold { firebaseUser, userData }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const response = await fetch(`/api/users/status/${firebaseUser.uid}`);
        if(response.ok) {
            const userData = await response.json();
            setUser({ firebaseUser, userData });
        } else {
            // Handle case where user exists in Firebase Auth but not in our DB
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

function ProtectedRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner component
    }

    if (!user) {
        // Not logged in, show public routes or a login prompt
        // For now, let's just show the main page which has a login button.
        return <FileIndexPage />;
    }

    if (user.userData.status === 'pending') {
        return <PendingApprovalPage />;
    }

    if (user.userData.status === 'denied') {
        return <AccessDeniedPage />;
    }

    if (user.userData.status === 'approved') {
        return (
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/file-index" element={<FileIndexPage />} />
                <Route path="/file-viewer/:id?" element={<FileViewerPage />} />
                <Route path="/upload-file" element={<UploadFilePage />} />
                <Route path="/file-edit/:id" element={<FileEditPage />} />
                {/* Redirect any other path to dashboard for approved users */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }
    
    // Fallback for any other state
    return <AccessDeniedPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
          <ProtectedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;