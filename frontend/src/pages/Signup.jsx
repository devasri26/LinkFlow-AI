import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import GlassCard from '../components/GlassCard';

const Signup = ({ setToast }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prefilledUrl, setPrefilledUrl] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Read URL query parameter for prefilled link redirection
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlParam = queryParams.get('url');
    if (urlParam) {
      setPrefilledUrl(urlParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all register fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register(username, email, password);
      setToast({ message: 'Welcome to the Control Center. Account created successfully.', type: 'success' });
      
      // If there was a prefilled URL, forward it to the dashboard
      if (prefilledUrl) {
        navigate(`/dashboard?url=${encodeURIComponent(prefilledUrl)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Email may be in use.');
      setToast({ message: 'Registration failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-950/20 text-slate-100 dark:text-slate-100 light:text-slate-800">
      <ParticleBackground />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold font-mono text-white text-lg">
              L
            </div>
            <span className="font-bold text-lg tracking-wider text-slate-200 dark:text-slate-200 light:text-slate-800">LinkFlow AI</span>
          </Link>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Register User Credentials</p>
        </div>

        <GlassCard hoverGlow className="border-indigo-500/10 p-6">
          <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-6 text-center">Deploy Console Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-[10px] font-mono mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] text-slate-455 dark:text-slate-400 light:text-slate-700 uppercase tracking-widest block mb-1 font-bold">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                  placeholder="user_zero"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-slate-455 dark:text-slate-400 light:text-slate-700 uppercase tracking-widest block mb-1 font-bold">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                  placeholder="user@linkflow.ai"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-slate-455 dark:text-slate-400 light:text-slate-700 uppercase tracking-widest block mb-1 font-bold">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10 mt-5"
            >
              <span>{submitting ? 'Registering...' : 'Register Account'}</span>
              {!submitting && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-5 text-center text-[10px] text-slate-400">
            <span>Already registered? </span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-350 transition-colors font-bold font-mono">
              Establish Connection
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Signup;
