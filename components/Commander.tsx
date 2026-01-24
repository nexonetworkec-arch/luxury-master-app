
import React, { useState } from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { LuxuryTheme, PrizeItem } from '../types';
import { generateBrandedBackground } from '../services/geminiService';
import LeadEditorModal from './LeadEditorModal';
import PrizeEditorModal from './PrizeEditorModal';

interface CommanderProps {
  onSave: () => void;
  onClose: () => void;
}

const Commander: React.FC<CommanderProps> = ({ onSave, onClose }) => {
  const { config, updateConfig, isAdmin, isMaster } = useLuxury();
  const [showLeadEditor, setShowLeadEditor] = useState(false);
  const [showPrizeEditor, setShowPrizeEditor] = useState(false);
  const [isGeneratingBG, setIsGeneratingBG] = useState(false);
  const [bgPrompt, setBgPrompt] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'customLogoURL' | 'backgroundImageURL') => {
    if (!config.permissions?.canCustom && !isAdmin && !isMaster) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateConfig({ ...config, [key]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAIBackground = async () => {
    if (!bgPrompt) return;
    setIsGeneratingBG(true);
    const imageUrl = await generateBrandedBackground(bgPrompt);
    if (imageUrl) {
      updateConfig({ ...config, backgroundImageURL: imageUrl });
      alert("FONDO GENERADO EXITOSAMENTE");
    } else {
      alert("Error al generar fondo. Verifique su Cloud Key.");
    }
    setIsGeneratingBG(false);
  };

  const removeBranding = (key: 'customLogoURL' | 'backgroundImageURL') => {
    updateConfig({ ...config, [key]: "" });
  };

  const handleUpdatePrizes = (newPrizes: string[], newAdvanced?: PrizeItem[]) => {
    if (!isAdmin && !isMaster && config.level === 'free' && newPrizes.length > 8) {
      alert("NIVEL FREE: Límite de 8 premios alcanzado.");
      return;
    }
    updateConfig({ ...config, prizes: newPrizes, advancedPrizes: newAdvanced || config.advancedPrizes });
  };

  const THEMES: { id: LuxuryTheme; label: string; color: string }[] = [
    { id: 'gold', label: 'Luxury Gold', color: '#d4af37' },
    { id: 'neon', label: 'Cyber Neon', color: '#00ffcc' },
    { id: 'blue', label: 'Tech Blue', color: '#00aaff' },
    { id: 'minimal', label: 'Pure White', color: '#ffffff' }
  ];

  const canCustom = config.permissions?.canCustom || isAdmin || isMaster;
  const canAutoRemoveUI = config.level === 'ppe' || isAdmin || isMaster;
  const canLeadEditorUI = config.level !== 'free' || isAdmin || isMaster;

  const toggleAutoRemove = () => {
    if (!canAutoRemoveUI) return;
    const currentStatus = !!config.permissions?.canAutoRemove;
    const basePermissions = config.permissions || { 
      canExport: isMaster, 
      canCustom: isMaster, 
      canAutoRemove: false, 
      showAds: !isMaster 
    };

    updateConfig({
      ...config,
      permissions: {
        ...basePermissions,
        canAutoRemove: !currentStatus
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-[#d4af37] font-luxury font-black text-2xl uppercase tracking-tighter">Panel Luxury Master®</h3>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[4px] mt-1">Configuración Inteligente de Sistema</p>
          </div>
          <button onClick={onClose} className="group transition-all active:scale-90">
            <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
              <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="bg-zinc-900/10 p-5 rounded-3xl border border-zinc-800/30">
                <label className="text-[9px] text-zinc-500 font-black uppercase mb-4 block tracking-widest">Temas Visuales</label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => updateConfig({ ...config, theme: t.id, colorA: t.color })} className={`p-3 rounded-2xl border text-[10px] font-black uppercase flex items-center gap-3 transition-all ${config.theme === t.id ? 'border-white bg-white text-black' : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-600'}`}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* CONTROLES DE TIPOGRAFÍA Y CONTENIDO */}
              <section className="bg-zinc-900/10 p-5 rounded-3xl border border-zinc-800/30 space-y-4">
                <label className="text-[9px] text-zinc-500 font-black uppercase block tracking-widest">Contenido y Tipografía</label>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] text-zinc-600 font-black uppercase ml-2 tracking-widest">Título Corporativo (LXM)</span>
                    <input 
                      type="text" 
                      value={config.title} 
                      onChange={e => updateConfig({ ...config, title: e.target.value.toUpperCase() })} 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] text-zinc-600 font-black uppercase ml-2 tracking-widest">Subtítulo Estratégico</span>
                      <textarea 
                        value={config.subtitle || ''} 
                        onChange={e => updateConfig({ ...config, subtitle: e.target.value.toUpperCase() })} 
                        className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-[10px] text-zinc-400 outline-none focus:border-[#d4af37] h-20 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col gap-1">
                          <span className="text-[7px] text-zinc-600 font-black uppercase ml-1 tracking-widest">Fuente Título (px)</span>
                          <input 
                            type="number" 
                            min="10" 
                            max="150"
                            value={config.titleFontSize || 56} 
                            onChange={e => updateConfig({ ...config, titleFontSize: parseInt(e.target.value) })} 
                            className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-[10px] text-[#d4af37] font-mono outline-none text-center"
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[7px] text-zinc-600 font-black uppercase ml-1 tracking-widest">Fuente Sub (px)</span>
                          <input 
                            type="number" 
                            min="8" 
                            max="60"
                            value={config.subtitleFontSize || 14} 
                            onChange={e => updateConfig({ ...config, subtitleFontSize: parseInt(e.target.value) })} 
                            className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-[10px] text-[#d4af37] font-mono outline-none text-center"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={`bg-zinc-900/10 p-5 rounded-3xl border border-zinc-800/30 space-y-4 ${!canCustom ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <label className="text-[9px] text-zinc-500 font-black uppercase block tracking-widest">Identidad Visual {isMaster && "(MASTER UNLOCKED)"}</label>
                
                <div className="flex gap-2">
                  <label className="flex-1 bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] text-zinc-400 font-black uppercase text-center cursor-pointer hover:border-white truncate">
                    {config.customLogoURL ? 'Cambiar Logo' : 'Subir Logo PNG'}
                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'customLogoURL')} accept="image/*" />
                  </label>
                  {config.customLogoURL && <button onClick={() => removeBranding('customLogoURL')} className="bg-red-950/20 border border-red-900/30 text-red-500 px-4 rounded-2xl">🗑️</button>}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <label className="flex-1 bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] text-zinc-400 font-black uppercase text-center cursor-pointer hover:border-white truncate">
                      {config.backgroundImageURL ? 'Cambiar Fondo' : 'Subir Fondo'}
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'backgroundImageURL')} accept="image/*" />
                    </label>
                    {config.backgroundImageURL && <button onClick={() => removeBranding('backgroundImageURL')} className="bg-red-950/20 border border-red-900/30 text-red-500 px-4 rounded-2xl">🗑️</button>}
                  </div>
                  
                  <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50 space-y-2">
                    <input 
                      type="text" 
                      placeholder="Prompt para Fondo IA (Ej: Lujo Oro...)" 
                      value={bgPrompt}
                      onChange={e => setBgPrompt(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[9px] text-white outline-none"
                    />
                    <button 
                      onClick={handleGenerateAIBackground}
                      disabled={isGeneratingBG || !bgPrompt}
                      className="w-full bg-[#d4af37] text-black font-black py-3 rounded-xl uppercase text-[8px] tracking-widest disabled:opacity-20"
                    >
                      {isGeneratingBG ? 'Generando...' : 'Generar Fondo Luxury IA'}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-zinc-900/10 p-5 rounded-3xl border border-zinc-800/30 space-y-4">
                <label className="text-[9px] text-zinc-500 font-black uppercase block tracking-widest">Reglas de Sorteo</label>
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase text-zinc-400">Captación de Leads</span>
                  <button onClick={() => updateConfig({ ...config, requireRegistration: !config.requireRegistration })} className={`w-12 h-6 rounded-full transition-all ${config.requireRegistration ? 'bg-green-500' : 'bg-zinc-800'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${config.requireRegistration ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
                <div className={`flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-zinc-800/50 ${!canAutoRemoveUI ? 'opacity-30' : ''}`}>
                  <span className="text-[10px] font-black uppercase text-zinc-400">Auto-Eliminar {isMaster && "⭐"}</span>
                  <button 
                    disabled={!canAutoRemoveUI} 
                    onClick={toggleAutoRemove} 
                    className={`w-12 h-6 rounded-full transition-all ${config.permissions?.canAutoRemove ? 'bg-[#d4af37]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${config.permissions?.canAutoRemove ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </section>

              <button onClick={() => setShowPrizeEditor(true)} className="w-full bg-zinc-900 border border-[#d4af37]/20 p-5 rounded-2xl text-[10px] font-black uppercase text-[#d4af37]">Editar Inventario</button>
              <button disabled={!canLeadEditorUI} onClick={() => setShowLeadEditor(true)} className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-zinc-800 transition-all disabled:opacity-30">Editar Leads Luxury</button>
            </div>
          </div>
        </div>
        <button onClick={onSave} className="w-full py-6 mt-8 rounded-3xl font-black uppercase tracking-[4px] text-sm bg-white text-black">Cerrar y Guardar</button>
      </div>

      {showLeadEditor && <LeadEditorModal fields={config.leadFields || []} onUpdate={f => updateConfig({ ...config, leadFields: f })} onClose={() => setShowLeadEditor(false)} />}
      {showPrizeEditor && <PrizeEditorModal isAdmin={isAdmin || isMaster} prizes={config.prizes} config={config} onUpdate={handleUpdatePrizes} onClose={() => setShowPrizeEditor(false)} />}
    </div>
  );
};

export default Commander;
