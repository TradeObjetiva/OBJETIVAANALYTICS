// Web Worker para processamento de Excel/CSV
importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');

self.onmessage = function (e) {
    const { data, type } = e.data;

    if (type === 'PARSE_EXCEL') {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            // Mapping logic
            const colMap = {
                'LÍDER': 'lider', 'LIDER': 'lider',
                'REGIÃO': 'regiao', 'REGIAO': 'regiao',
                'PROJETO': 'projeto',
                'CPF': 'cpf',
                'AGENTE': 'agente',
                'RAZÃO SOCIAL': 'razao_social', 'RAZAO SOCIAL': 'razao_social',
                'LOCAL': 'local',
                'REDE': 'rede',
                'CEP': 'cep',
                'LOGRADOURO': 'logradouro',
                'BAIRRO': 'bairro',
                'MUNICÍPIO': 'municipio', 'MUNICIPIO': 'municipio',
                'ESTADO': 'estado',
                'FORM': 'form',
                'VALOR': 'valor',
                'VALOR SEMANAL': 'valor_semanal',
                'HORAS POR VISITA': 'horas_por_visita',
                'DOM': 'dom',
                'SEG': 'seg',
                'TER': 'ter',
                'QUA': 'qua',
                'QUI': 'qui',
                'SEX': 'sex',
                'SAB': 'sab',
                'FREQ. SEMANAL': 'freq_semanal', 'FREQ SEMANAL': 'freq_semanal',
                'LOCAL_ID': 'local_id',
                'FORM_ID': 'form_id',
                'AGENT_ID': 'agent_id'
            };

            const rowsToInsert = jsonData.map(row => {
                let mappedRow = {};
                for (let key in row) {
                    if (typeof key === 'string') {
                        const limpaKey = key.trim().toUpperCase();
                        if (colMap[limpaKey]) {
                            mappedRow[colMap[limpaKey]] = String(row[key]).trim();
                        }
                    }
                }
                return mappedRow;
            }).filter(r => Object.keys(r).length > 0);

            self.postMessage({ type: 'SUCCESS', data: rowsToInsert });
        } catch (error) {
            self.postMessage({ type: 'ERROR', message: error.message });
        }
    }
};
