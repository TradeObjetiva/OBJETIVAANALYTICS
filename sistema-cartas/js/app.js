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

    // Inicializa a data atual
    if (cidadeDataInput) {
        cidadeDataInput.value = dataAtualExtenso();
    }

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
                <div class="edit-fields">
                    <div>
                        <label>Nome do Agente (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="agente" value="${grupo.agente}">
                    </div>
                    <div>
                        <label>CPF (Sobrescrita)</label>
                        <input type="text" data-idx="${index}" data-prop="cpf" value="${grupo.cpf}">
                    </div>
                </div>
            `;
            cardList.appendChild(item);
        });

        cardList.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", (e) => {
                const idx = e.target.getAttribute("data-idx");
                const prop = e.target.getAttribute("data-prop");
                state.grouped[idx][prop] = e.target.value;
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

    excelFile?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (progressContainer) progressContainer.style.display = "none";
        if (progressBar) progressBar.style.width = "0%";

        try {
            await carregarExcel(file);
            const numLojas = state.grouped.length;
            const statusBox = document.getElementById("statusBox");
            if (statusBox) statusBox.textContent = `${numLojas} lojas identificadas.`;
        } catch (error) {
            console.error(error);
            alert("Erro ao ler a planilha.");
        }
    });

    templatePdf?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            state.templateBytes = await file.arrayBuffer();
            alert("PDF modelo carregado com sucesso.");
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar o PDF modelo.");
        }
    });

    generateBtn?.addEventListener("click", async () => {
        try {
            generateBtn.textContent = "Gerando...";
            generateBtn.classList.add("loading");
            await gerarPDF();
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
        // Pequeno delay para a UI respirar e o layout do iframe redesenhar
        setTimeout(async () => {
            await gerarPreviaPDF();
            previewBtn.textContent = "Atualizar prévia";
        }, 100);
    });

    previewSelect?.addEventListener("change", () => {
        // Option to auto-trigger when dropdown changes? Let's just require clicking the button to avoid constant re-rendering.
    });
});
