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
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Forward the redirect to the Express server to capture user agent stats
    const backendUrl = import.meta.env.VITE_API_URL || '';
    let directRedirectUrl = 'http://localhost:5000';
    
    if (backendUrl.startsWith('http://') || backendUrl.startsWith('https://')) {
      directRedirectUrl = backendUrl.replace(/\/api\/?$/, '');
    } else {
      // Relative path / missing URL - if on localhost, point to default local backend
      if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
        directRedirectUrl = 'http://localhost:5000';
      } else {
        // In production, a missing or relative VITE_API_URL will fail and loop infinitely. Prevent this.
        setConfigError(true);
        return;
      }
    }
    
    window.location.href = `${directRedirectUrl}/${code}`;
  }, [code]);

  if (configError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-mono p-6 text-center text-red-400">
        <h2 className="text-lg font-bold mb-2">Configuration Error</h2>
        <p className="max-w-md text-xs text-slate-400 mb-6">
          The environment variable <code className="text-indigo-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">VITE_API_URL</code> is not configured on Vercel. 
          The redirection matrix needs the backend URL to process analytics.
        </p>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg text-left text-xs max-w-md space-y-3 text-slate-300">
          <p className="font-bold text-slate-200">How to fix this:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to your Vercel Project Dashboard.</li>
            <li>Navigate to <span className="font-bold text-slate-200">Settings &gt; Environment Variables</span>.</li>
            <li>Add <code className="text-indigo-400 font-bold">VITE_API_URL</code> with your Render backend API URL (e.g. <code className="text-emerald-400 font-bold">https://your-backend.onrender.com/api</code>).</li>
            <li>Redeploy your project on Vercel for the changes to take effect.</li>
          </ol>
        </div>
      </div>
    );
  }

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
