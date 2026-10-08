// ========================================================
// API CONFIGURATION (INTEGRATED WITH OBJETIVA ANALYTICS)
// ========================================================
const API_BASE = (window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
function getApiUrl(path) {
  return API_BASE + path;
}
// ========================================================
// STATE MANAGEMENT
// ========================================================

// Assiduidade & Pontualidade State
let allPromotores = [];
let currentPromotor = null;
let activeModalPeriodIdx = 0;
let colaboradoresObjetiva = []; // Base de Colaboradores carregada do Objetiva Analytics (Supabase)

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
// INITIALIZATION & TAB SWITCHING
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  setupEventListeners();
  carregarColaboradoresObjetiva();
  loadPontosExtrasData();
});

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
    });
  });
}

function setupEventListeners() {
  // Assiduidade listeners
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
  btnPeExportAudit.addEventListener('click', () => window.location.href = getApiUrl('/api/pontos-extras/exportar-excel'));
  if (btnPeExportPdf) {
    btnPeExportPdf.addEventListener('click', () => window.location.href = getApiUrl('/api/pontos-extras/exportar-pdf'));
  }
  btnPeSyncExcel.addEventListener('click', handleSyncToCampaign);

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
// INTEGRAÇÃO COM BANCO DE DADOS DE COLABORADORES (SUPABASE)
// ========================================================

async function carregarColaboradoresObjetiva() {
  if (staffBaseCount) staffBaseCount.textContent = "Conectando ao Supabase...";
  if (staffBaseBadge) {
    staffBaseBadge.textContent = "Carregando";
    staffBaseBadge.className = "file-status";
  }

  try {
    if (!window.supabase) {
      console.warn("Supabase ainda não inicializado, tentando novamente em 500ms...");
      setTimeout(carregarColaboradoresObjetiva, 500);
      return [];
    }

    // 1. Tenta carregar da base oficial de colaboradores
    const { data: staffData, error: staffError } = await window.supabase
      .from('tb_colaboradores')
      .select('*')
      .order('nome', { ascending: true });

    if (!staffError && staffData && staffData.length > 0) {
      // Filtrar apenas ativos
      colaboradoresObjetiva = staffData
        .filter(s => s.ativo !== false)
        .map(s => ({
          nome: (s.nome || '').trim().toUpperCase(),
          projeto: s.projeto || 'GERAL',
          cargo: s.cargo || 'PROMOTOR',
          equipe: s.cargo || s.projeto || 'PROMOTOR'
        }));
    } else {
      // 2. Fallback inteligente: buscar colaboradores cadastrados em tb_planilha
      const { data: planData } = await window.supabase
        .from('tb_planilha')
        .select('agente, projeto')
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
              equipe: 'PROMOTOR'
            };
          }
        });
        colaboradoresObjetiva = Object.values(unique);
      }
    }

    const count = colaboradoresObjetiva.length;
    if (staffBaseCount) {
      staffBaseCount.textContent = count > 0 
        ? `${count} colaboradores ativos vinculados`
        : "Nenhum colaborador na base (usando planilha padrão)";
    }
    if (staffBaseBadge) {
      staffBaseBadge.textContent = count > 0 ? "Sincronizado" : "Pendente";
      staffBaseBadge.className = count > 0 ? "file-status ready" : "file-status";
    }

    return colaboradoresObjetiva;
  } catch (err) {
    console.error("Erro ao carregar colaboradores do Objetiva:", err);
    if (staffBaseCount) staffBaseCount.textContent = "Usando planilha local";
    if (staffBaseBadge) staffBaseBadge.textContent = "Local";
    return [];
  }
}

