
import React, { useState, useEffect } from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { BrandPlaceholder } from '../services/brandAssets';

interface FloatingMenuProps {
  onOpenCommander: () => void;
  onOpenAdmin: () => void;
  onOpenLeads: () => void;
  onOpenLicense: () => void;
  onOpenSupportRequest: () => void;
  onLogout: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
  isUnlocked: boolean;
  onRequestUnlock: () => void;
  onMenuClose: () => void; 
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ 
  onOpenCommander, onOpenAdmin, onOpenLeads, onOpenLicense, onOpenSupportRequest,
  onLogout, canInstall, onInstall, isUnlocked, onRequestUnlock, onMenuClose
}) => {
  const { config, isAdmin, isMaster } = useLuxury();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      if (isUnlocked) setIsOpen(true);
      else onRequestUnlock();
    } else {
      setIsOpen(false);
      onMenuClose();
    }
  };

  useEffect(() => {
    if (isUnlocked) setIsOpen(true);
    else setIsOpen(false);
  }, [isUnlocked]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    onMenuClose();
  };

  const level = config.level;
  const hasWorkspaceAccess = level !== 'free' || isAdmin || isMaster;
  const hasLeadsAccess = level === 'pro' || level === 'ppe' || isAdmin || isMaster;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-300">
          
          {canInstall && onInstall && (
            <button 
              onClick={() => handleAction(onInstall)} 
              className="bg-gradient-to-r from-white to-zinc-200 px-6 py-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest w-52 text-left flex items-center gap-3 shadow-2xl animate-bounce"
            >
              <BrandPlaceholder label="APP" size="w-5 h-5" rounded="rounded-md" /> Instalar Nodo LXM
            </button>
          )}

          <button 
            onClick={() => handleAction(onOpenCommander)} 
            className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37] transition-all w-52 text-left flex items-center gap-3 shadow-2xl"
          >
            <BrandPlaceholder label="CFG" size="w-5 h-5" rounded="rounded-md" /> Configuración
          </button>
          
          {(level !== 'ppe' && !isMaster) && (
            <button 
              onClick={() => handleAction(onOpenLicense)} 
              className="bg-white px-6 py-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest w-52 text-left shadow-lg flex items-center gap-3 hover:bg-[#d4af37] transition-colors group"
            >
              <BrandPlaceholder label="ACT" size="w-5 h-5" rounded="rounded-md" /> 
              <div className="flex flex-col">
                <span>Activar Protocolo</span>
                <span className="text-[7px] opacity-50">Suscripción Luxury®</span>
              </div>
            </button>
          )}

          {hasWorkspaceAccess && (
            <button 
              onClick={() => handleAction(onOpenAdmin)} 
              className="bg-[#d4af37] px-6 py-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest w-52 text-left shadow-lg shadow-[#d4af37]/20 flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <BrandPlaceholder label="WKS" size="w-5 h-5" rounded="rounded-md" variant="muted" /> My Workspace {isMaster ? 'MASTER' : level.toUpperCase()}
            </button>
          )}

          {hasLeadsAccess && (
            <button 
              onClick={() => handleAction(onOpenLeads)} 
              className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37] transition-all w-52 text-left flex items-center gap-3 shadow-2xl"
            >
              <BrandPlaceholder label="CRM" size="w-5 h-5" rounded="rounded-md" /> Luxury Leads
            </button>
          )}

          {!isMaster && (
             <button 
              onClick={() => handleAction(onOpenSupportRequest)} 
              className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:border-[#d4af37] transition-all w-52 text-left flex items-center gap-3 shadow-2xl"
            >
              <BrandPlaceholder label="SUP" size="w-5 h-5" rounded="rounded-md" /> Solicitar Soporte
            </button>
          )}

          <button 
            onClick={() => handleAction(onLogout)} 
            className="bg-red-950/20 border border-red-900/40 px-6 py-4 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest w-52 text-left flex items-center gap-3"
          >
            <BrandPlaceholder label="EXT" size="w-5 h-5" rounded="rounded-md" /> Salir del Sistema
          </button>
        </div>
      )}
      
      <button 
        onClick={handleToggle} 
        className={`w-16 h-16 bg-black border-2 ${isMaster ? 'border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.4)]' : (isUnlocked ? 'border-[#d4af37]' : 'border-zinc-800')} rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-95 group relative overflow-hidden`}
      >
        {isMaster && (
           <div className="absolute inset-0 bg-[#d4af37]/10 animate-pulse"></div>
        )}
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className={`w-8 h-1 ${isOpen ? 'bg-[#d4af37] rotate-45 translate-y-2.5' : (isMaster ? 'bg-[#d4af37]' : 'bg-zinc-700')} transition-all duration-300`}></div>
          <div className={`w-8 h-1 ${isOpen ? 'opacity-0' : (isMaster ? 'bg-[#d4af37]' : 'bg-zinc-700')} transition-all duration-300`}></div>
          <div className={`w-8 h-1 ${isOpen ? 'bg-[#d4af37] -rotate-45 -translate-y-2.5' : (isMaster ? 'bg-[#d4af37]' : 'bg-zinc-700')} transition-all duration-300`}></div>
        </div>
      </button>
    </div>
  );
};

export default FloatingMenu;
