
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile, reauthenticateWithCredential, EmailAuthProvider
} from '@firebase/auth';
import { ref, set, onValue, update } from '@firebase/database';
import { auth, db } from './services/firebase';
import { LuxuryProvider, useLuxury } from './context/LuxuryContext';
import { BrandPlaceholder, LuxuryLogo, CloseButton } from './services/brandAssets';
import { GlobalMessage } from './types';

import Wheel, { WheelHandle } from './components/Wheel';
import Guardian from './components/Guardian';
import Commander from './components/Commander';
import AdminWorkspace from './components/AdminWorkspace';
import AdminControl from './components/AdminControl';
import WinnerModal from './components/WinnerModal';
import FloatingMenu from './components/FloatingMenu';
import RegistrationModal from './components/RegistrationModal';
import SecurityGate from './components/SecurityGate';
import LicenseActivationModal from './components/LicenseActivationModal';
import MasterPanel from './components/MasterPanel';
import SupportRequestModal from './components/SupportRequestModal';
import ApiKeyGate from './components/ApiKeyGate';

const AppContent: React.FC = () => {
  const { user, config, history, isAdmin, isMaster, isAuthChecking, connectionError, saveWinner, localMessage, updateConfig } = useLuxury();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  
  const [showCommander, setShowCommander] = useState(false);
  const [showAdminWorkspace, setShowAdminWorkspace] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showMasterPanel, setShowMasterPanel] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showKeyGate, setShowKeyGate] = useState(false);
  
  const [supportUid, setSupportUid] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerData, setWinnerData] = useState<{prize: string, index: number} | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  const [pendingLeadData, setPendingLeadData] = useState<Record<string, string> | null>(null);
  const [liveLeadName, setLiveLeadName] = useState<string>('');
  
  const [isMenuUnlocked, setIsMenuUnlocked] = useState(false);
  const [showSecurityGate, setShowSecurityGate] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<'idle' | 'verifying' | 'error'>('idle');
  
  const [incomingSupportRequest, setIncomingSupportRequest] = useState<boolean>(false);
  const [globalMessage, setGlobalMessage] = useState<GlobalMessage | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // PWA Support (Fase 4)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const wheelRef = useRef<WheelHandle>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[LXM-PWA] Instalación aceptada.');
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (user && !isMaster) {
      const supportRef = ref(db, `users/${user.uid}/support_request`);
      const unsub = onValue(supportRef, (snap) => {
        if (snap.exists() && snap.val().status === 'pending') setIncomingSupportRequest(true);
        else setIncomingSupportRequest(false);
      });
      return () => unsub();
    }
  }, [user, isMaster]);

  useEffect(() => {
    if (!user) return;
    const msgRef = ref(db, 'global_messages/active');
    const unsub = onValue(msgRef, (snap) => {
      if (snap.exists()) {
        const msg: GlobalMessage = snap.val();
        let isTarget = false;
        if (msg.target.type === 'all') isTarget = true;
        else if (msg.target.type === 'level') isTarget = msg.target.levels?.includes(config.level) || false;
        else if (msg.target.type === 'uid') isTarget = msg.target.uids?.includes(user.uid) || false;

        if (isTarget) setGlobalMessage(msg);
        else setGlobalMessage(null);
      } else {
        setGlobalMessage(null);
      }
    });
    return () => unsub();
  }, [user, config.level]);

  const activeBroadcast = useMemo(() => {
    if (globalMessage && !dismissedIds.includes(globalMessage.id)) return globalMessage;
    if (localMessage && !dismissedIds.includes(localMessage.id)) return localMessage;
    return null;
  }, [globalMessage, localMessage, dismissedIds]);

  const handleDismissMessage = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const handleSupportResponse = async (approved: boolean) => {
    if (!user) return;
    const supportRef = ref(db, `users/${user.uid}/support_request`);
    await update(supportRef, { status: approved ? 'approved' : 'denied' });
    setIncomingSupportRequest(false);
  };

  const handleAuth = async () => {
    if (authMode === 'register' && password !== confirmPassword) { alert("Las contraseñas no coinciden."); return; }
    setAuthStatus('verifying');
    try {
      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
        await set(ref(db, `users/${cred.user.uid}/profile`), { firstName, lastName, phone, email });
      } else if (authMode === 'recover') {
        await sendPasswordResetEmail(auth, email);
        alert("Enlace enviado.");
        setAuthMode('login');
      } else { await signInWithEmailAndPassword(auth, email, password); }
      setAuthStatus('idle');
    } catch (e) { setAuthStatus('error'); }
  };

  const handleVerifyMenu = async (enteredPassword: string) => {
    if (!auth.currentUser) return false;
    setSecurityStatus('verifying');
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, enteredPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      setIsMenuUnlocked(true);
      setShowSecurityGate(false);
      setSecurityStatus('idle');
      return true;
    } catch { setSecurityStatus('error'); return false; }
  };

  if (connectionError) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center font-mono">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-2 border-dashed border-[#d4af37]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BrandPlaceholder label="LXM" />
        </div>
      </div>
      <h1 className="text-white text-xl font-black uppercase tracking-[8px] mb-4">Sincronización Pendiente</h1>
      <button onClick={() => window.location.reload()} className="bg-[#d4af37] text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest">Reintentar Enlace</button>
    </div>
  );

  if (isAuthChecking) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-16 h-16 border-4 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin mb-6"></div>
      <p className="text-[#d4af37] text-[8px] font-black uppercase tracking-[6px] animate-pulse">Verificando Credenciales Luxury</p>
    </div>
  );

  if (!user) return (
    <Guardian 
      config={config} email={email} setEmail={setEmail} password={password} setPassword={setPassword} 
      confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
      firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} 
      phone={phone} setPhone={setPhone} authMode={authMode} setAuthMode={setAuthMode} 
      handleAuth={handleAuth} authStatus={authStatus} 
    />
  );
  
  const themeStyles = config.theme === 'neon' ? { '--accent': '#00ffcc', '--bg': '#000' } :
                     config.theme === 'blue' ? { '--accent': '#00aaff', '--bg': '#020b1a' } :
                     { '--accent': config.colorA || '#d4af37', '--bg': config.colorB || '#050505' };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden font-sans" style={{ ...themeStyles, backgroundColor: (themeStyles as any)['--bg'] } as any}>
      {config.backgroundImageURL && <div className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-30 transition-all duration-1000 luxury-bg" style={{ backgroundImage: `url(${config.backgroundImageURL})` }} />}
      
      {activeBroadcast && (
        <div className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-xl w-full bg-[#0a0a0a] border border-[#d4af37]/40 rounded-[48px] p-10 text-center shadow-[0_0_100px_rgba(212,175,55,0.2)] relative overflow-hidden">
             <div className="absolute top-8 right-8 z-50">
               <CloseButton onClick={() => handleDismissMessage(activeBroadcast.id)} />
             </div>
             <div className="mb-8 flex justify-center">
                <BrandPlaceholder label="LXM" size="w-16 h-16" />
             </div>
             {activeBroadcast.type !== 'image_only' && (
               <>
                 <h2 className="text-[#d4af37] font-luxury text-3xl font-black uppercase mb-3 tracking-tighter">{activeBroadcast.title}</h2>
                 <p className="text-zinc-400 text-xs uppercase tracking-[3px] mb-8 leading-relaxed">{activeBroadcast.subtitle}</p>
               </>
             )}
             {activeBroadcast.type !== 'text_only' && activeBroadcast.imageUrl && (
               <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-800/50">
                  <img src={activeBroadcast.imageUrl} alt="Node broadcast" className="w-full object-cover max-h-64" />
               </div>
             )}
          </div>
        </div>
      )}

      {incomingSupportRequest && (
        <div className="fixed inset-0 z-[600] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
           <div className="max-w-xl w-full bg-[#0a0a0a] border-4 border-red-600 rounded-[48px] p-10 text-center shadow-[0_0_100px_rgba(220,38,38,0.2)]">
              <h2 className="text-white text-2xl font-black uppercase mb-4">Intervención Requerida</h2>
              <p className="text-zinc-400 text-sm mb-8">Un administrador maestro está solicitando acceso para soporte técnico remoto.</p>
              <div className="flex gap-4">
                <button onClick={() => handleSupportResponse(false)} className="flex-1 py-4 rounded-2xl bg-zinc-900 text-white font-black uppercase text-[10px]">Denegar</button>
                <button onClick={() => handleSupportResponse(true)} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px]">Aprobar Acceso</button>
              </div>
           </div>
        </div>
      )}

      <header className="w-full flex justify-between items-center p-4 bg-black/60 backdrop-blur-xl border-b border-white/5 z-[100] shrink-0">
        <div className="flex items-center gap-3">
          {(config.permissions?.canCustom && config.customLogoURL) ? (
             <img src={config.customLogoURL} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <LuxuryLogo size="w-8 h-8" />
          )}
          <div className="flex flex-col">
            <h1 className="font-luxury font-black text-xl leading-none" style={{ color: (themeStyles as any)['--accent'] }}>
              {isMaster ? 'LUXURY MASTER®' : config.title}
            </h1>
            <span className="text-[7px] tracking-[4px] text-zinc-600 uppercase font-black">Elite Business Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isMaster && (
            <button onClick={() => setShowMasterPanel(true)} className="bg-[#d4af37] text-black px-6 py-2 rounded-xl flex items-center gap-3 animate-pulse">
              <span className="text-[10px] font-black uppercase">Master Hub</span>
            </button>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{config.level.toUpperCase()} SYSTEM</p>
            <p className="text-[10px] text-zinc-300 font-bold">{user.email}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center overflow-hidden relative z-10 landscape-row">
        <div className="shrink-0 w-full px-6 pt-10 pb-2 text-center flex flex-col items-center space-y-4 z-10 landscape-title">
          <h2 style={{ fontSize: liveLeadName ? 'min(8vw, 64px)' : `${config.titleFontSize || 56}px`, color: (themeStyles as any)['--accent'] }} className="font-luxury font-black tracking-tighter uppercase leading-[0.85]">
            {liveLeadName ? `BIENVENIDO, ${liveLeadName}` : (isMaster ? 'LUXURY MASTER' : config.title)}
          </h2>
          <h3 style={{ fontSize: `${config.subtitleFontSize || 14}px` }} className="font-bold uppercase tracking-[0.3em] text-zinc-500 text-center max-w-2xl">
            {liveLeadName ? "RECLAMA TU PREMIO EXCLUSIVO" : config.subtitle}
          </h3>
        </div>
        
        <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 min-h-0 relative landscape-wheel-container">
          <Wheel 
            ref={wheelRef} 
            isSpinning={isSpinning} 
            setIsSpinning={setIsSpinning} 
            onFinished={(p, i) => { 
              setWinnerData({prize: p, index: i}); 
              saveWinner(p, i, pendingLeadData || undefined); 
            }} 
            onSpinRequest={() => { 
              if (config.requireRegistration && !pendingLeadData) setShowRegistration(true); 
              else wheelRef.current?.executeSpin(); 
            }} 
          />
        </div>
      </main>

      <FloatingMenu 
        onOpenCommander={() => setShowCommander(true)} 
        onOpenAdmin={() => setShowAdminWorkspace(true)} 
        onOpenLeads={() => setShowAdminPanel(true)} 
        onOpenLicense={() => setShowLicenseModal(true)} 
        onOpenSupportRequest={() => setShowSupportModal(true)} 
        onLogout={() => signOut(auth)} 
        canInstall={!!deferredPrompt}
        onInstall={installPWA}
        isUnlocked={isMenuUnlocked} 
        onRequestUnlock={() => { if (config.permissions?.hasSecurity || isMaster) setShowSecurityGate(true); else setIsMenuUnlocked(true); }} 
        onMenuClose={() => setIsMenuUnlocked(false)} 
      />
      
      {showKeyGate && <ApiKeyGate onSuccess={() => setShowKeyGate(false)} />}
      {showSecurityGate && <SecurityGate onVerify={handleVerifyMenu} onClose={() => setShowSecurityGate(false)} status={securityStatus} />}
      {showCommander && <Commander onSave={() => setShowCommander(false)} onClose={() => setShowCommander(false)} />}
      {showRegistration && (
        <RegistrationModal 
          fields={config.leadFields || []} 
          history={history} 
          onDataChange={(data) => setLiveLeadName(Object.values(data)[0]?.toString().toUpperCase() || '')} 
          onConfirm={(data) => { 
            setPendingLeadData(data); 
            setShowRegistration(false); 
            setTimeout(() => wheelRef.current?.executeSpin(), 500);
          }} 
          onClose={() => setShowRegistration(false)} 
        />
      )}
      {winnerData && <WinnerModal winner={winnerData.prize} onClose={() => { setWinnerData(null); setLiveLeadName(''); }} />}
      {showAdminWorkspace && <AdminWorkspace targetUid={supportUid || undefined} onClose={() => { setShowAdminWorkspace(false); setSupportUid(null); }} />}
      {showAdminPanel && <AdminControl onClose={() => setShowAdminPanel(false)} />}
      {showLicenseModal && <LicenseActivationModal config={config} onSuccess={updateConfig} onClose={() => setShowLicenseModal(false)} />}
      {showSupportModal && <SupportRequestModal onClose={() => setShowSupportModal(false)} />}
      {showMasterPanel && <MasterPanel onEnterSupport={(uid) => { setSupportUid(uid); setShowMasterPanel(false); setShowAdminWorkspace(true); }} onClose={() => setShowMasterPanel(false)} />}
    </div>
  );
};

const App: React.FC = () => (
  <LuxuryProvider>
    <AppContent />
  </LuxuryProvider>
);

export default App;
