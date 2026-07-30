document.addEventListener("DOMContentLoaded", () => {
    const excelFile = document.getElementById("excelFile");
    const templatePdf = document.getElementById("templatePdf");
    const generateBtn = document.getElementById("generateBtn");
    const previewSelect = document.getElementById("previewSelect");
    const previewBtn = document.getElementById("previewBtn");
    const cidadeDataInput = document.getElementById("cidadeData");

    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    const filterSection = document.getElementById("filterSection");
    const filterCount = document.getElementById("filterCount");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const previewTitle = document.getElementById("previewTitle");

    // Inicializa a data atual
    if (cidadeDataInput) {
        cidadeDataInput.value = dataAtualExtenso();
    }

    // ─── CARTA.pdf permanente ─────────────────────────────────────────────────
    async function carregarModeloPermanente() {
        try {
            const response = await fetch('./CARTA.pdf');
            if (!response.ok) throw new Error('Não foi possível carregar CARTA.pdf');
            state.templateBytes = await response.arrayBuffer();
            // Atualiza UI
            const dropText = document.getElementById("pdfFileName");
            if (dropText) {
                dropText.innerHTML = `<span style="color: var(--success); font-weight: bold;">✓ Modelo Padrão Carregado:</span><br>CARTA.pdf`;
            }
            const dropZone = document.getElementById("pdfDropZone");
            if (dropZone) {
                dropZone.style.border = "2px solid var(--success)";
                dropZone.setAttribute("title", "Modelo CARTA.pdf carregado automaticamente. Você pode substituir arrastando outro PDF.");
            }
            const statusBox = document.getElementById("statusBox");
            if (statusBox && statusBox.textContent.includes("lojas identificadas")) {
                if (!statusBox.textContent.includes("Modelo PDF")) {
                    statusBox.textContent += " | Modelo PDF OK";
                }
            }
        } catch (err) {
            console.warn('CARTA.pdf não pôde ser carregado automaticamente:', err);
        }
    }
    carregarModeloPermanente();

    // ─── Multi-Select Filtros ────────────────────────────────────────────────
    // Estado dos filtros como conjuntos
    const selectedAgentes = new Set();
    const selectedRedes = new Set();
    const selectedLocais = new Set();

    function getFilteredGroups() {
        if (!state.grouped || !state.grouped.length) return [];
        return state.grouped.filter(g => {
            const matchAgente = selectedAgentes.size === 0 || selectedAgentes.has(g.agente);
            const matchRede = selectedRedes.size === 0 || selectedRedes.has(g.rede);
            const matchLocal = selectedLocais.size === 0 || selectedLocais.has(g.local);
            return matchAgente && matchRede && matchLocal;
        });
    }

    function syncCascadingFilters(changedSource) {
        if (!state.grouped || !state.grouped.length) return;

        // Opções válidas por dimensão dependendo dos filtros ativos nas demais dimensões
        const validAgentes = new Set(
            state.grouped
                .filter(g => (selectedRedes.size === 0 || selectedRedes.has(g.rede)) && (selectedLocais.size === 0 || selectedLocais.has(g.local)))
                .map(g => g.agente)
                .filter(Boolean)
        );

        const validRedes = new Set(
            state.grouped
                .filter(g => (selectedAgentes.size === 0 || selectedAgentes.has(g.agente)) && (selectedLocais.size === 0 || selectedLocais.has(g.local)))
                .map(g => g.rede)
                .filter(Boolean)
        );

        const validLocais = new Set(
            state.grouped
                .filter(g => (selectedAgentes.size === 0 || selectedAgentes.has(g.agente)) && (selectedRedes.size === 0 || selectedRedes.has(g.rede)))
                .map(g => g.local)
                .filter(Boolean)
        );

        // Remover seleções que deixaram de ser válidas devido ao filtro alterado
        if (changedSource !== 'agente') {
            for (const ag of [...selectedAgentes]) {
                if (!validAgentes.has(ag)) selectedAgentes.delete(ag);
            }
        }
        if (changedSource !== 'rede') {
            for (const rd of [...selectedRedes]) {
                if (!validRedes.has(rd)) selectedRedes.delete(rd);
            }
        }
        if (changedSource !== 'local') {
            for (const lc of [...selectedLocais]) {
                if (!validLocais.has(lc)) selectedLocais.delete(lc);
            }
        }

        // Reconstruir os dropdowns que não foram o alvo direto para manter o menu aberto e focado
        if (changedSource !== 'agente') {
            buildMultiSelectDropdown("filterAgenteContainer", [...validAgentes].sort(), selectedAgentes, () => syncCascadingFilters('agente'));
        }
        if (changedSource !== 'rede') {
            buildMultiSelectDropdown("filterRedeContainer", [...validRedes].sort(), selectedRedes, () => syncCascadingFilters('rede'));
        }
        if (changedSource !== 'local') {
            buildMultiSelectDropdown("filterLocalContainer", [...validLocais].sort(), selectedLocais, () => syncCascadingFilters('local'));
        }

        updateFilterCount();
    }

    function buildMultiSelectDropdown(containerId, items, selectedSet, onChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";
        const wrapper = document.createElement("div");
        wrapper.className = "multi-select-dropdown";

        // Summary button
        const summary = document.createElement("button");
        summary.type = "button";
        summary.className = "multi-select-summary";
        summary.setAttribute("aria-expanded", "false");
        const updateSummary = () => {
            const count = selectedSet.size;
            summary.textContent = count === 0 ? "Todos" : `${count} selecionado${count > 1 ? 's' : ''}`;
            summary.classList.toggle("has-selection", count > 0);
        };
        updateSummary();

        // Dropdown list
        const list = document.createElement("div");
        list.className = "multi-select-list";
        list.style.display = "none";

        // Search input
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Pesquisar...";
        searchInput.className = "multi-select-search";
        list.appendChild(searchInput);

        // "Selecionar todos" row
        const allRow = document.createElement("label");
        allRow.className = "multi-select-item select-all-row";
        const allCb = document.createElement("input");
        allCb.type = "checkbox";
        allCb.checked = selectedSet.size === 0;
        allRow.appendChild(allCb);
        allRow.appendChild(document.createTextNode(" Todos"));
        list.appendChild(allRow);

        // Item rows
        const itemRows = [];
        items.forEach(item => {
            const row = document.createElement("label");
            row.className = "multi-select-item";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.value = item;
            cb.checked = selectedSet.has(item);
            row.appendChild(cb);
            row.appendChild(document.createTextNode(` ${item}`));
            list.appendChild(row);
            itemRows.push({ row, cb, label: item });

            cb.addEventListener("change", () => {
                if (cb.checked) selectedSet.add(item);
                else selectedSet.delete(item);
                allCb.checked = selectedSet.size === 0;
                updateSummary();
                onChange();
            });
        });

        // "Todos" checkbox logic
        allCb.addEventListener("change", () => {
            if (allCb.checked) {
                selectedSet.clear();
                itemRows.forEach(({ cb }) => { cb.checked = false; });
            }
            updateSummary();
            onChange();
        });

        // Search filter
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase();
            itemRows.forEach(({ row, label }) => {
                row.style.display = label.toLowerCase().includes(q) ? "" : "none";
            });
        });

        // Toggle dropdown
        summary.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = list.style.display !== "none";
            list.style.display = isOpen ? "none" : "block";
            summary.setAttribute("aria-expanded", String(!isOpen));
            if (!isOpen) searchInput.focus();
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
            if (!wrapper.contains(e.target)) {
                list.style.display = "none";
                summary.setAttribute("aria-expanded", "false");
            }
        });

        wrapper.appendChild(summary);
        wrapper.appendChild(list);
        container.appendChild(wrapper);
    }

    function populateFilterSelects() {
        if (!state.grouped || !state.grouped.length) return;

        const agentes = [...new Set(state.grouped.map(g => g.agente).filter(Boolean))].sort();
        const redes = [...new Set(state.grouped.map(g => g.rede).filter(Boolean))].sort();
        const locais = [...new Set(state.grouped.map(g => g.local).filter(Boolean))].sort();

        buildMultiSelectDropdown("filterAgenteContainer", agentes, selectedAgentes, () => syncCascadingFilters('agente'));
        buildMultiSelectDropdown("filterRedeContainer", redes, selectedRedes, () => syncCascadingFilters('rede'));
        buildMultiSelectDropdown("filterLocalContainer", locais, selectedLocais, () => syncCascadingFilters('local'));

        if (filterSection) filterSection.style.display = "block";
        updateFilterCount();
    }

    function updateFilterCount() {
        const filtered = getFilteredGroups();
        const total = state.grouped ? state.grouped.length : 0;
        const count = filtered.length;

        if (filterCount) {
            if (count < total) {
                filterCount.innerHTML = `<span class="filter-active-badge">${count} de ${total} cartas selecionadas</span>`;
            } else {
                filterCount.innerHTML = `<span class="filter-all-badge">${total} cartas (sem filtro)</span>`;
            }
        }

        if (previewTitle) {
            const hasAgente = selectedAgentes.size > 0;
            const hasRede = selectedRedes.size > 0;
            const hasLocal = selectedLocais.size > 0;
            if (hasAgente || hasRede || hasLocal) {
                const parts = [];
                if (hasAgente) parts.push(`${selectedAgentes.size} agente${selectedAgentes.size > 1 ? 's' : ''}`);
                if (hasRede) parts.push(`${selectedRedes.size} rede${selectedRedes.size > 1 ? 's' : ''}`);
                if (hasLocal) parts.push(`${selectedLocais.size} local${selectedLocais.size > 1 ? 'is' : ''}`);
                previewTitle.textContent = `Prévia — ${parts.join(", ")} filtrado${parts.length > 1 ? 's' : ''} (${count} carta${count !== 1 ? 's' : ''})`;
            } else {
                previewTitle.textContent = `Prévia (Todas as Cartas — ${total})`;
            }
        }
    }

    clearFiltersBtn?.addEventListener("click", () => {
        selectedAgentes.clear();
        selectedRedes.clear();
        selectedLocais.clear();
        if (state.grouped && state.grouped.length) {
            populateFilterSelects();
        }
    });
    // ─── End Filtros ─────────────────────────────────────────────────────────

    const toggleEditBtn = document.getElementById("toggleEditBtn");
    const cardManager = document.getElementById("cardManager");
    const cardList = document.getElementById("cardList");

    toggleEditBtn?.addEventListener("click", () => {
        const isHidden = cardManager.style.display === "none";
        cardManager.style.display = isHidden ? "block" : "none";
        toggleEditBtn.textContent = isHidden ? "Ocultar Editor" : "Editar Dados Individuais";
        if (isHidden) atualizarEditorCartasUI();
    });

    window.atualizarEditorCartasUI = function() {
        if (!cardList) return;
        cardList.innerHTML = "";

        state.grouped.forEach((grupo, index) => {
            const item = document.createElement("div");
            item.className = "editable-card-item";
            item.innerHTML = `
                <h4>${grupo.agente} <span>${grupo.local}</span></h4>
                <div class="edit-fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="grid-column: span 2;">
                        <label>Nome do Agente (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="agente" value="${grupo.agente || ''}">
                    </div>
                    <div>
                        <label>CPF (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="cpf" value="${grupo.cpf || ''}">
                    </div>
                    <div>
                        <label>RG (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="rg" value="${grupo.rg || ''}">
                    </div>
                    <div>
                        <label>CTPS (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="ctps" value="${grupo.ctps || ''}">
                    </div>
                    <div>
                        <label>Cargo (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="cargo" value="${grupo.cargo || ''}" placeholder="Padrão: ${document.getElementById("cargo")?.value || ''}">
                    </div>
                    <div style="grid-column: span 2;">
                        <label>Endereço da Loja (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="endereco" value="${grupo.endereco || ''}">
                    </div>
                    <div style="grid-column: span 2;">
                        <label>Marcas / Produtos (Separados por vírgula)</label>
                        <input type="text" data-idx="${index}" data-prop="marcasText" value="${grupo.marcasText !== undefined ? grupo.marcasText : (grupo.marcas ? grupo.marcas.join(', ') : '')}">
                    </div>
                </div>
            `;
            cardList.appendChild(item);
        });

        cardList.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", (e) => {
                const idx = e.target.getAttribute("data-idx");
                const prop = e.target.getAttribute("data-prop");
                if (prop === "marcasText") {
                    state.grouped[idx][prop] = e.target.value;
                    state.grouped[idx].marcas = e.target.value.split(',').map(m => m.trim()).filter(Boolean);
                } else {
                    state.grouped[idx][prop] = e.target.value;
                }
            });
        });
    };

    window.atualizarAvisosUI = function() {
        const warningPanel = document.getElementById("warningPanel");
        const warningList = document.getElementById("warningList");
        if (!warningPanel || !warningList) return;

        if (state.avisos && state.avisos.length > 0) {
            warningList.innerHTML = "";
            state.avisos.forEach(aviso => {
                const li = document.createElement("li");
                li.textContent = aviso;
                warningList.appendChild(li);
            });
            warningPanel.style.display = "block";
        } else {
            warningPanel.style.display = "none";
        }
    };

    function setupDragAndDrop(zoneId, inputId) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        if (!zone || !input) return;

        zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            zone.classList.add("drag-over");
        });

        ["dragleave", "dragend", "drop"].forEach(type => {
            zone.addEventListener(type, () => zone.classList.remove("drag-over"));
        });

        zone.addEventListener("drop", (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event("change"));
            }
        });
    }

    setupDragAndDrop("excelDropZone", "excelFile");
    setupDragAndDrop("pdfDropZone", "templatePdf");
    setupDragAndDrop("attachmentsDropZone", "attachmentsFiles");

    const attachmentsFiles = document.getElementById("attachmentsFiles");
    attachmentsFiles?.addEventListener("change", async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        state.attachments = [];
        const fileNames = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            try {
                const bytes = await file.arrayBuffer();
                state.attachments.push({
                    name: file.name,
                    bytes: bytes,
                    type: ext  // 'pdf', 'jpg', 'jpeg', 'png'
                });
                fileNames.push(file.name);
            } catch (error) {
                console.error(error);
                alert(`Erro ao ler o anexo: ${file.name}`);
            }
        }

        const dropText = document.getElementById("attachmentsFileName");
        if (dropText) {
            dropText.innerHTML = `<span style="color: var(--success); font-weight: bold;">✓ ${state.attachments.length} Documento(s) Carregado(s):</span><br>${fileNames.join(', ')}`;
        }
    });

    excelFile?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const dropText = document.getElementById("excelFileName") || excelFile.closest('.drop-area')?.querySelector('.drop-text');
        if (dropText) dropText.innerHTML = `<span style="color: var(--success); font-weight: bold;">✓ Planilha Carregada:</span><br>${file.name}`;

        if (progressContainer) progressContainer.style.display = "none";
        if (progressBar) progressBar.style.width = "0%";

        try {
            await carregarExcel(file);
            const numLojas = state.grouped.length;
            const statusBox = document.getElementById("statusBox");
            if (statusBox) {
                let currentText = statusBox.textContent || "";
                let baseMsg = `${numLojas} lojas identificadas.`;
                if (currentText.includes("Modelo PDF")) {
                     statusBox.textContent = baseMsg + " | Modelo PDF OK";
                } else {
                     statusBox.textContent = baseMsg;
                }
            }
            populateFilterSelects();
        } catch (error) {
            console.error(error);
            alert("Erro ao ler a planilha.");
        }
    });

    templatePdf?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const dropText = document.getElementById("pdfFileName") || templatePdf.closest('.drop-area')?.querySelector('.drop-text');
        if (dropText) dropText.innerHTML = `<span style="color: var(--success); font-weight: bold;">✓ Modelo PDF Carregado:</span><br>${file.name}`;

        try {
            state.templateBytes = await file.arrayBuffer();
            const statusBox = document.getElementById("statusBox");
            if (statusBox && statusBox.textContent.includes("lojas identificadas")) {
                statusBox.textContent += " | Modelo PDF OK";
            } else if (statusBox) {
                statusBox.textContent = "Modelo PDF carregado.";
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar o PDF modelo.");
        }
    });

    generateBtn?.addEventListener("click", async () => {
        try {
            generateBtn.textContent = "Gerando...";
            generateBtn.classList.add("loading");
            const filtered = getFilteredGroups();
            if (!filtered.length) {
                alert("Nenhuma carta corresponde ao filtro selecionado.");
                return;
            }
            await gerarPDFFiltrado(filtered);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar o PDF. Verifique o console.");
        } finally {
            generateBtn.textContent = "Gerar PDF";
            generateBtn.classList.remove("loading");
        }
    });

    previewBtn?.addEventListener("click", () => {
        const previewPage = document.getElementById("previewPage");
        if (previewPage) previewPage.style.display = "none";

        previewBtn.textContent = "Atualizando...";
        setTimeout(async () => {
            const filtered = getFilteredGroups();
            if (!filtered.length) {
                previewBtn.textContent = "Atualizar prévia";
                alert("Nenhuma carta corresponde ao filtro selecionado.");
                return;
            }
            await gerarPreviaPDFFiltrado(filtered);
            previewBtn.textContent = "Atualizar prévia";
        }, 100);
    });

    previewSelect?.addEventListener("change", () => {});
});
