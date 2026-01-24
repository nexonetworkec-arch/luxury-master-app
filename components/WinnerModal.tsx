
import React, { useEffect, useState } from 'react';
import { CloseButton, BrandPlaceholder } from '../services/brandAssets';
import { generateVictoryVideo } from '../services/geminiService';

interface WinnerModalProps {
  winner: string | null;
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    if (winner) {
      const loadVideo = async () => {
        setIsLoadingVideo(true);
        const url = await generateVictoryVideo(winner);
        setVideoUrl(url);
        setIsLoadingVideo(false);
      };
      loadVideo();
    }
  }, [winner]);

  if (!winner) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border-t-[6px] md:border-t-[10px] border-[#d4af37] p-6 md:p-12 rounded-[32px] md:rounded-[64px] text-center max-w-2xl w-full max-h-[95vh] flex flex-col items-center shadow-[0_0_150px_rgba(212,175,55,0.15)] animate-in slide-in-from-bottom-10 duration-500 border border-[#d4af37]/10 relative overflow-hidden">
        
        <div className="absolute top-6 right-6 z-50">
          <CloseButton onClick={onClose} />
        </div>

        {videoUrl ? (
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-[#d4af37]/30 mb-8 shadow-2xl">
             <video src={videoUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
          </div>
        ) : isLoadingVideo ? (
          <div className="w-full aspect-video rounded-3xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center mb-8 gap-4">
             <div className="w-10 h-10 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
             <p className="text-[8px] text-[#d4af37] font-black uppercase tracking-[4px] animate-pulse">Generando Celebración Veo AI 4K...</p>
          </div>
        ) : (
          <div className="mb-6 md:mb-10">
             <BrandPlaceholder label="LXM" size="w-20 h-20 md:w-28 md:h-28" />
          </div>
        )}
        
        <h3 className="text-[#d4af37] text-[9px] md:text-[11px] font-black tracking-[6px] md:tracking-[10px] uppercase mb-4 opacity-80">¡FELICIDADES OPERADOR!</h3>
        
        <div className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 font-luxury tracking-tighter border-y border-zinc-900/50 py-8 leading-tight w-full break-words">
          {winner}
        </div>
        
        <button 
          onClick={onClose} 
          className="w-full bg-gradient-to-br from-[#d4af37] to-[#b8952b] text-black font-black px-8 py-5 md:py-6 rounded-[20px] md:rounded-[32px] uppercase text-[10px] md:text-[11px] tracking-[4px] md:tracking-[6px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
