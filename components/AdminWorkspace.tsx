
import React, { useState, useEffect } from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { LuxuryConfig, WinnerEntry, UserProfile, GlobalMessage } from '../types';
import { ref, onValue, set, remove } from '@firebase/database';
import { db } from '../services/firebase';
import { CloseButton, BrandPlaceholder } from '../services/brandAssets';

interface AdminWorkspaceProps { onClose: () => void; targetUid?: string; }

const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({ onClose, targetUid }) => {
  const { user, history: ctxHistory, config: ctxConfig } = useLuxury();
  const [remoteConfig, setRemoteConfig] = useState<LuxuryConfig | null>(null);
  const [remoteHistory, setRemoteHistory] = useState<WinnerEntry[]>([]);
  const [remoteProfile, setRemoteProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(!!targetUid);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'crm' | 'messaging'>('dashboard');

  // Estados para Mensajería Local (Idénticos a MasterPanel)
  const [msgTitle, setMsgTitle] = useState('BIENVENIDOS');
  const [msgSubtitle, setMsgSubtitle] = useState('Disfruta de nuestra experiencia exclusiva.');
  const [msgType, setMsgType] = useState<'text_only' | 'text_image' | 'image_only'>('text_only');
  const [msgImage, setMsgImage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (targetUid) {
      const configRef = ref(db, `users/${targetUid}/config`);
      const unsubConfig = onValue(configRef, (snap) => { if (snap.exists()) setRemoteConfig(snap.val()); setIsLoading(false); });
      const historyRef = ref(db, `users/${targetUid}/history`);
      const unsubHistory = onValue(historyRef, (snap) => { setRemoteHistory(snap.exists() ? Object.entries(snap.val()).map(([id, val]: [any, any]) => ({ ...val, id })) : []); });
      const profileRef = ref(db, `users/${targetUid}/profile`);
      const unsubProfile = onValue(profileRef, (snap) => { if (snap.exists()) setRemoteProfile(snap.val()); });
      return () => { unsubConfig(); unsubHistory(); unsubProfile(); };
    }
  }, [targetUid]);

  const config = remoteConfig || ctxConfig;
  const history = targetUid ? remoteHistory : ctxHistory;
  const currentUid = targetUid || user?.uid;
  const currentFields = config.leadFields || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMsgImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const publishLocalMessage = async () => {
    if (!currentUid || isPublishing) return;
    setIsPublishing(true);
    try {
      const newMsg: GlobalMessage = {
        id: `local_${Date.now()}`,
        title: msgType === 'image_only' ? '' : msgTitle,
        subtitle: msgType === 'image_only' ? '' : msgSubtitle,
        type: msgType,
        imageUrl: msgImage || undefined,
        createdAt: new Date().toISOString(),
        target: { type: 'uid', uids: [currentUid] }
      };
      await set(ref(db, `users/${currentUid}/local_message/active`), newMsg);
      alert("MENSAJE LOCAL PUBLICADO EXITOSAMENTE");
    } catch (e) {
      alert("ERROR DE SINCRONIZACIÓN");
    } finally {
      setIsPublishing(false);
    }
  };

  const clearLocalMessage = async () => {
    if (!currentUid || isClearing) return;
    setIsClearing(true);
    try {
      await remove(ref(db, `users/${currentUid}/local_message/active`));
      alert("MENSAJE LOCAL RETIRADO");
    } catch (e) {
      alert("ERROR AL RETIRAR MENSAJE");
    } finally {
      setIsClearing(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Inventario', icon: '📦' },
    { id: 'crm', label: 'Luxury CRM', icon: '💎' },
    { id: 'messaging', label: 'Mensajería', icon: '✉️' }
  ] as const;

  if (isLoading) return (
    <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[450] flex bg-black/98 backdrop-blur-3xl p-2 md:p-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex-1 bg-[#050505] border border-[#d4af37]/20 rounded-[24px] md:rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        
        {/* Sidebar Desktop */}
        <aside className="w-64 bg-black/40 border-r border-zinc-900 p-8 hidden md:flex flex-col shrink-0">
          <div className="mb-12">
            <h2 className="text-[#d4af37] font-luxury font-black text-xl uppercase tracking-tighter">Luxury Hub®</h2>
            <p className="text-[7px] text-zinc-600 font-black uppercase tracking-[4px] mt-1">Gestión de Nodo {targetUid ? 'REMOTO' : ''}</p>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-zinc-600 hover:text-white'}`}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
          <div className="pt-8 border-t border-zinc-900 flex justify-center"><CloseButton onClick={onClose} /></div>
        </aside>

        {/* Mobile Nav */}
        <nav className="md:hidden flex overflow-x-auto bg-black border-b border-zinc-900 p-3 gap-3 custom-scrollbar shrink-0">
          {navItems.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-zinc-700'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <button onClick={onClose} className="ml-auto text-[#d4af37] font-black text-xs px-2">X</button>
        </nav>

        {/* Workspace Central */}
        <div className="flex-1 p-4 md:p-12 overflow-y-auto custom-scrollbar bg-zinc-950/20">
          <header className="hidden md:flex justify-between items-center mb-10 border-b border-zinc-900 pb-8">
            <h3 className="text-white font-luxury font-black text-3xl uppercase tracking-tighter">{activeTab.toUpperCase()}</h3>
            <CloseButton onClick={onClose} />
          </header>

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
              <div className="p-6 md:p-8 bg-zinc-900/40 rounded-[24px] md:rounded-[32px] border border-zinc-800 shadow-xl">
                <span className="text-[8px] md:text-[10px] text-zinc-600 font-black uppercase">Leads Luxury</span>
                <div className="text-3xl md:text-4xl font-black text-[#d4af37] mt-4">{history.length}</div>
              </div>
              <div className="p-6 md:p-8 bg-zinc-900/40 rounded-[24px] md:rounded-[32px] border border-zinc-800 shadow-xl">
                <span className="text-[8px] md:text-[10px] text-zinc-600 font-black uppercase">Protocolo</span>
                <div className="text-xl md:text-2xl font-black text-white mt-4 uppercase tracking-tighter">{config.level}</div>
              </div>
              <div className="p-6 md:p-8 bg-zinc-900/40 rounded-[24px] md:rounded-[32px] border border-zinc-800 shadow-xl">
                <span className="text-[8px] md:text-[10px] text-zinc-600 font-black uppercase">Sync</span>
                <div className="text-xl md:text-2xl font-black text-green-500 mt-4 tracking-tighter uppercase">VERIFIED</div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-in slide-in-from-right-4 duration-500">
               {config.prizes.map((p, i) => (
                 <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-4 md:p-6 rounded-[20px] md:rounded-3xl flex flex-col items-center text-center">
                   <BrandPlaceholder label={(i+1).toString()} size="w-8 h-8 md:w-10 md:h-10" className="mb-4" />
                   <span className="text-white font-black uppercase text-[10px] tracking-wider line-clamp-2">{p}</span>
                 </div>
               ))}
             </div>
          )}

          {activeTab === 'messaging' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 animate-in fade-in duration-500">
               <div className="space-y-4 md:space-y-6">
                  <section className="bg-zinc-900/30 p-5 md:p-8 rounded-[24px] md:rounded-[32px] border border-zinc-800">
                    <h3 className="text-[#d4af37] font-luxury font-black text-lg md:text-xl mb-4 md:mb-6 uppercase">Comunicado de Nodo</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {(['text_only', 'text_image', 'image_only'] as const).map(type => (
                          <button 
                            key={type} 
                            onClick={() => setMsgType(type)} 
                            className={`p-2 md:p-3 rounded-xl border text-[7px] md:text-[8px] font-black uppercase transition-all ${msgType === type ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-zinc-800 text-zinc-600'}`}
                          >
                            {type.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      {msgType !== 'image_only' && (
                        <>
                          <input 
                            value={msgTitle} 
                            onChange={e => setMsgTitle(e.target.value)} 
                            className="w-full bg-black border border-zinc-800 p-3 md:p-4 rounded-xl text-xs text-white outline-none focus:border-[#d4af37]" 
                            placeholder="Título" 
                          />
                          <textarea 
                            value={msgSubtitle} 
                            onChange={e => setMsgSubtitle(e.target.value)} 
                            className="w-full bg-black border border-zinc-800 p-3 md:p-4 rounded-xl text-xs text-zinc-400 outline-none focus:border-[#d4af37] h-20 md:h-24" 
                            placeholder="Mensaje..." 
                          />
                        </>
                      )}

                      {msgType !== 'text_only' && (
                        <div className="flex gap-4">
                          <label className="flex-1 bg-zinc-900 border border-zinc-800 p-3 md:p-4 rounded-xl text-[8px] md:text-[9px] text-zinc-500 font-black uppercase text-center cursor-pointer hover:border-white">
                            {msgImage ? 'Cambiar Imagen' : 'Cargar Imagen'}
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                          </label>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4">
                        <button 
                          onClick={clearLocalMessage} 
                          disabled={isClearing}
                          className="bg-zinc-900 text-red-500 py-3 md:py-4 rounded-xl font-black uppercase text-[8px] md:text-[9px] border border-red-900/30 disabled:opacity-30"
                        >
                          Eliminar
                        </button>
                        <button 
                          onClick={publishLocalMessage} 
                          disabled={isPublishing}
                          className="bg-[#d4af37] text-black py-3 md:py-4 rounded-xl font-black uppercase text-[8px] md:text-[9px] shadow-lg disabled:opacity-30 active:scale-95 transition-transform"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  </section>
               </div>

               <div className="flex flex-col">
                  <h3 className="text-zinc-500 font-black text-[10px] mb-4 uppercase tracking-[4px]">Preview</h3>
                  <div className="flex-1 bg-black/40 border border-dashed border-zinc-800 rounded-[24px] md:rounded-[32px] flex items-center justify-center p-6 md:p-8 relative overflow-hidden" style={{ animation: 'none' }}>
                    <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#d4af37]/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] text-center shadow-2xl relative" style={{ animation: 'none' }}>
                      <div className="absolute top-4 right-4">
                        <CloseButton onClick={() => {}} />
                      </div>
                      <div className="mb-4 flex justify-center"><BrandPlaceholder label="LXM" size="w-10 h-10" /></div>
                      
                      {msgType !== 'image_only' && (
                        <>
                          <h4 className="text-[#d4af37] font-luxury text-lg md:text-xl font-black uppercase mb-1 md:mb-2">{msgTitle}</h4>
                          <p className="text-zinc-400 text-[8px] md:text-[10px] uppercase tracking-widest mb-4 md:mb-6">{msgSubtitle}</p>
                        </>
                      )}

                      {msgType !== 'text_only' && msgImage && (
                        <div className="mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden border border-zinc-800" style={{ animation: 'none' }}>
                           <img src={msgImage} alt="Local Preview" className="w-full object-cover max-h-40" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-[24px] md:rounded-[32px] overflow-x-auto animate-in slide-in-from-right-4 duration-500 custom-scrollbar">
              <div className="min-w-[800px]">
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
                    {history.length > 0 ? [...history].reverse().map((h, i) => (
                      <tr key={i} className="hover:bg-zinc-900/20 transition-all">
                        {currentFields.map(field => (
                          <td key={field.id} className="p-4 md:p-6 text-[10px] text-white font-bold uppercase truncate max-w-[150px]">
                            {h.leadData?.[field.id] || '---'}
                          </td>
                        ))}
                        <td className="p-4 md:p-6 text-right text-[10px] text-[#d4af37] font-black uppercase">{h.nombre}</td>
                        <td className="p-4 md:p-6 text-right text-[9px] text-zinc-600 font-mono">{new Date(h.fecha).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={currentFields.length + 2} className="p-20 text-center text-zinc-800 font-black uppercase text-[10px] tracking-widest">Sin actividad registrada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkspace;
