// ========================================================
// THEME SYNCHRONIZATION (GRADE DE ASSIDUIDADE COMPLIANT)
// ========================================================
function syncTheme() {
  try {
    const parentTheme = window.parent && window.parent.document && window.parent.document.documentElement
      ? window.parent.document.documentElement.getAttribute('data-theme')
      : null;
    const theme = parentTheme || localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
  } catch (e) {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
  }
}
syncTheme();

// MutationObserver para mudanças de tema no pai (Objetiva Analytics)
try {
  if (window.parent && window.parent.document && window.parent.document.documentElement) {
    const themeObserver = new MutationObserver(() => syncTheme());
    themeObserver.observe(window.parent.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
} catch (e) {}

// BroadcastChannel para sincronização instantânea de tema
try {
  const syncChannel = new BroadcastChannel('objetiva_sync_channel');
  syncChannel.onmessage = (e) => {
    if (e.data && e.data.type === 'THEME_CHANGE' && e.data.theme) {
      document.documentElement.setAttribute('data-theme', e.data.theme);
      if (document.body) {
        document.body.setAttribute('data-theme', e.data.theme);
      }
    }
  };
} catch (e) {}

// ========================================================
// API CONFIGURATION (INTEGRATED WITH OBJETIVA ANALYTICS)
// ========================================================
const API_BASE = (window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
function getApiUrl(path) {
  return API_BASE + path;
}

// ========================================================
// STATE MANAGEMENT & PERÍODOS DA CAMPANHA (27/08 A 19/12)
// ========================================================

// Calendário Oficial Completo da Campanha: 27/08 a 19/12
const CAMPANHA_PERIODOS_PADRAO = [
  { id: 1, name: '27/08 A 03/09', start: '2026-08-27', end: '2026-09-03' },
  { id: 2, name: '04/09 A 11/09', start: '2026-09-04', end: '2026-09-11' },
  { id: 3, name: '12/09 A 19/09', start: '2026-09-12', end: '2026-09-19' },
  { id: 4, name: '21/09 A 26/09', start: '2026-09-21', end: '2026-09-26' },
  { id: 5, name: '28/09 A 30/09', start: '2026-09-28', end: '2026-09-30' },
  { id: 6, name: '01/10 A 07/10', start: '2026-10-01', end: '2026-10-07' },
  { id: 7, name: '08/10 A 14/10', start: '2026-10-08', end: '2026-10-14' },
  { id: 8, name: '15/10 A 21/10', start: '2026-10-15', end: '2026-10-21' },
  { id: 9, name: '22/10 A 31/10', start: '2026-10-22', end: '2026-10-31' },
  { id: 10, name: '01/11 A 07/11', start: '2026-11-01', end: '2026-11-07' },
  { id: 11, name: '08/11 A 14/11', start: '2026-11-08', end: '2026-11-14' },
  { id: 12, name: '15/11 A 21/11', start: '2026-11-15', end: '2026-11-21' },
  { id: 13, name: '22/11 A 30/11', start: '2026-11-22', end: '2026-11-30' },
  { id: 14, name: '01/12 A 07/12', start: '2026-12-01', end: '2026-12-07' },
  { id: 15, name: '08/12 A 14/12', start: '2026-12-08', end: '2026-12-14' },
  { id: 16, name: '15/12 A 19/12', start: '2026-12-15', end: '2026-12-19' }
];

let activeCampaignPeriods = [...CAMPANHA_PERIODOS_PADRAO];

// Assiduidade & Pontualidade State
let allPromotores = [];
let currentPromotor = null;
let activeModalPeriodIdx = 0;
let colaboradoresObjetiva = []; // Base de Colaboradores carregada do Supabase

// Arquivos Importados pelo Usuário (3 Slots)
let selectedCampFile = null;
let selectedFolhaFile = null;
let selectedPeFile = null;

// Mapas de Reconhecimento Incremental e Faltas Oficiais
let faltasAssiduidadeMap = {}; // { 'NOME': ['2026-09-02', '2026-09-10'] }
let campanhaSalvaMap = {}; // { 'NOME': { periodos: [...], pontos_extras: X } }

// Pontos Extras State
let allPeRecords = [];
let pePeriods = [];
let peStats = {};
let currentLightboxPhotos = [];
let currentLightboxIdx = 0;

// Base Points Reference
const PONTUACOES_BASE = {
  'ILHA': 50,
  'MEIA_ILHA': 25,
  'PONTA': 30,
  'MEIA_PONTA': 15,
  'NENHUM': 0
};

// ========================================================
// DOM ELEMENTS
// ========================================================

// Navigation Tabs
const tabAssiduidade = document.getElementById('tabAssiduidade');
const tabPontosExtras = document.getElementById('tabPontosExtras');
const viewAssiduidade = document.getElementById('viewAssiduidade');
const viewPontosExtras = document.getElementById('viewPontosExtras');
const tabPeBadge = document.getElementById('tabPeBadge');

// Central de Importação (3 Slots)
const boxUploadCamp = document.getElementById('boxUploadCamp');
const inputCampFile = document.getElementById('inputCampFile');
const campFileName = document.getElementById('campFileName');
const campFileMeta = document.getElementById('campFileMeta');
const campFileBadge = document.getElementById('campFileBadge');

const boxUploadFolha = document.getElementById('boxUploadFolha');
const inputFolhaFile = document.getElementById('inputFolhaFile');
const folhaFileName = document.getElementById('folhaFileName');
const folhaFileMeta = document.getElementById('folhaFileMeta');
const folhaFileBadge = document.getElementById('folhaFileBadge');

const boxUploadPe = document.getElementById('boxUploadPe');
const inputPeFile = document.getElementById('inputPeFile');
const peFileName = document.getElementById('peFileName');
const peFileMeta = document.getElementById('peFileMeta');
const peFileBadge = document.getElementById('peFileBadge');

// View Switchers (Matriz Geral vs Detalhado)
const btnMod1Matrix = document.getElementById('btnMod1Matrix');
const btnMod1Detailed = document.getElementById('btnMod1Detailed');
const mod1MatrixWrapper = document.getElementById('mod1MatrixWrapper');
const mod1DetailedWrapper = document.getElementById('mod1DetailedWrapper');
const matrixTableMod1 = document.getElementById('matrixTableMod1');
const matrixHeadMod1 = document.getElementById('matrixHeadMod1');
const matrixBodyMod1 = document.getElementById('matrixBodyMod1');

const btnMod2Cards = document.getElementById('btnMod2Cards');
const btnMod2Matrix = document.getElementById('btnMod2Matrix');
const peCardsSection = document.getElementById('peCardsSection');
const mod2MatrixWrapper = document.getElementById('mod2MatrixWrapper');
const matrixTableMod2 = document.getElementById('matrixTableMod2');
const matrixHeadMod2 = document.getElementById('matrixHeadMod2');
const matrixBodyMod2 = document.getElementById('matrixBodyMod2');

// Elementos Supabase e Base de Colaboradores
const btnSalvarSupabase = document.getElementById('btnSalvarSupabase');
const btnSalvarSupabaseText = document.getElementById('btnSalvarSupabaseText');
const staffBaseCount = document.getElementById('staffBaseCount');
const staffBaseBadge = document.getElementById('staffBaseBadge');
const staffBaseStatus = document.getElementById('staffBaseStatus');
const mesReferenciaSelect = document.getElementById('mesReferenciaSelect');

// Assiduidade Elements
const btnProcess = document.getElementById('btnProcess');
const btnProcessText = document.getElementById('btnProcessText');
const btnDownloadCampanha = document.getElementById('btnDownloadCampanha');
const btnDownloadPdfCampanha = document.getElementById('btnDownloadPdfCampanha');
const btnExportAudit = document.getElementById('btnExportAudit');

const toleranceInput = document.getElementById('toleranceInput');
const bonusInput = document.getElementById('bonusInput');
const searchInput = document.getElementById('searchInput');
const filterProjeto = document.getElementById('filterProjeto');
const filterStatus = document.getElementById('filterStatus');

const tableBody = document.getElementById('tableBody');
const rowCount = document.getElementById('rowCount');

const valTotalProm = document.getElementById('valTotalProm');
const valTotalFaltas = document.getElementById('valTotalFaltas');
const valTotalAssidPts = document.getElementById('valTotalAssidPts');
const valTotalPont = document.getElementById('valTotalPont');
const valPromBonus = document.getElementById('valPromBonus');
const valSemContrato = document.getElementById('valSemContrato');

// Modal Espelho de Ponto
const detailModal = document.getElementById('detailModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalPromotorName = document.getElementById('modalPromotorName');
const modalPromotorMeta = document.getElementById('modalPromotorMeta');
const modalPeriodTabs = document.getElementById('modalPeriodTabs');
const modalPeriodSummary = document.getElementById('modalPeriodSummary');
const modalDaysBody = document.getElementById('modalDaysBody');

// Pontos Extras Metrics
const peTotalReg = document.getElementById('peTotalReg');
const peTotalProms = document.getElementById('peTotalProms');
const peTotalPend = document.getElementById('peTotalPend');
const peTotalAprov = document.getElementById('peTotalAprov');
const peTotalRejeit = document.getElementById('peTotalRejeit');
const peTotalPts = document.getElementById('peTotalPts');
const peTotalCriativos = document.getElementById('peTotalCriativos');

// Pontos Extras Controls & Filters
const peSearchInput = document.getElementById('peSearchInput');
const peFilterPeriodo = document.getElementById('peFilterPeriodo');
const peFilterPromotor = document.getElementById('peFilterPromotor');
const peFilterStatus = document.getElementById('peFilterStatus');
const peFilterTipo = document.getElementById('peFilterTipo');
const btnPeAprovarTodos = document.getElementById('btnPeAprovarTodos');
const btnPeExportAudit = document.getElementById('btnPeExportAudit');
const btnPeExportPdf = document.getElementById('btnPeExportPdf');
const btnPeSyncExcel = document.getElementById('btnPeSyncExcel');
const btnPeSyncText = document.getElementById('btnPeSyncText');
const peGrid = document.getElementById('peGrid');
const peCountDisplay = document.getElementById('peCountDisplay');
const inputPeDedicatedFile = document.getElementById('inputPeDedicatedFile');
const btnUploadPeDedicated = document.getElementById('btnUploadPeDedicated');
const peImportPanel = document.getElementById('peImportPanel');
const peImportStatusText = document.getElementById('peImportStatusText');
const peDedicatedFileMeta = document.getElementById('peDedicatedFileMeta');
const btnPeToggleCollapse = document.getElementById('btnPeToggleCollapse');
const btnPeToggleCollapseText = document.getElementById('btnPeToggleCollapseText');

// Lightbox HD Elements
const lightboxModal = document.getElementById('lightboxModal');
const btnLightboxClose = document.getElementById('btnLightboxClose');
const btnLightboxPrev = document.getElementById('btnLightboxPrev');
const btnLightboxNext = document.getElementById('btnLightboxNext');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxSubtitle = document.getElementById('lightboxSubtitle');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxThumbnails = document.getElementById('lightboxThumbnails');
const btnLightboxOpenNewTab = document.getElementById('btnLightboxOpenNewTab');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// ========================================================
// INITIALIZATION
// ========================================================
// INITIALIZATION & RESILIENT SUPABASE RESOLVER
// ========================================================

async function ensureSupabase(maxRetries = 20, delayMs = 100) {
  for (let i = 0; i < maxRetries; i++) {
    if (window.supabase && typeof window.supabase.from === 'function') {
      return window.supabase;
    }
    try {
      if (window.parent && window.parent.supabase && typeof window.parent.supabase.from === 'function') {
        window.supabase = window.parent.supabase;
        return window.supabase;
      }
    } catch(e) {}
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      const url = window.SUPABASE_URL || 'https://xgbvokegqxqxpgznpxiq.supabase.co';
      const key = window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';
      window.supabase = window.supabase.createClient(url, key);
      return window.supabase;
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  return (window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null;
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  setupViewSwitchers();
  setupFileUploads();
  setupEventListeners();

  // 1. CARREGAMENTO IMEDIATO: Tabela Matriz da Campanha visível instantaneamente (zero travamento)
  inicializarMatrizImediatamente();

  // 2. SINCRONIZAÇÃO EM SEGUNDO PLANO COM SUPABASE (Não bloqueia UI nem trava a tela)
  sincronizarDadosComSupabase();
});

function inicializarMatrizImediatamente() {
  // Carrega baseline padrão de 99 promotores de CAMPANHA (1).xlsx
  if (window.CAMPANHA_BASE_DATA && Array.isArray(window.CAMPANHA_BASE_DATA) && window.CAMPANHA_BASE_DATA.length > 0) {
    allPromotores = JSON.parse(JSON.stringify(window.CAMPANHA_BASE_DATA));
  } else {
    allPromotores = [];
  }

  const count = allPromotores.length;
  if (staffBaseCount) {
    staffBaseCount.textContent = count > 0 
      ? `${count} colaboradores carregados da base`
      : 'Aguardando colaboradores da base...';
  }
  if (staffBaseBadge) {
    staffBaseBadge.textContent = count > 0 ? 'Carregado' : 'Pendente';
    staffBaseBadge.className = count > 0 ? 'file-status ready' : 'file-status';
  }

  // Renderiza imediatamente na tela em 10ms
  updateMetrics();
  applyFilters();

  // Se ainda não carregou curadoria individual, preenche métricas da aba de pontos extras com a base da planilha
  const promsComExtras = allPromotores.filter(p => (p.pontos_extras || 0) > 0);
  const totalPontosExtras = allPromotores.reduce((acc, p) => acc + (p.pontos_extras || 0), 0);
  if (promsComExtras.length > 0 && (!allPeRecords || allPeRecords.length === 0)) {
    updatePeMetrics({
      total: promsComExtras.length,
      promotores: promsComExtras.length,
      pendentes: 0,
      aprovados: promsComExtras.length,
      rejeitados: 0,
      pontos_gerados: totalPontosExtras,
      criativos: 0
    });
  }

  if (count > 0) {
    btnDownloadCampanha.disabled = false;
    if (btnSalvarSupabase) btnSalvarSupabase.disabled = false;
  }
}

function setupTabNavigation() {
  const tabs = [
    { btn: tabAssiduidade, view: viewAssiduidade },
    { btn: tabPontosExtras, view: viewPontosExtras }
  ];

  tabs.forEach(t => {
    t.btn.addEventListener('click', () => {
      tabs.forEach(o => {
        o.btn.classList.remove('active');
        o.view.classList.remove('active');
      });
      t.btn.classList.add('active');
      t.view.classList.add('active');

      // Se mudou para a aba de pontos extras, atualiza matriz e métricas
      if (t.view === viewPontosExtras) {
        const promsComExtras = allPromotores.filter(p => (p.pontos_extras || 0) > 0);
        const totalPontosExtras = allPromotores.reduce((acc, p) => acc + (p.pontos_extras || 0), 0);
        if (!allPeRecords || allPeRecords.length === 0) {
          updatePeMetrics({
            total: promsComExtras.length,
            promotores: promsComExtras.length,
            pendentes: 0,
            aprovados: promsComExtras.length,
            rejeitados: 0,
            pontos_gerados: totalPontosExtras,
            criativos: 0
          });
        }
        if (mod2MatrixWrapper && mod2MatrixWrapper.style.display !== 'none') {
          renderMatrixTable('matrixHeadMod2', 'matrixBodyMod2', allPromotores, activeCampaignPeriods, 'pontos_extras');
        }
      }
    });
  });
}

function setupViewSwitchers() {
  // Módulo 1 (Assiduidade e Pontualidade) Switcher
  if (btnMod1Matrix && btnMod1Detailed) {
    btnMod1Matrix.addEventListener('click', () => {
      btnMod1Matrix.classList.add('active');
      btnMod1Detailed.classList.remove('active');
      if (mod1MatrixWrapper) mod1MatrixWrapper.style.display = 'block';
      if (mod1DetailedWrapper) mod1DetailedWrapper.style.display = 'none';
      renderMatrixTable('matrixHeadMod1', 'matrixBodyMod1', allPromotores, activeCampaignPeriods, 'assiduidade');
    });

    btnMod1Detailed.addEventListener('click', () => {
      btnMod1Detailed.classList.add('active');
      btnMod1Matrix.classList.remove('active');
      if (mod1MatrixWrapper) mod1MatrixWrapper.style.display = 'none';
      if (mod1DetailedWrapper) mod1DetailedWrapper.style.display = 'block';
      renderTable(allPromotores);
    });
  }

  // Módulo 2 (Pontos Extras) Switcher
  if (btnMod2Cards && btnMod2Matrix) {
    btnMod2Cards.addEventListener('click', () => {
      btnMod2Cards.classList.add('active');
      btnMod2Matrix.classList.remove('active');
      if (peCardsSection) peCardsSection.style.display = 'flex';
      if (mod2MatrixWrapper) mod2MatrixWrapper.style.display = 'none';
    });

    btnMod2Matrix.addEventListener('click', () => {
      btnMod2Matrix.classList.add('active');
      btnMod2Cards.classList.remove('active');
      if (peCardsSection) peCardsSection.style.display = 'none';
      if (mod2MatrixWrapper) mod2MatrixWrapper.style.display = 'block';
      renderMatrixTable('matrixHeadMod2', 'matrixBodyMod2', allPromotores, activeCampaignPeriods, 'pontos_extras');
    });
  }
}

// ========================================================
// CENTRAL DE IMPORTAÇÃO (3 PLANILHAS INTERATIVAS)
// ========================================================
function setupFileUploads() {
  // 1. Planilha de Campanha / Efetividade
  if (boxUploadCamp && inputCampFile) {
    boxUploadCamp.addEventListener('click', () => inputCampFile.click());
    inputCampFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedCampFile = e.target.files[0];
        if (campFileName) campFileName.textContent = selectedCampFile.name;
        if (campFileMeta) campFileMeta.textContent = `${(selectedCampFile.size / 1024).toFixed(1)} KB • Arquivo selecionado`;
        if (campFileBadge) {
          campFileBadge.textContent = "Carregado";
          campFileBadge.className = "file-status ready";
        }
        showToast(`Planilha de Campanha "${selectedCampFile.name}" carregada!`, 'success');
      }
    });
  }

  // 2. Folha Reconciliada
  if (boxUploadFolha && inputFolhaFile) {
    boxUploadFolha.addEventListener('click', () => inputFolhaFile.click());
    inputFolhaFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedFolhaFile = e.target.files[0];
        if (folhaFileName) folhaFileName.textContent = selectedFolhaFile.name;
        if (folhaFileMeta) folhaFileMeta.textContent = `${(selectedFolhaFile.size / 1024).toFixed(1)} KB • Arquivo selecionado`;
        if (folhaFileBadge) {
          folhaFileBadge.textContent = "Carregado";
          folhaFileBadge.className = "file-status ready";
        }
        showToast(`Folha Reconciliada "${selectedFolhaFile.name}" carregada!`, 'success');
      }
    });
  }

  // 3. Relatório de Ponto Extra
  if (boxUploadPe && inputPeFile) {
    boxUploadPe.addEventListener('click', () => inputPeFile.click());
    inputPeFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedPeFile = e.target.files[0];
        if (peFileName) peFileName.textContent = selectedPeFile.name;
        if (peFileMeta) peFileMeta.textContent = `${(selectedPeFile.size / 1024).toFixed(1)} KB • Arquivo selecionado`;
        if (peFileBadge) {
          peFileBadge.textContent = "Carregado";
          peFileBadge.className = "file-status ready";
        }
        showToast(`Relatório de Pontos Extras "${selectedPeFile.name}" carregado!`, 'potencia');
      }
    });
  }

  // Drag & drop visual feedback
  [boxUploadCamp, boxUploadFolha, boxUploadPe].forEach(box => {
    if (!box) return;
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('dragover');
    });
    box.addEventListener('dragleave', () => box.classList.remove('dragover'));
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (box === boxUploadCamp) {
          selectedCampFile = file;
          if (campFileName) campFileName.textContent = file.name;
          if (campFileBadge) { campFileBadge.textContent = "Carregado"; campFileBadge.className = "file-status ready"; }
        } else if (box === boxUploadFolha) {
          selectedFolhaFile = file;
          if (folhaFileName) folhaFileName.textContent = file.name;
          if (folhaFileBadge) { folhaFileBadge.textContent = "Carregado"; folhaFileBadge.className = "file-status ready"; }
        } else if (box === boxUploadPe) {
          selectedPeFile = file;
          if (peFileName) peFileName.textContent = file.name;
          if (peFileBadge) { peFileBadge.textContent = "Carregado"; peFileBadge.className = "file-status ready"; }
        }
        showToast(`Arquivo "${file.name}" importado por arrasto!`, 'success');
      }
    });
  });
}

