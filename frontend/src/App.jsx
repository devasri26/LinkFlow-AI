import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PublicStats from './pages/PublicStats';
import CustomToast from './components/CustomToast';
import { AnimatePresence } from 'framer-motion';

// Protected routing checker
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 font-mono text-xs text-indigo-400">
        Authenticating Connection...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Client Redirection catch-all for deployment
const ClientRedirect = () => {
  const { code } = useParams();
  useEffect(() => {
    // Forward the redirect to the Express server to capture user agent stats
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let directRedirectUrl = 'http://localhost:5000';
    
    if (backendUrl.startsWith('http://') || backendUrl.startsWith('https://')) {
      directRedirectUrl = backendUrl.replace(/\/api\/?$/, '');
    } else {
      // Relative path - if on localhost, point to default local backend, otherwise current origin
      if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        directRedirectUrl = window.location.origin;
      }
    }
    
    window.location.href = `${directRedirectUrl}/${code}`;
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-mono text-[10px] text-indigo-400">
      <span className="animate-pulse">Routing through LinkFlow AI Matrix...</span>
    </div>
  );
};

const AppContent = () => {
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setToast={setToast} />} />
        <Route path="/signup" element={<Signup setToast={setToast} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard setToast={setToast} toggleTheme={toggleTheme} theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route path="/stats/:code" element={<PublicStats setToast={setToast} />} />
        
        {/* Route interceptor redirect matching code */}
        <Route path="/:code" element={<ClientRedirect />} />
      </Routes>

      {/* Floating notification deck */}
      <AnimatePresence>
        {toast && (
          <CustomToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
