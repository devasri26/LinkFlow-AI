import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Sun, Moon, Link2, Plus, Search, BarChart3, AlertCircle } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import GlassCard from '../components/GlassCard';
import UrlCard from '../components/UrlCard';

const Dashboard = ({ setToast, toggleTheme, theme }) => {
  const { user, logout } = useContext(AuthContext);
  const [urls, setUrls] = useState([]);

  const ensureAbsoluteUrl = (link) => {
    if (!link) return '';
    if (!/^https?:\/\//i.test(link)) {
      return 'https://' + link;
    }
    return link;
  };
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired

  // URL Creator State
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete target confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch user URLs
  const fetchUrls = async () => {
    try {
      const res = await api.get(`/api/url/list?search=${search}`);
      setUrls(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error retrieving links from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Check query parameters to prefill the shortener console
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlParam = queryParams.get('url');
    if (urlParam) {
      setOriginalUrl(decodeURIComponent(urlParam));
    }
  }, []);

  // Set up polling and focus listeners for auto-refresh
  useEffect(() => {
    fetchUrls();

    // Poll the backend every 5 seconds to update clicks and lists in real-time
    const interval = setInterval(() => {
      fetchUrls();
    }, 5000);

    // Refresh immediately when window/tab is focused
    const handleFocus = () => {
      fetchUrls();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setToast({ message: 'Destination URL is required.', type: 'error' });
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/api/url/create', { originalUrl, title, customAlias, expiryDate });
      setUrls([res.data, ...urls]);
      setToast({ message: 'Short link initialized.', type: 'success' });

      // Reset Inputs
      setOriginalUrl('');
      setTitle('');
      setCustomAlias('');
      setExpiryDate('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Link initialization failed.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTrigger = (url) => {
    setDeleteTarget(url);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id || deleteTarget._id;
    try {
      await api.delete(`/api/url/delete/${id}`);
      setUrls(urls.filter((u) => (u.id || u._id) !== id));
      setToast({ message: 'Short link destroyed.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete URL.', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filter logic
  const filteredUrls = urls.filter((url) => {
    const isExpired = url.expiryDate ? new Date() > new Date(url.expiryDate) : false;
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  });

  return (
    <div className="relative min-h-screen bg-slate-950/20 text-slate-100 dark:text-slate-100 light:text-slate-800">
      <ParticleBackground />

      {/* Floating Header */}
      <header className="relative z-10 border-b border-slate-900/60 dark:border-slate-900/60 light:border-slate-200 bg-slate-950/50 dark:bg-slate-950/50 light:bg-white/85 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold font-mono text-white">
              L
            </div>
            <span className="font-bold text-base tracking-wider dark:text-slate-200 light:text-slate-800">
              LinkFlow <span className="text-indigo-400 font-extrabold">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-655 hidden sm:inline">
              SECURE CONNECTION // USER: <span className="text-indigo-400 font-bold uppercase">{user?.username}</span>
            </span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 border border-slate-800 dark:border-slate-800 light:border-slate-250 transition-colors"
              title="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider"
              title="Close connection"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Console Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Shortener Panel Console (Taller layout with more padding/spacing) */}
        <section className="lg:col-span-4 space-y-6">
          <GlassCard className="border-indigo-500/15 p-8 sm:p-10 py-12">
            <h3 className="text-base font-bold text-slate-200 dark:text-slate-200 light:text-slate-850 mb-6 flex items-center space-x-2">
              <Link2 size={18} className="text-indigo-400" />
              <span>Link Shortener Console</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. google.com/search"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">Link Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Campaign/Page label"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">Custom Alias (Optional)</label>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. summer-promo"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95"
              >
                <Plus size={16} />
                <span>{creating ? 'Initializing link...' : 'Shorten Link'}</span>
              </button>
            </form>
          </GlassCard>

          {/* Top Performing Links Leaderboard (Static rankings, no stats detail action) */}
          <GlassCard className="border-indigo-500/10">
            <h3 className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-850 mb-3 flex items-center space-x-2">
              <BarChart3 size={16} className="text-emerald-450" />
              <span>Top Performing Links</span>
            </h3>
            {urls.length === 0 ? (
              <p className="text-slate-500 text-xs font-mono">No telemetry data recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {[...urls]
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .slice(0, 3)
                  .map((url, index) => {
                    const rankColors = [
                      'from-amber-400 to-yellow-500 text-yellow-950 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
                      'from-slate-300 to-slate-400 text-slate-955 shadow-[0_0_10px_rgba(148,163,184,0.2)]',
                      'from-amber-600 to-amber-700 text-amber-50 shadow-[0_0_10px_rgba(180,83,9,0.2)]'
                    ];
                    const rankLabels = ['1ST', '2ND', '3RD'];
                    return (
                      <div
                        key={url.id || url._id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50 border border-slate-850 dark:border-slate-800/80 light:border-slate-200 transition-all"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r ${rankColors[index] || 'from-indigo-500/20 to-indigo-500/10 text-indigo-300'} font-mono`}>
                            {rankLabels[index] || `${index + 1}TH`}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate block">
                              {url.title || 'Untitled Link'}
                            </span>
                            <a
                              href={ensureAbsoluteUrl(`${window.location.origin}/${url.shortCode}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono truncate block"
                            >
                              /{url.shortCode}
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-indigo-400">
                            {url.clicks || 0}
                          </span>
                          <span className="text-[7.5px] text-slate-500 dark:text-slate-500 light:text-slate-605 uppercase tracking-widest block font-bold">clicks</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </GlassCard>
        </section>

        {/* Right Column: Deck & Cards Grid */}
        <section className="lg:col-span-8 space-y-8">

          {/* Controls Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-9 pr-4 py-2 rounded-lg text-xs"
                placeholder="Search link matrix by title or destination..."
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'all' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-655 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'active' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-655 hover:text-slate-200'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'expired' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-655 hover:text-slate-200'}`}
              >
                Expired
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div>
            {loading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="glass-panel h-52 rounded-2xl animate-pulse border-indigo-500/5 bg-slate-900/10"></div>
                ))}
              </div>
            ) : filteredUrls.length === 0 ? (
              <GlassCard className="text-center py-12 border-indigo-500/5 bg-slate-955/15">
                <svg className="w-48 h-32 mx-auto mb-4 text-indigo-500/40" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Planetary orbit outline */}
                  <path d="M20 60 C 20 20, 180 20, 180 60 C 180 100, 20 100, 20 60 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow origin-center" style={{ transformOrigin: '100px 60px' }} />
                  <path d="M40 60 C 40 35, 160 35, 160 60 C 160 85, 40 85, 40 60 Z" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />

                  {/* Connection lines */}
                  <line x1="100" y1="20" x2="60" y2="80" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="100" y1="20" x2="140" y2="80" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="60" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="0.75" />

                  {/* Data Nodes */}
                  <circle cx="100" cy="20" r="4" className="fill-indigo-400 animate-pulse" />
                  <circle cx="100" cy="20" r="8" className="stroke-indigo-400/30 stroke-1 animate-ping" />

                  <circle cx="60" cy="80" r="4.5" className="fill-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <circle cx="140" cy="80" r="3.5" className="fill-pink-400 animate-pulse" style={{ animationDelay: '1s' }} />

                  {/* Floating particles */}
                  <circle cx="115" cy="55" r="1.5" className="fill-cyan-400 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3s' }} />
                  <circle cx="80" cy="40" r="2" className="fill-indigo-305 animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '4.5s' }} />
                  <circle cx="150" cy="45" r="1" className="fill-purple-300 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2.5s' }} />
                </svg>
                <h4 className="text-sm font-bold text-slate-350 dark:text-slate-355 light:text-slate-750">Planetary Links Offline</h4>
                <p className="text-slate-450 dark:text-slate-400 light:text-slate-550 text-[11px] mt-1.5 max-w-xs mx-auto font-mono">
                  No active shortcode routes found. Establish a new node in the left cockpit pane.
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredUrls.map((url) => (
                  <UrlCard
                    key={url.id || url._id}
                    url={url}
                    onDelete={() => handleDeleteTrigger(url)}
                    onCopySuccess={() => setToast({ message: 'Shortened link copied to dashboard.', type: 'success' })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Custom Glass Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full rounded-2xl p-6 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-slate-955/85">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 animate-bounce">
                <AlertCircle size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-800">
                  Confirm Telemetry Destruction
                </h3>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                  Action is permanent & irreversible
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-left font-mono text-[11px] space-y-1.5">
                <p className="truncate">
                  <span className="text-red-400 font-bold">Short Link:</span>{' '}
                  <a
                    href={ensureAbsoluteUrl(`${window.location.origin}/${deleteTarget.shortCode}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-indigo-400 dark:text-indigo-300 font-semibold"
                  >
                    {`${window.location.origin}/${deleteTarget.shortCode}`}
                  </a>
                </p>
                <p className="truncate"><span className="text-slate-400 font-bold">Destination:</span> {deleteTarget.originalUrl}</p>
                <p><span className="text-slate-455 font-bold">Clicks Logged:</span> <span className="text-indigo-400 font-bold">{deleteTarget.clicks || 0} clicks</span></p>
              </div>

              <p className="text-slate-455 text-[11.5px] leading-relaxed">
                Deleting this node will purge all historical redirection paths, device diagnostic breakdowns, browser telemetry metrics, and the custom alias mappings. Are you sure you wish to proceed?
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-555 active:scale-95 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md shadow-red-500/10"
                >
                  Confirm Destroy
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-355 font-semibold rounded-lg text-xs border border-slate-750 transition-all"
                >
                  Abort Action
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
