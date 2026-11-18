import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './pages/Dashboard.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { LettersPage } from './pages/LettersPage.jsx';

function mountReactApps() {
  // 1. Dashboard Principal
  const homeContainer = document.getElementById('react-home-root');
  if (homeContainer && !homeContainer.__reactRoot) {
    const root = createRoot(homeContainer);
    homeContainer.__reactRoot = root;
    root.render(
      <React.StrictMode>
        <Dashboard />
      </React.StrictMode>
    );
    console.log('[React] Dashboard Home montado com sucesso.');
  }

  // 2. Sistema de Relatórios (Nativo)
  const relatorioContainer = document.getElementById('react-relatorios-root');
  if (relatorioContainer && !relatorioContainer.__reactRoot) {
    const root = createRoot(relatorioContainer);
    relatorioContainer.__reactRoot = root;
    root.render(
      <React.StrictMode>
        <ReportsPage />
      </React.StrictMode>
    );
    console.log('[React] Sistema de Relatórios montado com sucesso.');
  }

  // 3. Gerador de Cartas de Apresentação (Nativo)
  const cartasContainer = document.getElementById('react-cartas-root');
  if (cartasContainer && !cartasContainer.__reactRoot) {
    const root = createRoot(cartasContainer);
    cartasContainer.__reactRoot = root;
    root.render(
      <React.StrictMode>
        <LettersPage />
      </React.StrictMode>
    );
    console.log('[React] Gerador de Cartas montado com sucesso.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactApps);
} else {
  mountReactApps();
}
