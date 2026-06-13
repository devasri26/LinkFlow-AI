import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Trash2, QrCode, Calendar, ExternalLink } from 'lucide-react';
import GlassCard from './GlassCard';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const UrlCard = ({ url, onDelete, onCopySuccess }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Avoid encoding localhost URLs inside QR codes to ensure public scan compatibility
  const getShortLink = () => {
    let link = url.shortUrl || '';
    if (!link || link.includes('localhost') || link.includes('127.0.0.1')) {
      const hostname = window.location.hostname;
      if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        link = `${window.location.origin}/${url.shortCode}`;
      } else {
        // Fallback production URL when testing locally to avoid encoding localhost
        link = `https://linkflow.vercel.app/${url.shortCode}`;
      }
    }
    return link;
  };

  const shortLink = getShortLink();
  // Display link matching window location for local debugging copy action, or standard redirect link
  const displayLink = url.shortUrl || `${window.location.origin}/${url.shortCode}`;

  const animatedClicks = useAnimatedCounter(url.clicks || 0);

  useEffect(() => {
    QRCode.toDataURL(
      shortLink,
      {
        width: 512,
        margin: 4,
        color: {
          dark: '#000000', // Solid black for scan contrast
          light: '#ffffff', // Pure white background
        },
      }
    )
      .then((dataUrl) => setQrUrl(dataUrl))
      .catch((err) => console.error(err));
  }, [shortLink]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayLink);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 1800);
  };

  const isExpired = url.expiryDate ? new Date() > new Date(url.expiryDate) : false;

  return (
    <>
      <GlassCard hoverGlow className="flex flex-col justify-between h-full group border-indigo-500/10 hover:border-indigo-500/30">
        <div>
          {/* Badge & Active State Indicators */}
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {url.customAlias ? 'Custom Alias' : 'Standard'}
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isExpired ? 'bg-red-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-1 group-hover:text-indigo-400 transition-colors truncate">
            {url.title || 'Untitled Link'}
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="relative">
              <label className="text-[9px] text-indigo-400/80 uppercase font-bold tracking-widest block mb-0.5">Short Link</label>
              
              {/* Floating Copy Confirmation Badge */}
              {copied && (
                <span className="absolute -top-3.5 right-0 text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded animate-float shadow">
                  +1 Copied!
                </span>
              )}
              
              <div className="flex items-center space-x-2 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-2 font-mono text-sm">
                <a
                  href={displayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate flex-1 hover:underline text-indigo-300 dark:text-indigo-300 light:text-indigo-650 font-semibold"
                  title="Open shortened link"
                >
                  {displayLink}
                </a>
                <button
                  onClick={handleCopy}
                  className="hover:text-indigo-400 text-slate-400 active:scale-90 transition-all p-1 transform"
                  title="Copy link"
                >
                  <Copy size={14} className={copied ? 'text-indigo-400 scale-110' : 'transition-transform duration-150'} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-slate-400/80 uppercase font-bold tracking-widest block mb-0.5">Destination</label>
              <a
                href={url.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-xs font-mono truncate"
              >
                <span className="truncate">{url.originalUrl}</span>
                <ExternalLink size={10} className="flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Clicks and metadata panel */}
        <div>
          <div className="flex items-center justify-between border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pt-3 mb-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Total Clicks</span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-mono">
                {animatedClicks}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Created</span>
              <span className="text-xs font-mono text-slate-400 mt-0.5">
                {new Date(url.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {url.expiryDate && (
            <div className="flex items-center space-x-1 text-xs mb-3 text-amber-500/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              <Calendar size={12} />
              <span className="font-mono text-[10px]">Expires: {new Date(url.expiryDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Grid control items: Rebalanced into a clean two-column grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-center space-x-1 bg-purple-500/10 hover:bg-purple-500/25 active:scale-[0.96] border border-purple-500/20 text-purple-300 py-1.5 rounded-lg text-xs font-semibold transition-all transform"
            >
              <QrCode size={14} />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => onDelete(url.id || url._id)}
              className="flex items-center justify-center space-x-1 bg-red-500/10 hover:bg-red-500/25 active:scale-[0.96] border border-red-500/20 text-red-400 py-1.5 rounded-lg text-xs font-semibold transition-all transform"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* QR Code download modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 text-center border-indigo-500/20 relative">
            <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-1">Futuristic QR Matrix</h3>
            <p className="text-slate-400 text-[10px] mb-5 font-mono">Scan code or save to share</p>
            
            <div className="bg-white p-3 rounded-xl inline-block mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Link Code" className="w-40 h-40 mx-auto" />
              ) : (
                <div className="w-40 h-40 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-slate-500">
                  Generating...
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <a
                href={qrUrl}
                download={`qr-${url.shortCode}.png`}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs text-center transition-all shadow-md shadow-indigo-500/10"
              >
                Download PNG
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UrlCard;
