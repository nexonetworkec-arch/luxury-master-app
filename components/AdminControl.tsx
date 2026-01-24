
import React from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { useFilteredData } from '../hooks/useFilteredData';
import { WinnerEntry } from '../types';

interface AdminControlProps {
  onClose: () => void;
}

const AdminControl: React.FC<AdminControlProps> = ({ onClose }) => {
  const { history, config } = useLuxury();
  const currentFields = config.leadFields || [];

  const { 
    filteredData, 
    searchTerm, setSearchTerm, 
    startDate, setStartDate, 
    endDate, setEndDate, 
    exportCSV 
  } = useFilteredData<WinnerEntry>({
    data: history,
    searchKeys: ['nombre', ...currentFields.map(f => `leadData.${f.id}`)],
    dateKey: 'fecha' as any
  });

  const handleExport = () => {
    const headers = ["Premio", "Fecha", ...currentFields.map(f => f.label)];
    exportCSV('leads_luxury', headers, (h) => [
      h.nombre, 
      h.fecha, 
      ...currentFields.map(f => h.leadData?.[f.id] || '')
    ]);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-2 md:p-8 animate-in fade-in duration-300">
      <div className="bg-[#050505] border border-[#d4af37]/20 p-4 md:p-10 rounded-[32px] md:rounded-[40px] w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h3 className="text-[#d4af37] font-luxury font-black text-xl md:text-3xl uppercase tracking-tighter leading-none">Luxury CRM®</h3>
            <p className="text-[7px] md:text-[8px] text-zinc-600 font-bold uppercase tracking-[4px] mt-2">Gestión de Participantes Sincronizada Master AI</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleExport} 
              disabled={filteredData.length === 0}
              className="bg-[#d4af37] text-black text-[9px] font-black uppercase px-6 py-3 rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-20 disabled:grayscale shadow-lg"
            >
              Exportar CSV
            </button>
            <button onClick={onClose} className="group transition-all active:scale-90">
              <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
                <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-zinc-900/10 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-zinc-800/30 shrink-0">
          <div className="md:col-span-2 space-y-1">
             <label className="text-[7px] text-zinc-600 font-black uppercase ml-2">Buscador Luxury</label>
             <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por lead o premio..." className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#d4af37]" />
          </div>
          <div className="flex-1 space-y-1">
             <label className="text-[7px] text-zinc-600 font-black uppercase ml-2">Rango Fecha</label>
             <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none" />
             </div>
          </div>
          <div className="flex items-end justify-end">
             <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-2xl text-right">
                <span className="text-[14px] text-[#d4af37] font-black block leading-none">{filteredData.length}</span>
                <span className="text-[6px] text-zinc-600 font-bold uppercase tracking-widest">Registros Totales</span>
             </div>
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800 rounded-[24px] md:rounded-[32px] overflow-x-auto custom-scrollbar flex-1 min-h-0">
          <div className="min-w-[1000px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[8px] font-black uppercase text-zinc-600 tracking-widest border-b border-zinc-900 bg-zinc-900/50">
                  {currentFields.map(field => (
                    <th key={field.id} className="p-4 md:p-6 text-[#d4af37]">{field.label}</th>
                  ))}
                  <th className="p-4 md:p-6 text-right">Premio Reclamado</th>
                  <th className="p-4 md:p-6 text-right">Fecha Sincro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {filteredData.length > 0 ? [...filteredData].reverse().map((h, i) => (
                  <tr key={i} className="hover:bg-zinc-900/20 transition-all">
                    {currentFields.map(field => (
                      <td key={field.id} className="p-4 md:p-6 text-[10px] text-white font-bold uppercase truncate max-w-[180px]">
                        {h.leadData?.[field.id] || '---'}
                      </td>
                    ))}
                    <td className="p-4 md:p-6 text-right text-[10px] text-[#d4af37] font-black uppercase">{h.nombre}</td>
                    <td className="p-4 md:p-6 text-right text-[9px] text-zinc-600 font-mono">{new Date(h.fecha).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={currentFields.length + 2} className="p-20 text-center text-zinc-800 font-black uppercase text-[10px] tracking-widest">Sin registros sincronizados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControl;
