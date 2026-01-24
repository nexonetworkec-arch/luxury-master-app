
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  // Registro de Service Worker para PWA (Fase 4)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('[LXM-PWA] Nodo Sincronizado:', reg.scope))
        .catch(err => console.error('[LXM-PWA] Error de Sincro:', err));
    });
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    setTimeout(() => {
      window.dispatchEvent(new Event('LXM_READY'));
    }, 500);
  } catch (error) {
    console.error("Fallo de montaje:", error);
    window.dispatchEvent(new Event('LXM_READY'));
  }
};

init();