async function salvarCampanhaNoSupabase() {
  if (!allPromotores || allPromotores.length === 0) {
    showToast("Processe as pontuações primeiro antes de salvar no Supabase.", "danger");
    return;
  }

  if (!window.supabase) {
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

    const { error } = await window.supabase
      .from('tb_campanha_colaboradores')
      .upsert(registros, { onConflict: 'nome,mes_referencia' });

    if (error) {
      console.error("Erro Supabase:", error);
      if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        showToast("Tabela 'tb_campanha_colaboradores' não encontrada no Supabase. Execute o script create_campanha_tables.sql no SQL Editor do Supabase.", "danger", 8000);
      } else {
        showToast("Erro ao salvar no Supabase: " + error.message, "danger", 6000);
      }
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
// ASSIDUIDADE & PONTUALIDADE LOGIC (PRESERVED & EXPANDED)
// ========================================================

async function processScores() {
  btnProcess.classList.add('is-loading');
  btnProcess.disabled = true;
  btnProcessText.textContent = "Processando Planilhas...";

  const formData = new FormData();
  formData.append('tolerance', toleranceInput.value);
  formData.append('bonus', bonusInput.value);

  // Enviar a base oficial de colaboradores se houver
  if (colaboradoresObjetiva && colaboradoresObjetiva.length > 0) {
    formData.append('colaboradores', JSON.stringify(colaboradoresObjetiva));
  }

  try {
    const res = await fetch(getApiUrl('/api/process'), {
      method: 'POST',
      body: formData
    });
    const json = await res.json();

    if (json.success) {
      const data = json.data;
      allPromotores = data.promotores;
      updateMetrics(data.metrics);
      applyFilters();

      btnDownloadCampanha.disabled = false;
      btnExportAudit.disabled = false;
      if (btnSalvarSupabase) btnSalvarSupabase.disabled = false;
      showToast("Folha de ponto e campanha processadas com sucesso!", "success");
    } else {
      showToast("Erro ao processar: " + (json.error || "Erro desconhecido"), "danger", 5000);
    }
  } catch (err) {
    showToast("Não foi possível conectar ao servidor (127.0.0.1:5000). Certifique-se de que o backend Python está ativo executando iniciar_painel.bat.", "danger", 6000);
  } finally {
    btnProcess.classList.remove('is-loading');
    btnProcess.disabled = false;
    btnProcessText.textContent = "Processar Pontuações";
  }
}

function updateMetrics(metrics) {
  valTotalProm.textContent = metrics.total_promotores;
  valTotalFaltas.textContent = metrics.total_faltas;
  valTotalAssidPts.textContent = `${metrics.total_faltas * -50} pontos deduzidos no mês`;
  valTotalPont.textContent = `+${metrics.total_pontos_pontualidade} pts`;
  valPromBonus.textContent = metrics.promotores_com_bonus;
  if (valSemContrato) valSemContrato.textContent = metrics.total_sem_contrato || 0;
}

function applyFilters() {
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

  renderTable(filtered);
}

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

    let periodCellsHtml = '';
    if (p.status === 'OK' && p.periodos) {
      p.periodos.forEach(per => {
        const assidBadge = per.faltas > 0 ? 
          `<span class="badge-faltas font-mono" title="${per.faltas} falta(s)">-${per.faltas * 50} pts</span>` : 
          `<span class="text-muted font-mono" title="Sem faltas">0</span>`;

        const pontBadge = `<span class="badge-pont font-mono" title="${per.dias_pontuais} dias pontuais">+${per.pontos_pontualidade_total}</span>`;

        periodCellsHtml += `
          <td class="td-center">
            <div class="period-cell-compact">
              <div>${assidBadge}</div>
              <div>${pontBadge}</div>
            </div>
          </td>
        `;
      });
    } else {
      periodCellsHtml = `<td colspan="5" class="td-center text-muted">Folha não localizada</td>`;
    }

    const bonusCell = hasBonusTotal ? 
      `<span class="badge-bonus-star">★ 30 pts</span>` : 
      `<span class="text-muted">-</span>`;

    const contratoBadge = p.contrato ? 
      `<span class="tag-contrato">${escapeHtml(p.contrato)}</span>` : 
      (p.sem_contrato ? `<span class="tag-contrato tag-contrato-alerta">Sem Contrato</span>` : '');

    tr.innerHTML = `
      <td>
        <div class="promotor-name">${escapeHtml(p.nome)}</div>
        <div class="promotor-meta">${contratoBadge}</div>
      </td>
      <td>
        <div><span class="project-tag ${p.projeto === 'EXCLUSIVO' ? 'proj-exclusivo' : 'proj-compartilhado'}">${p.projeto || '-'}</span></div>
        <small class="team-tag">${p.equipe || '-'}</small>
      </td>
      ${periodCellsHtml}
      <td class="td-center">${bonusCell}</td>
      <td class="td-action">
        <button class="btn-table-action" onclick="openModal('${escapeHtml(p.nome)}')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Auditar
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function openModal(nome) {
  const p = allPromotores.find(item => item.nome === nome);
  if (!p) return;

  currentPromotor = p;
  activeModalPeriodIdx = 0;

  modalPromotorName.textContent = p.nome;
  modalPromotorMeta.textContent = `Projeto: ${p.projeto || '-'} • Equipe: ${p.equipe || '-'} • Contrato: ${p.contrato || 'N/A'}`;

  modalPeriodTabs.innerHTML = '';
  p.periodos.forEach((per, idx) => {
    const tabBtn = document.createElement('button');
    tabBtn.className = `modal-tab-btn ${idx === 0 ? 'active' : ''}`;
    tabBtn.textContent = per.period_name;
    tabBtn.onclick = () => selectModalPeriod(idx);
    modalPeriodTabs.appendChild(tabBtn);
  });

  renderModalPeriod(0);
  detailModal.classList.add('active');
}

function closeModal() {
  detailModal.classList.remove('active');
}

function selectModalPeriod(idx) {
  activeModalPeriodIdx = idx;
  const buttons = modalPeriodTabs.querySelectorAll('.modal-tab-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
  renderModalPeriod(idx);
}

function renderModalPeriod(idx) {
  if (!currentPromotor || !currentPromotor.periodos[idx]) return;
  const per = currentPromotor.periodos[idx];

  modalPeriodSummary.innerHTML = `
    <div class="chip ${per.faltas > 0 ? 'chip-danger' : 'chip-neutral'}">
      <strong>Faltas:</strong> ${per.faltas} (${per.pontos_assiduidade} pts)
    </div>
    <div class="chip chip-success">
      <strong>Dias Pontuais:</strong> ${per.dias_pontuais} de ${per.dias_trabalhados} trabalhados (+${per.pontos_pontualidade_base} pts)
    </div>
    <div class="chip chip-neutral">
      <strong>Dias com Atraso:</strong> ${per.dias_com_atraso}
    </div>
    ${per.ganhou_bonus ? `<div class="chip chip-success" style="background:rgba(251,191,36,0.15);color:#fcd34d;">🏆 4 Semanas 100%: +${per.bonus_complemento} pts (Fechou 30 pts)</div>` : ''}
    <div class="chip chip-neutral">
      <strong>Total Pontualidade Período:</strong> +${per.pontos_pontualidade_total} pts
    </div>
  `;

  modalDaysBody.innerHTML = '';
  per.detalhes_dias.forEach(d => {
    const tr = document.createElement('tr');

    const statusBadge = `<span class="status-badge status-${d.status}">${d.status}</span>`;
    const pontualBadge = d.status === 'TRABALHADO' ? 
      (d.pontual ? '<span class="text-success font-bold">✓ SIM</span>' : '<span class="text-danger font-bold">✗ NÃO</span>') : '-';

    const atrasoText = d.atraso_min > 0 ? `<span class="text-danger font-bold">+${d.atraso_min}m</span>` : '<span class="text-muted">0m</span>';
    const estouroText = d.estouro_int_min > 0 ? `<span class="text-danger font-bold">+${d.estouro_int_min}m</span>` : '<span class="text-muted">0m</span>';

    tr.innerHTML = `
      <td><strong>${d.date_br}</strong></td>
      <td style="color:var(--text-muted);">${d.dia_sem}</td>
      <td class="time-val">${d.exec_in || '-'}</td>
      <td class="time-val" style="color:var(--text-muted);">${d.plan_in || '-'}</td>
      <td>${d.status === 'TRABALHADO' ? atrasoText : '-'}</td>
      <td class="time-val">${d.exec_int || '-'}</td>
      <td class="time-val" style="color:var(--text-muted);">${d.plan_int || '-'}</td>
      <td>${d.status === 'TRABALHADO' ? estouroText : '-'}</td>
      <td>${statusBadge}</td>
      <td>${pontualBadge}</td>
      <td style="font-size:0.78rem; max-width:240px; color:var(--text-light);">${escapeHtml(d.motivo_falta || d.obs || '-')}</td>
    `;
    modalDaysBody.appendChild(tr);
  });
}

// ========================================================
// PONTOS EXTRAS ENGINE CLIENT
// ========================================================

async function loadPontosExtrasData() {
  try {
    const res = await fetch(getApiUrl('/api/pontos-extras'));
    const json = await res.json();

    if (json.success) {
      allPeRecords = json.records;
      pePeriods = json.periods || [];
      peStats = json.stats || {};

      updatePeMetrics(peStats);
      populatePeFilters();
      renderPeCards();
    } else {
      peGrid.innerHTML = `
        <div class="pe-loading-card">
          <h4>Erro ao carregar dados de pontos extras</h4>
          <p>${escapeHtml(json.error)}</p>
        </div>
      `;
    }
  } catch (err) {
    peGrid.innerHTML = `
      <div class="pe-loading-card">
        <h4>Aguardando Servidor de Campanha (Python)</h4>
        <p>Para ler os dados e fotos dos pontos extras, inicie o servidor Python executando <strong>iniciar_painel.bat</strong> (porta 5000).</p>
        <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="loadPontosExtrasData()">Tentar Novamente</button>
      </div>
    `;
  }
}

function updatePeMetrics(stats) {
  peTotalReg.textContent = stats.total_registros || 0;
  peTotalProms.textContent = `${stats.promoters ? stats.promoters.length : 0} colaboradores distintos`;
  peTotalPend.textContent = stats.total_pendentes || 0;
  peTotalAprov.textContent = stats.total_aprovados || 0;
  peTotalRejeit.textContent = `${stats.total_rejeitados || 0} reprovados`;
  peTotalPts.textContent = `+${stats.total_pontos || 0} pts`;
  peTotalCriativos.textContent = `${stats.total_criativos || 0} conquistas`;

  // Update tab badge
  const pend = stats.total_pendentes || 0;
  tabPeBadge.textContent = `${pend} pendente${pend !== 1 ? 's' : ''}`;
  if (pend > 0) {
    tabPeBadge.style.display = 'inline-block';
  } else {
    tabPeBadge.textContent = '0 pendentes';
  }
}

function populatePeFilters() {
  // Periods dropdown
  peFilterPeriodo.innerHTML = '<option value="">Todos os Períodos</option>';
  pePeriods.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = `P${idx+1}: ${p}`;
    peFilterPeriodo.appendChild(opt);
  });

  // Promoters dropdown
  peFilterPromotor.innerHTML = '<option value="">Todos os Colaboradores</option>';
  if (peStats.promoters) {
    peStats.promoters.forEach(pName => {
      const opt = document.createElement('option');
      opt.value = pName;
      opt.textContent = pName;
      peFilterPromotor.appendChild(opt);
    });
  }
}

function renderPeCards() {
  const query = peSearchInput.value.toLowerCase().trim();
  const perFilter = peFilterPeriodo.value;
  const promFilter = peFilterPromotor.value;
  const statusFilter = peFilterStatus.value;
  const tipoFilter = peFilterTipo.value;

  const filtered = allPeRecords.filter(r => {
    // Search query
    const matchQuery = !query ||
      r.promotor_csv.toLowerCase().includes(query) ||
      (r.promotor_campanha && r.promotor_campanha.toLowerCase().includes(query)) ||
      r.pdv.toLowerCase().includes(query) ||
      r.atividade.toLowerCase().includes(query) ||
      r.task_id.toLowerCase().includes(query);

    // Period filter
    const matchPer = !perFilter || r.periodo === perFilter;

    // Promoter filter
    const matchProm = !promFilter || r.promotor_campanha === promFilter || r.promotor_csv === promFilter;

    // Status filter
    const matchStatus = !statusFilter || r.status === statusFilter;

    // Tipo filter
    const matchTipo = !tipoFilter || r.tipo === tipoFilter;

    return matchQuery && matchPer && matchProm && matchStatus && matchTipo;
  });

  peCountDisplay.textContent = `${filtered.length} de ${allPeRecords.length} registros exibidos`;
  peGrid.innerHTML = '';

  if (filtered.length === 0) {
    peGrid.innerHTML = `
      <div class="pe-loading-card">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h4>Nenhum ponto extra corresponde aos filtros selecionados</h4>
        <p>Ajuste os filtros de período, colaborador ou status.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(r => {
    const card = createPeCardElement(r);
    peGrid.appendChild(card);
  });
}

function createPeCardElement(r) {
  const card = document.createElement('div');
  const statusClass = `status-${r.status.toLowerCase()}`;
  const criativoClass = r.criativo ? 'is-criativo' : '';
  card.className = `pe-card ${statusClass} ${criativoClass}`;
  card.id = `pe-card-${r.task_id}`;

  const mainPhoto = r.fotos[0] || '';
  const totalFotos = r.fotos.length;

  // Header
  const matchBadge = r.matched ? 
    `<span class="pe-match-badge pe-match-ok">✓ Campanha</span>` : 
    `<span class="pe-match-badge pe-match-alert" title="Promotor não localizado exatamente na planilha">⚠️ Verificar</span>`;

  // Photos strip
  let thumbsHtml = '';
  if (totalFotos > 1) {
    r.fotos.forEach((fUrl, fIdx) => {
      thumbsHtml += `
        <img src="${fUrl}" class="pe-thumb-mini ${fIdx === 0 ? 'active' : ''}" 
             alt="Foto ${fIdx+1}" onclick="switchCardPreview('${r.task_id}', '${fUrl}', this)">
      `;
    });
  }

  // Period options for card
  let periodOptionsHtml = '';
  pePeriods.forEach((p, idx) => {
    const selected = (r.periodo === p) ? 'selected' : '';
    periodOptionsHtml += `<option value="${p}" ${selected}>P${idx+1}: ${p}</option>`;
  });
  if (!pePeriods.includes(r.periodo) && r.periodo) {
    periodOptionsHtml += `<option value="${r.periodo}" selected>${r.periodo}</option>`;
  }

  // Points computed
  const currentPts = r.status === 'APROVADO' ? calculateLocalPoints(r.tipo, r.criativo, r.quantidade) : 0;
  const ptsPillText = r.status === 'APROVADO' ? `+${currentPts} pts` : `0 pts`;
  const ptsPillClass = (r.status === 'APROVADO' && currentPts > 0) ? 'has-pts' : '';

  card.innerHTML = `
    <!-- Card Header -->
    <div class="pe-card-header">
      <div class="pe-card-header-top">
        <div class="pe-promotor-name">${escapeHtml(r.promotor_csv)}</div>
        ${matchBadge}
      </div>
      <div class="pe-card-pdv">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>${escapeHtml(r.pdv)}</span>
      </div>
      <div class="pe-card-meta-row">
        <span>📅 ${escapeHtml(r.data_exec)}</span>
        <span>🏷️ ${escapeHtml(r.atividade)}</span>
      </div>
    </div>

    <!-- Media Section -->
    <div class="pe-media-section">
      <img src="${mainPhoto}" id="main-img-${r.task_id}" class="pe-main-img" 
           alt="Foto Ponto Extra" onclick="openLightboxForTask('${r.task_id}', 0)">
      <span class="pe-photo-badge">📷 ${totalFotos} foto${totalFotos !== 1 ? 's' : ''}</span>
      <button class="pe-expand-btn" title="Ver foto em alta resolução com Zoom" onclick="openLightboxForTask('${r.task_id}', 0)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
      ${totalFotos > 1 ? `<div class="pe-strip-thumbs">${thumbsHtml}</div>` : ''}
    </div>

    <!-- Curadoria Form -->
    <div class="pe-card-body">
      <!-- Status Toggles -->
      <div class="pe-status-toggle">
        <button type="button" class="pe-status-btn ${r.status === 'APROVADO' ? 'active' : ''}" 
                data-status="APROVADO" onclick="setCardStatus('${r.task_id}', 'APROVADO')">
          ✓ Aprovar
        </button>
        <button type="button" class="pe-status-btn ${r.status === 'REJEITADO' ? 'active' : ''}" 
                data-status="REJEITADO" onclick="setCardStatus('${r.task_id}', 'REJEITADO')">
          ✗ Rejeitar
        </button>
        <button type="button" class="pe-status-btn ${r.status === 'PENDENTE' ? 'active' : ''}" 
                data-status="PENDENTE" onclick="setCardStatus('${r.task_id}', 'PENDENTE')">
          ⏳ Pendente
        </button>
      </div>

      <!-- Tipo de Ponto Extra -->
      <div class="pe-type-row">
        <label>Classificação do Ponto Extra:</label>
        <select class="pe-select-tipo" id="tipo-${r.task_id}" onchange="handleCardFieldChange('${r.task_id}')">
          <option value="ILHA" ${r.tipo === 'ILHA' ? 'selected' : ''}>🏛️ Ilha (50 pts)</option>
          <option value="MEIA_ILHA" ${r.tipo === 'MEIA_ILHA' ? 'selected' : ''}>📦 Meia Ilha (25 pts)</option>
          <option value="PONTA" ${r.tipo === 'PONTA' ? 'selected' : ''}>🏷️ Ponta de Gôndola (30 pts)</option>
          <option value="MEIA_PONTA" ${r.tipo === 'MEIA_PONTA' ? 'selected' : ''}>🔖 Meia Ponta (15 pts)</option>
        </select>
      </div>

      <!-- Bônus Criativo (Dobro) -->
      <div class="pe-creative-toggle-wrap ${r.criativo ? 'active' : ''}" id="creative-wrap-${r.task_id}" 
           onclick="toggleCardCriativo('${r.task_id}')">
        <div class="pe-creative-label">
          <span>💡</span>
          <div>
            <div>PONTO EXTRA CRIATIVO?</div>
            <small style="color:var(--text-muted);font-weight:normal;">Bônus Especial: Pontuação em DOBRO!</small>
          </div>
        </div>
        <div class="pe-toggle-switch"></div>
      </div>

      <!-- Periodo & Calculated Score -->
      <div class="pe-calc-row">
        <select class="pe-periodo-select" id="periodo-${r.task_id}" onchange="handleCardFieldChange('${r.task_id}')">
          ${periodOptionsHtml}
        </select>
        <div class="pe-pts-pill ${ptsPillClass}" id="pts-pill-${r.task_id}">
          ${ptsPillText}
        </div>
      </div>

      <!-- Observação -->
      <input type="text" class="pe-obs-input" id="obs-${r.task_id}" 
             placeholder="Observação ou motivo (opcional)..." value="${escapeHtml(r.motivo || '')}" 
             onchange="handleCardFieldChange('${r.task_id}')">

      <!-- Action Save Button -->
      <button type="button" class="pe-save-btn" id="save-btn-${r.task_id}" onclick="saveCardApproval('${r.task_id}')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Salvar Curadoria
      </button>
    </div>
  `;

  return card;
}

function calculateLocalPoints(tipo, criativo, quantidade = 1) {
  const base = PONTUACOES_BASE[tipo] || 0;
  const mult = criativo ? 2 : 1;
  return base * quantidade * mult;
}

function switchCardPreview(taskId, url, thumbEl) {
  const mainImg = document.getElementById(`main-img-${taskId}`);
  if (mainImg) mainImg.src = url;

  const card = document.getElementById(`pe-card-${taskId}`);
  if (card) {
    const thumbs = card.querySelectorAll('.pe-thumb-mini');
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  }
}

function setCardStatus(taskId, newStatus) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;

  record.status = newStatus;

  const card = document.getElementById(`pe-card-${taskId}`);
  if (card) {
    card.classList.remove('status-aprovado', 'status-rejeitado', 'status-pendente');
    card.classList.add(`status-${newStatus.toLowerCase()}`);

    const btns = card.querySelectorAll('.pe-status-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.status === newStatus);
    });
  }

  updateCardScoreBadge(taskId);
  saveCardApproval(taskId, false); // silent auto-save
}

