
import React from 'react';
import { LuxuryConfig } from '../types';
import { useLuxury } from '../context/LuxuryContext';
import { LuxuryLogo } from '../services/brandAssets';

interface GuardianProps {
  config: LuxuryConfig; email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void; confirmPassword?: string;
  setConfirmPassword?: (v: string) => void; firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void; phone: string; setPhone: (v: string) => void;
  authMode: 'login' | 'register' | 'recover'; setAuthMode: (v: any) => void;
  handleAuth: () => void; authStatus: string;
}

const Guardian: React.FC<GuardianProps> = ({ 
  config, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
  firstName, setFirstName, lastName, setLastName, phone, setPhone,
  authMode, setAuthMode, handleAuth, authStatus 
}) => {
  const { loginAsGuest } = useLuxury();
  const accent = config.colorA || '#d4af37';
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] px-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37]/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg p-10 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-[#d4af37]/20 rounded-[48px] text-center z-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-500">
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <LuxuryLogo size="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-black font-luxury uppercase tracking-tight" style={{ color: accent }}>{config.title}</h1>
          <p className="text-[8px] tracking-[6px] text-zinc-600 mt-2 uppercase font-black">Luxury Master® Access Protocol</p>
        </div>

        <div className="space-y-4">
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-[#d4af37] transition-all" placeholder="Nombre" />
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-[#d4af37] transition-all" placeholder="Apellido" />
            </div>
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-[#d4af37] transition-all" placeholder="Email institucional" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-[#d4af37] transition-all" placeholder="Password de seguridad" />
        </div>

        {authStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Error de Autenticación</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={handleAuth} 
            disabled={authStatus === 'verifying'}
            className="w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50" 
            style={{ backgroundColor: accent, color: '#000' }}
          >
            {authStatus === 'verifying' ? 'Verificando Nodo...' : (authMode === 'login' ? 'Acceder al Sistema' : 'Crear Cuenta Elite')}
          </button>
          
          <button 
            onClick={loginAsGuest}
            className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-black uppercase text-[9px] tracking-[4px] hover:text-white hover:border-zinc-600 transition-all"
          >
            Modo Demo / Vista Previa
          </button>
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
          <p 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
            className="text-[9px] text-zinc-600 cursor-pointer uppercase font-black tracking-widest hover:text-[#d4af37] transition-colors"
          >
            {authMode === 'login' ? 'Crear Nuevo Nodo' : 'Volver al Login'}
          </p>
          {authMode === 'login' && (
            <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest cursor-not-allowed">
              ¿Olvidó su clave?
            </p>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[8px] text-zinc-800 font-black uppercase tracking-[8px] pointer-events-none landscape-hide">
        Excellence Verified by Luxury Sentinel AI
      </div>
    </div>
  );
};

export default Guardian;
