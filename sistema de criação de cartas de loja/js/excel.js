function agruparLojas(rows) {
    const map = new Map();
    const registroCpfAgentes = new Map();
    state.avisos = []; // Limpa avisos anteriores

    // Primeiro passo: Mapear todos os CPFs disponíveis por Agente
    rows.forEach((row, index) => {
        const agente = String(getValue(row, "AGENTE") || "").trim();
        const local = String(getValue(row, "LOCAL") || "").trim();
        const cpf = String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim();

        const linhaReal = index + 2; // +1 zero-indexed, +1 header

        if (!agente) {
            state.avisos.push(`Linha ${linhaReal}: Nome do Agente faltando.`);
        }
        if (!local) {
            state.avisos.push(`Linha ${linhaReal}: Nome da Loja (Local) faltando.`);
        }

        if (agente && cpf) {
            const nomeNormalizado = normalizeText(agente).toUpperCase();
            if (!registroCpfAgentes.has(nomeNormalizado)) {
                registroCpfAgentes.set(nomeNormalizado, cpf);
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
                // Busca o CPF no registro global primeiro, depois na linha
                cpf: registroCpfAgentes.get(nomeNormalizado) || String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim(),
                endereco: montarEndereco(row),
                rede: String(getValue(row, "REDE") || "").trim(),
                razaoSocial: String(getValue(row, "RAZÃO SOCIAL") || getValue(row, "RAZAO SOCIAL") || "").trim(),
                marcas: [],
            });
        }

        const grupo = map.get(key);
        const marca = limparMarca(getValue(row, "FORM"));

        if (marca) grupo.marcas.push(marca);

        // Reforço caso o CPF apareça em linhas posteriores para o mesmo grupo
        const cpfLinha = String(getValue(row, "CPF") || getValue(row, "DOC") || "").trim();
        if (!grupo.cpf && cpfLinha) grupo.cpf = cpfLinha;

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
