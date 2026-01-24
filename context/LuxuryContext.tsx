
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { ref, onValue, set, push } from '@firebase/database';
import { auth, db } from '../services/firebase';
import { LuxuryConfig, WinnerEntry, AuditLog, LuxuryUserRecord, GlobalStats, GlobalMessage, UserPermissions, AppLanguage } from '../types';

const TRANSLATIONS = {
  es: {
    welcome: "BIENVENIDO",
    master_hub: "MASTER HUB",
    node_sync: "NODO SINCRONIZADO",
    inventory: "INVENTARIO",
    security: "SEGURIDAD",
    winners: "GANADORES",
    support: "SOPORTE",
    logout: "SALIR",
    congrats: "¡FELICIDADES OPERADOR!",
    claiming: "RECLAMA TU PREMIO EXCLUSIVO",
    verifying: "VERIFICANDO CREDENCIALES"
  },
  en: {
    welcome: "WELCOME",
    master_hub: "MASTER HUB",
    node_sync: "NODE SYNCED",
    inventory: "INVENTORY",
    security: "SECURITY",
    winners: "WINNERS",
    support: "SUPPORT",
    logout: "LOGOUT",
    congrats: "CONGRATULATIONS OPERATOR!",
    claiming: "CLAIM YOUR EXCLUSIVE PRIZE",
    verifying: "VERIFYING CREDENTIALS"
  }
};

const DEFAULT_CONFIG: LuxuryConfig = {
  title: "LUXURY MASTER® AI", subtitle: "ELITE BUSINESS SYSTEM",
  prizes: ["PREMIO 1", "PREMIO 2", "PREMIO 3", "PREMIO 4"],
  colorA: "#d4af37", colorB: "#050505", theme: 'gold', level: "free",
  permissions: { 
    canExport: false, canCustom: false, canAutoRemove: false, showAds: true,
    hasAdvancedInventory: false, hasAI: false, hasSecurity: false, maxPrizes: 8
  },
  requireRegistration: false, leadFields: [],
  titleFontSize: 56, subtitleFontSize: 14, fontFamily: 'luxury',
  lang: 'es'
};

interface LuxuryContextType {
  user: User | any | null;
  config: LuxuryConfig;
  history: WinnerEntry[];
  logs: AuditLog[];
  isAdmin: boolean;
  isMaster: boolean;
  isAuthChecking: boolean;
  connectionError: string | null;
  globalUsers: LuxuryUserRecord[];
  globalStats: GlobalStats;
  localMessage: GlobalMessage | null;
  tiers: Record<string, UserPermissions>;
  t: (key: keyof typeof TRANSLATIONS.es) => string;
  setLanguage: (lang: AppLanguage) => void;
  updateConfig: (newConfig: LuxuryConfig) => Promise<void>;
  saveWinner: (prize: string, index: number, leadData?: Record<string, string>) => Promise<void>;
  resetHistory: () => Promise<void>;
  pushAuditLog: (event: string, type?: 'info' | 'warning' | 'success' | 'security') => Promise<void>;
  loginAsGuest: () => void;
  hardReset: () => Promise<void>;
}

const LuxuryContext = createContext<LuxuryContextType | undefined>(undefined);