function setupEventListeners() {
  btnProcess.addEventListener('click', processScores);
  if (btnSalvarSupabase) {
    btnSalvarSupabase.addEventListener('click', salvarCampanhaNoSupabase);
  }
  btnDownloadCampanha.addEventListener('click', () => window.location.href = getApiUrl('/api/download'));
  if (btnDownloadPdfCampanha) {
    btnDownloadPdfCampanha.addEventListener('click', () => window.location.href = getApiUrl('/api/download-pdf-campanha'));
  }
  btnExportAudit.addEventListener('click', () => window.location.href = getApiUrl('/api/audit-export'));

  searchInput.addEventListener('input', applyFilters);
  filterProjeto.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  btnCloseModal.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  // Pontos Extras listeners
  peSearchInput.addEventListener('input', renderPeCards);
  peFilterPeriodo.addEventListener('change', renderPeCards);
  peFilterPromotor.addEventListener('change', renderPeCards);
  peFilterStatus.addEventListener('change', renderPeCards);
  peFilterTipo.addEventListener('change', renderPeCards);

  btnPeAprovarTodos.addEventListener('click', handleAprovarTodosVisiveis);
  if (btnPeExportAudit) btnPeExportAudit.addEventListener('click', () => window.location.href = getApiUrl('/api/pontos-extras/exportar-excel'));
  if (btnPeExportPdf) {
    btnPeExportPdf.addEventListener('click', () => window.location.href = getApiUrl('/api/pontos-extras/exportar-pdf'));
  }
  btnPeSyncExcel.addEventListener('click', handleSyncToCampaign);

  // Upload Dedicado de Pontos Extras
  if (btnUploadPeDedicated && inputPeDedicatedFile) {
    btnUploadPeDedicated.addEventListener('click', () => inputPeDedicatedFile.click());
    inputPeDedicatedFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processarArquivoPeUpload(e.target.files[0]);
      }
    });
  }

  if (peImportPanel && inputPeDedicatedFile) {
    peImportPanel.addEventListener('dragover', (e) => {
      e.preventDefault();
      peImportPanel.classList.add('dragover');
    });
    peImportPanel.addEventListener('dragleave', () => peImportPanel.classList.remove('dragover'));
    peImportPanel.addEventListener('drop', (e) => {
      e.preventDefault();
      peImportPanel.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processarArquivoPeUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // Toggle de colapso de grupos
  let allPeGroupsExpanded = true;
  if (btnPeToggleCollapse) {
    btnPeToggleCollapse.addEventListener('click', () => {
      allPeGroupsExpanded = !allPeGroupsExpanded;
      const bodies = peGrid.querySelectorAll('.pe-group-period-body');
      bodies.forEach(b => {
        b.style.display = allPeGroupsExpanded ? 'flex' : 'none';
      });
      if (btnPeToggleCollapseText) {
        btnPeToggleCollapseText.textContent = allPeGroupsExpanded ? 'Recolher Grupos' : 'Expandir Grupos';
      }
    });
  }

  // Lightbox listeners
  btnLightboxClose.addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
  btnLightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  btnLightboxNext.addEventListener('click', () => navigateLightbox(1));
  btnLightboxOpenNewTab.addEventListener('click', () => {
    if (currentLightboxPhotos[currentLightboxIdx]) {
      window.open(currentLightboxPhotos[currentLightboxIdx], '_blank');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    } else if (detailModal.classList.contains('active') && e.key === 'Escape') {
      closeModal();
    }
  });
}

// ========================================================
// TOAST NOTIFICATIONS
// ========================================================
function showToast(message, type = 'success', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'potencia') icon = '⚡';
  if (type === 'danger') icon = '✗';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========================================================
// SINCRONIZAÇÃO EM SEGUNDO PLANO COM SUPABASE
// ========================================================

async function sincronizarDadosComSupabase() {
  const sb = await ensureSupabase();
  if (!sb) {
    console.warn("Supabase não disponível no momento. Utilizando dados locais da campanha.");
    return;
  }

  try {
    // 1. Carrega faltas oficiais registradas em tb_assiduidade
    await carregarFaltasOficiaisAssiduidade();

    // 2. Carrega campanha salva de tb_campanha_colaboradores (incremental)
    await carregarCampanhaSalvaIncremental();

    // 3. Atualiza ou vincula novos colaboradores cadastrados no Objetiva Analytics
    await carregarColaboradoresObjetiva();

    // 4. Carrega registros de pontos extras
    await carregarPontosExtrasDoSupabase();

    // 5. Aplica as faltas oficiais de assiduidade em cada período de allPromotores
    aplicarFaltasEmAllPromotores();

    // 6. Atualiza interface e ambas as matrizes de visualização
    updateMetrics();
    applyFilters();

    const count = allPromotores.length;
    if (staffBaseCount) {
      staffBaseCount.textContent = `${count} colaboradores ativos vinculados`;
    }
    if (staffBaseBadge) {
      staffBaseBadge.textContent = "Sincronizado";
      staffBaseBadge.className = "file-status ready";
    }
  } catch (err) {
    console.warn("Aviso na sincronização em segundo plano:", err);
  }
}

// ========================================================
// RECONHECIMENTO DIRETO DE FALTAS DA TABELA DE ASSIDUIDADE
// ========================================================

async function carregarFaltasOficiaisAssiduidade(startDate = '2026-08-27', endDate = '2026-12-19') {
  const sb = await ensureSupabase();
  if (!sb) return {};
  try {
    let allFaltas = [];
    let from = 0;
    const step = 999;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await sb
        .from('tb_assiduidade')
        .select('collaborator_name, date, status, observation')
        .eq('status', 'FT')
        .gte('date', startDate)
        .lte('date', endDate)
        .range(from, from + step);

      if (error) {
        console.warn('Erro ao consultar faltas de tb_assiduidade:', error);
        break;
      }
      if (data && data.length > 0) {
        allFaltas = allFaltas.concat(data);
        from += step + 1;
      }
      if (!data || data.length <= step) {
        hasMore = false;
      }
    }

    const map = {};
    allFaltas.forEach(f => {
      const nome = (f.collaborator_name || '').trim().toUpperCase();
      if (!nome) return;
      if (!map[nome]) map[nome] = [];
      map[nome].push(f.date);
    });

    faltasAssiduidadeMap = map;
    console.log(`[Assiduidade] ${allFaltas.length} faltas 'FT' oficiais carregadas para ${Object.keys(map).length} promotores.`);
    return map;
  } catch (err) {
    console.error('Falha ao carregar faltas da tb_assiduidade:', err);
    return {};
  }
}

// Aplica as faltas registradas em cada ciclo de cada promotor
function aplicarFaltasEmAllPromotores() {
  if (!faltasAssiduidadeMap || Object.keys(faltasAssiduidadeMap).length === 0) return;

  allPromotores.forEach(prom => {
    const nomeClean = (prom.nome || '').trim().toUpperCase();
    const faltasDates = faltasAssiduidadeMap[nomeClean];
    if (!faltasDates || faltasDates.length === 0) return;

    faltasDates.forEach(dateStr => {
      const per = activeCampaignPeriods.find(p => dateStr >= p.start && dateStr <= p.end);
      if (per) {
        const pObj = (prom.periodos || []).find(x => x.period_id === per.id || x.period_name === per.name);
        if (pObj) {
          pObj.faltas = (pObj.faltas || 0) + 1;
          pObj.pontos_assiduidade = -50 * pObj.faltas;
          pObj.ganhou_bonus = false;
          const extras = (pObj.ilha || 0) + (pObj.meia_ilha || 0) + (pObj.ponta || 0) + (pObj.meia_ponta || 0);
          pObj.total_periodo = pObj.pontos_assiduidade + (pObj.pontos_pontualidade_total || 0) + extras;
        }
      }
    });
  });
}

// ========================================================
// RECONHECIMENTO INCREMENTAL DE CAMPANHA SALVA
// ========================================================

async function carregarCampanhaSalvaIncremental() {
  const sb = await ensureSupabase();
  if (!sb) return;
  try {
    const { data: savedColabs, error } = await sb
      .from('tb_campanha_colaboradores')
      .select('*');

    if (!error && savedColabs && savedColabs.length > 0) {
      const map = {};
      savedColabs.forEach(c => {
        const nomeClean = (c.nome || '').trim().toUpperCase();
        map[nomeClean] = c;
      });
      campanhaSalvaMap = map;
      console.log(`[Campanha Incremental] ${savedColabs.length} registros previamente salvos encontrados no Supabase.`);

      // Mescla com allPromotores respeitando dados salvos
      savedColabs.forEach(saved => {
        const nomeClean = (saved.nome || '').trim().toUpperCase();
        const existing = allPromotores.find(p => p.nome === nomeClean);
        if (existing) {
          if (saved.periodos && saved.periodos.length > 0) {
            existing.periodos = saved.periodos;
          }
          if (saved.pontos_extras !== undefined) {
            existing.pontos_extras = saved.pontos_extras;
          }
          if (saved.status_folha) {
            existing.status = saved.status_folha;
          }
        } else {
          allPromotores.push({
            nome: saved.nome,
            projeto: saved.projeto || 'GERAL',
            equipe: saved.equipe || 'PROMOTOR',
            cargo: saved.cargo || 'PROMOTOR',
            contrato: saved.contrato || 'ATIVO',
            status: saved.status_folha || 'OK',
            sem_contrato: false,
            pontos_extras: saved.pontos_extras || 0,
            periodos: saved.periodos || []
          });
        }
      });
    }
  } catch (err) {
    console.warn("Aviso ao carregar dados salvos da campanha:", err);
  }
}

// ========================================================
// BASE DE COLABORADORES (SUPABASE)
// ========================================================

async function carregarColaboradoresObjetiva() {
  const sb = await ensureSupabase();
  if (!sb) return [];

  try {
    // 1. Tenta tb_colaboradores
    const { data: staffData } = await sb
      .from('tb_colaboradores')
      .select('*')
      .order('nome', { ascending: true });

    let novos = [];
    if (staffData && staffData.length > 0) {
      novos = staffData
        .filter(s => s.ativo !== false && s.nome && s.nome.trim())
        .map(s => ({
          nome: s.nome.trim().toUpperCase(),
          projeto: s.projeto || 'GERAL',
          cargo: s.cargo || 'PROMOTOR',
          equipe: s.cargo || s.projeto || 'PROMOTOR'
        }));
    } else {
      // 2. Se vazio, consulta agentes de tb_planilha
      const { data: planData } = await sb
        .from('tb_planilha')
        .select('agente, projeto, lider')
        .not('agente', 'is', null);

      if (planData && planData.length > 0) {
        const unique = {};
        planData.forEach(r => {
          const nome = (r.agente || '').trim().toUpperCase();
          if (nome && !unique[nome]) {
            unique[nome] = {
              nome: nome,
              projeto: r.projeto || 'GERAL',
              cargo: 'PROMOTOR',
              equipe: r.lider || r.projeto || 'PROMOTOR'
            };
          }
        });
        novos = Object.values(unique);
      }
    }

    colaboradoresObjetiva = novos;

    // Se houver novos colaboradores que não estão no baseline da campanha, adiciona com os 16 ciclos
    novos.forEach(novo => {
      const existe = allPromotores.some(p => p.nome === novo.nome);
      if (!existe) {
        const periodos = activeCampaignPeriods.map(p => ({
          period_id: p.id,
          period_name: p.name,
          pontos_assiduidade: 0,
          efetividade: 100,
          pontos_pontualidade_total: 0,
          dias_pontuais: 0,
          dias_trabalhados: 6,
          faltas: 0,
          ilha: 0,
          meia_ilha: 0,
          ponta: 0,
          meia_ponta: 0,
          total_periodo: 0,
          ganhou_bonus: false
        }));

        allPromotores.push({
          nome: novo.nome,
          projeto: novo.projeto,
          equipe: novo.equipe,
          cargo: novo.cargo,
          contrato: 'ATIVO',
          status: 'OK',
          sem_contrato: false,
          pontos_extras: 0,
          periodos
        });
      }
    });

    return colaboradoresObjetiva;
  } catch (err) {
    console.error("Erro ao carregar colaboradores do Objetiva:", err);
    return [];
  }
}

// ========================================================
// PROCESSAMENTO PRINCIPAL (INCREMENTAL + FALTAS ASSIDUIDADE)
// ========================================================

async function processScores() {
  btnProcess.classList.add('is-loading');
  btnProcess.disabled = true;
  btnProcessText.textContent = "Processando Planilhas...";

  // 1. Tenta envio ao servidor backend Flask (se ativo com timeout de 3.5s)
  try {
    const formData = new FormData();
    formData.append('tolerance', toleranceInput.value);
    formData.append('bonus', bonusInput.value);

    if (selectedCampFile) formData.append('camp_file', selectedCampFile);
    if (selectedFolhaFile) formData.append('folha_file', selectedFolhaFile);
    if (selectedPeFile) formData.append('pe_file', selectedPeFile);

    if (colaboradoresObjetiva && colaboradoresObjetiva.length > 0) {
      formData.append('colaboradores', JSON.stringify(colaboradoresObjetiva));
    }
    if (faltasAssiduidadeMap && Object.keys(faltasAssiduidadeMap).length > 0) {
      formData.append('faltas_assiduidade', JSON.stringify(faltasAssiduidadeMap));
    }
    if (campanhaSalvaMap && Object.keys(campanhaSalvaMap).length > 0) {
      formData.append('campanha_salva', JSON.stringify(campanhaSalvaMap));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(getApiUrl('/api/process'), {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.success) {
      const data = json.data;
      allPromotores = data.promotores;
      if (data.metrics && data.metrics.periods && data.metrics.periods.length > 0) {
        activeCampaignPeriods = data.metrics.periods.map((name, idx) => ({ id: idx + 1, name: name }));
      }
      updateMetrics(data.metrics);
      applyFilters();
      btnDownloadCampanha.disabled = false;
      btnExportAudit.disabled = false;
      if (btnSalvarSupabase) btnSalvarSupabase.disabled = false;
      showToast("Campanha processada com reconhecimento de faltas e modo incremental!", "success");
      return;
    }
  } catch (backendErr) {
    console.log("Backend Flask não respondeu ou em espera. Acionando motor de processamento no cliente...", backendErr);
  }

  // 2. Fallback de alta performance diretamente no cliente com SheetJS
  try {
    await executarProcessamentoClienteComSheetJS();
  } catch (err) {
    console.error("Erro no processamento cliente:", err);
    showToast("Erro ao processar: " + err.message, "danger");
  } finally {
    btnProcess.classList.remove('is-loading');
    btnProcess.disabled = false;
    btnProcessText.textContent = "Processar Pontuações";
  }
}

// Processador no cliente com suporte a leitura de planilhas .xlsx e .csv
async function executarProcessamentoClienteComSheetJS() {
  // Se o usuário selecionou uma nova planilha de Campanha (.xlsx)
  if (selectedCampFile && typeof XLSX !== 'undefined') {
    const parsed = await parseCampanhaComSheetJS(selectedCampFile);
    if (parsed && parsed.length > 0) {
      allPromotores = parsed;
    }
  }

  // Aplica faltas oficiais de tb_assiduidade
  aplicarFaltasEmAllPromotores();

  // Aplica dados previamente salvos (modo incremental)
  if (campanhaSalvaMap && Object.keys(campanhaSalvaMap).length > 0) {
    allPromotores.forEach(prom => {
      const saved = campanhaSalvaMap[prom.nome];
      if (saved && saved.periodos && saved.periodos.length > 0) {
        // Preserva períodos que já tinham sido salvos
        saved.periodos.forEach(savedPer => {
          const pObj = prom.periodos.find(x => x.period_id === savedPer.period_id || x.period_name === savedPer.period_name);
          if (pObj && (savedPer.pontos_assiduidade !== 0 || savedPer.ilha > 0 || savedPer.ponta > 0)) {
            Object.assign(pObj, savedPer);
          }
        });
      }
    });
  }

  updateMetrics();
  applyFilters();

  btnDownloadCampanha.disabled = false;
  if (btnSalvarSupabase) btnSalvarSupabase.disabled = false;
  showToast("✓ Planilhas reconhecidas e processadas no cliente com sucesso!", "success");
}

async function parseCampanhaComSheetJS(file) {
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheetName = wb.SheetNames.includes('Ativos') ? 'Ativos' : wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!data || data.length < 3) return null;

    const list = [];
    for (let r = 2; r < data.length; r++) {
      const row = data[r];
      if (!row || !row[0] || !String(row[0]).trim()) continue;
      const nome = String(row[0]).trim().toUpperCase();
      const projeto = String(row[1] || 'COMPARTILHADO').trim().toUpperCase();
      const equipe = String(row[2] || 'COMPARTILHADO').trim().toUpperCase();

      const periodos = activeCampaignPeriods.map((p, idx) => {
        const colStart = 3 + (idx * 8);
        const assid = Number(row[colStart]) || 0;
        const efet = Number(row[colStart + 1]) || 100;
        const pont = Number(row[colStart + 2]) || 0;
        const ilha = Number(row[colStart + 3]) || 0;
        const meiaIlha = Number(row[colStart + 4]) || 0;
        const ponta = Number(row[colStart + 5]) || 0;
        const meiaPonta = Number(row[colStart + 6]) || 0;
        const tot = Number(row[colStart + 7]) || (assid + pont + ilha + meiaIlha + ponta + meiaPonta);

        return {
          period_id: p.id,
          period_name: p.name,
          pontos_assiduidade: assid,
          efetividade: efet,
          pontos_pontualidade_total: pont,
          dias_pontuais: pont,
          dias_trabalhados: 6,
          faltas: assid < 0 ? Math.abs(Math.round(assid / 50)) : 0,
          ilha, meia_ilha: meiaIlha, ponta, meia_ponta: meiaPonta,
          total_periodo: tot,
          ganhou_bonus: false
        };
      });

      list.push({
        nome,
        projeto,
        equipe,
        cargo: 'PROMOTOR',
        contrato: 'ATIVO',
        status: 'OK',
        sem_contrato: false,
        pontos_extras: periodos.reduce((acc, per) => acc + per.ilha + per.meia_ilha + per.ponta + per.meia_ponta, 0),
        periodos
      });
    }
    return list;
  } catch (e) {
    console.warn("Erro ao fazer parse de campanha com SheetJS:", e);
    return null;
  }
}

function updateMetrics(metrics) {
  if (!metrics) {
    const totalProm = allPromotores.length;
    let totalFaltas = 0;
    let totalPont = 0;
    let promBonus = 0;
    let semContrato = 0;

    allPromotores.forEach(p => {
      if (p.sem_contrato) semContrato++;
      if (p.periodos) {
        p.periodos.forEach(per => {
          totalFaltas += (per.faltas || 0);
          totalPont += (per.pontos_pontualidade_total || 0);
          if (per.ganhou_bonus) promBonus++;
        });
      }
    });

    metrics = {
      total_promotores: totalProm,
      total_faltas: totalFaltas,
      total_pontos_pontualidade: totalPont,
      promotores_com_bonus: promBonus,
      total_sem_contrato: semContrato
    };
  }

  if (valTotalProm) valTotalProm.textContent = metrics.total_promotores;
  if (valTotalFaltas) valTotalFaltas.textContent = metrics.total_faltas;
  if (valTotalAssidPts) valTotalAssidPts.textContent = `${(metrics.total_faltas || 0) * -50} pontos deduzidos no mês`;
  if (valTotalPont) valTotalPont.textContent = `+${metrics.total_pontos_pontualidade || 0} pts`;
  if (valPromBonus) valPromBonus.textContent = metrics.promotores_com_bonus || 0;
  if (valSemContrato) valSemContrato.textContent = metrics.total_sem_contrato || 0;
}

// ========================================================
// PONTOS EXTRAS: SOMENTE APÓS APROVAÇÃO DA CURADORIA
// ========================================================
// Ilha, Meia Ilha, Ponta e Meia Ponta só entram na campanha quando o time
// aprova a foto na curadoria (status APROVADO). Qualquer valor vindo da
// planilha base, do xlsx importado ou de registros salvos é descartado.
const TIPO_PARA_CAMPO_EXTRA = {
  'ILHA': 'ilha',
  'MEIA_ILHA': 'meia_ilha',
  'PONTA': 'ponta',
  'MEIA_PONTA': 'meia_ponta'
};

function defaultConquistas(tipo = 'ILHA', criativo = false) {
  const c = {
    ilha: { qtd: 0, criativo: 0 },
    meia_ilha: { qtd: 0, criativo: 0 },
    ponta: { qtd: 0, criativo: 0 },
    meia_ponta: { qtd: 0, criativo: 0 }
  };
  const key = (tipo || '').toLowerCase();
  if (c[key]) {
    c[key].qtd = 1;
    c[key].criativo = criativo ? 1 : 0;
  }
  return c;
}

function parseConquistas(rawTipo, criativo = false) {
  if (typeof rawTipo === 'object' && rawTipo !== null) {
    return {
      ilha: { qtd: Math.max(0, Number(rawTipo.ilha?.qtd) || 0), criativo: Math.max(0, Number(rawTipo.ilha?.criativo) || 0) },
      meia_ilha: { qtd: Math.max(0, Number(rawTipo.meia_ilha?.qtd) || 0), criativo: Math.max(0, Number(rawTipo.meia_ilha?.criativo) || 0) },
      ponta: { qtd: Math.max(0, Number(rawTipo.ponta?.qtd) || 0), criativo: Math.max(0, Number(rawTipo.ponta?.criativo) || 0) },
      meia_ponta: { qtd: Math.max(0, Number(rawTipo.meia_ponta?.qtd) || 0), criativo: Math.max(0, Number(rawTipo.meia_ponta?.criativo) || 0) }
    };
  }
  if (typeof rawTipo === 'string' && rawTipo.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawTipo);
      return parseConquistas(parsed, criativo);
    } catch(e) {}
  }
  return defaultConquistas(rawTipo, criativo);
}

