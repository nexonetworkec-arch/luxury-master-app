
import React from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { useFilteredData } from '../hooks/useFilteredData';
import { AuditLog } from '../types';

interface SentinelProps {
  isVisible: boolean;
  onClose: () => void;
}

const Sentinel: React.FC<SentinelProps> = ({ isVisible, onClose }) => {
  const { logs } = useLuxury();

  const { 
    filteredData, 
    searchTerm, setSearchTerm, 
    startDate, setStartDate, 
    endDate, setEndDate, 
    exportCSV 
  } = useFilteredData<AuditLog>({
    data: logs,
    searchKeys: ['event', 'user', 'type'],
    dateKey: 'timestamp'
  });

  const handleExport = () => {
    const headers = ["Evento", "Tipo", "Operador", "Fecha/Hora"];
    exportCSV('auditoria_luxury', headers, (l) => [
      l.event, 
      l.type, 
      l.user || 'SISTEMA', 
      new Date(l.timestamp).toLocaleString()
    ]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-2 md:p-8 animate-in fade-in duration-300">
      <div className="bg-[#050505] border border-[#d4af37]/20 p-4 md:p-10 rounded-[32px] md:rounded-[40px] w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h3 className="text-[#d4af37] font-luxury font-black text-xl md:text-3xl uppercase tracking-tighter leading-none">Auditoría Luxury Master®</h3>
            <p className="text-[7px] md:text-[8px] text-zinc-600 font-bold uppercase tracking-[4px] mt-2">Protocolo de Seguridad Cloud Intelligence</p>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={handleExport} disabled={filteredData.length === 0} className="bg-[#d4af37] text-black text-[9px] font-black uppercase px-6 py-3 rounded-2xl hover:brightness-110 shadow-lg disabled:opacity-20">Exportar CSV</button>
             <button onClick={onClose} className="group transition-all active:scale-90">
                <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
                  <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
                </div>
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-zinc-900/10 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-zinc-800/30 shrink-0">
          <div className="md:col-span-2 space-y-1">
             <label className="text-[7px] text-zinc-600 font-black uppercase ml-2">Filtrar Historial</label>
             <input type="text" placeholder="Ej: GANADOR, Sistema..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#d4af37]" />
          </div>
          <div className="flex-1 space-y-1">
             <label className="text-[7px] text-zinc-600 font-black uppercase ml-2">Temporalidad</label>
             <div className="flex gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none" />
             </div>
          </div>
          <div className="flex items-end justify-end">
             <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-2xl">
                <span className="text-[14px] text-[#d4af37] font-black block leading-none">{filteredData.length}</span>
                <span className="text-[6px] text-zinc-600 font-bold uppercase tracking-widest">Eventos Registrados</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-900/5 rounded-[20px] border border-zinc-800/30 min-h-0">
          {filteredData.length > 0 ? [...filteredData].reverse().map((l) => (
            <div key={l.id} className="p-5 border-b border-zinc-900/50 hover:bg-zinc-800/20 flex justify-between items-center text-[10px]">
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold uppercase">{l.event}</span>
                <span className="text-zinc-600 text-[8px] uppercase font-black">{l.user || 'SISTEMA'}</span>
              </div>
              <span className="text-zinc-500 font-mono">{new Date(l.timestamp).toLocaleString()}</span>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
              <p className="font-luxury uppercase tracking-[4px] text-xs">Sin registros de auditoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sentinel;
