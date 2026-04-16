// =============================== CONSTANTES ===============================
const DAY_ORDER = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const DAY_NAMES = {
    SEG: "Seg",
    TER: "Ter",
    QUA: "Qua",
    QUI: "Qui",
    SEX: "Sexta",
    SAB: "Sáb"
};

// =============================== ESTADO GLOBAL ===============================
const state = {
    data: [],
    headers: [],
    selectedPromoter: "",
    processedData: [],
    colMap: {},
    taskCols: [],
    agents: [],
    projectType: "compartilhado" // "compartilhado" ou "exclusivo"
};

// =============================== ELEMENTOS DOM ===============================
const elements = {
    dropZone: document.getElementById("drop-zone"),
    fileInput: document.getElementById("file-input"),
    controls: document.getElementById("controls"),
    promoterSelect: document.getElementById("promoter-select"),
    customTitle: document.getElementById("custom-title"),
    colorMode: document.getElementById("color-mode"),
    btnGenerate: document.getElementById("btn-generate"),
    previewContent: document.getElementById("preview-content"),
    loading: document.getElementById("loading"),
    statusMsg: document.getElementById("status-msg")
};

// =============================== UTILITÁRIOS ===============================
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === "success" ? "✅" : "❌"}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? "flex" : "none";
    }
}

function setStatus(msg, type = "info") {
    if (elements.statusMsg) {
        elements.statusMsg.textContent = msg;
        elements.statusMsg.className = `status-${type}`;
    }
}

const clean = (v) => String(v ?? "").trim();

const normalize = (v) =>
    clean(v)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

const normalizeLoose = (v) => normalize(v).replace(/[^A-Z0-9 ]/g, "");

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function cleanTaskName(name) {
    if (!name) return "";
    let cleaned = String(name).replace(/^PESQUISA\s+/i, "");
    cleaned = cleaned.replace(/^PESQUISA$/i, "");
    return cleaned.trim();
}

function formatAddress(row) {
    const parts = [];
    const logradouro = clean(row[state.colMap.logradouro]);
    const bairro = clean(row[state.colMap.bairro]);
    const municipio = clean(row[state.colMap.municipio]);
    const estado = clean(row[state.colMap.estado]);

    if (logradouro) parts.push(logradouro);
    if (bairro) parts.push(bairro);
    if (municipio) parts.push(municipio);
    if (estado) parts.push(estado);

    return parts.join(", ");
}

// =============================== EXTRAIR DIAS DA SEMANA ===============================
function extractDaysFromRow(row) {
    const days = [];

    DAY_ORDER.forEach((day) => {
        const colIndex = state.colMap.days[day];
        if (colIndex === undefined || colIndex === -1) return;

        const value = row[colIndex];
        if (value === undefined || value === null || value === "") return;

        const strValue = String(value).trim().toUpperCase();
        let isActive = false;

        if (!isNaN(strValue) && !isNaN(parseFloat(strValue))) {
            isActive = parseFloat(strValue) > 0;
        } else if (["X", "SIM", "YES", "TRUE", "1", "OK", "✔", "✓", "S", "ATIVO", "ATIVA"].includes(strValue)) {
            isActive = true;
        }

        if (isActive) {
            days.push(day);
        }
    });

    return days;
}

