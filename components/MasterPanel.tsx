
import React, { useState, useMemo, useEffect } from 'react';
import { useLuxury } from '../context/LuxuryContext';
import { ref, set } from '@firebase/database';
import { db } from '../services/firebase';
import { LuxuryUserRecord, WinnerEntry, AnalysisResult, GlobalMessage, PredictiveInsights, QuantumAuditResult, ExecutiveReport, AppLanguage } from '../types';
import { useFilteredData } from '../hooks/useFilteredData';
import { analyzeCode, getPredictiveInsights, getQuantumAudit, generateExecutiveReport, generateBrandedBackground } from '../services/geminiService';
import Editor from './Editor';
import AnalysisDisplay from './AnalysisDisplay';
import { BrandPlaceholder, CloseButton } from '../services/brandAssets';

interface MasterPanelProps { 
  onClose: () => void; 
  onEnterSupport: (uid: string) => void; 
}

interface ExtendedLead extends WinnerEntry {
  ownerName: string;
  ownerUid: string;
}

const MasterPanel: React.FC<MasterPanelProps> = ({ onClose, onEnterSupport }) => {
  const { isMaster, globalUsers, globalStats, logs: globalLogs, pushAuditLog, config, setLanguage, t } = useLuxury();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'leads' | 'intelligence' | 'security' | 'dev' | 'media' | 'messaging'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // --- INTELLIGENCE & SECURITY ---
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [quantumResult, setQuantumResult] = useState<QuantumAuditResult | null>(null);
  const [isQuantumScanning, setIsQuantumScanning] = useState(false);
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // --- DEV & MEDIA ---
  const [code, setCode] = useState('// Ingrese código para análisis de arquitectura...');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bgPrompt, setBgPrompt] = useState('');
  const [isGeneratingBG, setIsGeneratingBG] = useState(false);
  const [generatedBG, setGeneratedBG] = useState<string | null>(null);

  // --- GLOBAL MESSAGING ---
  const [msgTitle, setMsgTitle] = useState('COMUNICADO OFICIAL');
  const [msgSubtitle, setMsgSubtitle] = useState('Atención a todos los nodos: Actualización de sistema disponible.');
  const [msgTarget, setMsgTarget] = useState<'all' | 'level' | 'uid'>('all');
  const [msgLevel, setMsgLevel] = useState<'free' | 'pro' | 'ppe'>('pro');
  const [msgUid, setMsgUid] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // --- DASHBOARD DATA ---
  const [mockActivity, setMockActivity] = useState<number[]>(Array.from({length: 20}, () => Math.floor(Math.random() * 50) + 10));

  useEffect(() => {
    const interval = setInterval(() => {
      setMockActivity(prev => [...prev.slice(1), Math.floor(Math.random() * 50) + 10]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIC: CRM GLOBAL ---
  const allGlobalLeads = useMemo(() => {
    const leads: ExtendedLead[] = [];
    globalUsers.forEach(userNode => {
      if (userNode.history) {
        Object.values(userNode.history).forEach((h: any) => {
          leads.push({
            ...h,
            ownerName: userNode.profile?.firstName ? `${userNode.profile.firstName} ${userNode.profile.lastName}` : 'Anónimo',
            ownerUid: userNode.uid
          });
        });
      }
    });
    return leads.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [globalUsers]);

  const { filteredData: filteredLeads, searchTerm: leadSearch, setSearchTerm: setLeadSearch, exportCSV: exportLeads } = useFilteredData<ExtendedLead>({
    data: allGlobalLeads,
    searchKeys: ['nombre', 'ownerName', 'ownerUid'],
    dateKey: 'fecha' as any
  });

  // --- LOGIC: ANALYTICS & SECURITY ---
  const handlePredictiveScan = async () => {
    setIsPredicting(true);
    try {
      const data = await getPredictiveInsights(allGlobalLeads);
      setInsights(data);
    } catch (e: any) { alert("AI_ERROR: " + e.message); } finally { setIsPredicting(false); }
  };

  const handleQuantumScan = async () => {
    setIsQuantumScanning(true);
    try {
      const result = await getQuantumAudit(globalLogs);
      setQuantumResult(result);
      pushAuditLog("SECURITY: Escaneo de entropía Sentinel finalizado.", "security");
    } catch (e) { alert("SCAN_ERROR"); } finally { setIsQuantumScanning(false); }
  };

  const handleExportReport = async () => {
    setIsGeneratingReport(true);
    try {
      const data = { leadsCount: allGlobalLeads.length, activeNodes: globalStats.activeNow, auditEntries: globalLogs.length };
      const res = await generateExecutiveReport(data);
      setReport(res);
      setTimeout(() => window.print(), 1000);
    } catch (e) { alert("REPORT_ERROR"); } finally { setIsGeneratingReport(false); }
  };

  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeCode(code);
      setAnalysis(res);
    } catch (e) { alert("DEV_ERROR"); } finally { setIsAnalyzing(false); }
  };

  const handleGenerateMedia = async () => {
    if (!bgPrompt) return;
    setIsGeneratingBG(true);
    try {
      const url = await generateBrandedBackground(bgPrompt);
      setGeneratedBG(url);
    } catch (e) { alert("MEDIA_ERROR"); } finally { setIsGeneratingBG(false); }
  };

  const handlePublishGlobal = async () => {
    setIsPublishing(true);
    try {
      const newMsg: GlobalMessage = {
        id: `global_${Date.now()}`,
        title: msgTitle,
        subtitle: msgSubtitle,
        type: 'text_only',
        createdAt: new Date().toISOString(),
        target: {
          type: msgTarget,
          levels: msgTarget === 'level' ? [msgLevel] : undefined,
          uids: msgTarget === 'uid' ? [msgUid] : undefined
        }
      };
      await set(ref(db, 'global_messages/active'), newMsg);
      alert("MENSAJE PUBLICADO EN TODA LA RED");
    } catch (e) { alert("PUB_ERROR"); } finally { setIsPublishing(false); }
  };

  const sortedUsers = useMemo(() => {
    return globalUsers.filter(u => {
      const term = searchTerm.toLowerCase();
      return u.uid.toLowerCase().includes(term) || (u.profile?.email || '').toLowerCase().includes(term);
    });
  }, [globalUsers, searchTerm]);

  if (!isMaster) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black flex flex-col p-0 md:p-8 animate-in fade-in duration-500 overflow-hidden print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col bg-[#050505] border border-[#d4af37]/20 md:rounded-[40px] shadow-2xl overflow-hidden print:border-none print:bg-white print:shadow-none">
        
        <header className="flex justify-between items-center p-4 md:p-8 border-b border-zinc-900 bg-black/40 shrink-0 print:hidden">
          <div className="flex flex-col">
            <h1 className="text-[#d4af37] font-luxury font-black text-xl md:text-3xl uppercase tracking-tighter leading-none">Master Hub LXM®</h1>
            <p className="text-[6px] md:text-[8px] text-zinc-600 font-bold uppercase tracking-[4px] mt-2">Mando Central de Operaciones</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {(['es', 'en'] as AppLanguage[]).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${config.lang === lang ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'text-zinc-600 border-zinc-800'}`}>{lang}</button>
              ))}
            </div>
            <CloseButton onClick={onClose} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-16 md:w-64 bg-black/30 border-r border-zinc-900 flex flex-col shrink-0 overflow-y-auto custom-scrollbar print:hidden">
            <div className="p-2 md:p-6 space-y-2 flex-1">
              {[
                { id: 'dashboard', label: t('welcome'), icon: '📊' },
                { id: 'users', label: 'Nodos Red', icon: '🛰️' },
                { id: 'intelligence', label: 'Intelligence', icon: '🧠' },
                { id: 'security', label: t('security'), icon: '🛡️' },
                { id: 'leads', label: 'CRM Global', icon: '💎' },
                { id: 'messaging', label: 'Mensajería', icon: '✉️' },
                { id: 'dev', label: 'Desarrollo', icon: '💻' },
                { id: 'media', label: 'Media Lab', icon: '🎬' },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-zinc-600 hover:text-zinc-300'}`}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1 p-4 md:p-10 overflow-y-auto custom-scrollbar bg-zinc-950/20 relative print:bg-white print:overflow-visible print:p-0">
            
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in print:hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-8 bg-zinc-900/20 rounded-[40px] border border-zinc-800 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[4px]">Sentinel Activity Stream</span>
                    </div>
                    <div className="h-32 flex items-end gap-1 px-2">
                       {mockActivity.map((h, i) => (
                         <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-[#d4af37]/40 to-[#d4af37] rounded-t-sm transition-all duration-1000" />
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-black border border-zinc-800 rounded-3xl text-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase">Active Nodes</span>
                        <div className="text-4xl font-black text-white mt-2">{globalStats.totalUsers}</div>
                     </div>
                     <div className="p-6 bg-black border border-zinc-800 rounded-3xl text-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase">Online</span>
                        <div className="text-4xl font-black text-blue-500 mt-2">{globalStats.activeNow}</div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* CRM GLOBAL */}
            {activeTab === 'leads' && (
              <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h2 className="text-[#d4af37] font-luxury font-black text-2xl uppercase">Global CRM Access</h2>
                  <button onClick={() => exportLeads('crm_global_full', ['Premio', 'Fecha', 'Dueño Nodo', 'UID Nodo'], (l) => [l.nombre, l.fecha, l.ownerName, l.ownerUid])} className="bg-white text-black text-[9px] font-black uppercase px-6 py-3 rounded-xl">Exportar Full DB</button>
                </div>
                <input type="text" placeholder="Buscar en toda la base de datos de red..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="w-full bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl text-xs text-white outline-none" />
                <div className="flex-1 overflow-auto rounded-[32px] border border-zinc-800 bg-black/40 custom-scrollbar">
                  <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-zinc-900/50 text-[8px] font-black uppercase text-zinc-600 tracking-widest sticky top-0 z-10">
                      <tr><th className="p-6">Premio</th><th className="p-6">Fecha</th><th className="p-6">Dueño Nodo</th><th className="p-6">UID Nodo</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/30">
                      {filteredLeads.map((l, i) => (
                        <tr key={i} className="hover:bg-zinc-900/40 transition-all">
                          <td className="p-6 text-[#d4af37] font-black text-[10px] uppercase">{l.nombre}</td>
                          <td className="p-6 text-zinc-400 font-mono text-[9px]">{new Date(l.fecha).toLocaleString()}</td>
                          <td className="p-6 text-white font-bold text-[10px] uppercase">{l.ownerName}</td>
                          <td className="p-6 text-zinc-600 font-mono text-[8px]">{l.ownerUid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INTELLIGENCE */}
            {activeTab === 'intelligence' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center">
                   <h2 className="text-[#d4af37] font-luxury font-black text-2xl uppercase">Predictive Intelligence</h2>
                   <button onClick={handlePredictiveScan} disabled={isPredicting} className="bg-[#d4af37] text-black text-[10px] font-black px-8 py-4 rounded-xl shadow-lg disabled:opacity-30">{isPredicting ? 'Procesando Red...' : 'Iniciar Escaneo Predictivo'}</button>
                </div>
                {insights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[32px]">
                        <h3 className="text-[10px] text-zinc-500 font-black uppercase mb-6">Probabilidad de Conversión</h3>
                        <div className="text-6xl font-black text-white">{(insights.conversionProbability * 100).toFixed(1)}%</div>
                        <p className="text-zinc-500 text-[10px] mt-4 leading-relaxed">Basado en patrones de engagement detectados en los últimos {allGlobalLeads.length} eventos.</p>
                     </div>
                     <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[32px]">
                        <h3 className="text-[10px] text-zinc-500 font-black uppercase mb-6">Estrategia de Crecimiento AI</h3>
                        <ul className="space-y-3">
                          {insights.growthStrategy.map((s, i) => (
                            <li key={i} className="text-xs text-zinc-300 flex gap-4"><span className="text-[#d4af37]">▶</span> {s}</li>
                          ))}
                        </ul>
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* MENSAJERÍA GLOBAL */}
            {activeTab === 'messaging' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
                <section className="bg-zinc-900/20 p-8 rounded-[40px] border border-zinc-800 space-y-6">
                   <h2 className="text-[#d4af37] font-luxury font-black text-xl uppercase">Push de Red Global</h2>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[8px] text-zinc-600 font-black uppercase ml-2 mb-1 block">Objetivo (Target)</label>
                        <select value={msgTarget} onChange={e => setMsgTarget(e.target.value as any)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-xs text-white outline-none">
                           <option value="all">Toda la Red (Omni)</option>
                           <option value="level">Por Nivel de Suscripción</option>
                           <option value="uid">UID Específico</option>
                        </select>
                      </div>
                      {msgTarget === 'level' && (
                        <div className="flex gap-2">
                           {(['free', 'pro', 'ppe'] as const).map(l => (
                             <button key={l} onClick={() => setMsgLevel(l)} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${msgLevel === l ? 'bg-white text-black border-white' : 'text-zinc-600 border-zinc-800'}`}>{l}</button>
                           ))}
                        </div>
                      )}
                      {msgTarget === 'uid' && <input value={msgUid} onChange={e => setMsgUid(e.target.value)} placeholder="Ingrese UID del Nodo..." className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-xs text-white" />}
                      <input value={msgTitle} onChange={e => setMsgTitle(e.target.value)} placeholder="Título del Comunicado" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-xs text-white" />
                      <textarea value={msgSubtitle} onChange={e => setMsgSubtitle(e.target.value)} placeholder="Mensaje central..." className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-xs text-zinc-400 h-24" />
                      <button onClick={handlePublishGlobal} disabled={isPublishing} className="w-full bg-[#d4af37] text-black font-black py-5 rounded-xl uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30">{isPublishing ? 'Emitiendo en Red...' : 'Publicar Comunicado Global'}</button>
                   </div>
                </section>
                <div className="flex flex-col">
                   <span className="text-zinc-600 text-[9px] font-black uppercase mb-4 tracking-widest">Previsualización de Nodo</span>
                   <div className="flex-1 bg-black/40 border border-dashed border-zinc-800 rounded-[40px] flex items-center justify-center p-10">
                      <div className="w-full max-sm bg-[#0a0a0a] border border-[#d4af37]/30 p-10 rounded-[48px] text-center shadow-2xl">
                         <div className="mb-6 flex justify-center"><BrandPlaceholder label="LXM" size="w-12 h-12" /></div>
                         <h3 className="text-[#d4af37] font-luxury text-2xl font-black uppercase mb-2">{msgTitle}</h3>
                         <p className="text-zinc-500 text-[10px] uppercase tracking-[3px] leading-relaxed">{msgSubtitle}</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* SEGURIDAD CUÁNTICA */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in print:hidden">
                <div className="flex justify-between items-center bg-zinc-900/40 p-10 rounded-[40px] border border-zinc-800 border-l-[12px] border-l-blue-600">
                  <div>
                    <h2 className="text-blue-500 font-luxury font-black text-3xl uppercase">Sentinel Security Lab</h2>
                    <p className="text-zinc-500 text-xs mt-2 uppercase tracking-[2px]">Bóveda de integridad cuántica y endurecimiento de sistema.</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleQuantumScan} disabled={isQuantumScanning} className="bg-blue-600 text-white font-black px-8 py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30">{isQuantumScanning ? 'Escaneando Entropía...' : 'Fijar Bóveda Cuántica'}</button>
                    <button onClick={handleExportReport} disabled={isGeneratingReport} className="bg-[#d4af37] text-black font-black px-8 py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-30">{isGeneratingReport ? 'Compilando...' : 'Exportar Reporte BI'}</button>
                  </div>
                </div>
                {quantumResult && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-8 bg-black border border-zinc-800 rounded-[32px] text-center flex flex-col items-center">
                       <span className="text-[10px] text-zinc-500 font-black uppercase mb-4">Entropy Level</span>
                       <div className="w-32 h-32 rounded-full border-[8px] border-blue-900/30 border-t-blue-500 flex items-center justify-center relative">
                          <span className="text-3xl font-black text-white">{(quantumResult.entropyScore * 100).toFixed(0)}%</span>
                       </div>
                       <p className="text-[8px] text-zinc-600 mt-4 uppercase font-bold">Resilience: {quantumResult.encryptionStrength}</p>
                    </div>
                    <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[32px] md:col-span-2">
                       <h3 className="text-[10px] text-blue-400 font-black uppercase mb-6">Anomalías Detectadas</h3>
                       <div className="space-y-4">
                         {quantumResult.detectedAnomalies.map((a, i) => (
                           <div key={i} className={`p-4 rounded-2xl border ${a.risk === 'high' ? 'bg-red-950/20 border-red-900/30 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-300'} flex justify-between items-center`}>
                              <div className="flex flex-col"><span className="text-[10px] font-black uppercase">{a.type}</span><span className="text-[8px] opacity-60 mt-1">{a.description}</span></div>
                              <span className="text-[8px] font-black uppercase px-3 py-1 bg-black/40 rounded-full">{a.risk} risk</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MEDIA LAB */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                 <div className="space-y-6">
                    <h2 className="text-[#d4af37] font-luxury font-black text-xl uppercase">Generación de Activos 8K</h2>
                    <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[32px] space-y-4">
                       <label className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block">Concepto de Marca</label>
                       <textarea value={bgPrompt} onChange={e => setBgPrompt(e.target.value)} placeholder="Ej: Abstract golden silk with cinematic lighting, luxury hotel lobby 8k..." className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-xs text-white h-32" />
                       <button onClick={handleGenerateMedia} disabled={isGeneratingBG} className="w-full bg-[#d4af37] text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30">{isGeneratingBG ? 'Sintetizando Imagen...' : 'Generar Activo Cinematográfico'}</button>
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-zinc-600 text-[9px] font-black uppercase mb-4 tracking-widest">Resultado Renderizado</span>
                    <div className="flex-1 bg-black border border-zinc-900 rounded-[32px] overflow-hidden flex items-center justify-center">
                       {generatedBG ? <img src={generatedBG} className="w-full h-full object-cover" /> : <div className="text-zinc-800 text-[40px] font-black opacity-10 font-luxury">LXM MEDIA</div>}
                    </div>
                 </div>
              </div>
            )}

            {/* DESARROLLO */}
            {activeTab === 'dev' && (
              <div className="h-full flex flex-col gap-6 animate-in fade-in">
                <h2 className="text-[#d4af37] font-luxury font-black text-xl uppercase">Architectural Sandbox</h2>
                <div className="flex-1 min-h-[400px]">
                  <Editor value={code} onChange={setCode} />
                </div>
                <button onClick={handleAnalyzeCode} disabled={isAnalyzing} className="bg-indigo-600 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30">{isAnalyzing ? 'Analizando...' : 'Analizar Arquitectura con Gemini 3 Pro'}</button>
                {analysis && <AnalysisDisplay result={analysis} isLoading={isAnalyzing} />}
              </div>
            )}

            {/* USERS / NODOS */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                <input type="text" placeholder="Buscar Nodo por UID o Email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl text-xs text-white outline-none" />
                <div className="flex-1 overflow-auto rounded-[32px] border border-zinc-800 bg-black/40 custom-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-zinc-900/50 text-[8px] font-black uppercase text-zinc-600 tracking-widest sticky top-0 z-10">
                      <tr><th className="p-6">UID</th><th className="p-6">Titular</th><th className="p-6">Email</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Acción</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/30">
                      {sortedUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-zinc-900/40 transition-all">
                          <td className="p-6 font-mono text-[10px] text-zinc-500">{u.uid.substring(0, 8)}...</td>
                          <td className="p-6 text-white font-black text-[10px] uppercase">{u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : 'NODO_ANÓNIMO'}</td>
                          <td className="p-6 text-zinc-400 text-[10px]">{u.profile?.email || 'S/N'}</td>
                          <td className="p-6 text-center"><div className={`inline-block w-2 h-2 rounded-full ${u.presence?.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`}></div></td>
                          <td className="p-6 text-right"><button onClick={() => onEnterSupport(u.uid)} className="px-4 py-2 rounded-xl bg-zinc-900 text-white border border-zinc-800 text-[8px] font-black uppercase hover:border-[#d4af37]">Intervenir</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* VISTA DE IMPRESIÓN REPORTE EJECUTIVO */}
            {report && (
              <div className="hidden print:block bg-white text-black p-12 h-screen">
                 <div className="flex justify-between items-start border-b-8 border-black pb-8 mb-12">
                   <div><h1 className="text-5xl font-black uppercase tracking-tighter">EXECUTIVE BI REPORT</h1><p className="text-sm font-bold uppercase tracking-widest mt-2">LUXURY MASTER® AI SENTINEL SYSTEM</p></div>
                   <div className="text-right"><p className="text-xs font-black">ID: {report.id}</p><p className="text-xs font-bold">{new Date(report.timestamp).toLocaleString()}</p></div>
                 </div>
                 <div className="grid grid-cols-3 gap-8 mb-12">
                   <div className="p-8 bg-zinc-100 rounded-3xl border border-black"><span className="text-[10px] font-black uppercase">Total Red Leads</span><div className="text-4xl font-black mt-2">{allGlobalLeads.length}</div></div>
                   <div className="p-8 bg-zinc-100 rounded-3xl border border-black"><span className="text-[10px] font-black uppercase">Active Nodes</span><div className="text-4xl font-black mt-2">{globalStats.activeNow}</div></div>
                   <div className="p-8 bg-zinc-100 rounded-3xl border border-black"><span className="text-[10px] font-black uppercase">Security Status</span><div className="text-4xl font-black mt-2">VERIFIED</div></div>
                 </div>
                 <div className="space-y-8">
                   <section><h3 className="text-xl font-black uppercase border-b-2 border-black pb-2 mb-4">IA Executive Summary</h3><p className="text-sm leading-relaxed">{report.aiExecutiveSummary}</p></section>
                   <section className="pt-12"><div className="w-full h-1 bg-black opacity-10 mb-8" /><p className="text-[10px] font-black text-center uppercase tracking-[8px]">Excellence Verified by Luxury Master® AI</p></section>
                 </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MasterPanel;
