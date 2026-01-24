
import React, { useState } from 'react';
import { suggestPrizes } from '../services/geminiService';
import { PrizeItem, LuxuryConfig } from '../types';

interface PrizeEditorModalProps {
  prizes: string[];
  config: LuxuryConfig;
  onUpdate: (prizes: string[], advanced?: PrizeItem[]) => void;
  onClose: () => void;
  isAdmin?: boolean;
}

const PrizeEditorModal: React.FC<PrizeEditorModalProps> = ({ prizes, config, onUpdate, onClose, isAdmin }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [theme, setTheme] = useState('');

  const addPrize = () => {
    if (!isAdmin && config.level === 'free' && prizes.length >= 8) {
      alert("NIVEL FREE: Límite de 8 premios alcanzado. Mejora tu plan para más.");
      return;
    }
    onUpdate([...prizes, `NUEVO PREMIO ${prizes.length + 1}`]);
  };

  const handleAISuggest = async () => {
    if (!config.permissions?.hasAI && !isAdmin) {
       alert("ESTA FUNCIÓN REQUIRE NIVEL PRO O PPE.");
       return;
    }
    setIsSuggesting(true);
    try {
      const suggested = await suggestPrizes(config.title, theme);
      if (suggested && suggested.length > 0) {
        const finalSuggested = (!isAdmin && config.level === 'free') ? suggested.slice(0, 8) : suggested;
        
        const newAdvanced: PrizeItem[] = finalSuggested.map((name, i) => ({
          id: `ai_${Date.now()}_${i}`,
          name: name.toUpperCase(),
          stock: 10,
          weight: 100
        }));
        onUpdate(finalSuggested, newAdvanced);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const updatePrize = (index: number, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = value.toUpperCase();
    onUpdate(newPrizes);
  };

  const removePrize = (index: number) => {
    if (prizes.length <= 2) {
      alert("SISTEMA: Se requieren al menos 2 premios.");
      return;
    }
    onUpdate(prizes.filter((_, i) => i !== index));
  };

  const restoreDefaults = () => {
    const defaultNames = ["PREMIO 1", "PREMIO 2", "PREMIO 3", "PREMIO 4"];
    const defaultAdvanced: PrizeItem[] = defaultNames.map((name, i) => ({
      id: `${i + 1}`,
      name: name,
      stock: 10,
      weight: 100
    }));
    onUpdate(defaultNames, defaultAdvanced);
  };

  const canUseAI = config.permissions?.hasAI || isAdmin;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-6 md:p-10 rounded-[32px] md:rounded-[48px] w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[#d4af37] font-luxury font-black text-xl md:text-2xl uppercase tracking-tighter">Inventario de Premios</h3>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[2px]">Gestión de Activos</p>
               {(config.level === 'free' && !isAdmin) && <span className="text-[7px] text-[#d4af37] font-black border border-[#d4af37]/20 px-1 rounded">LÍMITE: {prizes.length}/8</span>}
            </div>
          </div>
          <button onClick={onClose} className="group transition-all active:scale-90">
            <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
              <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {prizes.map((prize, idx) => (
            <div key={idx} className="flex gap-3 items-center bg-zinc-900/20 border border-zinc-800 p-2 rounded-2xl group transition-all focus-within:border-[#d4af37]/40">
              <span className="w-8 h-8 flex items-center justify-center bg-black rounded-full text-[10px] font-black text-[#d4af37] border border-zinc-800">
                {idx + 1}
              </span>
              <input 
                value={prize}
                onChange={e => updatePrize(idx, e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs text-white font-bold uppercase tracking-wider p-2"
                placeholder="Nombre del premio..."
              />
              <button 
                onClick={() => removePrize(idx)}
                className="text-zinc-700 hover:text-red-500 transition-colors p-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <div className={`space-y-2 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 ${!canUseAI ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
            <input 
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-[10px] text-zinc-300 outline-none focus:border-[#d4af37]/50 transition-all"
              placeholder="Temática para IA (Lujo, Cyberpunk...)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={restoreDefaults}
              className="bg-zinc-900/50 border border-zinc-800 text-zinc-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:text-[#d4af37]"
            >
              Restaurar Base
            </button>
            <button 
              onClick={addPrize}
              className="bg-zinc-900/80 border border-zinc-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px]"
            >
              + Añadir Manual
            </button>
          </div>
          
          <button 
            onClick={handleAISuggest}
            disabled={isSuggesting}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[2px] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 ${!canUseAI ? 'bg-zinc-900 text-zinc-700' : 'bg-gradient-to-r from-[#d4af37] to-[#8a6d1d] text-black shadow-lg'}`}
          >
            {isSuggesting ? 'Sincronizando...' : canUseAI ? 'Generar Premios con IA' : 'IA Bloqueada (Requiere Pro)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizeEditorModal;
