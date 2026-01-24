
import React, { useState, useEffect } from 'react';
import { CloseButton, BrandPlaceholder } from '../services/brandAssets';

interface SecurityGateProps {
  onVerify: (password: string) => Promise<boolean>;
  onClose: () => void;
  status: 'idle' | 'verifying' | 'error';
}

const SecurityGate: React.FC<SecurityGateProps> = ({ onVerify, onClose, status }) => {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setPassword('');
    return () => setPassword('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || status === 'verifying') return;
    await onVerify(password);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-500">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-8 md:p-12 rounded-[40px] w-full max-w-md shadow-[0_0_100px_rgba(212,175,55,0.1)] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        
        <div className="flex justify-between items-start mb-6">
          <BrandPlaceholder label="LXM" size="w-16 h-16" rounded="rounded-2xl" className="rotate-45" />
          <CloseButton onClick={onClose} />
        </div>

        <h3 className="text-[#d4af37] font-luxury font-black text-xl uppercase tracking-tighter mb-2">Seguridad Luxury®</h3>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[4px] mb-8">Autenticación de Acceso Requerida</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="text-[8px] uppercase font-black text-zinc-500 ml-4 mb-1 block group-focus-within:text-[#d4af37] text-left">Password del Operador</label>
            <div className="relative">
              <input 
                autoFocus
                type={showPass ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`w-full bg-[#050505] border ${status === 'error' ? 'border-red-900 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 focus:border-[#d4af37]'} rounded-2xl p-4 text-[#d4af37] font-bold outline-none text-center tracking-[4px] transition-all`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-[#d4af37] transition-colors p-2"
              >
                <BrandPlaceholder label="V" size="w-4 h-4" className="border-zinc-800" />
              </button>
            </div>
            {status === 'error' && (
              <p className="text-[8px] text-red-600 font-black uppercase mt-2 tracking-widest animate-pulse">Credencial Errónea</p>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={status === 'verifying' || !password}
              className="w-full bg-[#d4af37] text-black font-black py-5 rounded-2xl uppercase tracking-[3px] text-[10px] shadow-lg shadow-[#d4af37]/10 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
            >
              {status === 'verifying' && <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>}
              {status === 'verifying' ? 'Verificando...' : 'Desbloquear Protocolo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityGate;
