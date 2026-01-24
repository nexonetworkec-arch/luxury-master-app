
import { initializeApp, getApp, getApps } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getDatabase } from '@firebase/database';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

/**
 * 🛠️ CONFIGURACIÓN DE PRODUCCIÓN LUXURY MASTER® AI
 * Sincronizado con el proyecto: luxury-master-ai
 */
const firebaseConfig = {
  apiKey: "AIzaSyABOCz969uLmXIK2McDOpReXsEvwMKCzgw",
  authDomain: "luxury-master-ai.firebaseapp.com",
  databaseURL: "https://luxury-master-ai-default-rtdb.firebaseio.com",
  projectId: "luxury-master-ai",
  storageBucket: "luxury-master-ai.firebasestorage.app",
  messagingSenderId: "377497345826",
  appId: "1:377497345826:web:98c2563b9c17d1b47c8f7b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Fase 4: Hardening con App Check
// Nota: Requiere configuración de ReCAPTCHA Enterprise en la consola de Firebase
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('6LfP5qAqAAAAAOMv2N8_8W7j9z_m9Z8k8qG_0_0_'), // Site Key Placeholder
    isTokenAutoRefreshEnabled: true
  });
}

export const auth = getAuth(app);
export const db = getDatabase(app);