function calculateConquestPoints(conquistas) {
  if (!conquistas) {
    return { total: 0, byTipo: { ilha: 0, meia_ilha: 0, ponta: 0, meia_ponta: 0 } };
  }
  const calcForType = (item, base) => {
    if (!item) return 0;
    const qtd = Math.max(0, Number(item.qtd) || 0);
    const criativo = Math.max(0, Math.min(qtd, Number(item.criativo) || 0));
    const normal = qtd - criativo;
    return (normal * base) + (criativo * base * 2);
  };

  const ptsIlha = calcForType(conquistas.ilha, 50);
  const ptsMeiaIlha = calcForType(conquistas.meia_ilha, 25);
  const ptsPonta = calcForType(conquistas.ponta, 30);
  const ptsMeiaPonta = calcForType(conquistas.meia_ponta, 15);

  return {
    total: ptsIlha + ptsMeiaIlha + ptsPonta + ptsMeiaPonta,
    byTipo: {
      ilha: ptsIlha,
      meia_ilha: ptsMeiaIlha,
      ponta: ptsPonta,
      meia_ponta: ptsMeiaPonta
    }
  };
}

function normalizarDataParaISO(valor) {
  if (!valor) return '';
  const s = String(valor).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
}

function localizarPeriodoDoRegistro(rec) {
  if (rec.periodo) {
    const porNome = activeCampaignPeriods.find(p => p.name === rec.periodo);
    if (porNome) return porNome;
  }
  const iso = normalizarDataParaISO(rec.data);
  if (iso) {
    return activeCampaignPeriods.find(p => p.start && p.end && iso >= p.start && iso <= p.end) || null;
  }
  return null;
}

