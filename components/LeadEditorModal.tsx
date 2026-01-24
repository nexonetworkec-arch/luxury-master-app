
import React from 'react';
import { LeadField } from '../types';

interface LeadEditorModalProps {
  fields: LeadField[];
  onUpdate: (fields: LeadField[]) => void;
  onClose: () => void;
}

const LeadEditorModal: React.FC<LeadEditorModalProps> = ({ fields, onUpdate, onClose }) => {
  const addField = () => {
    const newField: LeadField = { 
      id: `field_${Date.now()}`, 
      label: 'NUEVO CAMPO', 
      placeholder: 'Ingresa valor...', 
      type: 'text', 
      required: true 
    };
    onUpdate([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<LeadField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onUpdate(newFields);
  };

  const removeField = (index: number) => {
    onUpdate(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-6 md:p-10 rounded-[32px] md:rounded-[48px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[#d4af37] font-luxury font-black text-xl md:text-2xl uppercase tracking-tighter">Editor de Formulario</h3>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[2px]">Módulo de Captación Dinámica</p>
          </div>
          <button onClick={onClose} className="group transition-all active:scale-90">
            <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
              <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-2xl group transition-all focus-within:border-[#d4af37]/40">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-600 font-black uppercase mb-1 ml-1">Etiqueta del Campo</span>
                    <input 
                      value={field.label}
                      onChange={e => updateField(idx, { label: e.target.value })}
                      className="bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-600 font-black uppercase mb-1 ml-1">Texto de Ayuda (Placeholder)</span>
                    <input 
                      value={field.placeholder}
                      onChange={e => updateField(idx, { placeholder: e.target.value })}
                      className="bg-black border border-zinc-800 p-3 rounded-xl text-[10px] text-zinc-400 italic outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4 ml-4">
                  <button 
                    onClick={() => removeField(idx)}
                    className="text-zinc-700 hover:text-red-500 transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={field.required} 
                      onChange={e => updateField(idx, { required: e.target.checked })}
                      className="accent-[#d4af37] w-3 h-3"
                    />
                    <span className="text-[7px] text-zinc-500 font-black uppercase">Obligatorio</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          {fields.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[2px]">No hay campos configurados</p>
            </div>
          )}
        </div>

        <button 
          onClick={addField}
          className="w-full mt-6 bg-zinc-900 border border-zinc-800 text-[#d4af37] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-colors"
        >
          + AÑADIR NUEVO CAMPO
        </button>
      </div>
    </div>
  );
};

export default LeadEditorModal;
