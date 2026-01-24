
import React, { useEffect, useState } from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { db, auth } from '../services/firebase';
import { ref, push } from '@firebase/database';
import { CloseButton, BrandPlaceholder } from '../services/brandAssets';

interface SupportRequestModalProps {
  onClose: () => void;
}

const SupportRequestModal: React.FC<SupportRequestModalProps> = ({ onClose }) => {
  const { config, updateConfig } = useLuxury();
  const [accessCode, setAccessCode] = useState(config.supportAccessCode || '');

  useEffect(() => {
    if (!accessCode) {
      const newCode = `LXM-SUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setAccessCode(newCode);
      updateConfig({ ...config, supportAccessCode: newCode });
      
      if (auth.currentUser) {
        push(ref(db, `users/${auth.currentUser.uid}/audit_logs`), {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          event: "SISTEMA: El usuario ha solicitado asistencia técnica remota Luxury Master®.",
          type: 'warning',
          user: auth.currentUser.email
        });
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-500">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-8 md:p-12 rounded-[40px] w-full max-w-md shadow-[0_0_100px_rgba(212,175,55,0.15)] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        
        <div className="flex justify-between items-start mb-6">
          <BrandPlaceholder label="LXM" size="w-16 h-16" />
          <CloseButton onClick={onClose} />
        </div>

        <h3 className="text-[#d4af37] font-luxury font-black text-xl uppercase tracking-tighter mb-2">Asistencia Luxury®</h3>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[4px] mb-8 leading-relaxed">
          Un administrador maestro puede intervenir en su entorno de trabajo usando este código.
        </p>

        <div className="space-y-6">
          <div className="bg-black border border-dashed border-[#d4af37]/30 p-6 rounded-2xl group transition-all">
            <span className="text-[7px] text-zinc-600 font-black uppercase mb-2 block tracking-widest">Código de Autorización Maestro</span>
            <div className="text-xl md:text-2xl font-mono font-bold text-white tracking-[4px] select-all">
              {accessCode}
            </div>
          </div>
          
          <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <p className="text-[8px] text-zinc-500 font-bold uppercase leading-relaxed text-center">
              Al proporcionar este código, usted autoriza el acceso remoto para tareas de configuración de Luxury Master®.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportRequestModal;
