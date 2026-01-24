
import React, { useState } from 'react';
import { ref, get, set } from '@firebase/database';
import { db, auth } from '../services/firebase';
import { LuxuryConfig } from '../types';
import { CloseButton } from '../services/brandAssets';

interface LicenseActivationModalProps { config: LuxuryConfig; onSuccess: (c: LuxuryConfig) => void; onClose: () => void; }

const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({ config, onSuccess, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    const key = input.trim().toUpperCase();
    if (!key) return;
    setLoading(true);
    try {
      const snap = await get(ref(db, `licenses/${key}`));
      if (snap.exists() && snap.val().isActive) {
        const lData = snap.val();
        const newLevel = lData.level as 'pro' | 'ppe';
        const newConfig = { ...config, level: newLevel, licenseKey: key, activationDate: new Date().toISOString() };
        await set(ref(db, `users/${auth.currentUser?.uid}/config`), newConfig);
        await set(ref(db, `licenses/${key}/usedBy`), auth.currentUser?.uid);
        onSuccess(newConfig);
        alert("PROTOCOLO LUXURY ACTIVADO");
        onClose();
      } else { alert("CÓDIGO INVÁLIDO"); }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-12 rounded-[40px] w-full max-w-md text-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <CloseButton onClick={onClose} size="w-8 h-8" />
        </div>
        <h3 className="text-[#d4af37] font-luxury font-black text-xl uppercase mb-8">Activación Luxury Master</h3>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="LXM-PRO-XXXX" className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-center font-mono text-[#d4af37] outline-none mb-6 uppercase" />
        <button onClick={handleActivate} disabled={loading} className="w-full bg-[#d4af37] text-black py-5 rounded-2xl font-black uppercase text-xs">
          {loading ? 'Sincronizando...' : 'Desbloquear Protocolo'}
        </button>
      </div>
    </div>
  );
};

export default LicenseActivationModal;
