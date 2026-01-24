
import React, { useState, useMemo } from 'react';
import { LeadField, WinnerEntry } from '../types';

interface RegistrationModalProps {
  fields: LeadField[];
  history: WinnerEntry[];
  onConfirm: (data: Record<string, string>) => void;
  onDataChange?: (data: Record<string, string>) => void;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ fields, history, onConfirm, onDataChange, onClose }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const duplicateInfo = useMemo(() => {
    // Buscar si algún campo crítico (email o teléfono) ya existe en el historial
    for (const field of fields) {
      const currentValue = (formData[field.id] || '').trim().toLowerCase();
      if (!currentValue) continue;

      if (field.type === 'email' || field.type === 'tel' || field.id.toLowerCase().includes('email') || field.id.toLowerCase().includes('telefono')) {
        const foundMatch = history.find(entry => {
          if (!entry.leadData) return false;
          // Buscar en todos los campos del leadData histórico
          return Object.values(entry.leadData).some(val => 
            (val || '').toString().trim().toLowerCase() === currentValue
          );
        });

        if (foundMatch) {
          return { 
            isDuplicate: true, 
            fieldLabel: field.label, 
            value: currentValue 
          };
        }
      }
    }
    return { isDuplicate: false };
  }, [formData, history, fields]);

  const handleChange = (id: string, value: string) => {
    const newData = { ...formData, [id]: value };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const isFormValid = () => {
    const allRequiredFilled = fields.every(f => !f.required || (formData[f.id] && formData[f.id].trim() !== ''));
    return allRequiredFilled && !duplicateInfo.isDuplicate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onConfirm(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 p-8 md:p-12 rounded-[32px] md:rounded-[48px] w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>
        
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <h3 className="text-[#d4af37] font-luxury font-black text-2xl uppercase tracking-tighter">Registro</h3>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[4px] mt-2">Valide sus datos</p>
          </div>
          <button onClick={onClose} className="group transition-all active:scale-90">
            <div className="w-10 h-10 luxury-icon-placeholder rounded-full border-zinc-800 group-hover:border-[#d4af37]/50">
              <span className="text-[12px] text-[#d4af37]/40 group-hover:text-[#d4af37]">X</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-600 ml-4 mb-1 block">
                {field.label} {field.required && <span className="text-red-900/50">*</span>}
              </label>
              <input 
                required={field.required}
                type={field.type}
                value={formData[field.id] || ''}
                onChange={e => handleChange(field.id, e.target.value)}
                className={`w-full bg-[#050505] border p-4 rounded-2xl text-white outline-none focus:border-[#d4af37] transition-all text-sm placeholder:text-zinc-800 ${duplicateInfo.isDuplicate && (field.type === 'email' || field.type === 'tel') ? 'border-red-900/50 text-red-400' : 'border-zinc-900'}`}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {duplicateInfo.isDuplicate && (
            <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl animate-pulse">
              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest text-center leading-relaxed">
                ACCESO DENEGADO: El {duplicateInfo.fieldLabel} ya tiene un registro previo.
              </p>
            </div>
          )}

          <div className="pt-6 sticky bottom-0 bg-[#0a0a0a] pb-2">
            <button 
              type="submit"
              disabled={!isFormValid()}
              className="w-full bg-[#d4af37] text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale"
            >
              {duplicateInfo.isDuplicate ? 'IDENTIDAD DUPLICADA' : 'REGISTRAR Y GIRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
