import React, { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, Check, ArrowRight, Globe, Link2, Plus } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import GlassCard from '../components/GlassCard';
import ParticleBackground from '../components/ParticleBackground';
import CyberGlobe from '../components/CyberGlobe';

const Landing = () => {
  const { user, loading } = useContext(AuthContext);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly or yearly
  const [demoTab, setDemoTab] = useState('devices'); // devices, browsers
  const [landingUrl, setLandingUrl] = useState('');
  const navigate = useNavigate();

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  if (!loading && user) {
    return <Navigate to="/dashboard" />;
  }

  const handleLandingShorten = (e) => {
    e.preventDefault();
    if (!landingUrl) return;
    // Redirect to signup with the destination URL prefilled in query parameters
    navigate(`/signup?url=${encodeURIComponent(landingUrl)}`);
  };

  // Demo Datasets
  const demoDevices = [
    { name: 'Desktop', value: 68 },
    { name: 'Mobile', value: 25 },
    { name: 'Tablet', value: 7 }
  ];

  const demoBrowsers = [
    { name: 'Chrome', value: 55 },
    { name: 'Safari', value: 25 },
    { name: 'Firefox', value: 12 },
    { name: 'Edge', value: 8 }
  ];

  const pricingPlans = [
    {
      name: 'Hobby User',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Deploy essential redirects and track basic links.',
      features: ['5 custom link aliases', 'Basic click counters', 'Standard QR code generation', '3-day log retention'],
      cta: 'Start Free Routing',
      popular: false,
    },
    {
      name: 'Pro User',
      priceMonthly: 15,
      priceYearly: 12,
      description: 'Advanced custom aliases, custom expiration, and analytics metrics.',
      features: ['Unlimited links & aliases', 'Detailed device & browser metrics', 'Custom link expiration', 'Downloadable vector QR code', '30-day log history'],
      cta: 'Select Pro User',
      popular: true,
    },
    {
      name: 'Enterprise User',
      priceMonthly: 59,
      priceYearly: 47,
      description: 'Dedicated API access, custom branded domains, SLA guarantees.',
      features: ['Everything in Pro User', 'Custom branding domains', 'Granular country mapping logs', 'Raw log database exports', 'Direct database API access', 'Priority SLA coverage'],
      cta: 'Select Enterprise User',
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950/20 text-slate-100 dark:text-slate-100 light:text-slate-800">
      <ParticleBackground />

      {/* Centered navigation header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-900/60 dark:border-slate-900/60 light:border-slate-200 backdrop-blur-md">
        {/* Left spacer for centering the brand */}
        <div className="flex-1 hidden sm:block"></div>

        {/* Center brand logo & title */}
        <div className="flex-shrink-0 flex items-center space-x-2.5 justify-center sm:mx-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold font-mono text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            L
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent dark:from-indigo-200 dark:to-purple-300 light:from-indigo-650 light:to-indigo-850 font-sans">
            LinkFlow <span className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600 font-extrabold">AI</span>
          </span>
        </div>

        {/* Right action controls */}
        <div className="flex-1 flex items-center justify-end space-x-4">
          <Link to="/login" className="text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-indigo-400 transition-colors text-xs font-bold font-mono uppercase tracking-wider">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-500/10 dark:bg-indigo-500/10 light:bg-indigo-600 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/20 light:hover:bg-indigo-700 text-indigo-300 dark:text-indigo-300 light:text-white border border-indigo-500/35 dark:border-indigo-500/35 light:border-transparent px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider"
          >
            Access Console
          </Link>
        </div>
      </header>

      {/* Hero display section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Streamline Your Link <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Operations with LinkFlow
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Create high-performance shortened links, capture real-time analytics, and route traffic globally through a secure, enterprise-grade redirect network.
          </p>

          {/* Link Shortener Console: Primary focus area of the landing page */}
          <GlassCard className="border-indigo-500/15 p-8 sm:p-10 py-12 max-w-xl mx-auto lg:mx-0 w-full space-y-6 bg-slate-950/30">
            <h3 className="text-base font-bold text-slate-200 dark:text-slate-200 light:text-slate-850 flex items-center space-x-2.5">
              <Link2 size={18} className="text-indigo-400" />
              <span>Link Shortener Console</span>
            </h3>

            <form onSubmit={handleLandingShorten} className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={landingUrl}
                  onChange={(e) => setLandingUrl(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. google.com/search"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95"
              >
                <Plus size={16} />
                <span>Shorten Link</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Stack: Taller Rotating CyberGlobe Animation */}
        <div className="flex-1 w-full flex items-center justify-center relative min-h-[450px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[750px] max-w-lg">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <CyberGlobe className="w-full h-full min-h-[450px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[750px]" />
        </div>
      </main>

      {/* Interactive Demo Sandbox Section */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-6 py-16 border-t border-slate-900/60 dark:border-slate-900/60 light:border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent dark:from-indigo-200 dark:to-purple-300 light:from-indigo-650 light:to-indigo-850">
            Interactive Analytics Showcase
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
            Explore live redirection data & visual metric modules
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <GlassCard className="border-indigo-500/10 p-6 bg-slate-950/20 text-center">
            <div className="flex flex-col space-y-4 mb-4">
              <div className="flex justify-center items-center">
                <h4 className="text-[11px] font-bold text-slate-350 dark:text-slate-355 light:text-slate-750 flex items-center space-x-1.5 uppercase font-mono tracking-widest">
                  <Zap size={13} className="text-indigo-400" />
                  <span>Live Matrix Sandbox</span>
                </h4>
              </div>

              {/* View selectors */}
              <div className="flex bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-55 border border-slate-850 dark:border-slate-850 light:border-slate-150 p-0.5 rounded text-[9px] font-mono max-w-xs mx-auto w-full justify-between">
                <button
                  onClick={() => setDemoTab('devices')}
                  className={`px-4 py-1.5 rounded transition-colors flex-1 text-center ${demoTab === 'devices' ? 'bg-purple-600 text-white font-bold' : 'text-slate-450 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'}`}
                >
                  Devices
                </button>
                <button
                  onClick={() => setDemoTab('browsers')}
                  className={`px-4 py-1.5 rounded transition-colors flex-1 text-center ${demoTab === 'browsers' ? 'bg-purple-600 text-white font-bold' : 'text-slate-450 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'}`}
                >
                  Browsers
                </button>
              </div>
            </div>

            {/* Recharts graphic */}
            <div className="h-48 w-full flex items-center justify-center">
              {demoTab === 'devices' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demoDevices}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {demoDevices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {demoTab === 'browsers' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoBrowsers}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]}>
                      {demoBrowsers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend / Metrics summary */}
            <div className="flex justify-center flex-wrap gap-3 text-[9px] font-mono text-slate-405 dark:text-slate-400 light:text-slate-550 mt-3 border-t border-slate-900/60 dark:border-slate-800/60 pt-3">
              {demoTab === 'devices' && demoDevices.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}: {entry.value}%</span>
                </div>
              ))}
              {demoTab === 'browsers' && demoBrowsers.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }}></span>
                  <span>{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Pricing Module section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 border-t border-slate-900/60 dark:border-slate-900/60 light:border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent dark:from-indigo-200 dark:to-purple-300 light:from-indigo-650 light:to-indigo-850">Pricing Matrix</h2>
          <p className="text-xs text-slate-455 dark:text-slate-400 light:text-slate-550 font-mono mt-1 mb-6 uppercase tracking-wider">Select your redirection bandwidth</p>
          
          {/* Monthly/Yearly Toggle switch */}
          <div className="inline-flex items-center space-x-3 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-805 dark:border-slate-800 light:border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${billingPeriod === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Yearly Billing
              <span className="absolute -top-3.5 -right-3 px-1.5 py-0.5 bg-indigo-600 text-white rounded font-mono uppercase tracking-wider font-extrabold scale-95 animate-pulse">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            return (
              <GlassCard
                key={plan.name}
                hoverGlow={plan.popular}
                className={`flex flex-col justify-between p-6 relative ${plan.popular ? 'border-indigo-500/40 dark:border-indigo-500/40 light:border-indigo-600 shadow-lg' : 'border-slate-900 dark:border-slate-900 light:border-slate-200'}`}
              >
                {plan.popular && (
                  <span className="absolute top-4 right-4 bg-indigo-600 text-[8px] font-bold text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-850 mb-1">{plan.name}</h3>
                  <p className="text-slate-450 dark:text-slate-400 light:text-slate-550 text-[11px] min-h-8 mb-4">{plan.description}</p>
                  
                  {/* Price display */}
                  <div className="flex items-baseline mb-6 font-mono">
                    <span className="text-3xl font-extrabold text-white dark:text-white light:text-slate-800">${price}</span>
                    <span className="text-[10px] text-slate-505 ml-1">/ month</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-slate-350 dark:text-slate-300 light:text-slate-655 font-mono">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/signup"
                  className={`w-full py-2.5 rounded-lg text-xs font-bold text-center transition-all block ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/10' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                >
                  {plan.cta}
                </Link>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-6 py-12 mb-10">
        <GlassCard className="border-indigo-500/10 text-center p-8 relative overflow-hidden bg-slate-950/45 border-dashed border border-indigo-500/20">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl"></div>

          <Globe className="mx-auto text-indigo-400/70 mb-4 animate-spin-slow" size={32} />
          <h2 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-850 mb-2">Get Started with LinkFlow</h2>
          <p className="text-slate-455 dark:text-slate-400 light:text-slate-550 text-xs max-w-sm mx-auto mb-6">
            Initialize your free account and start routing and tracking your shortened links.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10"
          >
            <span>Create Your Account</span>
            <ArrowRight size={14} />
          </Link>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-5 border-t border-slate-900/60 dark:border-slate-900/60 light:border-slate-200 text-center text-[10px] text-slate-550 font-mono">
        &copy; {new Date().getFullYear()} LinkFlow AI. Premium Link Infrastructure.
      </footer>
    </div>
  );
};

export default Landing;