function toggleCardCriativo(taskId) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;

  record.criativo = !record.criativo;

  const wrap = document.getElementById(`creative-wrap-${taskId}`);
  const card = document.getElementById(`pe-card-${taskId}`);
  if (wrap) wrap.classList.toggle('active', record.criativo);
  if (card) card.classList.toggle('is-criativo', record.criativo);

  updateCardScoreBadge(taskId);
  saveCardApproval(taskId, false);
}

function handleCardFieldChange(taskId) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;

  const tipoSelect = document.getElementById(`tipo-${taskId}`);
  const perSelect = document.getElementById(`periodo-${taskId}`);
  const obsInput = document.getElementById(`obs-${taskId}`);

  if (tipoSelect) record.tipo = tipoSelect.value;
  if (perSelect) record.periodo = perSelect.value;
  if (obsInput) record.motivo = obsInput.value;

  updateCardScoreBadge(taskId);
  saveCardApproval(taskId, false);
}

function updateCardScoreBadge(taskId) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;

  const pill = document.getElementById(`pts-pill-${taskId}`);
  if (!pill) return;

  if (record.status === 'APROVADO') {
    const pts = calculateLocalPoints(record.tipo, record.criativo, record.quantidade);
    record.pontos = pts;
    pill.textContent = `+${pts} pts`;
    pill.className = 'pe-pts-pill has-pts';
  } else {
    record.pontos = 0;
    pill.textContent = '0 pts';
    pill.className = 'pe-pts-pill';
  }
}