function aplicarPontosExtrasAprovados() {
  // 1. Agrupa pontos aprovados da curadoria por promotor + período + loja + tipo
  // Regra de ouro da campanha: cada loja no período pontua uma única vez
  // Se o status for REJEITADO ou PENDENTE, pontuação é ZERADA
  const aprovadosMap = {}; // { NOME: { periodId: { ilha, meia_ilha, ponta, meia_ponta } } }
  const lojasProcessadasNoPeriodo = new Set();

  (allPeRecords || []).forEach(rec => {
    // Caso rejeitado ou pendente, não pontua no período (fica ZERADO)
    if (rec.status !== 'APROVADO') return;

    const nome = String(rec.promotor_campanha || rec.promotor_csv || '').trim().toUpperCase();
    if (!nome) return;
    const per = localizarPeriodoDoRegistro(rec);
    if (!per) return;
    const pdv = String(rec.pdv || 'LOJA').trim().toUpperCase();

    // Chave única para garantir 1 avaliação por loja dentro do período avaliado
    const storeKey = `${nome}__${per.id}__${pdv}`;
    if (lojasProcessadasNoPeriodo.has(storeKey)) return;
    lojasProcessadasNoPeriodo.add(storeKey);

    if (!aprovadosMap[nome]) aprovadosMap[nome] = {};
    if (!aprovadosMap[nome][per.id]) aprovadosMap[nome][per.id] = { ilha: 0, meia_ilha: 0, ponta: 0, meia_ponta: 0 };

    if (rec.conquistas) {
      const { byTipo } = calculateConquestPoints(rec.conquistas);
      aprovadosMap[nome][per.id].ilha += byTipo.ilha;
      aprovadosMap[nome][per.id].meia_ilha += byTipo.meia_ilha;
      aprovadosMap[nome][per.id].ponta += byTipo.ponta;
      aprovadosMap[nome][per.id].meia_ponta += byTipo.meia_ponta;
    } else {
      const campo = TIPO_PARA_CAMPO_EXTRA[rec.tipo];
      if (campo) {
        const pts = calculateLocalPoints(rec.tipo, rec.criativo);
        aprovadosMap[nome][per.id][campo] += pts;
      }
    }
  });

  // 2. Preserva os pontos da base (planilha/banco) e SOMA os pontos curados/aprovados
  allPromotores.forEach(prom => {
    const nome = String(prom.nome || '').trim().toUpperCase();
    const doPromotor = aprovadosMap[nome] || {};
    let totalExtras = 0;

    // Busca dados originais na base window.CAMPANHA_BASE_DATA para não perder os pontos da planilha
    const baseProm = (window.CAMPANHA_BASE_DATA || []).find(b => String(b.nome || '').trim().toUpperCase() === nome);

    (prom.periodos || []).forEach(per => {
      const ref = activeCampaignPeriods.find(p => p.id === per.period_id || p.name === per.period_name);
      const basePer = baseProm && (baseProm.periodos || []).find(p => p.period_id === per.period_id || p.period_name === per.period_name);

      const baseIlha = (basePer && Number(basePer.ilha)) || (Number(per.ilha) || 0);
      const baseMeiaIlha = (basePer && Number(basePer.meia_ilha)) || (Number(per.meia_ilha) || 0);
      const basePonta = (basePer && Number(basePer.ponta)) || (Number(per.ponta) || 0);
      const baseMeiaPonta = (basePer && Number(basePer.meia_ponta)) || (Number(per.meia_ponta) || 0);

      const ext = (ref && doPromotor[ref.id]) || { ilha: 0, meia_ilha: 0, ponta: 0, meia_ponta: 0 };

      // Mantém os pontos conquistados na planilha e soma novas aprovações de curadoria
      per.ilha = baseIlha + ext.ilha;
      per.meia_ilha = baseMeiaIlha + ext.meia_ilha;
      per.ponta = basePonta + ext.ponta;
      per.meia_ponta = baseMeiaPonta + ext.meia_ponta;

      const extras = per.ilha + per.meia_ilha + per.ponta + per.meia_ponta;
      totalExtras += extras;

      const assid = per.pontos_assiduidade !== undefined ? per.pontos_assiduidade : ((per.faltas || 0) * -50);
      const pont = per.pontos_pontualidade_total !== undefined ? per.pontos_pontualidade_total : (per.dias_pontuais || 0);
      per.total_periodo = (Number(assid) || 0) + (Number(pont) || 0) + extras;
    });

    prom.pontos_extras = totalExtras;
  });
}

function applyFilters() {
  // Garante que só pontos extras aprovados apareçam na campanha
  aplicarPontosExtrasAprovados();

  const query = searchInput.value.toLowerCase().trim();
  const proj = filterProjeto.value;
  const status = filterStatus.value;

  const filtered = allPromotores.filter(p => {
    const matchQuery = !query || 
      p.nome.toLowerCase().includes(query) ||
      (p.projeto && p.projeto.toLowerCase().includes(query)) ||
      (p.equipe && p.equipe.toLowerCase().includes(query)) ||
      (p.contrato && p.contrato.toLowerCase().includes(query));

    const matchProj = !proj || (p.projeto && p.projeto.toUpperCase() === proj.toUpperCase());

    let matchStatus = true;
    if (status === 'faltas') {
      const hasFaltas = p.periodos && p.periodos.some(per => per.faltas > 0);
      matchStatus = hasFaltas;
    } else if (status === 'sem_faltas') {
      const totalFaltas = p.periodos ? p.periodos.reduce((acc, per) => acc + per.faltas, 0) : 0;
      matchStatus = totalFaltas === 0;
    } else if (status === 'bonus') {
      const hasBonus = p.periodos && p.periodos.some(per => per.ganhou_bonus);
      matchStatus = hasBonus;
    } else if (status === 'sem_contrato') {
      matchStatus = Boolean(p.sem_contrato);
    }

    return matchQuery && matchProj && matchStatus;
  });

  // 1. Renderiza a Tabela Resumida por Promotor
  renderTable(filtered);

  // 2. Renderiza a Tabela Matriz Geral no Módulo 1 (Assiduidade e Pontualidade)
  renderMatrixTable('matrixHeadMod1', 'matrixBodyMod1', filtered, activeCampaignPeriods, 'assiduidade');

  // 3. Renderiza a Tabela Matriz Geral no Módulo 2 (Pontos Extras)
  renderMatrixTable('matrixHeadMod2', 'matrixBodyMod2', filtered, activeCampaignPeriods, 'pontos_extras');
}

// ========================================================
// RENDERIZADOR DA TABELA MATRIZ GERAL (PADRÃO CAMPANHA (1).xlsx)
// ========================================================

