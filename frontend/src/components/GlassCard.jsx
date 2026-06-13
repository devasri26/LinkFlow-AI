import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverGlow = false, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] ${
        hoverGlow ? 'glow-border' : ''
      } ${onClick ? 'cursor-pointer hover:scale-[1.005]' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
