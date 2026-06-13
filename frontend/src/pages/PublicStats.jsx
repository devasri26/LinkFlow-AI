import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import GlassCard from '../components/GlassCard';
import AnalyticsView from '../components/AnalyticsView';

const PublicStats = ({ setToast }) => {
  const { code } = useParams();
  const [url, setUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await api.get(`/api/url/stats/${code}`);
      setUrl(res.data.url);
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error(err);
      setError('Matrix telemetry not found. The shortcode may be invalid.');
      if (setToast) {
        setToast({ message: 'Failed to retrieve telemetry diagnostics.', type: 'error' });
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);

    // Background poll every 5 seconds to get real-time click updates
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [code]);

  return (
    <div className="relative min-h-screen bg-slate-950/20 text-slate-100 dark:text-slate-100 light:text-slate-800">
      <ParticleBackground />

      {/* Navigation header */}
      <header className="relative z-10 border-b border-slate-900/60 dark:border-slate-900/60 light:border-slate-200 bg-slate-950/50 dark:bg-slate-950/50 light:bg-white/80 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-indigo-400 transition-colors">
            <ArrowLeft size={14} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Return</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs font-mono uppercase tracking-widest text-slate-350 dark:text-slate-300 light:text-slate-700">LinkFlow Public stats</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
            <span className="text-xs text-slate-400 font-mono">Retrieving link matrix diagnostics...</span>
          </div>
        ) : error ? (
          <GlassCard className="text-center py-16 border-red-500/10">
            <h2 className="text-xl font-bold text-red-400 mb-2">404 Matrix Disconnected</h2>
            <p className="text-slate-450 dark:text-slate-400 light:text-slate-650 text-xs max-w-sm mx-auto mb-6">{error}</p>
            <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors">
              Return Home
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            <GlassCard className="border-indigo-500/10 p-5">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider block w-fit mb-2">
                Public Diagnostics Matrix
              </span>
              <h2 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-1">{url.title || 'Untitled Shortcode'}</h2>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-405 dark:text-slate-400 light:text-slate-600 mt-3 border-t border-slate-850 dark:border-slate-800 light:border-slate-200 pt-3">
                <div>
                  <span className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600 font-bold">Short Link:</span>{' '}
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400 dark:text-indigo-300 light:text-indigo-650">
                    {url.shortUrl}
                  </a>
                </div>
                <div className="truncate">
                  <span className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600 font-bold">Destination:</span>{' '}
                  <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">
                    {url.originalUrl}
                  </a>
                </div>
              </div>
            </GlassCard>

            <AnalyticsView analytics={analytics} onRefresh={fetchStats} />
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicStats;
