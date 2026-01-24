
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useLuxury } from '../context/LuxuryContext';

interface WheelProps {
  onFinished: (winner: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (state: boolean) => void;
  onSpinRequest?: () => void;
}

export interface WheelHandle { executeSpin: () => void; }

const Wheel = forwardRef<WheelHandle, WheelProps>(({ onFinished, isSpinning, setIsSpinning, onSpinRequest }, ref) => {
  const { config } = useLuxury();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);

  const currentPrizes = useMemo(() => config.advancedPrizes?.map(p => p.name) || config.prizes || [], [config]);

  useImperativeHandle(ref, () => ({ executeSpin: () => { if (!isSpinning) spin(); } }));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1000;
    canvas.width = canvas.height = size;
    const cx = size / 2;
    const r = size / 2 - 20;
    const n = currentPrizes.length;
    if (n < 2) return;

    ctx.clearRect(0, 0, size, size);
    const slice = (Math.PI * 2) / n;

    currentPrizes.forEach((text, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0 ? (config.colorA || '#d4af37') : (config.colorB || '#050505');
      ctx.moveTo(cx, cx);
      ctx.arc(cx, cx, r, angle + i * slice, angle + (i + 1) * slice);
      ctx.fill();
      ctx.translate(cx, cx);
      ctx.rotate(angle + i * slice + slice / 2);
      ctx.font = "bold 32px 'Inter'";
      ctx.textAlign = "right";
      ctx.fillStyle = i % 2 === 0 ? "#000" : "#fff";
      ctx.fillText(text.toString().toUpperCase().substring(0, 15), r - 80, 10);
      ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cx, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = config.colorA || '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => { draw(); }, [angle, config]);

  const spin = () => {
    if (currentPrizes.length < 2) return;
    
    // Algoritmo de Probabilidad Pesada (Weighted Random Selection)
    let winnerIndex = 0;
    if (config.advancedPrizes && config.advancedPrizes.length > 0) {
      const totalWeight = config.advancedPrizes.reduce((acc, p) => acc + (p.stock > 0 ? p.weight : 0), 0);
      if (totalWeight <= 0) {
        alert("SISTEMA: No hay stock disponible de ningún premio.");
        return;
      }
      let random = Math.random() * totalWeight;
      for (let i = 0; i < config.advancedPrizes.length; i++) {
        const p = config.advancedPrizes[i];
        if (p.stock <= 0) continue;
        if (random < p.weight) {
          winnerIndex = i;
          break;
        }
        random -= p.weight;
      }
    } else {
      winnerIndex = Math.floor(Math.random() * currentPrizes.length);
    }

    setIsSpinning(true);
    const finalAngle = ((Math.PI * 1.5) - (winnerIndex * (Math.PI * 2 / currentPrizes.length)) - (Math.PI / currentPrizes.length)) + (Math.PI * 2 * 10);
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / 6000, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setAngle(finalAngle * ease);
      if (p < 1) requestAnimationFrame(animate);
      else { setIsSpinning(false); onFinished(currentPrizes[winnerIndex], winnerIndex); }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20 landscape-hide">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-[#d4af37]"></div>
      </div>
      <canvas ref={canvasRef} className="max-w-full max-h-full rounded-full shadow-[0_0_80px_rgba(0,0,0,0.7)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <button 
          onClick={() => !isSpinning && (onSpinRequest ? onSpinRequest() : spin())} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a6d1d] border-[6px] border-[#0a0a0a] flex flex-col items-center justify-center hover:scale-105 transition-all overflow-hidden shadow-2xl"
        >
          {config.customLogoURL ? (
            <img src={config.customLogoURL} alt="Center Logo" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-black font-black text-[10px] tracking-widest leading-none uppercase">LUXURY</span>
              <span className="text-black/60 font-black text-[8px] uppercase tracking-[2px]">Master</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default Wheel;