// =============================== DETECÇÃO DE CABEÇALHO ===============================
function detectHeaderRow(rows) {
    const keywords = ["AGENTE", "LOCAL", "LOJA", "FORM", "SEG", "TER"];
    let bestIndex = -1;
    let bestScore = 0;

    for (let i = 0; i < Math.min(50, rows.length); i++) {
        const row = rows[i] || [];
        const text = row.map(normalizeLoose).join(" ");
        const score = keywords.filter((k) => text.includes(k)).length;

        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// =============================== MAPEAMENTO DE COLUNAS ===============================
function buildColumnMap(headers) {
    if (state.projectType === "exclusivo") {
        return buildColumnMapExclusivo(headers);
    }

    const h = headers.map(normalizeLoose);
    const find = (patterns) => h.findIndex((col) => patterns.some((p) => p.test(col)));

    const days = {};
    DAY_ORDER.forEach((day) => {
        days[day] = h.findIndex((col) => col === day || col === day.toLowerCase());
    });

    days.DOM = h.findIndex((col) => col === "DOM" || col === "dom");

    const logradouroIndex = h.findIndex((col) => {
        const colNorm = normalizeLoose(col);
        return (
            (colNorm === "LOGRADOURO" ||
                colNorm === "ENDERECO" ||
                colNorm === "RUA" ||
                colNorm === "ENDEREÇO") &&
            !colNorm.includes("TIPO")
        );
    });

    return {
        agente: find([/AGENTE/, /PROMOTOR/]),
        local: find([/LOCAL/, /LOJA/]),
        form: find([/FORM/, /PESQUISA/, /TAREFA/]),
        logradouro: logradouroIndex,
        bairro: find([/BAIRRO/]),
        municipio: find([/MUNICIPIO/, /MUNICÍPIO/, /CIDADE/]),
        estado: find([/ESTADO/]),
        rede: find([/REDE/]),
        days: days
    };
}

function buildColumnMapExclusivo(headers) {
    const h = headers.map(normalizeLoose);
    const find = (patterns) => h.findIndex((col) => patterns.some((p) => p.test(col)));

    // Mapeamento baseado no pedido do usuário e na imagem:
    // promotor = agente
    // endereço = logradouro
    // cliente = form
    
    const days = {};
    const clienteIndex = find([/CLIENTE/]);
    
    // Dias: No projeto exclusivo eles podem vir como S, T, Q, Q, S, S ou SEG, TER...
    const segIdx = h.findIndex((col, i) => i > clienteIndex && (col === "S" || col === "SEG"));
    if (segIdx !== -1) {
        days.SEG = segIdx;
        days.TER = segIdx + 1;
        days.QUA = segIdx + 2;
        days.QUI = segIdx + 3;
        days.SEX = segIdx + 4;
        days.SAB = segIdx + 5;
    } else {
        DAY_ORDER.forEach((day) => {
            days[day] = h.findIndex((col) => col === day || col === day[0]);
        });
    }

    return {
        agente: find([/PROMOTOR/, /AGENTE/]),
        local: find([/LOCAL/, /LOJA/]),
        form: find([/CLIENTE/]), // Agora mapeado conforme solicitado
        logradouro: find([/ENDERECO/, /LOGRADOURO/, /RUA/, /ENDEREÇO/]),
        bairro: find([/BAIRRO/]),
        municipio: find([/MUNICIPIO/, /CIDADE/]),
        estado: find([/UF/, /ESTADO/]),
        rede: find([/CLIENTE/]), // Usamos o cliente como rede também se for o caso
        days: days
    };
}

// =============================== IDENTIFICAR TAREFAS ===============================
function identifyTaskColumns(headers, colMap) {
    if (colMap.form !== -1) {
        return [{ name: headers[colMap.form], index: colMap.form }];
    }
    return [];
}

// =============================== PROCESSAMENTO PRINCIPAL ===============================
function processExcelData(rows) {
    const headerIndex = detectHeaderRow(rows);
    if (headerIndex === -1) {
        throw new Error("Cabeçalho não encontrado na planilha");
    }

    const headers = rows[headerIndex].map(clean);
    const dataRows = rows.slice(headerIndex + 1).filter((r) => r.some((c) => clean(c) !== ""));

    const colMap = buildColumnMap(headers);
    const taskCols = identifyTaskColumns(headers, colMap);

    if (colMap.agente === -1) setStatus("⚠️ Coluna 'AGENTE' não encontrada", "error");
    if (colMap.local === -1) setStatus("⚠️ Coluna 'LOCAL' não encontrada", "error");
    if (colMap.form === -1) setStatus("⚠️ Coluna 'FORM' não encontrada", "error");

    state.headers = headers;
    state.colMap = colMap;
    state.taskCols = taskCols;
    state.data = dataRows;

    const agents = [...new Set(dataRows.map((r) => clean(r[colMap.agente])).filter((a) => a))];
    state.agents = agents;

    if (agents.length === 0) {
        throw new Error("Nenhum agente encontrado na planilha");
    }

    elements.promoterSelect.innerHTML = `<option value="ALL">🌟 Todos os Agentes</option>` + agents
        .map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`)
        .join("");

    elements.controls.classList.remove("hidden");

    state.selectedPromoter = agents[0];
    elements.promoterSelect.value = agents[0];

    setStatus(`✅ Planilha carregada! ${dataRows.length} registros, ${agents.length} agentes`, "success");
    showToast("Planilha carregada com sucesso!", "success");

    updatePreview();
}

// =============================== AGRUPAMENTO DE LOJAS ===============================
function groupData(rows) {
    const map = {};

    rows.forEach((r) => {
        const localName = clean(r[state.colMap.local]);
        if (!localName) return;

        const key = normalizeLoose(localName);

        if (!map[key]) {
            map[key] = {
                name: localName,
                rede: clean(r[state.colMap.rede]),
                enderecoCompleto: formatAddress(r),
                tasks: [],
                allDays: { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false }
            };
        }

        // Se for exclusivo e não tiver tarefas fixas, criamos uma tarefa genérica
        if (state.projectType === "exclusivo" && state.taskCols.length === 0) {
            const days = extractDaysFromRow(r);
            days.forEach((day) => {
                if (Object.prototype.hasOwnProperty.call(map[key].allDays, day)) {
                    map[key].allDays[day] = true;
                }
            });

            const taskName = "Atendimento Geral";
            const existingTask = map[key].tasks.find((task) => task.name === taskName);
            if (existingTask) {
                days.forEach((d) => {
                    if (!existingTask.days.includes(d)) existingTask.days.push(d);
                });
            } else {
                map[key].tasks.push({
                    name: taskName,
                    days: days
                });
            }
        } else if (state.taskCols.length > 0) {
            const taskCol = state.taskCols[0];
            const taskValue = clean(r[taskCol.index]);

            if (taskValue) {
                const taskName = cleanTaskName(taskValue);
                const days = extractDaysFromRow(r);

                days.forEach((day) => {
                    if (Object.prototype.hasOwnProperty.call(map[key].allDays, day)) {
                        map[key].allDays[day] = true;
                    }
                });

                const existingTask = map[key].tasks.find((task) => task.name === taskName);
                if (existingTask) {
                    days.forEach((d) => {
                        if (!existingTask.days.includes(d)) existingTask.days.push(d);
                    });
                } else {
                    map[key].tasks.push({
                        name: taskName,
                        days: days
                    });
                }
            }
        }
    });

    Object.values(map).forEach((store) => {
        store.tasks.sort((a, b) => a.name.localeCompare(b.name));
    });

    return Object.values(map);
}

// =============================== ATUALIZAR PREVIEW ===============================
function updatePreview() {
    if (!state.data.length || state.colMap.agente === undefined || state.colMap.agente === -1) {
        elements.previewContent.innerHTML = `<div class="empty-state"><p>⚠️ Nenhum dado disponível</p></div>`;
        return;
    }

    if (state.selectedPromoter === "ALL") {
        elements.previewContent.innerHTML = `<div class="empty-state">
            <p>🌟 <strong>Todos os Agentes</strong> selecionados.</p>
            <p style="font-size: 14px; margin-top: 10px;">A pré-visualização não é exibida para todos simultaneamente para evitar lentidão. Clique em <strong>Exportar PDF</strong> para gerar o arquivo completo com todos os roteiros separados por folha.</p>
        </div>`;
        return;
    }

    const rows = state.data.filter(
        (r) => normalize(clean(r[state.colMap.agente])) === normalize(state.selectedPromoter)
    );

    if (rows.length === 0) {
        elements.previewContent.innerHTML = `<div class="empty-state"><p>⚠️ Nenhuma loja encontrada para este agente</p></div>`;
        return;
    }

    state.processedData = groupData(rows);

    let html = "";

    /* --- SUSPENSO TEMPORARIAMENTE: Mostrar apenas a Tabela Resumida ---
    state.processedData.forEach((store) => {
        html += `
            <div class="store-card">
                <div class="store-name">🏪 ${escapeHtml(store.name)}</div>
                ${store.enderecoCompleto ? `<div class="store-address">📍 ${escapeHtml(store.enderecoCompleto)}</div>` : ""}
                ${store.rede ? `<div class="store-info">🏢 Rede: ${escapeHtml(store.rede)}</div>` : ""}
                <div class="store-tasks">
                    ${store.tasks
                .map(
                    (task) => `
                        <div class="task-item">
                            <div class="task-name">📋 ${escapeHtml(task.name)}</div>
                            <div class="days-container">
                                ${DAY_ORDER.map(
                        (day) => `
                                    <span class="day-badge ${task.days.includes(day) ? "active" : "inactive"}">
                                        ${DAY_NAMES[day]}
                                    </span>
                                `
                    ).join("")}
                            </div>
                        </div>
                    `
                )
                .join("")}
                </div>
            </div>
        `;
    });
    */

    html += generateSummaryTableHTML();
    elements.previewContent.innerHTML = html;
}

// =============================== TABELA RESUMIDA HTML ===============================
function generateSummaryTableHTML() {
    if (!state.processedData || state.processedData.length === 0) {
        return '<div class="summary-section"><p style="color: #999;">Nenhum dado disponível para gerar tabela resumida</p></div>';
    }

    const sortedStores = [...state.processedData].sort((a, b) => a.name.localeCompare(b.name));

    let tableHtml = `
        <div class="summary-section">
            <h3 class="summary-title">📊 Roteiro Agência Objetiva</h3>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Loja</th>
                        <th>Endereço</th>
                        <th>SEG</th>
                        <th>TER</th>
                        <th>QUA</th>
                        <th>QUI</th>
                        <th>SEX</th>
                        <th>SAB</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedStores.forEach((store) => {
        const days = store.allDays || { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false };

        tableHtml += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left; font-weight: 600; background: #f8fafc; color: #000000; font-size: 11px;">
                    ${escapeHtml(store.name)}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 10px; color: #475569; background: #ffffff;">
                    ${escapeHtml(store.enderecoCompleto || "---")}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.SEG ? "#fff3e0" : "white"};">${days.SEG ? "✅" : ""}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.TER ? "#fff3e0" : "white"};">${days.TER ? "✅" : ""}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.QUA ? "#fff3e0" : "white"};">${days.QUA ? "✅" : ""}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.QUI ? "#fff3e0" : "white"};">${days.QUI ? "✅" : ""}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.SEX ? "#fff3e0" : "white"};">${days.SEX ? "✅" : ""}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0f172a; background: ${days.SAB ? "#fff3e0" : "white"};">${days.SAB ? "✅" : ""}</td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">✅ = Dia com atendimento</p>
        </div>
    `;

    return tableHtml;
}

// =============================== EXPORTAR PDF (VERSÃO OTIMIZADA) ===============================
async function exportPDF() {
    if (!state.data || state.data.length === 0) {
        showToast("Nenhum dado para exportar!", "error");
        return;
    }

    showLoading(true);

    try {
        const title = elements.customTitle.value || "Roteiro Agência Objetiva";
        const isColorMode = elements.colorMode && elements.colorMode.value === "color";

        // Cores baseado no modo selecionado
        const colors = {
            primary: isColorMode ? "#f97316" : "#333333",
            badgeActive: isColorMode ? "#f97316" : "#444444",
            badgeInactive: isColorMode ? "#e2e8f0" : "#dddddd",
            badgeActiveText: isColorMode ? "white" : "white",
            badgeInactiveText: isColorMode ? "#64748b" : "#666666",
            headerBg: isColorMode ? "#f97316" : "#444444",
            activeDayBg: isColorMode ? "#fff3e0" : "#eeeeee"
        };

        const agentsToExport = state.selectedPromoter === "ALL" ? state.agents : [state.selectedPromoter];

        // Remove agentes que não têm nenhuma loja (para evitar criar páginas vazias que quebram o html2pdf)
        const validAgents = agentsToExport.filter(agent => {
            const rows = state.data.filter(r => normalize(clean(r[state.colMap.agente])) === normalize(agent));
            return rows.length > 0;
        });

        if (validAgents.length === 0) {
            showToast("Nenhum dado válido para exportar!", "error");
            showLoading(false);
            return;
        }

        let fileNameSufix = state.selectedPromoter === "ALL" ? "TODOS_AGENTES" : state.selectedPromoter;

        // Configurar PDF com margens reduzidas
        const opt = {
            margin: [8, 5, 8, 5],
            filename: `${title.replace(/[^a-z0-9]/gi, "_")}_${fileNameSufix}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] } // Assegura que page-break-after funcione
        };

        function generateSummaryTableForAgent(agentStores, agentName) {
            const MAX_ROWS_PER_PAGE = 45;
            const tablePages = [];

            for (let i = 0; i < agentStores.length; i += MAX_ROWS_PER_PAGE) {
                tablePages.push(agentStores.slice(i, i + MAX_ROWS_PER_PAGE));
            }

            let allTablesHtml = '';

            for (let pageIdx = 0; pageIdx < tablePages.length; pageIdx++) {
                const pageStores = tablePages[pageIdx];

                let tableHtml = `
                    <div style="page-break-after: ${pageIdx < tablePages.length - 1 ? 'always' : 'auto'}; break-after: ${pageIdx < tablePages.length - 1 ? 'page' : 'auto'};">
                        <div style="margin-bottom: 15px;">
                            <h2 style="color: ${colors.primary}; font-size: 18px; margin: 0 0 10px 0; border-bottom: 2px solid ${colors.primary}; padding-bottom: 6px; display: inline-block;">
                                📊 Roteiro Agência Objetiva
                            </h2>
                            <div style="font-size: 10px; color: #555; margin: 8px 0;">
                                <strong>Promotor(a):</strong> ${escapeHtml(agentName)}
                            </div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 9px; page-break-inside: auto;">
                            <thead>
                                <tr style="background: ${colors.headerBg};">
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: left; color: white; font-size: 8px; width: 25%;">Loja</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: left; color: white; font-size: 8px; width: 40%;">Endereço</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">SEG</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">TER</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">QUA</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">QUI</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">SEX</th>
                                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center; color: white; font-size: 8px; width: 5.7%;">SAB</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                for (let i = 0; i < pageStores.length; i++) {
                    const store = pageStores[i];
                    const days = store.allDays || { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false };
                    const bgColor = i % 2 === 0 ? "#ffffff" : "#fafafa";

                    tableHtml += `
                        <tr style="background: ${bgColor}; page-break-inside: avoid; break-inside: avoid;">
                            <td style="padding: 5px 6px; border: 1px solid #ddd; font-weight: bold; color: #000000; font-size: 8px;">${escapeHtml(store.name)}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; color: #444; font-size: 7.5px;">${escapeHtml(store.enderecoCompleto || "---")}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.SEG ? colors.activeDayBg : "white"}; font-size: 8px;">${days.SEG ? "✅" : ""}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.TER ? colors.activeDayBg : "white"}; font-size: 8px;">${days.TER ? "✅" : ""}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.QUA ? colors.activeDayBg : "white"}; font-size: 8px;">${days.QUA ? "✅" : ""}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.QUI ? colors.activeDayBg : "white"}; font-size: 8px;">${days.QUI ? "✅" : ""}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.SEX ? colors.activeDayBg : "white"}; font-size: 8px;">${days.SEX ? "✅" : ""}</td>
                            <td style="padding: 5px 6px; border: 1px solid #ddd; text-align: center; background: ${days.SAB ? colors.activeDayBg : "white"}; font-size: 8px;">${days.SAB ? "✅" : ""}</td>
                        </tr>
                    `;
                }

                tableHtml += `
                            </tbody>
                        </table>
                        <p style="font-size: 8px; color: #666; margin-top: 8px;">✅ = Dia com atendimento</p>
                    </div>
                `;

                allTablesHtml += tableHtml;
            }

            return allTablesHtml;
        }

        let worker = html2pdf().set(opt);

        // Forçamos o scroll para o topo para evitar que o html2canvas corte os elementos no Y offset
        const originalScroll = window.scrollY;
        window.scroll(0, 0);

        for (let idx = 0; idx < validAgents.length; idx++) {
            const currentAgent = validAgents[idx];

            const rows = state.data.filter(
                (r) => normalize(clean(r[state.colMap.agente])) === normalize(currentAgent)
            );

            const processed = groupData(rows);
            // Evitar erro se o filter falhar de alguma forma
            if (processed.length === 0) continue;

            const sortedStores = [...processed].sort((a, b) => a.name.localeCompare(b.name));

            const container = document.createElement('div');

            // Removido style="position:absolute" pois isso quebra a renderização do html2canvas 
            // resultando numa página em branco.
            // Para não quebrar por tamanho (Canvas Height Limit), criamos e processamos
            // um contêiner de cada vez, aguardando (await) antes de inserir o próximo!

            // Replicando o body original no container
            container.innerHTML = `
                <div style="font-family: Arial, Helvetica, sans-serif; background: white; padding: 15px; margin: 0; box-sizing: border-box;">
                    <div style="margin-bottom: 20px; text-align: center;">
                        <img src="logo-objetiva-pdf.png" style="height: 50px; width: auto;" alt="Logo" onerror="this.style.display='none'">
                    </div>
                    ${generateSummaryTableForAgent(sortedStores, currentAgent)}
                </div>
            `;

            document.body.appendChild(container);

            if (idx === 0) {
                // Primeira página inicializa o worker
                worker = worker.from(container).toPdf();
            } else {
                // Adiciona nova folha e converte o novo container
                worker = worker.get('pdf').then(pdf => {
                    pdf.addPage();
                }).from(container).toContainer().toCanvas().toPdf();
            }

            // O SEGredo para não criar uma tela infinita que estoura a memória do navegador
            // é ESPERAR a renderização terminar para DEPOIS apagar o container,
            // garantindo que no próximo laço o top/offset será sempre zero!
            await worker;
            document.body.removeChild(container);
        }

        // Aguarda todos os elementos serem processados e salva
        await worker.save();

        // Devolve o scroll pra onde o usuário estava
        window.scroll(0, originalScroll);

        showToast(`PDF gerado em ${isColorMode ? "colorido" : "preto e branco"} com sucesso!`, "success");

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showToast("Erro ao gerar PDF: " + error.message, "error");
    } finally {
        showLoading(false);
    }
}

// =============================== DEBUG MODAL ===============================
function showDebugModal() {
    const container = document.getElementById("debug-table-container");
    if (!container) return;

    let html = '<table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;"><thead><tr>';

    if (state.headers.length) {
        html += state.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    }

    html += "</table></thead><tbody>";

    state.data.forEach((row) => {
        html += "<tr>" + row.map((cell) => `<td>${escapeHtml(String(cell || ""))}</td>`).join("") + "</tr>";
    });

    html += "</tbody></table>";

    if (state.data.length === 0) {
        html = '<p style="padding: 20px; text-align: center;">Nenhum dado carregado ainda.</p>';
    }

    container.innerHTML = html;
    const modal = document.getElementById("debug-modal");
    if (modal) modal.classList.remove("hidden");
}

function closeDebugModal() {
    const modal = document.getElementById("debug-modal");
    if (modal) modal.classList.add("hidden");
}

window.closeDebugModal = closeDebugModal;

// =============================== PROCESSAR ARQUIVO ===============================
function processFile(file) {
    if (!file) return;

    showLoading(true);
    setStatus("Lendo arquivo...", "info");

    const reader = new FileReader();

    reader.onload = (ev) => {
        try {
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            processExcelData(rows);
        } catch (error) {
            console.error("Erro ao processar:", error);
            setStatus("Erro ao processar planilha: " + error.message, "error");
            showToast("Erro ao processar planilha!", "error");
        } finally {
            showLoading(false);
        }
    };

    reader.onerror = () => {
        showLoading(false);
        setStatus("Erro ao ler o arquivo", "error");
        showToast("Erro ao ler o arquivo!", "error");
    };

    reader.readAsArrayBuffer(file);
}

// =============================== EVENTOS ===============================
if (elements.fileInput) {
    elements.fileInput.addEventListener("change", (e) => {
        if (e.target.files[0]) processFile(e.target.files[0]);
    });
}

if (elements.dropZone) {
    elements.dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        elements.dropZone.classList.add("dragover");
    });

    elements.dropZone.addEventListener("dragleave", () => {
        elements.dropZone.classList.remove("dragover");
    });

    elements.dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];

        if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv"))) {
            processFile(file);
        } else {
            showToast("Por favor, envie um arquivo Excel ou CSV", "error");
        }
    });

    elements.dropZone.addEventListener("click", () => {
        if (elements.fileInput) elements.fileInput.click();
    });
}

if (elements.promoterSelect) {
    elements.promoterSelect.addEventListener("change", (e) => {
        state.selectedPromoter = e.target.value;
        updatePreview();
    });
}

if (elements.btnGenerate) {
    elements.btnGenerate.addEventListener("click", exportPDF);
}

const btnDebug = document.getElementById("btn-debug");
if (btnDebug) {
    btnDebug.addEventListener("click", showDebugModal);
}

// Inicializar Seletor de Projeto
document.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.project-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.projectType = btn.getAttribute('data-type');
        
        // Se já houver dados carregados, re-processar
        if (state.data.length > 0) {
            // Re-processar com as novas definições de coluna
            // Pegamos o cabeçalho original que deve estar salvo ou re-detectado
            // Como state.data não contém o cabeçalho, precisamos re-processar o arquivo ou salvar o cabeçalho
            // Por simplicidade, vamos avisar que precisa re-importar se mudar o tipo
            showToast("Tipo de projeto alterado. Importe a planilha novamente para aplicar a nova lógica.", "info");
        }
    });
});