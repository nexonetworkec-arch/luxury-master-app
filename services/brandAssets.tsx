
import React from 'react';

/**
 * LUXURY MASTER® AI - Asset Factory
 * Este módulo centraliza la identidad visual de la marca.
 */

interface PlaceholderProps {
  label: string;
  size?: string;
  rounded?: string;
  className?: string;
  variant?: 'default' | 'gold' | 'muted';
}

export const BrandPlaceholder: React.FC<PlaceholderProps> = ({ 
  label, 
  size = "w-10 h-10", 
  rounded = "rounded-full", 
  className = "",
  variant = 'default'
}) => {
  const variants = {
    default: "border-zinc-800 bg-[#d4af37]/5",
    gold: "border-[#d4af37]/40 bg-[#d4af37]/10",
    muted: "border-zinc-900 bg-black/20"
  };

  return (
    <div className={`${size} ${rounded} luxury-icon-placeholder ${variants[variant]} ${className}`}>
      <span className="text-[35%] font-black text-[#d4af37]/40 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const CloseButton: React.FC<{ onClick: () => void; size?: string; className?: string }> = ({ 
  onClick, 
  size = "w-10 h-10",
  className = ""
}) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }} 
    className={`group transition-all active:scale-90 shrink-0 ${className}`}
    aria-label="Cerrar"
  >
    <div className={`${size} luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50 bg-black/40 backdrop-blur-sm transition-colors`}>
      <span className="text-[35%] text-[#d4af37]/40 group-hover:text-[#d4af37] font-black">X</span>
    </div>
  </button>
);

export const LuxuryLogo: React.FC<{ size?: string }> = ({ size = "w-12 h-12" }) => (
  <div className={`${size} luxury-icon-placeholder rounded-xl border-[#d4af37]/30 rotate-12 shadow-lg shadow-[#d4af37]/10`}>
    <span className="text-[30%] font-black text-[#d4af37] tracking-[2px]">LXM</span>
  </div>
);
