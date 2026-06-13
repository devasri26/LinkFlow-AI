import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Calendar, Monitor, Globe, Shield, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const AnalyticsView = ({ analytics, onRefresh }) => {
  if (!analytics || !analytics.totalClicks || analytics.totalClicks === 0) {
    return (
      <GlassCard className="text-center py-16 border-indigo-500/10">
        <Monitor className="mx-auto text-indigo-400/50 mb-4 animate-bounce" size={48} />
        <h3 className="text-lg font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-2">No System Traffic Detected</h3>
        <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
          Share your shortened URL link in a browser to start compiling device, browser, and OS metrics.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-indigo-500/20"
          >
            Refresh Diagnostics
          </button>
        )}
      </GlassCard>
    );
  }

  const { totalClicks, lastVisited, timelineData = [], browserData = [], osData = [], deviceData = [], recentVisits = [] } = analytics;

  const [rangeMode, setRangeMode] = useState('daily');

  const getWeeklyData = (dailyData) => {
    if (!dailyData || dailyData.length < 8) return dailyData;
    const weeks = {};
    dailyData.forEach(item => {
      const date = new Date(item.date);
      const day = date.getDay();
      const diff = date.getDate() - day;
      const startOfWeek = new Date(date.setDate(diff));
      const weekKey = startOfWeek.toISOString().split('T')[0];
      weeks[weekKey] = (weeks[weekKey] || 0) + item.clicks;
    });
    
    return Object.keys(weeks)
      .sort()
      .map(weekStart => {
        const dateObj = new Date(weekStart);
        const label = `Wk: ${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        return {
          date: label,
          clicks: weeks[weekStart]
        };
      });
  };

  const activeTimelineData = rangeMode === 'daily' ? timelineData : getWeeklyData(timelineData);

  return (
    <div className="space-y-6">
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border-indigo-500/10 flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Monitor size={20} />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Diagnostic Clicks</label>
            <span className="text-2xl font-bold font-mono bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{totalClicks}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-indigo-500/10 flex items-center space-x-4">
          <div className="p-3.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Calendar size={20} />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Last Clicked</label>
            <span className="text-xs font-bold font-mono text-slate-200 dark:text-slate-200 light:text-slate-800">
              {lastVisited ? new Date(lastVisited).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <RefreshCw size={20} className={onRefresh ? "hover:rotate-180 transition-transform duration-500 cursor-pointer" : ""} onClick={onRefresh} />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Telemetry Status</label>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Online</span>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-[10px] bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-750 dark:border-slate-700 light:border-slate-300 transition-colors font-bold"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Timeline graph */}
      <GlassCard className="border-indigo-500/10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center space-x-2">
            <Calendar size={16} className="text-indigo-400" />
            <span>Click Timeline</span>
          </h4>
          <div className="flex bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-0.5 rounded-lg text-[10px] font-mono">
            <button
              onClick={() => setRangeMode('daily')}
              className={`px-2.5 py-1 rounded transition-colors ${rangeMode === 'daily' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setRangeMode('weekly')}
              className={`px-2.5 py-1 rounded transition-colors ${rangeMode === 'weekly' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'}`}
            >
              Weekly
            </button>
          </div>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTimelineData}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Matrix pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Splits */}
        <GlassCard className="border-indigo-500/10 flex flex-col justify-between h-[310px]">
          <h4 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-1 flex items-center space-x-2">
            <Monitor size={14} className="text-purple-400" />
            <span>Devices</span>
          </h4>
          <div className="h-40 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-3.5 text-[10px] font-mono">
            {deviceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-350 dark:text-slate-300 light:text-slate-655 font-bold">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Browser Stats */}
        <GlassCard className="border-indigo-500/10 flex flex-col justify-between h-[310px]">
          <h4 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-1 flex items-center space-x-2">
            <Globe size={14} className="text-indigo-400" />
            <span>Browsers</span>
          </h4>
          <div className="h-40 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: '10px', fill: '#94a3b8', fontFamily: 'monospace' }}
                >
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 text-[9px] font-mono max-h-12 overflow-y-auto">
            {browserData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* OS distribution */}
        <GlassCard className="border-indigo-500/10 flex flex-col justify-between h-[310px]">
          <h4 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-1 flex items-center space-x-2">
            <Shield size={14} className="text-pink-400" />
            <span>Platforms (OS)</span>
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={osData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '10px'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {osData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Real-time visits console */}
      <GlassCard className="border-indigo-500/10">
        <h4 className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-4 flex items-center space-x-2">
          <Monitor size={16} className="text-indigo-400" />
          <span>Real-time Log Stream</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 uppercase tracking-widest text-[9px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">OS</th>
                <th className="pb-3">Browser</th>
                <th className="pb-3">Device</th>
                <th className="pb-3">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 dark:divide-slate-800/40 light:divide-slate-200 text-slate-350 dark:text-slate-300 light:text-slate-700">
              {recentVisits.map((visit, index) => (
                <tr key={index} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="py-2.5">{new Date(visit.timestamp).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/15 text-[10px]">
                      {visit.os}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[10px]">
                      {visit.browser}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/15 text-[10px]">
                      {visit.device}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 dark:text-slate-400 light:text-slate-500">{visit.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsView;
