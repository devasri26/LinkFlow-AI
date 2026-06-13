import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomToast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 backdrop-blur-md border px-4 py-3 rounded-xl shadow-lg max-w-xs ${
        type === 'success'
          ? 'bg-emerald-950/45 dark:bg-emerald-950/45 light:bg-emerald-50 border-emerald-500/20 text-emerald-350 dark:text-emerald-350 light:text-emerald-600'
          : 'bg-red-950/45 dark:bg-red-950/45 light:bg-red-55 border-red-500/20 text-red-350 dark:text-red-350 light:text-red-650'
      }`}
    >
      {type === 'success' ? <CheckCircle size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
      <span className="text-xs font-semibold flex-1 font-sans">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors p-0.5">
        <X size={12} />
      </button>
    </motion.div>
  );
};

export default CustomToast;
