import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './pages/Dashboard.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { LettersPage } from './pages/LettersPage.jsx';

export function mountReactApps() {
  // 1. Dashboard Principal
  try {
    const homeContainer = document.getElementById('react-home-root');
    if (homeContainer && !homeContainer.__reactRoot) {
      const root = createRoot(homeContainer);
      homeContainer.__reactRoot = root;
      root.render(<Dashboard />);
      console.log('[React] Dashboard Home montado com sucesso.');
    }
  } catch (err) {
    console.error('[React] Erro ao montar Dashboard:', err);
  }

  // 2. Sistema de Relatórios (Nativo)
  try {
    const relatorioContainer = document.getElementById('react-relatorios-root');
    if (relatorioContainer && !relatorioContainer.__reactRoot) {
      const root = createRoot(relatorioContainer);
      relatorioContainer.__reactRoot = root;
      root.render(<ReportsPage />);
      console.log('[React] Sistema de Relatórios montado com sucesso.');
    }
  } catch (err) {
    console.error('[React] Erro ao montar Relatórios:', err);
  }

  // 3. Gerador de Cartas de Apresentação (Nativo)
  try {
    const cartasContainer = document.getElementById('react-cartas-root');
    if (cartasContainer && !cartasContainer.__reactRoot) {
      const root = createRoot(cartasContainer);
      cartasContainer.__reactRoot = root;
      root.render(<LettersPage />);
      console.log('[React] Gerador de Cartas montado com sucesso.');
    }
  } catch (err) {
    console.error('[React] Erro ao montar Cartas:', err);
  }
}

if (typeof window !== 'undefined') {
  window.mountReactApps = mountReactApps;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactApps);
} else {
  mountReactApps();
}