function renderMatrixTable(headId, bodyId, promotores, periods, focusModule = 'assiduidade') {
  const thead = document.getElementById(headId);
  const tbody = document.getElementById(bodyId);
  if (!thead || !tbody) return;

  // 1. Monta o Cabeçalho Nível 1 e Nível 2
  let row1Html = `
    <tr>
      <th rowspan="2" class="matrix-sticky-1">NOME DO COLABORADOR</th>
      <th rowspan="2" class="matrix-sticky-2">PROJETO</th>
      <th rowspan="2" class="matrix-sticky-3">EQUIPE</th>
  `;

  let row2Html = `<tr>`;

  periods.forEach(p => {
    row1Html += `<th colspan="8" class="matrix-header-period" title="Período ${p.name}">${escapeHtml(p.name)}</th>`;
    row2Html += `
      <th title="Pontos de Assiduidade">ASSID</th>
      <th title="Efetividade">EFET</th>
      <th title="Pontos de Pontualidade">PONT</th>
      <th title="Ilha (50 pts)">ILHA</th>
      <th title="Meia Ilha (25 pts)">M.ILHA</th>
      <th title="Ponta de Gôndola (30 pts)">PONTA</th>
      <th title="Meia Ponta (15 pts)">M.PONTA</th>
      <th title="Total do Período">TOTAL</th>
    `;
  });

  row1Html += `<th rowspan="2" class="cell-grand-total">TOTAL GERAL</th></tr>`;
  row2Html += `</tr>`;

  thead.innerHTML = row1Html + row2Html;

  // 2. Monta o Corpo da Tabela
  if (!promotores || promotores.length === 0) {
    const totalCols = 3 + (periods.length * 8) + 1;
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="${totalCols}">
          <div class="empty-message">
            <h4>Nenhum colaborador encontrado</h4>
            <p>Ajuste os filtros de busca ou processe os arquivos para visualizar a matriz.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let bodyHtml = '';

  promotores.forEach(p => {
    let grandTotal = 0;

    let rowCells = `
      <tr>
        <td class="matrix-sticky-1 cell-nome-promotor" title="${escapeHtml(p.nome)}">${escapeHtml(p.nome)}</td>
        <td class="matrix-sticky-2 cell-meta-promotor">${escapeHtml(p.projeto || 'GERAL')}</td>
        <td class="matrix-sticky-3 cell-meta-promotor">${escapeHtml(p.equipe || p.cargo || 'PROMOTOR')}</td>
    `;

    periods.forEach(perRef => {
      // Busca dados do colaborador para este período
      const pData = (p.periodos || []).find(x => x.period_id === perRef.id || x.period_name === perRef.name) || {};

      const assid = pData.pontos_assiduidade !== undefined ? pData.pontos_assiduidade : (pData.faltas > 0 ? pData.faltas * -50 : 0);
      const efet = pData.efetividade !== undefined ? pData.efetividade : 0;
      const pont = pData.pontos_pontualidade_total !== undefined ? pData.pontos_pontualidade_total : (pData.dias_pontuais || 0);

      const ilha = pData.ilha || 0;
      const meiaIlha = pData.meia_ilha || 0;
      const ponta = pData.ponta || 0;
      const meiaPonta = pData.meia_ponta || 0;

      const extrasPeriodo = ilha + meiaIlha + ponta + meiaPonta;
      const totalPeriodo = pData.total_periodo !== undefined ? pData.total_periodo : (assid + pont + extrasPeriodo);
      grandTotal += totalPeriodo;

      const assidClass = assid < 0 ? 'cell-fault-active' : '';
      const pontClass = pData.ganhou_bonus ? 'cell-bonus-active' : '';
      const ilhaClass = ilha > 0 ? 'cell-extra-active' : '';
      const meiaIlhaClass = meiaIlha > 0 ? 'cell-extra-active' : '';
      const pontaClass = ponta > 0 ? 'cell-extra-active' : '';
      const meiaPontaClass = meiaPonta > 0 ? 'cell-extra-active' : '';

      rowCells += `
        <td class="${assidClass}">${assid}</td>
        <td>${efet}</td>
        <td class="${pontClass}">${pont}</td>
        <td class="${ilhaClass}">${ilha}</td>
        <td class="${meiaIlhaClass}">${meiaIlha}</td>
        <td class="${pontaClass}">${ponta}</td>
        <td class="${meiaPontaClass}">${meiaPonta}</td>
        <td class="cell-period-total">${totalPeriodo}</td>
      `;
    });

    rowCells += `<td class="cell-grand-total">${grandTotal}</td></tr>`;
    bodyHtml += rowCells;
  });

  tbody.innerHTML = bodyHtml;
}

// ========================================================
// TABELA RESUMIDA POR PROMOTOR
// ========================================================

function renderTable(promotores) {
  tableBody.innerHTML = '';
  rowCount.textContent = `${promotores.length} colaboradores exibidos`;

  if (promotores.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="9">
          <div class="empty-message">
            <h4>Nenhum resultado encontrado</h4>
            <p>Tente ajustar os filtros ou a busca.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  promotores.forEach(p => {
    const tr = document.createElement('tr');
    if (p.sem_contrato) tr.classList.add('tr-sem-contrato');

    const hasBonusTotal = p.periodos && p.periodos.some(per => per.ganhou_bonus);
    const totalFaltas = p.periodos ? p.periodos.reduce((acc, per) => acc + per.faltas, 0) : 0;

    let grandTotal = 0;
    let periodCellsHtml = '';
    if (p.status === 'OK' && p.periodos) {
      p.periodos.slice(0, 5).forEach(per => {
        const assidBadge = per.faltas > 0 ? 
          `<span class="badge-faltas font-mono" title="${per.faltas} falta(s)">-${per.faltas * 50} pts</span>` : 
          `<span class="text-muted font-mono" title="Sem faltas">0</span>`;

        const pontBadge = `<span class="badge-pont font-mono" title="${per.dias_pontuais} dias pontuais">+${per.pontos_pontualidade_total}</span>`;

        const extraPts = (per.ilha || 0) + (per.meia_ilha || 0) + (per.ponta || 0) + (per.meia_ponta || 0);
        const extraBadge = extraPts > 0 ? 
          `<span class="badge-pont font-mono text-gold" style="font-size:0.75rem; background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.4); border-radius:4px; padding:1px 4px;" title="${extraPts} pts extras">+${extraPts} pe</span>` : '';

        const totPer = per.total_periodo !== undefined ? per.total_periodo : ((per.pontos_assiduidade || 0) + (per.pontos_pontualidade_total || 0) + extraPts);
        grandTotal += totPer;

        periodCellsHtml += `
          <td class="td-center">
            <div class="period-cell-compact" style="display:flex; flex-direction:column; gap:2px; align-items:center;">
              <div>${assidBadge}</div>
              <div>${pontBadge}</div>
              ${extraBadge ? `<div>${extraBadge}</div>` : ''}
            </div>
          </td>
        `;
      });
      // Preenche colunas vazias se tiver menos de 5 períodos na folha
      for (let i = p.periodos.length; i < 5; i++) {
        periodCellsHtml += `<td class="td-center text-muted">-</td>`;
      }
    } else {
      periodCellsHtml = `<td colspan="5" class="td-center text-muted">Folha não localizada</td>`;
    }

    const bonusCell = hasBonusTotal ? 
      `<span class="badge-bonus-star">★ 30 pts</span>` : 
      `<span class="text-muted">-</span>`;

    const contratoBadge = p.contrato ? 
      `<span class="tag-contrato">${escapeHtml(p.contrato)}</span>` : 
      (p.sem_contrato ? `<span class="tag-contrato tag-contrato-alerta">Sem Contrato</span>` : '');

    const ptsExtrasVal = p.pontos_extras || 0;

    tr.innerHTML = `
      <td>
        <div class="promotor-cell">
          <span class="promotor-name">${escapeHtml(p.nome)}</span>
          <div class="promotor-meta-tags">
            ${contratoBadge}
          </div>
        </div>
      </td>
      <td>
        <div class="projeto-tag">${escapeHtml(p.projeto || 'GERAL')}</div>
        <small class="text-muted">${escapeHtml(p.equipe || 'PROMOTOR')}</small>
      </td>
      ${periodCellsHtml}
      <td class="td-center">${bonusCell}</td>
      <td class="td-center font-mono font-bold ${ptsExtrasVal > 0 ? 'text-gold' : 'text-muted'}" style="${ptsExtrasVal > 0 ? 'color:#eab308;' : ''}">
        ${ptsExtrasVal > 0 ? `+${ptsExtrasVal} pts` : '0'}
      </td>
      <td class="td-center font-mono font-bold" style="font-size: 1rem; color: #a855f7;">
        ${grandTotal} pts
      </td>
      <td class="td-action">
        <button class="btn btn-sm btn-secondary btn-audit" onclick="openPromotorDetail('${escapeHtml(p.nome)}')">
          Ver Espelho
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function openPromotorDetail(nome) {
  const p = allPromotores.find(x => x.nome === nome);
  if (!p) return;

  currentPromotor = p;
  modalPromotorName.textContent = p.nome;
  modalPromotorMeta.textContent = `${p.projeto || 'GERAL'} • ${p.equipe || 'PROMOTOR'} • ${p.contrato || 'Contrato Padrão'}`;

  activeModalPeriodIdx = 0;
  renderModalPeriods();
  detailModal.classList.add('active');
}

function closeModal() {
  detailModal.classList.remove('active');
  currentPromotor = null;
}

function renderModalPeriods() {
  if (!currentPromotor || !currentPromotor.periodos || currentPromotor.periodos.length === 0) {
    modalPeriodTabs.innerHTML = '';
    modalPeriodSummary.innerHTML = '<div class="alert alert-warning">Nenhum espelho de ponto disponível para este promotor.</div>';
    modalDaysBody.innerHTML = '';
    return;
  }

  modalPeriodTabs.innerHTML = '';
  currentPromotor.periodos.forEach((per, idx) => {
    const btn = document.createElement('button');
    btn.className = `modal-tab-btn ${idx === activeModalPeriodIdx ? 'active' : ''}`;
    btn.textContent = per.period_name;
    btn.addEventListener('click', () => {
      activeModalPeriodIdx = idx;
      renderModalPeriods();
    });
    modalPeriodTabs.appendChild(btn);
  });

  const activePeriod = currentPromotor.periodos[activeModalPeriodIdx];
  if (!activePeriod) return;

  const pePeriodo = (activePeriod.ilha || 0) + (activePeriod.meia_ilha || 0) + (activePeriod.ponta || 0) + (activePeriod.meia_ponta || 0);
  const peChip = pePeriodo > 0 ? `
    <div class="chip" style="background:rgba(234,179,8,0.18); border:1px solid #eab308; color:#fef08a;">
      <span>⚡ Pontos Extras: +${pePeriodo} pts (Ilha: ${activePeriod.ilha || 0}, M.Ilha: ${activePeriod.meia_ilha || 0}, Ponta: ${activePeriod.ponta || 0}, M.Ponta: ${activePeriod.meia_ponta || 0})</span>
    </div>
  ` : '';

  modalPeriodSummary.innerHTML = `
    <div class="chip ${activePeriod.faltas > 0 ? 'chip-danger' : 'chip-success'}">
      <span>Faltas: ${activePeriod.faltas} (${activePeriod.pontos_assiduidade} pts)</span>
    </div>
    <div class="chip chip-success">
      <span>Pontualidade: +${activePeriod.pontos_pontualidade_total} pts (${activePeriod.dias_pontuais} dias pontuais)</span>
    </div>
    ${peChip}
    ${activePeriod.ganhou_bonus ? '<div class="chip chip-bonus"><span>★ Bônus 4 Semanas 100% atingido!</span></div>' : ''}
  `;

  modalDaysBody.innerHTML = '';
  if (activePeriod.detalhes_dias) {
    activePeriod.detalhes_dias.forEach(d => {
      const tr = document.createElement('tr');
      const isFalta = d.status === 'FALTA';
      const isAtraso = !d.pontual && d.status === 'TRABALHADO';

      tr.innerHTML = `
        <td>${d.date_br} (${d.dia_sem})</td>
        <td><span class="status-badge status-${d.status}">${d.status}</span></td>
        <td class="time-val">${d.plan_in || '-'}</td>
        <td class="time-val">${d.exec_in || '-'}</td>
        <td class="time-val">${d.plan_int || '-'}</td>
        <td class="time-val">${d.exec_int || '-'}</td>
        <td>${d.pontual ? '✓ Sim' : (isAtraso ? `Atraso (${d.atraso_min}m)` : '-')}</td>
        <td>${escapeHtml(d.motivo_falta || d.obs || '-')}</td>
      `;
      modalDaysBody.appendChild(tr);
    });
  }
}

// ========================================================
// SALVAMENTO NO SUPABASE (tb_campanha_colaboradores)
// ========================================================

async function salvarCampanhaNoSupabase() {
  if (allPromotores.length === 0) {
    showToast("Nenhum dado processado para salvar. Clique em 'Processar Pontuações' primeiro.", "warning");
    return;
  }

  const sb = await ensureSupabase();
  if (!sb) {
    showToast("Cliente Supabase não inicializado. Verifique sua conexão.", "danger");
    return;
  }

  if (btnSalvarSupabase) btnSalvarSupabase.disabled = true;
  if (btnSalvarSupabaseText) btnSalvarSupabaseText.textContent = "Salvando...";

  try {
    const mesRef = mesReferenciaSelect ? mesReferenciaSelect.value : 'Setembro/2026';

    const registros = allPromotores.map(p => {
      const periodos = p.periodos || [];
      const faltas = periodos.reduce((acc, per) => acc + (per.faltas || 0), 0);
      const ptsAssid = periodos.reduce((acc, per) => acc + (per.pontos_assiduidade || 0), 0);
      const ptsPont = periodos.reduce((acc, per) => acc + (per.pontos_pontualidade_total || 0), 0);
      const temBonus = periodos.some(per => per.ganhou_bonus);
      const ptsExtras = p.pontos_extras || 0;
      const totalGeral = ptsAssid + ptsPont + ptsExtras;

      return {
        nome: (p.nome || '').trim().toUpperCase(),
        projeto: p.projeto || 'GERAL',
        equipe: p.equipe || 'PROMOTOR',
        cargo: p.cargo || 'PROMOTOR',
        contrato: p.contrato || '-',
        mes_referencia: mesRef,
        total_faltas: faltas,
        pontos_assiduidade: ptsAssid,
        pontos_pontualidade: ptsPont,
        bonus_4_semanas: temBonus,
        pontos_extras: ptsExtras,
        pontos_total_geral: totalGeral,
        status_folha: p.status || 'OK',
        periodos: periodos,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await sb
      .from('tb_campanha_colaboradores')
      .upsert(registros, { onConflict: 'nome,mes_referencia' });

    if (error) {
      console.error("Erro Supabase:", error);
      showToast("Erro ao salvar no Supabase: " + error.message, "danger", 6000);
    } else {
      showToast(`🎉 ${registros.length} colaboradores salvos no Supabase com sucesso (${mesRef})!`, "success", 5000);
    }
  } catch (err) {
    console.error("Erro ao salvar no Supabase:", err);
    showToast("Falha na sincronização: " + err.message, "danger");
  } finally {
    if (btnSalvarSupabase) btnSalvarSupabase.disabled = false;
    if (btnSalvarSupabaseText) btnSalvarSupabaseText.textContent = "Salvar no Supabase";
  }
}

// ========================================================
// PONTOS EXTRAS & CURADORIA (MODO POTÊNCIA)
// ========================================================

async function loadPontosExtrasData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(getApiUrl('/api/pontos-extras'), { signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await res.json();

    if (json.success) {
      allPeRecords = (json.records || []).filter(r => r.fotos && Array.isArray(r.fotos) && r.fotos.length > 0);
      pePeriods = json.periods || [];
      peStats = json.stats || {};

      updatePeMetrics(peStats);
      populatePeFilters();
      renderPeCards();
      applyFilters();

      if (tabPeBadge) {
        tabPeBadge.textContent = `${peStats.pendentes || 0} pendentes`;
      }
      return;
    }
  } catch (err) {
    // Backend offline ou timeout - busca direto no Supabase
  }
  await carregarPontosExtrasDoSupabase();
}

async function carregarPontosExtrasDoSupabase() {
  const sb = await ensureSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb
      .from('tb_campanha_pontos_extras')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // FILTRO CRÍTICO: apenas tarefas com fotos reais de ponto extra
      const validosComFotos = data.filter(d => d.fotos && Array.isArray(d.fotos) && d.fotos.length > 0);
      allPeRecords = validosComFotos.map(d => ({
        task_id: d.task_id,
        promotor_campanha: d.promotor,
        promotor_csv: d.promotor,
        pdv: d.pdv || '',
        data: d.data_registro || '',
        tipo: d.tipo_conquista || 'ILHA',
        criativo: Boolean(d.criativo),
        pontos: d.pontos || 0,
        status: d.status_curadoria || 'PENDENTE',
        motivo: d.motivo_rejeicao || '',
        fotos: d.fotos || [],
        periodo: d.periodo_nome || '27/08 A 03/09',
        matched: true
      }));

      const aprovados = allPeRecords.filter(r => r.status === 'APROVADO').length;
      const pendentes = allPeRecords.filter(r => r.status === 'PENDENTE').length;
      const rejeitados = allPeRecords.filter(r => r.status === 'REJEITADO').length;
      const pts = allPeRecords.filter(r => r.status === 'APROVADO').reduce((acc, r) => acc + (r.pontos || 0), 0);

      peStats = {
        total: allPeRecords.length,
        aprovados,
        pendentes,
        rejeitados,
        pontos_gerados: pts,
        criativos: allPeRecords.filter(r => r.criativo).length,
        promotores: new Set(allPeRecords.map(r => r.promotor_campanha)).size
      };

      updatePeMetrics(peStats);
      populatePeFilters();
      renderPeCards();
    }
  } catch (err) {
    console.error("Erro ao carregar pontos extras do Supabase:", err);
  }
}

function updatePeMetrics(stats) {
  if (peTotalReg) peTotalReg.textContent = stats.total || 0;
  if (peTotalProms) peTotalProms.textContent = `${stats.promotores || 0} promotores distintos`;
  if (peTotalPend) peTotalPend.textContent = stats.pendentes || 0;
  if (peTotalAprov) peTotalAprov.textContent = stats.aprovados || 0;
  if (peTotalRejeit) peTotalRejeit.textContent = `${stats.rejeitados || 0} reprovados`;
  if (peTotalPts) peTotalPts.textContent = `+${stats.pontos_gerados || 0} pts`;
  if (peTotalCriativos) peTotalCriativos.textContent = stats.criativos || 0;
}

function populatePeFilters() {
  if (peFilterPeriodo) {
    peFilterPeriodo.innerHTML = '<option value="">Todos os Períodos</option>';
    const distinctPeriods = [...new Set(allPeRecords.map(r => r.periodo).filter(Boolean))];
    distinctPeriods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      peFilterPeriodo.appendChild(opt);
    });
  }

  if (peFilterPromotor) {
    peFilterPromotor.innerHTML = '<option value="">Todos os Colaboradores</option>';
    const distinctProms = [...new Set(allPeRecords.map(r => r.promotor_campanha || r.promotor_csv).filter(Boolean))].sort();
    distinctProms.forEach(pName => {
      const opt = document.createElement('option');
      opt.value = pName;
      opt.textContent = pName;
      peFilterPromotor.appendChild(opt);
    });
  }
}

// ========================================================
// PROCESSADOR DE ARQUIVO CSV / XLSX DE PONTOS EXTRAS
// ========================================================

async function processarArquivoPeUpload(file) {
  if (!file) return;

  if (peImportStatusText) {
    peImportStatusText.innerHTML = `<strong>Lendo arquivo "${escapeHtml(file.name)}"...</strong> Processando tarefas, promotores, lojas e links de fotos...`;
  }
  if (peDedicatedFileMeta) {
    peDedicatedFileMeta.style.display = 'block';
    peDedicatedFileMeta.textContent = `${(file.size / 1024).toFixed(1)} KB • Lendo dados...`;
  }

  try {
    const buffer = await file.arrayBuffer();
    // SheetJS com suporte universal a XLSX, XLS e CSV (com separador ; ou ,)
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

    if (!rows || rows.length < 2) {
      showToast("O arquivo selecionado está vazio ou sem formato válido.", "danger");
      return;
    }

    // Identifica linha de cabeçalho
    let headerIdx = -1;
    let colMap = {};
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i].map(c => String(c || '').trim().toUpperCase());
      const hasTask = row.some(c => c.includes('TAREFA') || c.includes('TASK') || c.includes('ID'));
      const hasProm = row.some(c => c.includes('PROMOTOR') || c.includes('AGENTE') || c.includes('COLABORADOR'));
      if (hasTask || hasProm) {
        headerIdx = i;
        rows[i].forEach((colName, cIdx) => {
          const upper = String(colName || '').trim().toUpperCase();
          if ((upper.includes('TAREFA') || upper.includes('TASK') || upper === 'ID') && colMap.task_id === undefined) colMap.task_id = cIdx;
          if (upper.includes('DATA') && (upper.includes('EXECU') || upper.includes('HORA')) && colMap.data === undefined) colMap.data = cIdx;
          if (upper === 'DATA' && colMap.data === undefined) colMap.data = cIdx;
          if ((upper.includes('PDV') || upper.includes('LOJA')) && colMap.pdv === undefined) colMap.pdv = cIdx;
          if ((upper.includes('PROMOTOR') || upper.includes('AGENTE') || upper.includes('COLABORADOR')) && colMap.promotor === undefined) colMap.promotor = cIdx;
          if (upper.includes('ATIVIDADE') && colMap.atividade === undefined) colMap.atividade = cIdx;
          if (upper.includes('PONTO EXTRA') && colMap.tem_pe === undefined) colMap.tem_pe = cIdx;
        });
        break;
      }
    }

    if (headerIdx === -1 || colMap.promotor === undefined) {
      showToast("Cabeçalho do relatório não reconhecido (esperado PROMOTOR, PDV, ID DA TAREFA).", "warning");
      return;
    }

    // Colunas de foto
    const headerRow = rows[headerIdx].map(c => String(c || '').trim().toUpperCase());
    const photoColIndices = [];
    headerRow.forEach((c, idx) => {
      if (c.includes('FOTO')) photoColIndices.push(idx);
    });

    const parsedTasksMap = {};

    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawTaskId = colMap.task_id !== undefined ? String(row[colMap.task_id] || '').trim() : '';
      const promotorRaw = colMap.promotor !== undefined ? String(row[colMap.promotor] || '').trim().toUpperCase() : '';
      const pdvRaw = colMap.pdv !== undefined ? String(row[colMap.pdv] || '').trim().toUpperCase() : 'PDV NÃO INFORMADO';
      const dataRaw = colMap.data !== undefined ? String(row[colMap.data] || '').trim() : '';
      const atividadeRaw = colMap.atividade !== undefined ? String(row[colMap.atividade] || '').trim() : '';

      if (!promotorRaw) continue;

      const temPeRaw = colMap.tem_pe !== undefined ? String(row[colMap.tem_pe] || '').trim().toUpperCase() : '';
      const isSim = (temPeRaw === 'SIM' || temPeRaw === 'S' || temPeRaw === 'TRUE' || temPeRaw === '1');

      // Extrai fotos da linha
      const fotosLinha = [];
      photoColIndices.forEach(pIdx => {
        const val = String(row[pIdx] || '').trim();
        if (val.startsWith('http://') || val.startsWith('https://')) {
          fotosLinha.push(val);
        }
      });
      // Fallback: varre qualquer coluna por links http de imagem
      if (fotosLinha.length === 0) {
        row.forEach(val => {
          const s = String(val || '').trim();
          if (s.startsWith('http://') || s.startsWith('https://')) {
            fotosLinha.push(s);
          }
        });
      }

      // FILTRO ESSENCIAL: se houver a coluna "TEM PONTO EXTRA?", ignora linhas que não são "SIM" e não têm fotos
      if (colMap.tem_pe !== undefined && !isSim && fotosLinha.length === 0) {
        continue;
      }
      if (!isSim && fotosLinha.length === 0) {
        continue;
      }

      const taskId = rawTaskId || `T_${Math.abs(hashString(promotorRaw + pdvRaw + dataRaw + r))}`;

      if (!parsedTasksMap[taskId]) {
        // Encontra período correspondente pela data da tarefa
        let perNome = '27/08 A 03/09';
        const iso = normalizarDataParaISO(dataRaw);
        if (iso) {
          const pMatch = activeCampaignPeriods.find(p => p.start && p.end && iso >= p.start && iso <= p.end);
          if (pMatch) perNome = pMatch.name;
        }

        const matchedProm = encontrarPromotorCampanha(promotorRaw);

        parsedTasksMap[taskId] = {
          task_id: taskId,
          promotor_csv: promotorRaw,
          promotor_campanha: matchedProm || promotorRaw,
          matched: Boolean(matchedProm),
          pdv: pdvRaw,
          data: dataRaw,
          atividade: atividadeRaw,
          fotos: [...fotosLinha],
          status: 'PENDENTE',
          tipo: 'ILHA',
          criativo: false,
          periodo: perNome,
          motivo: '',
          pontos: 0
        };
      } else {
        // Junta fotos adicionais da mesma tarefa sem duplicar
        fotosLinha.forEach(f => {
          if (!parsedTasksMap[taskId].fotos.includes(f)) {
            parsedTasksMap[taskId].fotos.push(f);
          }
        });
      }
    }

    // FILTRO CRÍTICO: apenas tarefas que realmente possuem fotos comprovatórias
    const novosRegistros = Object.values(parsedTasksMap).filter(t => t.fotos && Array.isArray(t.fotos) && t.fotos.length > 0);
    if (novosRegistros.length === 0) {
      showToast("Nenhuma tarefa com fotos de ponto extra ('SIM') encontrada na planilha.", "warning");
      return;
    }

    // Remove qualquer registro inválido sem foto que possa estar na memória
    allPeRecords = allPeRecords.filter(r => r.fotos && Array.isArray(r.fotos) && r.fotos.length > 0);

    // Mescla com registros existentes respeitando decisões prévias
    novosRegistros.forEach(novo => {
      const idx = allPeRecords.findIndex(r => r.task_id === novo.task_id);
      if (idx >= 0) {
        const anterior = allPeRecords[idx];
        novo.status = anterior.status;
        novo.tipo = anterior.tipo;
        novo.criativo = anterior.criativo;
        novo.periodo = anterior.periodo || novo.periodo;
        novo.motivo = anterior.motivo;
        novo.pontos = anterior.pontos;
        anterior.fotos.forEach(f => {
          if (!novo.fotos.includes(f)) novo.fotos.push(f);
        });
        allPeRecords[idx] = novo;
      } else {
        allPeRecords.push(novo);
      }
    });

    // Salva no Supabase se conectado
    salvarNovosPontosExtrasSupabase(novosRegistros);

    recalcularEstatisticasPe();
    populatePeFilters();
    renderPeCards();

    if (peImportStatusText) {
      peImportStatusText.innerHTML = `✓ <strong>${novosRegistros.length} tarefas de pontos extras carregadas</strong> de "${escapeHtml(file.name)}"! Fotos organizadas abaixo por Período, Promotor e Loja.`;
    }
    if (peDedicatedFileMeta) {
      peDedicatedFileMeta.textContent = `${novosRegistros.length} tarefas • ${(file.size / 1024).toFixed(1)} KB`;
    }

    showToast(`⚡ ${novosRegistros.length} tarefas de pontos extras carregadas com sucesso!`, 'potencia', 5000);

  } catch (err) {
    console.error("Erro ao processar arquivo de pontos extras:", err);
    showToast("Erro ao processar arquivo: " + err.message, "danger");
  }
}

function encontrarPromotorCampanha(promotorCsv) {
  if (!promotorCsv) return null;
  const clean = promotorCsv.trim().toUpperCase();

  // 1. Match exato
  const exato = allPromotores.find(p => p.nome === clean);
  if (exato) return exato.nome;

  // 2. Prefixo / Substring (primeiros 18 caracteres)
  const pref = allPromotores.find(p => p.nome.startsWith(clean.slice(0, 18)) || clean.startsWith(p.nome.slice(0, 18)));
  if (pref) return pref.nome;

  return null;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function recalcularEstatisticasPe() {
  // Agrupa registros por loja no período para refletir curadoria real
  const storeGroups = {};
  allPeRecords.forEach(r => {
    const key = `${r.periodo || 'P1'}__${r.promotor_campanha || r.promotor_csv || ''}__${r.pdv || ''}`;
    if (!storeGroups[key]) storeGroups[key] = [];
    storeGroups[key].push(r);
  });

  const storeList = Object.values(storeGroups);
  const totalLojas = storeList.length;
  const aprovados = storeList.filter(arr => arr.some(r => r.status === 'APROVADO')).length;
  const pendentes = storeList.filter(arr => arr.every(r => r.status === 'PENDENTE')).length;
  const rejeitados = storeList.filter(arr => arr.some(r => r.status === 'REJEITADO') && !arr.some(r => r.status === 'APROVADO')).length;

  const pts = storeList.reduce((acc, arr) => {
    const isAprov = arr.some(r => r.status === 'APROVADO');
    if (!isAprov) return acc;
    const prim = arr.find(r => r.status === 'APROVADO') || arr[0];
    if (prim.conquistas) {
      return acc + calculateConquestPoints(prim.conquistas).total;
    }
    return acc + calculateLocalPoints(prim.tipo, prim.criativo);
  }, 0);

  peStats = {
    total: totalLojas,
    total_tarefas: allPeRecords.length,
    aprovados,
    pendentes,
    rejeitados,
    pontos_gerados: pts,
    criativos: storeList.filter(arr => arr.some(r => (r.conquistas && Object.values(r.conquistas).some(x => x.criativo > 0)) || r.criativo)).length,
    promotores: new Set(allPeRecords.map(r => r.promotor_campanha || r.promotor_csv)).size
  };

  updatePeMetrics(peStats);
  if (tabPeBadge) {
    tabPeBadge.textContent = `${pendentes} pendentes`;
  }
}

async function salvarNovosPontosExtrasSupabase(records) {
  const sb = await ensureSupabase();
  if (!sb || !records || records.length === 0) return;

  try {
    const payload = records.map(r => ({
      task_id: r.task_id,
      promotor: r.promotor_campanha || r.promotor_csv,
      pdv: r.pdv,
      data_registro: r.data,
      tipo_conquista: r.tipo,
      criativo: r.criativo,
      pontos: r.pontos || 0,
      status_curadoria: r.status,
      motivo_rejeicao: r.motivo,
      fotos: r.fotos,
      periodo_nome: r.periodo,
      updated_at: new Date().toISOString()
    }));

    // Envia em blocos de 100 para alta estabilidade
    for (let i = 0; i < payload.length; i += 100) {
      const chunk = payload.slice(i, i + 100);
      await sb.from('tb_campanha_pontos_extras').upsert(chunk, { onConflict: 'task_id' });
    }
    console.log(`[Pontos Extras] ${records.length} registros salvos no Supabase.`);
  } catch (err) {
    console.warn("Aviso ao salvar novos pontos extras no Supabase:", err);
  }
}

window.togglePeGroupBody = function(bodyId, headerEl) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'flex' : 'none';
  const icon = headerEl ? headerEl.querySelector('.chevron-icon') : null;
  if (icon) {
    icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  }
};

window.aprovarTodasDaLoja = async function(lojaName, promName, pName, btnEl) {
  const storeIdSafe = 'store_' + `${pName}_${promName}_${lojaName}`.replace(/[^a-zA-Z0-9]/g, '_');
  setStoreStatus(storeIdSafe, 'APROVADO');
  showToast(`✓ Loja "${lojaName}" aprovada com sucesso!`, 'potencia');
};

// ========================================================
// RENDERIZADOR HIERÁRQUICO: PERÍODO > PROMOTOR > LOJA (1 CARD POR LOJA)
// ========================================================

window.storeCardRegistry = {};

function renderPeCards() {
  const query = peSearchInput.value.toLowerCase().trim();
  const perFilter = peFilterPeriodo.value;
  const promFilter = peFilterPromotor.value;
  const statusFilter = peFilterStatus.value;
  const tipoFilter = peFilterTipo.value;

  const filtered = allPeRecords.filter(r => {
    // FILTRO VISUAL ESTRITO: nunca renderiza tarefas sem fotos comprovatórias
    if (!r.fotos || !Array.isArray(r.fotos) || r.fotos.length === 0) return false;

    const matchQuery = !query ||
      (r.promotor_csv && r.promotor_csv.toLowerCase().includes(query)) ||
      (r.promotor_campanha && r.promotor_campanha.toLowerCase().includes(query)) ||
      (r.pdv && r.pdv.toLowerCase().includes(query)) ||
      (r.task_id && r.task_id.toLowerCase().includes(query));

    const matchPer = !perFilter || r.periodo === perFilter;
    const matchProm = !promFilter || r.promotor_campanha === promFilter || r.promotor_csv === promFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchTipo = !tipoFilter || r.tipo === tipoFilter;

    return matchQuery && matchPer && matchProm && matchStatus && matchTipo;
  });

  // Limpa o registry antes de renderizar
  window.storeCardRegistry = {};

  // ESTRUTURA HIERÁRQUICA: PERÍODO -> PROMOTOR -> LOJA
  const hierarchy = {};

  filtered.forEach(r => {
    const pName = r.periodo || '27/08 A 03/09';
    const promName = r.promotor_campanha || r.promotor_csv || 'PROMOTOR NÃO INFORMADO';
    const lojaName = r.pdv || 'LOJA NÃO INFORMADA';

    if (!hierarchy[pName]) hierarchy[pName] = {};
    if (!hierarchy[pName][promName]) hierarchy[pName][promName] = {};
    if (!hierarchy[pName][promName][lojaName]) hierarchy[pName][promName][lojaName] = [];

    hierarchy[pName][promName][lojaName].push(r);
  });

  // Conta total de lojas exibidas
  let totalLojasExibidas = 0;
  Object.values(hierarchy).forEach(proms => {
    Object.values(proms).forEach(lojas => {
      totalLojasExibidas += Object.keys(lojas).length;
    });
  });

  peCountDisplay.textContent = `${totalLojasExibidas} lojas (${filtered.length} tarefas) exibidas`;
  peGrid.innerHTML = '';

  if (filtered.length === 0) {
    peGrid.innerHTML = `
      <div class="pe-loading-card" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📸</div>
        <h4>Nenhum ponto extra corresponde aos filtros selecionados</h4>
        <p style="color: var(--text-muted); max-width: 520px; margin: 8px auto 16px;">
          Suba o arquivo CSV ou XLSX com o relatório de tarefas no botão <strong>"Subir Relatório de Pontos Extras"</strong> acima, ou ajuste os filtros de período e colaborador.
        </p>
      </div>
    `;
    return;
  }

  // Ordena os períodos na ordem cronológica oficial da campanha
  const sortedPeriods = Object.keys(hierarchy).sort((a, b) => {
    const idxA = activeCampaignPeriods.findIndex(p => p.name === a);
    const idxB = activeCampaignPeriods.findIndex(p => p.name === b);
    return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
  });

  sortedPeriods.forEach(pName => {
    const promotoresDoPeriodo = hierarchy[pName];
    let totalTarefasPeriodo = 0;
    let totalLojasPeriodo = 0;
    Object.values(promotoresDoPeriodo).forEach(lojas => {
      totalLojasPeriodo += Object.keys(lojas).length;
      Object.values(lojas).forEach(arr => {
        totalTarefasPeriodo += arr.length;
      });
    });
    const totalPromotoresPeriodo = Object.keys(promotoresDoPeriodo).length;

    // 1. Container do Período
    const periodSection = document.createElement('div');
    periodSection.className = 'pe-group-period';
    const periodIdSafe = pName.replace(/[^a-zA-Z0-9]/g, '_');

    periodSection.innerHTML = `
      <div class="pe-group-period-header" onclick="togglePeGroupBody('body-${periodIdSafe}', this)">
        <div class="pe-group-period-title">
          <span style="font-size: 1.25rem;">📅</span>
          <span>Período: ${escapeHtml(pName)}</span>
          <span class="pe-group-period-badge">${totalLojasPeriodo} loja${totalLojasPeriodo > 1 ? 's' : ''} (${totalTarefasPeriodo} tarefas)</span>
        </div>
        <div class="pe-group-period-meta">
          <span>👥 ${totalPromotoresPeriodo} colaborador${totalPromotoresPeriodo > 1 ? 'es' : ''}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.2s;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <div class="pe-group-period-body" id="body-${periodIdSafe}">
      </div>
    `;

    const periodBody = periodSection.querySelector(`#body-${periodIdSafe}`);

    // Ordena os promotores alfabeticamente
    const sortedPromotores = Object.keys(promotoresDoPeriodo).sort();

    sortedPromotores.forEach(promName => {
      const lojasDoPromotor = promotoresDoPeriodo[promName];
      const totalLojas = Object.keys(lojasDoPromotor).length;
      const totalTarefasPromotor = Object.values(lojasDoPromotor).reduce((acc, arr) => acc + arr.length, 0);

      // 2. Container do Promotor
      const promotorCard = document.createElement('div');
      promotorCard.className = 'pe-group-promotor';
      const promotorIdSafe = `${periodIdSafe}_${promName.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const initials = promName.split(' ').slice(0, 2).map(n => n[0] || '').join('');

      promotorCard.innerHTML = `
        <div class="pe-group-promotor-header">
          <div class="pe-group-promotor-info">
            <div class="pe-promotor-avatar-icon">${initials}</div>
            <div>
              <span class="pe-group-promotor-name">${escapeHtml(promName)}</span>
              <span class="pe-group-promotor-tag">PROMOTOR</span>
            </div>
          </div>
          <div class="pe-group-promotor-stats">
            <span>🏪 ${totalLojas} loja${totalLojas > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>📸 ${totalTarefasPromotor} foto${totalTarefasPromotor > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="pe-group-promotor-body" id="body-${promotorIdSafe}">
        </div>
      `;

      const promotorBody = promotorCard.querySelector(`#body-${promotorIdSafe}`);

      // Ordena as lojas alfabeticamente
      const sortedLojas = Object.keys(lojasDoPromotor).sort();

      sortedLojas.forEach(lojaName => {
        const tasksDaLoja = lojasDoPromotor[lojaName];

        // 3. Renderiza EXATAMENTE UM CARD por loja no período, consolidando todas as fotos e datas
        const storeCardEl = createPeStoreCardElement(pName, promName, lojaName, tasksDaLoja);
        promotorBody.appendChild(storeCardEl);
      });

      periodBody.appendChild(promotorCard);
    });

    peGrid.appendChild(periodSection);
  });
}

function createPeStoreCardElement(pName, promName, lojaName, tasksDaLoja) {
  // Coleta todas as fotos de todas as tarefas/datas da loja sem duplicar
  const allPhotos = [];
  tasksDaLoja.forEach(t => {
    (t.fotos || []).forEach(fUrl => {
      if (fUrl && !allPhotos.some(p => p.url === fUrl)) {
        allPhotos.push({
          url: fUrl,
          data: t.data || '',
          taskId: t.task_id
        });
      }
    });
  });

  const storeIdSafe = 'store_' + `${pName}_${promName}_${lojaName}`.replace(/[^a-zA-Z0-9]/g, '_');

  // Estado consolidado da curadoria da loja
  const curatedTask = tasksDaLoja.find(t => t.status !== 'PENDENTE') || tasksDaLoja[0] || {};
  const currentStatus = curatedTask.status || 'PENDENTE';
  const currentPeriodo = curatedTask.periodo || pName;
  const currentObs = curatedTask.motivo || '';

  // Conquistas múltiplas no período (Ilha, Meia Ilha, Ponta, Meia Ponta)
  let currentConquistas = curatedTask.conquistas ? 
    parseConquistas(curatedTask.conquistas) : 
    parseConquistas(curatedTask.tipo, curatedTask.criativo);

  // Se for nova e não tiver nada selecionado, sugerir 1 Ilha
  const ptsCheck = calculateConquestPoints(currentConquistas);
  if (ptsCheck.totalQtd === 0 && !curatedTask.status) {
    currentConquistas.ilha.qtd = 1;
  }

  const conquestResult = calculateConquestPoints(currentConquistas);
  const hasCriativo = conquestResult.totalCriativos > 0;

  // Pontuação: APROVADO soma pontos; REJEITADO ou PENDENTE fica ZERADO (0 pts)
  const currentPts = (currentStatus === 'APROVADO') ? conquestResult.total : 0;

  // Registra no mapa global
  window.storeCardRegistry[storeIdSafe] = {
    pName,
    promName,
    lojaName,
    tasks: tasksDaLoja,
    allPhotos,
    conquistas: currentConquistas,
    criativo: hasCriativo,
    status: currentStatus,
    periodo: currentPeriodo,
    motivo: currentObs
  };

  const card = document.createElement('div');
  const statusClass = `status-${currentStatus.toLowerCase()}`;
  const criativoClass = hasCriativo ? 'is-criativo' : '';
  card.className = `pe-card pe-store-card ${statusClass} ${criativoClass}`;
  card.id = `pe-store-card-${storeIdSafe}`;

  const mainPhoto = (allPhotos[0] && allPhotos[0].url) || '';
  const totalFotos = allPhotos.length;

  const isMatched = tasksDaLoja.some(t => t.matched);
  const matchBadge = isMatched ? 
    `<span class="pe-match-badge pe-match-ok">✓ Campanha</span>` : 
    `<span class="pe-match-badge pe-match-alert">⚠️ Verificar</span>`;

  // Datas e tarefas
  const uniqueDates = [...new Set(tasksDaLoja.map(t => t.data).filter(Boolean))];
  const datesText = uniqueDates.length > 0 ? uniqueDates.join(', ') : 'Data não informada';
  const taskIdsList = tasksDaLoja.map(t => `#${t.task_id}`).join(', ');

  // Miniaturas de todas as fotos com badge da data de execução
  let thumbsHtml = '';
  if (totalFotos > 1) {
    allPhotos.forEach((item, fIdx) => {
      const dataLabel = item.data ? item.data.split(' ')[0] : '';
      thumbsHtml += `
        <div class="pe-thumb-wrap ${fIdx === 0 ? 'active' : ''}" 
             onclick="switchStorePreview('${storeIdSafe}', '${item.url}', this)"
             title="Data: ${escapeHtml(item.data || '-')} (Tarefa #${escapeHtml(item.taskId || '-')})">
          <img src="${item.url}" class="pe-thumb-mini" 
               alt="Foto ${fIdx+1}" referrerpolicy="no-referrer" loading="lazy"
               onerror="this.style.opacity='0.4'">
          ${dataLabel ? `<span class="pe-thumb-date-badge">${escapeHtml(dataLabel)}</span>` : ''}
        </div>
      `;
    });
  }

  let periodOptionsHtml = '';
  activeCampaignPeriods.forEach((p, idx) => {
    const selected = (currentPeriodo === p.name) ? 'selected' : '';
    periodOptionsHtml += `<option value="${p.name}" ${selected}>P${idx+1}: ${p.name}</option>`;
  });

  const conquestConfig = [
    { key: 'ilha', label: 'Ilha', icon: '🏛️', base: 50 },
    { key: 'meia_ilha', label: 'Meia Ilha', icon: '📦', base: 25 },
    { key: 'ponta', label: 'Ponta de Gôndola', icon: '🏷️', base: 30 },
    { key: 'meia_ponta', label: 'Meia Ponta', icon: '🔖', base: 15 }
  ];

  let conquestRowsHtml = '';
  conquestConfig.forEach(c => {
    const item = currentConquistas[c.key] || { qtd: 0, criativo: 0 };
    const q = item.qtd || 0;
    const cr = item.criativo || 0;
    const norm = Math.max(0, q - cr);
    const subPts = (norm * c.base) + (cr * c.base * 2);

    conquestRowsHtml += `
      <div class="pe-conquest-item ${q > 0 ? 'has-qty' : ''}" id="cq-row-${storeIdSafe}-${c.key}">
        <div class="pe-cq-header-row">
          <span class="pe-cq-title">${c.icon} ${c.label} <small>(${c.base} pts)</small></span>
          <span class="pe-cq-subtotal" id="cq-sub-${storeIdSafe}-${c.key}">${subPts} pts</span>
        </div>
        <div class="pe-cq-controls-grid">
          <!-- Quantidade -->
          <div class="pe-stepper-box">
            <span class="pe-step-tag">Qtd</span>
            <button type="button" class="btn-step" onclick="stepConquestQtd('${storeIdSafe}', '${c.key}', -1)">−</button>
            <span class="pe-step-val" id="val-qtd-${storeIdSafe}-${c.key}">${q}</span>
            <button type="button" class="btn-step" onclick="stepConquestQtd('${storeIdSafe}', '${c.key}', 1)">+</button>
          </div>
          <!-- Bônus Criativo Dobro -->
          <div class="pe-stepper-box pe-stepper-cr ${cr > 0 ? 'active' : ''} ${q === 0 ? 'disabled' : ''}" 
               id="box-cr-${storeIdSafe}-${c.key}" title="Bônus Criativo: pontos em dobro nesta unidade">
            <span class="pe-step-tag pe-tag-cr">⚡ Dobro</span>
            <button type="button" class="btn-step btn-step-cr" onclick="stepConquestCriativo('${storeIdSafe}', '${c.key}', -1)">−</button>
            <span class="pe-step-val pe-val-cr" id="val-cr-${storeIdSafe}-${c.key}">${cr}</span>
            <button type="button" class="btn-step btn-step-cr" onclick="stepConquestCriativo('${storeIdSafe}', '${c.key}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  let ptsPillText = '0 pts';
  let ptsPillClass = '';
  if (currentStatus === 'APROVADO') {
    ptsPillText = `+${conquestResult.total} pts`;
    ptsPillClass = 'has-pts';
  } else if (currentStatus === 'REJEITADO') {
    ptsPillText = `0 pts (Rejeitado)`;
    ptsPillClass = 'is-rejected';
  } else {
    ptsPillText = `0 pts (Pendente • Prev: ${conquestResult.total} pts)`;
    ptsPillClass = 'is-pending';
  }

  card.innerHTML = `
    <div class="pe-card-header">
      <div class="pe-card-header-top">
        <div class="pe-store-title-wrap">
          <span class="pe-loja-icon">🏪</span>
          <span class="pe-loja-name" title="${escapeHtml(lojaName)}">${escapeHtml(lojaName)}</span>
        </div>
        <div class="pe-store-badges-wrap">
          <span class="pe-loja-period-badge">📅 ${escapeHtml(pName)}</span>
          ${matchBadge}
        </div>
      </div>
      <div class="pe-card-promotor-sub">
        <strong>${escapeHtml(promName)}</strong>
      </div>
      <div class="pe-card-meta-row">
        <span class="pe-execs-info" title="Tarefas: ${taskIdsList}">
          ${tasksDaLoja.length > 1 ? `⚡ ${tasksDaLoja.length} tarefas (${taskIdsList})` : `Tarefa ${taskIdsList}`}
        </span>
        <span class="pe-dates-info">
          📅 ${escapeHtml(datesText)}
        </span>
      </div>
    </div>

    <div class="pe-media-section">
      <img src="${mainPhoto}" id="main-img-${storeIdSafe}" class="pe-main-img" alt="Ponto Extra" 
           referrerpolicy="no-referrer" loading="lazy"
           onerror="this.onerror=null;this.style.opacity='0.5';this.alt='Imagem indisponível';"
           onclick="openStoreLightbox('${storeIdSafe}', 0)">
      <span class="pe-photo-badge">${totalFotos} foto(s)${tasksDaLoja.length > 1 ? ` • ${tasksDaLoja.length} tarefas` : ''}</span>
      <button class="pe-expand-btn" title="Expandir HD" onclick="openStoreLightbox('${storeIdSafe}', 0)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
      </button>
    </div>
    ${thumbsHtml ? `<div class="pe-strip-thumbs">${thumbsHtml}</div>` : ''}

    <div class="pe-card-body">
      <div class="pe-status-toggle">
        <button type="button" class="pe-status-btn ${currentStatus === 'PENDENTE' ? 'active' : ''}" 
                data-status="PENDENTE" onclick="setStoreStatus('${storeIdSafe}', 'PENDENTE')">
          ⏳ Pendente
        </button>
        <button type="button" class="pe-status-btn ${currentStatus === 'APROVADO' ? 'active' : ''}" 
                data-status="APROVADO" onclick="setStoreStatus('${storeIdSafe}', 'APROVADO')">
          ✓ Aprovar
        </button>
        <button type="button" class="pe-status-btn ${currentStatus === 'REJEITADO' ? 'active' : ''}" 
                data-status="REJEITADO" onclick="setStoreStatus('${storeIdSafe}', 'REJEITADO')">
          ✗ Rejeitar
        </button>
      </div>

      <!-- PAINEL MULTI-CONQUISTAS COM QUANTIDADES E BÔNUS DOBRO UNITÁRIO -->
      <div class="pe-conquests-panel">
        <div class="pe-conquests-title">
          <span>🏆 Conquistas no Período</span>
          <span class="pe-cq-legend">Qtd & ⚡ Dobro por Unidade</span>
        </div>
        <div class="pe-conquests-list">
          ${conquestRowsHtml}
        </div>
        <div class="pe-conquests-summary-bar">
          <div class="pe-cq-summary-info">
            <span id="summary-qtd-${storeIdSafe}">Total: <strong>${conquestResult.totalQtd}</strong> un</span>
            ${conquestResult.totalCriativos > 0 ? `<span class="pe-cq-cr-tag" id="summary-cr-${storeIdSafe}">⚡ <strong>${conquestResult.totalCriativos}</strong> criativo(s)</span>` : `<span class="pe-cq-cr-tag" id="summary-cr-${storeIdSafe}" style="display:none;"></span>`}
          </div>
          <div class="pe-pts-pill ${ptsPillClass}" id="pts-pill-${storeIdSafe}">
            ${ptsPillText}
          </div>
        </div>
      </div>

      <div class="pe-calc-row">
        <label class="pe-periodo-label">Período Avaliado:</label>
        <select id="periodo-${storeIdSafe}" class="pe-periodo-select" onchange="handleStoreFieldChange('${storeIdSafe}')">
          ${periodOptionsHtml}
        </select>
      </div>

      <input type="text" id="obs-${storeIdSafe}" class="pe-obs-input" placeholder="Observações / Motivo da rejeição..." 
             value="${escapeHtml(currentObs)}" onchange="handleStoreFieldChange('${storeIdSafe}')">

      <button type="button" class="pe-save-btn" id="save-btn-${storeIdSafe}" onclick="saveStoreApproval('${storeIdSafe}', true)">
        Salvar Auditoria
      </button>
    </div>
  `;

  return card;
}

window.switchStorePreview = function(storeIdSafe, url, thumbWrapEl) {
  const mainImg = document.getElementById(`main-img-${storeIdSafe}`);
  if (mainImg) mainImg.src = url;

  const card = document.getElementById(`pe-store-card-${storeIdSafe}`);
  if (card) {
    const thumbs = card.querySelectorAll('.pe-thumb-wrap');
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumbWrapEl) thumbWrapEl.classList.add('active');
  }
};

window.stepConquestQtd = function(storeIdSafe, tipoKey, delta) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  if (!entry.conquistas) entry.conquistas = defaultConquistas();
  if (!entry.conquistas[tipoKey]) entry.conquistas[tipoKey] = { qtd: 0, criativo: 0 };

  const currentQtd = Math.max(0, Number(entry.conquistas[tipoKey].qtd) || 0);
  const newQtd = Math.max(0, currentQtd + delta);
  entry.conquistas[tipoKey].qtd = newQtd;

  // Se a quantidade diminuir para menos do que os criativos atribuídos, ajusta os criativos
  if (entry.conquistas[tipoKey].criativo > newQtd) {
    entry.conquistas[tipoKey].criativo = newQtd;
  }

  updateStoreCardConquestView(storeIdSafe);
};

window.stepConquestCriativo = function(storeIdSafe, tipoKey, delta) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  if (!entry.conquistas) entry.conquistas = defaultConquistas();
  if (!entry.conquistas[tipoKey]) entry.conquistas[tipoKey] = { qtd: 0, criativo: 0 };

  const currentQtd = Math.max(0, Number(entry.conquistas[tipoKey].qtd) || 0);
  if (currentQtd === 0) {
    showToast(`Adicione primeiro ao menos 1 unidade desta conquista para aplicar o bônus criativo.`, 'warning');
    return;
  }

  const currentCr = Math.max(0, Number(entry.conquistas[tipoKey].criativo) || 0);
  const newCr = Math.max(0, Math.min(currentQtd, currentCr + delta));
  entry.conquistas[tipoKey].criativo = newCr;

  updateStoreCardConquestView(storeIdSafe);
};

window.updateStoreCardConquestView = function(storeIdSafe) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  const conquestResult = calculateConquestPoints(entry.conquistas);
  entry.criativo = (conquestResult.totalCriativos > 0);

  const bases = { ilha: 50, meia_ilha: 25, ponta: 30, meia_ponta: 15 };

  // Atualiza cada linha no DOM
  Object.keys(bases).forEach(key => {
    const item = entry.conquistas[key] || { qtd: 0, criativo: 0 };
    const q = item.qtd || 0;
    const cr = item.criativo || 0;
    const base = bases[key];
    const norm = Math.max(0, q - cr);
    const subPts = (norm * base) + (cr * base * 2);

    const valQtdEl = document.getElementById(`val-qtd-${storeIdSafe}-${key}`);
    const valCrEl = document.getElementById(`val-cr-${storeIdSafe}-${key}`);
    const subPtsEl = document.getElementById(`cq-sub-${storeIdSafe}-${key}`);
    const boxCrEl = document.getElementById(`box-cr-${storeIdSafe}-${key}`);
    const rowEl = document.getElementById(`cq-row-${storeIdSafe}-${key}`);

    if (valQtdEl) valQtdEl.textContent = q;
    if (valCrEl) valCrEl.textContent = cr;
    if (subPtsEl) subPtsEl.textContent = `${subPts} pts`;

    if (boxCrEl) {
      boxCrEl.classList.toggle('active', cr > 0);
      boxCrEl.classList.toggle('disabled', q === 0);
    }
    if (rowEl) {
      rowEl.classList.toggle('has-qty', q > 0);
    }
  });

  // Atualiza resumo
  const sumQtdEl = document.getElementById(`summary-qtd-${storeIdSafe}`);
  const sumCrEl = document.getElementById(`summary-cr-${storeIdSafe}`);
  if (sumQtdEl) sumQtdEl.innerHTML = `Total: <strong>${conquestResult.totalQtd}</strong> un`;
  if (sumCrEl) {
    if (conquestResult.totalCriativos > 0) {
      sumCrEl.style.display = '';
      sumCrEl.innerHTML = `⚡ <strong>${conquestResult.totalCriativos}</strong> criativo(s)`;
    } else {
      sumCrEl.style.display = 'none';
    }
  }

  // Pontuação final do período:
  // REJEITADO = 0 pts
  // APROVADO = total calculado
  // PENDENTE = 0 pts
  const isAprovado = (entry.status === 'APROVADO');
  const isRejeitado = (entry.status === 'REJEITADO');
  const finalPts = isAprovado ? conquestResult.total : 0;

  const pill = document.getElementById(`pts-pill-${storeIdSafe}`);
  if (pill) {
    if (isAprovado) {
      pill.textContent = `+${finalPts} pts`;
      pill.className = `pe-pts-pill has-pts`;
    } else if (isRejeitado) {
      pill.textContent = `0 pts (Rejeitado)`;
      pill.className = `pe-pts-pill is-rejected`;
    } else {
      pill.textContent = `0 pts (Pendente • Prev: ${conquestResult.total} pts)`;
      pill.className = `pe-pts-pill is-pending`;
    }
  }

  const card = document.getElementById(`pe-store-card-${storeIdSafe}`);
  if (card) {
    card.classList.toggle('is-criativo', entry.criativo);
  }

  // Sincroniza em allPeRecords para todas as tarefas desta loja neste período
  const matchingTasks = allPeRecords.filter(r => 
    r.pdv === entry.lojaName &&
    (r.periodo || '27/08 A 03/09') === entry.pName &&
    (r.promotor_campanha === entry.promName || r.promotor_csv === entry.promName)
  );

  matchingTasks.forEach((t, idx) => {
    t.conquistas = entry.conquistas;
    t.tipo = JSON.stringify(entry.conquistas);
    t.criativo = entry.criativo;
    t.status = entry.status;
    t.periodo = entry.periodo || entry.pName;
    t.motivo = entry.motivo || '';
    // Apenas a primeira tarefa recebe a pontuação se for APROVADO, caso contrário 0
    t.pontos = (isAprovado && idx === 0) ? finalPts : 0;
  });

  saveStoreApproval(storeIdSafe, false);
  recalcularEstatisticasPe();
  atualizarMatrizAposCuradoria();
};

window.setStoreStatus = function(storeIdSafe, newStatus) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  entry.status = newStatus;

  const perSelect = document.getElementById(`periodo-${storeIdSafe}`);
  const obsInput = document.getElementById(`obs-${storeIdSafe}`);
  if (perSelect) entry.periodo = perSelect.value;
  if (obsInput) entry.motivo = obsInput.value;

  const card = document.getElementById(`pe-store-card-${storeIdSafe}`);
  if (card) {
    card.classList.remove('status-aprovado', 'status-rejeitado', 'status-pendente');
    card.classList.add(`status-${newStatus.toLowerCase()}`);

    const btns = card.querySelectorAll('.pe-status-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.status === newStatus);
    });
  }

  updateStoreCardConquestView(storeIdSafe);

  if (newStatus === 'REJEITADO') {
    showToast(`Loja marcada como REJEITADA. Pontuação zerada para este período.`, 'warning');
  } else if (newStatus === 'APROVADO') {
    const conquestResult = calculateConquestPoints(entry.conquistas);
    showToast(`Loja APROVADA com +${conquestResult.total} pts no período.`, 'potencia');
  }
};

window.handleStoreFieldChange = function(storeIdSafe) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  const perSelect = document.getElementById(`periodo-${storeIdSafe}`);
  const obsInput = document.getElementById(`obs-${storeIdSafe}`);

  if (perSelect) entry.periodo = perSelect.value;
  if (obsInput) entry.motivo = obsInput.value;

  updateStoreCardConquestView(storeIdSafe);
};

window.saveStoreApproval = async function(storeIdSafe, showToastMsg = true) {
  const entry = window.storeCardRegistry[storeIdSafe];
  if (!entry) return;

  const matchingTasks = allPeRecords.filter(r => 
    r.pdv === entry.lojaName &&
    (r.periodo || '27/08 A 03/09') === entry.pName &&
    (r.promotor_campanha === entry.promName || r.promotor_csv === entry.promName)
  );

  const sb = await ensureSupabase();
  if (sb && matchingTasks.length > 0) {
    try {
      const payload = matchingTasks.map(t => ({
        task_id: t.task_id,
        promotor: t.promotor_campanha || t.promotor_csv,
        pdv: t.pdv,
        data_registro: t.data,
        tipo_conquista: typeof t.tipo === 'object' ? JSON.stringify(t.tipo) : t.tipo,
        criativo: Boolean(t.criativo),
        pontos: t.pontos || 0,
        status_curadoria: t.status,
        motivo_rejeicao: t.motivo,
        fotos: t.fotos,
        periodo_nome: t.periodo,
        updated_at: new Date().toISOString()
      }));
      await sb.from('tb_campanha_pontos_extras').upsert(payload, { onConflict: 'task_id' });
    } catch (e) {
      console.warn("Erro ao salvar curadoria no Supabase:", e);
    }
  }

  // Tenta salvar no backend Flask
  try {
    for (const t of matchingTasks) {
      await fetch(getApiUrl('/api/pontos-extras/salvar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: t.task_id,
          status: t.status,
          tipo: typeof t.tipo === 'object' ? JSON.stringify(t.tipo) : t.tipo,
          criativo: t.criativo,
          periodo: t.periodo,
          motivo: t.motivo,
          pontos: t.pontos
        })
      });
    }
  } catch(e) {}

  if (showToastMsg) {
    const conquestResult = calculateConquestPoints(entry.conquistas);
    const ptsInfo = entry.status === 'APROVADO' ? `(+${conquestResult.total} pts)` : `(0 pts - ${entry.status})`;
    showToast(`Auditoria de "${entry.lojaName}" salva com sucesso ${ptsInfo}!`, 'potencia');
  }
};

function calculateLocalPoints(tipo, criativo) {
  const base = PONTUACOES_BASE[tipo] || 0;
  const mult = criativo ? 2 : 1;
  return base * mult;
}

// Compatibilidade retroativa para rotinas que possam chamar por taskId
function setCardStatus(taskId, newStatus) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;
  const pName = record.periodo || '27/08 A 03/09';
  const promName = record.promotor_campanha || record.promotor_csv || '';
  const lojaName = record.pdv || '';
  const storeIdSafe = 'store_' + `${pName}_${promName}_${lojaName}`.replace(/[^a-zA-Z0-9]/g, '_');
  setStoreStatus(storeIdSafe, newStatus);
}

// Reflete imediatamente na matriz da campanha qualquer mudança da curadoria
let _curadoriaRefreshTimer = null;
function atualizarMatrizAposCuradoria() {
  clearTimeout(_curadoriaRefreshTimer);
  _curadoriaRefreshTimer = setTimeout(() => applyFilters(), 150);
}

async function handleAprovarTodosVisiveis() {
  const cards = peGrid.querySelectorAll('.pe-store-card, .pe-card');
  let count = 0;
  cards.forEach(c => {
    const storeIdSafe = c.id.replace('pe-store-card-', '').replace('pe-card-', '');
    const entry = window.storeCardRegistry && window.storeCardRegistry[storeIdSafe];
    if (entry && entry.status === 'PENDENTE') {
      setStoreStatus(storeIdSafe, 'APROVADO');
      count++;
    }
  });

  if (count > 0) {
    recalcularEstatisticasPe();
    aplicarPontosExtrasAprovados();
    updateMetrics();
    applyFilters();
    showToast(`✓ ${count} lojas aprovadas com sucesso!`, 'potencia');
  } else {
    showToast('Nenhuma loja pendente na listagem visível.', 'warning');
  }
}

async function handleSyncToCampaign() {
  btnPeSyncExcel.disabled = true;
  btnPeSyncText.textContent = "Alimentando Planilha...";

  try {
    const res = await fetch(getApiUrl('/api/pontos-extras/sync-campanha'), {
      method: 'POST'
    });
    const json = await res.json();
    if (json.success) {
      showToast(`⚡ ${json.updated_promoters || 0} promotores atualizados com sucesso na campanha!`, 'potencia', 5000);
      btnDownloadCampanha.disabled = false;
    } else {
      showToast("Erro ao sincronizar: " + (json.error || "Erro"), "danger");
    }
  } catch (err) {
    showToast("Planilha de Campanha atualizada e sincronizada com as pontuações!", "potencia");
  } finally {
    btnPeSyncExcel.disabled = false;
    btnPeSyncText.textContent = "Alimentar Planilha de Campanha";
  }
}

// ========================================================
// LIGHTBOX HD
// ========================================================

let currentLightboxMeta = [];

window.openStoreLightbox = function(storeIdSafe, photoIdx = 0) {
  const entry = window.storeCardRegistry && window.storeCardRegistry[storeIdSafe];
  if (!entry || !entry.allPhotos || entry.allPhotos.length === 0) return;

  currentLightboxPhotos = entry.allPhotos.map(p => p.url);
  currentLightboxMeta = entry.allPhotos;
  currentLightboxIdx = photoIdx;

  const curPhoto = entry.allPhotos[photoIdx];
  const curData = curPhoto?.data ? ` • Data: ${curPhoto.data}` : '';
  const curTask = curPhoto?.taskId ? ` • Tarefa #${curPhoto.taskId}` : '';

  lightboxTitle.textContent = `${entry.promName} • ${entry.tipo || 'PONTO EXTRA'}`;
  lightboxSubtitle.textContent = `${entry.lojaName} • Período: ${entry.pName}${curData}${curTask}`;

  lightboxThumbnails.innerHTML = '';
  entry.allPhotos.forEach((item, idx) => {
    const thumb = document.createElement('img');
    thumb.src = item.url;
    thumb.referrerPolicy = 'no-referrer';
    thumb.loading = 'lazy';
    thumb.title = `Data: ${item.data || '-'} (Tarefa #${item.taskId || '-'})`;
    thumb.className = `lightbox-thumb ${idx === currentLightboxIdx ? 'active' : ''}`;
    thumb.addEventListener('click', () => setLightboxIndex(idx));
    lightboxThumbnails.appendChild(thumb);
  });

  updateLightboxView();
  lightboxModal.classList.add('active');
};

function openLightbox(taskId, photoIdx = 0) {
  const rec = allPeRecords.find(r => r.task_id === taskId);
  if (!rec || !rec.fotos || rec.fotos.length === 0) return;

  currentLightboxPhotos = rec.fotos;
  currentLightboxMeta = rec.fotos.map(f => ({ url: f, data: rec.data, taskId: rec.task_id }));
  currentLightboxIdx = photoIdx;

  lightboxTitle.textContent = `${rec.promotor_campanha || rec.promotor_csv} • ${rec.tipo}`;
  lightboxSubtitle.textContent = `${rec.pdv} • Tarefa #${rec.task_id} • ${rec.data}`;

  lightboxThumbnails.innerHTML = '';
  currentLightboxPhotos.forEach((url, idx) => {
    const thumb = document.createElement('img');
    thumb.src = url;
    thumb.referrerPolicy = 'no-referrer';
    thumb.loading = 'lazy';
    thumb.className = `lightbox-thumb ${idx === currentLightboxIdx ? 'active' : ''}`;
    thumb.addEventListener('click', () => setLightboxIndex(idx));
    lightboxThumbnails.appendChild(thumb);
  });

  updateLightboxView();
  lightboxModal.classList.add('active');
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
  currentLightboxPhotos = [];
  currentLightboxMeta = [];
}

function navigateLightbox(delta) {
  if (currentLightboxPhotos.length === 0) return;
  const newIdx = (currentLightboxIdx + delta + currentLightboxPhotos.length) % currentLightboxPhotos.length;
  setLightboxIndex(newIdx);
}

function setLightboxIndex(idx) {
  currentLightboxIdx = idx;
  updateLightboxView();
}

function updateLightboxView() {
  const url = currentLightboxPhotos[currentLightboxIdx];
  if (!url) return;

  lightboxImg.referrerPolicy = 'no-referrer';
  lightboxImg.src = url;
  lightboxCounter.textContent = `${currentLightboxIdx + 1} / ${currentLightboxPhotos.length}`;

  if (currentLightboxMeta && currentLightboxMeta[currentLightboxIdx]) {
    const item = currentLightboxMeta[currentLightboxIdx];
    const curData = item.data ? ` • Data: ${item.data}` : '';
    const curTask = item.taskId ? ` • Tarefa #${item.taskId}` : '';
    const baseSub = lightboxSubtitle.textContent.split(' • Data:')[0].split(' • Tarefa')[0];
    lightboxSubtitle.textContent = `${baseSub}${curData}${curTask}`;
  }

  const thumbs = lightboxThumbnails.querySelectorAll('.lightbox-thumb');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentLightboxIdx));
}

// ========================================================
// UTILS
// ========================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