export const LuxuryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [rawConfig, setRawConfig] = useState<LuxuryConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<WinnerEntry[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [dbIsAdmin, setDbIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [globalUsers, setGlobalUsers] = useState<LuxuryUserRecord[]>([]);
  const [localMessage, setLocalMessage] = useState<GlobalMessage | null>(null);
  const [tiers, setTiers] = useState<Record<string, UserPermissions>>({});

  // La distinción entre Admin y Master ahora se maneja por privilegios en BD, no por UID fijo en código.
  const isAdmin = useMemo(() => dbIsAdmin || user?.isGuest, [dbIsAdmin, user]);
  const isMaster = useMemo(() => dbIsAdmin, [dbIsAdmin]); // En esta versión simplificada, Admin = Master

  const t = useCallback((key: keyof typeof TRANSLATIONS.es) => {
    const lang = rawConfig.lang || 'es';
    return TRANSLATIONS[lang][key] || key;
  }, [rawConfig.lang]);

  const setLanguage = useCallback((lang: AppLanguage) => {
    updateConfig({ ...rawConfig, lang });
  }, [rawConfig]);

  const pushAuditLog = useCallback(async (event: string, type: 'info' | 'warning' | 'success' | 'security' = 'info') => {
    if (!user) return;
    const logData = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event,
      type,
      user: user.email || user.uid
    };
    await push(ref(db, `users/${user.uid}/audit_logs`), logData);
    if (type === 'security' || isAdmin) {
      await push(ref(db, `audit_master`), logData);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const unsubTiers = onValue(ref(db, 'global_configs/tiers'), (snap) => {
      if (snap.exists()) setTiers(snap.val());
    });
    return () => unsubTiers();
  }, []);

  const config = useMemo<LuxuryConfig>(() => {
    const level = rawConfig.level || 'free';
    const dynamicPermissions = tiers[level] || DEFAULT_CONFIG.permissions;
    return { ...rawConfig, permissions: dynamicPermissions };
  }, [rawConfig, tiers]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          // Verificamos si el UID existe en el nodo de administradores
          onValue(ref(db, `admins/${u.uid}`), (snap) => {
            setDbIsAdmin(snap.exists());
          });

          onValue(ref(db, `users/${u.uid}/config`), (snap) => { 
            if (snap.exists()) setRawConfig(snap.val()); 
          });

          onValue(ref(db, `users/${u.uid}/history`), (snap) => {
            setHistory(snap.exists() ? Object.values(snap.val()) : []);
          });

          if (dbIsAdmin) {
            onValue(ref(db, `audit_master`), (snap) => {
              setLogs(snap.exists() ? Object.values(snap.val()) : []);
            });
            onValue(ref(db, `users`), (snap) => {
              if (snap.exists()) {
                setGlobalUsers(Object.entries(snap.val()).map(([uid, data]: [any, any]) => ({ uid, ...data })));
              }
            });
          }
        } catch (e) { 
          setConnectionError("SYNC_ERROR"); 
        }
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribeAuth();
  }, [dbIsAdmin]);

  const updateConfig = useCallback(async (newConfig: LuxuryConfig) => {
    if (!user || user.isGuest) {
       setRawConfig(newConfig);
       return;
    }
    await set(ref(db, `users/${user.uid}/config`), newConfig);
    await pushAuditLog("CONFIG_UPDATE", "info");
  }, [user, pushAuditLog]);

  const saveWinner = useCallback(async (prize: string, index: number, leadData?: Record<string, string>) => {
    if (!user || user.isGuest) return;
    await push(ref(db, `users/${user.uid}/history`), { nombre: prize, fecha: new Date().toISOString(), leadData });
    await pushAuditLog(`WINNER: ${prize}`, "success");
  }, [user, pushAuditLog]);

  const resetHistory = useCallback(async () => {
    if (!user || user.isGuest) return;
    await set(ref(db, `users/${user.uid}/history`), null);
    await pushAuditLog("HISTORY_RESET", "warning");
  }, [user, pushAuditLog]);

  const loginAsGuest = useCallback(() => {
    setUser({ uid: "guest", email: "guest@lxm.ai", isGuest: true });
    setIsAuthChecking(false);
  }, []);

  const hardReset = useCallback(async () => {
    if (user && !user.isGuest) await set(ref(db, `users/${user.uid}`), null);
    window.location.reload();
  }, [user]);

  const globalStats = useMemo(() => ({
    totalUsers: globalUsers.length,
    activeNow: globalUsers.filter(u => u.presence?.status === 'online').length,
    byLevel: { free: 0, pro: 0, ppe: 0 },
    expiringSoon: 0,
    prizesDelivered: 0
  }), [globalUsers]);

  return (
    <LuxuryContext.Provider value={{ 
      user, config, history, logs, isAdmin, isMaster, isAuthChecking, connectionError,
      globalUsers, globalStats, localMessage, tiers, t, setLanguage,
      updateConfig, saveWinner, resetHistory, pushAuditLog, loginAsGuest, hardReset
    }}>
      {children}
    </LuxuryContext.Provider>
  );
};

export const useLuxury = () => {
  const context = useContext(LuxuryContext);
  if (!context) throw new Error("useLuxury failure");
  return context;
};