async function saveCardApproval(taskId, showToastMsg = true) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record) return;

  const saveBtn = document.getElementById(`save-btn-${taskId}`);
  if (saveBtn) {
    saveBtn.textContent = "Salvando...";
    saveBtn.disabled = true;
  }

  const payload = {
    task_id: taskId,
    status: record.status,
    tipo: record.tipo,
    criativo: record.criativo,
    quantidade: record.quantidade || 1,
    periodo: record.periodo,
    motivo: record.motivo
  };

  try {
    const res = await fetch(getApiUrl('/api/pontos-extras/salvar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      if (json.stats) {
        peStats = json.stats;
        updatePeMetrics(peStats);
      }
      if (saveBtn) {
        saveBtn.classList.add('is-saved');
        saveBtn.textContent = "Salvo ✓";
        setTimeout(() => {
          saveBtn.classList.remove('is-saved');
          saveBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Salvar Curadoria
          `;
          saveBtn.disabled = false;
        }, 1800);
      }
      if (showToastMsg) {
        showToast(`Curadoria da tarefa #${taskId} salva com sucesso!`, 'potencia');
      }
    }
  } catch (err) {
    if (saveBtn) saveBtn.disabled = false;
    showToast(`Erro ao salvar: ${err.message}`, 'danger');
  }
}

// Batch Approval
async function handleAprovarTodosVisiveis() {
  const query = peSearchInput.value.toLowerCase().trim();
  const perFilter = peFilterPeriodo.value;
  const promFilter = peFilterPromotor.value;
  const statusFilter = peFilterStatus.value;
  const tipoFilter = peFilterTipo.value;

  const visibleRecords = allPeRecords.filter(r => {
    const matchQuery = !query ||
      r.promotor_csv.toLowerCase().includes(query) ||
      (r.promotor_campanha && r.promotor_campanha.toLowerCase().includes(query)) ||
      r.pdv.toLowerCase().includes(query) ||
      r.atividade.toLowerCase().includes(query) ||
      r.task_id.toLowerCase().includes(query);
    const matchPer = !perFilter || r.periodo === perFilter;
    const matchProm = !promFilter || r.promotor_campanha === promFilter || r.promotor_csv === promFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchTipo = !tipoFilter || r.tipo === tipoFilter;

    return matchQuery && matchPer && matchProm && matchStatus && matchTipo;
  });

  if (visibleRecords.length === 0) {
    alert("Nenhum registro visível para aprovar.");
    return;
  }

  if (!confirm(`Deseja aprovar todos os ${visibleRecords.length} registros atualmente visíveis?`)) {
    return;
  }

  const updates = [];
  visibleRecords.forEach(r => {
    r.status = 'APROVADO';
    r.pontos = calculateLocalPoints(r.tipo, r.criativo, r.quantidade);
    updates.push({
      task_id: r.task_id,
      status: 'APROVADO',
      tipo: r.tipo,
      criativo: r.criativo,
      quantidade: r.quantidade || 1,
      periodo: r.periodo,
      motivo: r.motivo
    });
  });

  try {
    const res = await fetch(getApiUrl('/api/pontos-extras/salvar-lote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    const json = await res.json();
    if (json.success) {
      if (json.stats) {
        peStats = json.stats;
        updatePeMetrics(peStats);
      }
      renderPeCards();
      showToast(`${visibleRecords.length} registros aprovados com sucesso!`, 'success');
    }
  } catch (err) {
    showToast(`Erro na aprovação em lote: ${err.message}`, 'danger');
  }
}

// Sync to Excel
async function handleSyncToCampaign() {
  btnPeSyncExcel.disabled = true;
  btnPeSyncText.textContent = "Alimentando Planilha...";

  try {
    const res = await fetch(getApiUrl('/api/pontos-extras/alimentar-planilha'), {
      method: 'POST'
    });
    const json = await res.json();

    if (json.success) {
      btnDownloadCampanha.disabled = false;
      const totalColabs = json.items_updated || 0;
      
      // Sincronizar também no Supabase se houver registros
      salvarPontosExtrasNoSupabase(allPeRecords);

      showToast(`Sucesso! ${totalColabs} lançamentos de pontos extras alimentados na planilha e sincronizados com Supabase`, 'potencia', 5000);
    } else {
      showToast("Erro ao alimentar planilha: " + (json.error || "Erro desconhecido"), 'danger');
    }
  } catch (err) {
    showToast("Erro na requisição: " + err.message, 'danger');
  } finally {
    btnPeSyncExcel.disabled = false;
    btnPeSyncText.textContent = "Alimentar Planilha de Campanha";
  }
}

async function salvarPontosExtrasNoSupabase(records) {
  if (!window.supabase || !records || records.length === 0) return;
  try {
    const payload = records.map(r => ({
      task_id: r.task_id,
      promotor: (r.promotor || '').trim().toUpperCase(),
      pdv: r.pdv || '',
      data_registro: r.data || '',
      tipo_conquista: r.tipo_aprovado || r.tipo_detectado || 'NENHUM',
      criativo: !!r.criativo,
      pontos: r.pontos || 0,
      status_curadoria: r.status || 'PENDENTE',
      motivo_rejeicao: r.motivo_rejeicao || '',
      fotos: r.fotos || [],
      periodo_nome: r.periodo_nome || '',
      updated_at: new Date().toISOString()
    }));

    const { error } = await window.supabase
      .from('tb_campanha_pontos_extras')
      .upsert(payload, { onConflict: 'task_id' });

    if (error) {
      console.warn("Aviso ao salvar pontos extras no Supabase:", error.message);
    } else {
      console.log(`Pontos extras sincronizados no Supabase (${payload.length} registros).`);
    }
  } catch (e) {
    console.warn("Erro ao sincronizar pontos extras no Supabase:", e);
  }
}

// ========================================================
// LIGHTBOX HD VIEWER
// ========================================================

function openLightboxForTask(taskId, photoIdx = 0) {
  const record = allPeRecords.find(r => r.task_id === taskId);
  if (!record || !record.fotos || record.fotos.length === 0) return;

  currentLightboxPhotos = record.fotos;
  currentLightboxIdx = photoIdx;

  lightboxTitle.textContent = `${record.promotor_csv} • ${record.pdv}`;
  lightboxSubtitle.textContent = `Atividade: ${record.atividade} • Execução: ${record.data_exec}`;

  renderLightboxImage();
  renderLightboxThumbs();

  lightboxModal.classList.add('active');
}

function renderLightboxImage() {
  const url = currentLightboxPhotos[currentLightboxIdx];
  if (!url) return;

  lightboxImg.src = url;
  lightboxCounter.textContent = `${currentLightboxIdx + 1} / ${currentLightboxPhotos.length}`;

  const thumbs = lightboxThumbnails.querySelectorAll('.lightbox-thumb');
  thumbs.forEach((t, i) => {
    t.classList.toggle('active', i === currentLightboxIdx);
  });
}

function renderLightboxThumbs() {
  lightboxThumbnails.innerHTML = '';
  if (currentLightboxPhotos.length <= 1) {
    lightboxThumbnails.style.display = 'none';
    return;
  }
  lightboxThumbnails.style.display = 'flex';

  currentLightboxPhotos.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.className = `lightbox-thumb ${i === currentLightboxIdx ? 'active' : ''}`;
    img.onclick = () => {
      currentLightboxIdx = i;
      renderLightboxImage();
    };
    lightboxThumbnails.appendChild(img);
  });
}

function navigateLightbox(dir) {
  if (currentLightboxPhotos.length <= 1) return;
  currentLightboxIdx += dir;
  if (currentLightboxIdx < 0) currentLightboxIdx = currentLightboxPhotos.length - 1;
  if (currentLightboxIdx >= currentLightboxPhotos.length) currentLightboxIdx = 0;
  renderLightboxImage();
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
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
