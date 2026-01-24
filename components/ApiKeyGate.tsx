
import React, { useState, useEffect } from 'react';

interface ApiKeyGateProps {
  onSuccess: () => void;
}

const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ onSuccess }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenSelect = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Según la regla de race condition, asumimos éxito y procedemos
    onSuccess();
  };

  if (hasKey === true) {
    return null; // Ya tiene llave, no mostramos nada
  }

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-10 rounded-[48px] max-w-md w-full text-center shadow-[0_0_100px_rgba(212,175,55,0.15)]">
        <div className="w-20 h-20 luxury-icon-placeholder rounded-full mx-auto mb-8 shadow-lg">
          <span className="text-xl font-black text-[#d4af37]/40 tracking-[4px]">LXM</span>
        </div>
        
        <h2 className="text-[#d4af37] font-luxury font-black text-2xl uppercase tracking-tighter mb-4">Cloud Intelligence Link</h2>
        <p className="text-zinc-400 text-xs mb-8 leading-relaxed">
          Para habilitar funciones de generación de medios 4K y Video IA en este entorno multiusuario, es necesario vincular una clave de API de un proyecto con facturación activa.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleOpenSelect}
            className="w-full bg-[#d4af37] text-black font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all"
          >
            Vincular Google Cloud Key
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-[8px] text-zinc-600 font-black uppercase tracking-[2px] hover:text-[#d4af37] transition-colors"
          >
            Guía de Configuración de Facturación
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyGate;
