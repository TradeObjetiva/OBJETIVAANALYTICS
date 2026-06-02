function agruparLojas(rows) {
    const map = new Map();
    const registroCpfAgentes = new Map();
    const registroRgAgentes = new Map();
    const registroCtpsAgentes = new Map();
    state.avisos = []; // Limpa avisos anteriores

    // Primeiro passo: Mapear todos os CPFs, RGs e CTPSs disponíveis por Agente
    rows.forEach((row, index) => {
        const agente = String(getValue(row, "AGENTE") || "").trim();
        const local = String(getValue(row, "LOCAL") || "").trim();
        const cpf = String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim();
        const rg = String(getValue(row, "RG") || "").trim();
        const ctps = String(getValue(row, "CTPS") || "").trim();

        const linhaReal = index + 2; // +1 zero-indexed, +1 header

        if (!agente) {
            state.avisos.push(`Linha ${linhaReal}: Nome do Agente faltando.`);
        }
        if (!local) {
            state.avisos.push(`Linha ${linhaReal}: Nome da Loja (Local) faltando.`);
        }

        if (agente) {
            const nomeNormalizado = normalizeText(agente).toUpperCase();
            if (cpf && !registroCpfAgentes.has(nomeNormalizado)) {
                registroCpfAgentes.set(nomeNormalizado, cpf);
            }
            if (rg && !registroRgAgentes.has(nomeNormalizado)) {
                registroRgAgentes.set(nomeNormalizado, rg);
            }
            if (ctps && !registroCtpsAgentes.has(nomeNormalizado)) {
                registroCtpsAgentes.set(nomeNormalizado, ctps);
            }
        }
    });

    rows.forEach((row) => {
        const local = String(getValue(row, "LOCAL") || "").trim();
        const agente = String(getValue(row, "AGENTE") || "").trim();
        if (!local || !agente) return;

        const nomeNormalizado = normalizeText(agente).toUpperCase();
        const key = `${nomeNormalizado}|${normalizeText(local).toUpperCase()}`;

        if (!map.has(key)) {
            map.set(key, {
                local,
                agente,
                // Busca no registro global primeiro, depois na linha
                cpf: registroCpfAgentes.get(nomeNormalizado) || String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim(),
                rg: registroRgAgentes.get(nomeNormalizado) || String(getValue(row, "RG") || "").trim(),
                ctps: registroCtpsAgentes.get(nomeNormalizado) || String(getValue(row, "CTPS") || "").trim(),
                endereco: montarEndereco(row),
                rede: String(getValue(row, "REDE") || "").trim(),
                razaoSocial: String(getValue(row, "RAZÃO SOCIAL") || getValue(row, "RAZAO SOCIAL") || "").trim(),
                marcas: [],
                cargo: null, // Inicializa como nulo para sobrescritas individuais
            });
        }

        const grupo = map.get(key);
        const marca = limparMarca(getValue(row, "FORM"));

        if (marca) grupo.marcas.push(marca);

        // Reforço caso dados apareçam em linhas posteriores para o mesmo grupo
        const cpfLinha = String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim();
        if (!grupo.cpf && cpfLinha) grupo.cpf = cpfLinha;

        const rgLinha = String(getValue(row, "RG") || "").trim();
        if (!grupo.rg && rgLinha) grupo.rg = rgLinha;

        const ctpsLinha = String(getValue(row, "CTPS") || "").trim();
        if (!grupo.ctps && ctpsLinha) grupo.ctps = ctpsLinha;

        if (!grupo.endereco) grupo.endereco = montarEndereco(row);
        if (!grupo.rede) grupo.rede = String(getValue(row, "REDE") || "").trim();
        if (!grupo.razaoSocial) {
            grupo.razaoSocial = String(getValue(row, "RAZÃO SOCIAL") || getValue(row, "RAZAO SOCIAL") || "").trim();
        }
    });

    return [...map.values()].map((grupo) => ({
        ...grupo,
        marcas: uniqueNormalized(grupo.marcas),
    }));
}

async function carregarExcel(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    state.rows = json;
    state.grouped = agruparLojas(json);
    if (window.atualizarListaPreview) window.atualizarListaPreview();
    if (window.atualizarAvisosUI) window.atualizarAvisosUI();
}
