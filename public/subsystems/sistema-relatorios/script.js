const EXPORT_MODEL = [
  { export: 'DATA', source: 'Data Hora Inicio Execucao Atividade Gerada Pelo Sistema (Dim Tempo)', transform: 'date' },
  { export: 'DATA', source: 'DATA HORA TAREFA', transform: 'date' },
  { export: 'DATA', source: 'Data Hora Inicio Execucao Atividade Gerada Pelo Sistema (Dim Tempo)', transform: 'date' },
  { export: 'DATA', source: 'DATA E HORA INÍCIO EXECUÇÃO', transform: 'date' },
  { export: 'DATA', source: 'DATA E HORA INÍCIO DE EXECUÇÃO', transform: 'date' },
  { export: 'DATA', source: 'DATA E HORA DE EXECUÇÃO', transform: 'date' },
  { export: 'DATA', source: 'DATA E HORA DA EXECUÇÃO', transform: 'date' },
  { export: 'DATA', source: 'DATA E HORA EXECUÇÃO', transform: 'date' },
  { export: 'DATA', source: 'DATA VISITA', transform: 'date' },
  { export: 'DATA', source: 'DATA DA VISITA', transform: 'date' },
  { export: 'DATA', source: 'DATA', transform: 'date' },

  { export: 'PDV', source: 'Local de Atendimento Descrição' },
  { export: 'PDV', source: 'Local de Atendimento Descricao' },
  { export: 'PDV', source: 'Local de Atendimento Identificador Alternativo' },
  { export: 'PDV', source: 'PDV' },
  { export: 'PDV', source: 'FANTASIA' },
  { export: 'PDV', source: 'LOJA' },
  { export: 'PDV', source: 'LOCAL' },
  { export: 'PDV', source: 'PONTO DE VENDA' },
  { export: 'PDV', source: 'NOME DO PDV' },
  { export: 'PDV', source: 'CLIENTE' },

  { export: 'PROMOTOR', source: 'Pessoa Nome' },
  { export: 'PROMOTOR', source: 'Pessoa ID Para Integracao' },
  { export: 'PROMOTOR', source: 'PROMOTOR' },
  { export: 'PROMOTOR', source: 'AGENTE' },
  { export: 'PROMOTOR', source: 'COLABORADOR' },
  { export: 'PROMOTOR', source: 'SUPERVISOR' },
  { export: 'PROMOTOR', source: 'NOME DO PROMOTOR' },

  { export: 'ITENS', source: 'Itens Descrição' },
  { export: 'ITENS', source: 'ITENS DESCRICAO' },
  { export: 'CÓDIGO ITEM', source: 'ITENS IDENTIFICADOR' },
  { export: 'ITENS', source: 'SKU' },
  { export: 'ITENS', source: 'ITENS' },
  { export: 'ITENS', source: 'PRODUTO' },
  { export: 'ITENS', source: 'DESCRICAO' },
  { export: 'ITENS', source: 'DESCRIÇÃO' },
  { export: 'ITENS', source: 'DESCRIÇÃO DO PRODUTO' },
  { export: 'ITENS', source: 'NOME DO PRODUTO' },
  { export: 'ITENS', source: 'ITEM' },

  { export: 'RUPTURA TOTAL?', source: 'RUPTURA TOTAL?' },
  { export: 'RUPTURA TOTAL?', source: 'RUPTURA TOTAL' },
  { export: 'PRODUTO EM RUPTURA?', source: 'PRODUTO EM RUPTURA?' },
  { export: 'PRODUTO EM RUPTURA?', source: 'PRODUTO EM RUPTURA' },
  { export: 'TIPO DE RUPTURA', source: 'TIPO DE RUPTURA' },
  { export: 'TIPO DE RUPTURA', source: 'TIPO_DE_RUPTURA' },

  { export: 'PRECO', source: 'PRECO' },
  { export: 'PRECO', source: 'PREÇO' },
  { export: 'PRECO', source: 'VALOR' },
  { export: 'PRECO', source: 'PREÇO UNITÁRIO' },
  { export: 'PRECO', source: 'PRECO UNITARIO' },

  { export: 'QTD. UNIDADE NO ESTOQUE', source: 'ESTOQUE TOTAL DA LOJA (UNIDADE)' },
  { export: 'QTD. UNIDADE NO ESTOQUE', source: 'ESTOQUE TOTAL DA LOJA' },
  { export: 'QTD. UNIDADE NO ESTOQUE', source: 'ESTOQUE' },
  { export: 'QTD. UNIDADE NO ESTOQUE', source: 'QUANTIDADE EM ESTOQUE' },
  { export: 'QTD. UNIDADE NO ESTOQUE', source: 'QTD ESTOQUE' },

  { export: 'TEM SKU VENCENDO EM 60 DIAS?', source: 'TEM SKU VENCENDO EM 60 DIAS?' },
  { export: 'TEM SKU VENCENDO EM 60 DIAS?', source: 'TEM SKU VENCENDO EM 60 DIAS' },
  { export: 'TEM SKU VENCENDO EM 60 DIAS?', source: 'VENCIMENTO 60 DIAS' },

  { export: 'DATA DO DIA', source: 'Data Hora Inicio Execucao Atividade Gerada Pelo Sistema (Dim Tempo)', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA HORA TAREFA', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA E HORA INÍCIO EXECUÇÃO', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA E HORA INÍCIO DE EXECUÇÃO', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA E HORA DE EXECUÇÃO', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA E HORA DA EXECUÇÃO', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA E HORA EXECUÇÃO', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA VISITA', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA DA VISITA', transform: 'date' },
  { export: 'DATA DO DIA', source: 'DATA', transform: 'date' },

  { export: 'INFORME A VALIDADE', source: 'INFORME A VALIDADE' },
  { export: 'INFORME A VALIDADE', source: 'VALIDADE' },
  { export: 'INFORME A VALIDADE', source: 'DATA DE VALIDADE' },

  { export: 'DIAS PARA O VENCIMENTO', source: 'DIAS PARA O VENCIMENTO' },
  { export: 'DIAS PARA O VENCIMENTO', source: 'DIAS VENCIMENTO' },
  { export: 'DIAS PARA O VENCIMENTO', source: 'DIAS RESTANTES' },

  { export: 'QUAL A QUANTIDADE EM UNIDADES?', source: 'QUAL A QUANTIDADE EM UNIDADES?' },
  { export: 'QUAL A QUANTIDADE EM UNIDADES?', source: 'QUANTIDADE' },
  { export: 'QUAL A QUANTIDADE EM UNIDADES?', source: 'QUANTIDADE (UN)' },
  { export: 'QUAL A QUANTIDADE EM UNIDADES?', source: 'QTD UNIDADES' },
  { export: 'QUAL A QUANTIDADE EM UNIDADES?', source: 'QUANTIDADE TOTAL' },

  { export: 'INFORME O LOTE', source: 'INFORME O LOTE' },
  { export: 'INFORME O LOTE', source: 'LOTE' },
  { export: 'INFORME O LOTE', source: 'NUMERO DO LOTE' },

  { export: 'TEM UM SEGUNDO LOTE EM VENCIMENTO?', source: 'TEM UM SEGUNDO LOTE EM VENCIMENTO?' },
  { export: 'TEM UM SEGUNDO LOTE EM VENCIMENTO?', source: 'TEM_UM_SEGUNDO_LOTE_EM_VENCIMENTO' },

  // Lote 2
  { export: '(2) INFORME A VALIDADE', source: '(2) INFORME A VALIDADE' },
  { export: '(2) INFORME A VALIDADE', source: '_2_INFORME_A_VALIDADE' },
  { export: '(2) DIAS PARA O VENCIMENTO', source: '(2) DIAS PARA O VENCIMENTO' },
  { export: '(2) DIAS PARA O VENCIMENTO', source: '_2_DIAS_PARA_O_VENCIMENTO' },
  { export: '(2) QUAL A QUANTIDADE EM UNIDADES?', source: '(2) QUAL A QUANTIDADE EM UNIDADES?' },
  { export: '(2) QUAL A QUANTIDADE EM UNIDADES?', source: '(2) QUAL A QUANTIDADE EM UNIDADES' },
  { export: '(2) QUAL A QUANTIDADE EM UNIDADES?', source: '_2_QUAL_A_QUANTIDADE_EM_UNIDADES' },
  { export: '(2) INFORME O LOTE', source: '(2) INFORME O LOTE' },
  { export: '(2) INFORME O LOTE', source: '_2_INFORME_O_LOTE' },
  { export: '(2) ACAO TOMADA', source: '(2) ACAO TOMADA' },
  { export: '(2) ACAO TOMADA', source: '_2_ACAO_TOMADA' },
  { export: '(2) FOTO DO SKU PRECIFICADO', source: '(2) FOTO DO SKU PRECIFICADO' },
  { export: '(2) FOTO DO SKU PRECIFICADO', source: '_2_FOTO_DO_SKU_PRECIFICADO' },

  // Lote 3
  { export: 'TEM UM TERCEIRO LOTE EM VENCIMENTO?', source: 'TEM UM TERCEIRO LOTE EM VENCIMENTO?' },
  { export: 'TEM UM TERCEIRO LOTE EM VENCIMENTO?', source: 'TEM_UM_TERCEIRO_LOTE_EM_VENCIMENTO' },
  { export: '(3) INFORME A VALIDADE', source: '(3) INFORME A VALIDADE' },
  { export: '(3) INFORME A VALIDADE', source: '_3_INFORME_A_VALIDADE' },
  { export: '(3) DIAS PARA O VENCIMENTO', source: '(3) DIAS PARA O VENCIMENTO' },
  { export: '(3) DIAS PARA O VENCIMENTO', source: '_3_DIAS_PARA_O_VENCIMENTO' },
  { export: '(3) QUAL A QUANTIDADE EM UNIDADES?', source: '(3) QUAL A QUANTIDADE EM UNIDADES?' },
  { export: '(3) QUAL A QUANTIDADE EM UNIDADES?', source: '(3) QUAL A QUANTIDADE EM UNIDADES' },
  { export: '(3) QUAL A QUANTIDADE EM UNIDADES?', source: '_3_QUAL_A_QUANTIDADE_EM_UNIDADES' },
  { export: '(3) INFORME O LOTE', source: '(3) INFORME O LOTE' },
  { export: '(3) INFORME O LOTE', source: '_3_INFORME_O_LOTE' },
  { export: '(3) ACAO TOMADA', source: '(3) ACAO TOMADA' },
  { export: '(3) ACAO TOMADA', source: '_3_ACAO_TOMADA' },
  { export: '(3) FOTO DO SKU PRECIFICADO', source: '(3) FOTO DO SKU PRECIFICADO' },
  { export: '(3) FOTO DO SKU PRECIFICADO', source: '_3_FOTO_DO_SKU_PRECIFICADO' },

  { export: 'TEM PONTO EXTRA?', source: 'TEM PONTO EXTRA?' },
  { export: 'TEM PONTO EXTRA?', source: 'PONTO EXTRA' },
  { export: 'TEM PONTO EXTRA?', source: 'TEM_PONTO_EXTRA' },

  // Fotos Adicionais Ponto Extra & Mix
  { export: 'FOTO DO PONTO EXTRA 01', source: 'FOTO_DO_PONTO_EXTRA_01' },
  { export: 'FOTO DO PONTO EXTRA 02', source: 'FOTO_DO_PONTO_EXTRA_02' },
  { export: 'FOTO DO PONTO EXTRA 03', source: 'FOTO_DO_PONTO_EXTRA_03' },
  { export: 'FOTO DO PONTO EXTRA 04', source: 'FOTO_DO_PONTO_EXTRA_04' },
  { export: 'FOTO DO PONTO EXTRA 05', source: 'FOTO_DO_PONTO_EXTRA_05' },
  { export: 'FOTO DO MIX 01', source: 'FOTO_DO_MIX_01' },
  { export: 'FOTO DO MIX 02', source: 'FOTO_DO_MIX_02' },
  { export: 'DISTÂNCIA DO PDV', source: 'DISTÂNCIA DO PDV' },
  { export: 'DISTÂNCIA DO PDV', source: 'DISTANCIA_DO_PDV' },
  { export: 'PRODUTO NA AREA DE VENDAS?', source: 'PRODUTO NA AREA DE VENDAS?' },
  { export: 'PRODUTO NA AREA DE VENDAS?', source: 'PRODUTO_NA_AREA_DE_VENDAS' },
  { export: 'PRODUTO EM ESTOQUE?', source: 'PRODUTO EM ESTOQUE?' },
  { export: 'PRODUTO EM ESTOQUE?', source: 'PRODUTO_EM_ESTOQUE' },
  { export: 'ACAO TOMADA', source: 'ACAO TOMADA' },
  { export: 'ACAO TOMADA', source: 'ACAO_TOMADA' },
  { export: 'FOTO DO SKU PRECIFICADO', source: 'FOTO DO SKU PRECIFICADO' },
  { export: 'FOTO DO SKU PRECIFICADO', source: 'FOTO_DO_SKU_PRECIFICADO' },

  { export: 'QUANTAS CAIXAS FORAM ABASTECIDAS?', source: 'QUANTAS CAIXAS FORAM ABASTECIDAS?' },
  { export: 'QUANTAS CAIXAS FORAM ABASTECIDAS?', source: 'QTD. DE CAIXAS ABASTECIDAS' },
  { export: 'QUANTAS CAIXAS FORAM ABASTECIDAS?', source: 'QTD DE CAIXAS ABASTECIDAS' },
  { export: 'QUANTAS CAIXAS FORAM ABASTECIDAS?', source: 'CAIXAS ABASTECIDAS' },

  { export: 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA?', source: 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA?' },
  { export: 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA?', source: 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA' },
  { export: 'QUAL MOTIVO DA AVARIA?', source: 'QUAL MOTIVO DA AVARIA?' },
  { export: 'QUAL MOTIVO DA AVARIA?', source: 'QUAL MOTIVO DA AVARIA' },
  { export: 'QUAL MOTIVO DA AVARIA?', source: 'MOTIVO DA AVARIA' },
  { export: 'QUAL MOTIVO DA AVARIA?', source: 'MOTIVO AVARIA' },
  { export: 'CITE O PESO DO PRODUTO', source: 'CITE O PESO DO PRODUTO' },
  { export: 'CITE O PESO DO PRODUTO', source: 'PESO DO PRODUTO' },
  { export: 'FOTO DO PRODUTO NA BALANÇA', source: 'FOTO DO PRODUTO NA BALANÇA' },
  { export: 'FOTO DO PRODUTO NA BALANÇA', source: 'FOTO DO PRODUTO NA BALANCA' },
  { export: 'CITE O LOTE DO PRODUTO', source: 'CITE O LOTE DO PRODUTO' },
  { export: 'CITE O LOTE DO PRODUTO', source: 'LOTE DO PRODUTO' },
  { export: 'COLOQUE O VALOR DA NOTA', source: 'COLOQUE O VALOR DA NOTA' },
  { export: 'COLOQUE O VALOR DA NOTA', source: 'VALOR DA NOTA' },
  { export: 'FOTO DA MESA', source: 'FOTO DA MESA' },

  { export: 'DATA E HORA INICIO EXECUCAO', source: 'DATA E HORA INICIO EXECUCAO', transform: 'datetime' },
  { export: 'DATA E HORA INICIO EXECUCAO', source: 'DATA E HORA INÍCIO EXECUÇÃO', transform: 'datetime' },
  { export: 'DATA E HORA INICIO EXECUCAO', source: 'Data Hora Inicio Execucao Atividade Gerada Pelo Sistema (Dim Tempo)', transform: 'datetime' },
  { export: 'SEÇAO', source: 'SEÇAO' },
  { export: 'SEÇAO', source: 'SEÇÃO' },
  { export: 'SEÇAO', source: 'SECAO' },
  { export: 'VISITOU O ALMOXARIFADO?', source: 'VISITOU O ALMOXARIFADO?' },
  { export: 'VISITOU O ALMOXARIFADO?', source: 'VISITOU ALMOXARIFADO?' },
  { export: 'OBSERVAÇÃO ALMOXARIFADO', source: 'OBSERVAÇÃO ALMOXARIFADO' },
  { export: 'OBSERVAÇÃO ALMOXARIFADO', source: 'OBSERVAÇÃO ALMOXARIFADO?' },
  { export: 'OBSERVAÇÃO ALMOXARIFADO', source: 'OBSERVACOES ALMOXARIFADO' },
  { export: 'VISITOU A COZINHA?', source: 'VISITOU A COZINHA?' },
  { export: 'VISITOU A COZINHA?', source: 'VISITOU COZINHA?' },
  { export: 'OBSERVAÇÃO COZINHA', source: 'OBSERVAÇÃO COZINHA' },
  { export: 'OBSERVAÇÃO COZINHA', source: 'OBSERVACOES COZINHA' },
  { export: 'VISITOU O AÇOUGUE?', source: 'VISITOU O AÇOUGUE?' },
  { export: 'VISITOU O AÇOUGUE?', source: 'VISITOU ACOUGUE?' },
  { export: 'OBSERVAÇÃO AÇOUGUE', source: 'OBSERVAÇÃO AÇOUGUE' },
  { export: 'OBSERVAÇÃO AÇOUGUE', source: 'OBSERVACOES ACOUGUE' },
  { export: 'VISITOU O SALGADO?', source: 'VISITOU O SALGADO?' },
  { export: 'VISITOU O SALGADO?', source: 'VISITOU SALGADO?' },
  { export: 'OBSERVAÇÃO SALGADO', source: 'OBSERVAÇÃO SALGADO' },
  { export: 'OBSERVAÇÃO SALGADO', source: 'OBSERVACOES SALGADO' },
  { export: 'VISITOU O LATICÍNIOS?', source: 'VISITOU O LATICÍNIOS?' },
  { export: 'VISITOU O LATICÍNIOS?', source: 'VISITOU LATICINIOS?' },
  { export: 'OBSERVAÇÃO LATICÍNIOS', source: 'OBSERVAÇÃO LATICÍNIOS' },
  { export: 'OBSERVAÇÃO LATICÍNIOS', source: 'OBSERVACOES LATICINIOS' },
  { export: 'VISITOU O FLV?', source: 'VISITOU O FLV?' },
  { export: 'VISITOU O FLV?', source: 'VISITOU FLV?' },
  { export: 'OBSERVAÇÃO FLV', source: 'OBSERVAÇÃO FLV' },
  { export: 'OBSERVAÇÃO FLV', source: 'OBSERVACOES FLV' },
  { export: 'VISITOU A LIXEIRA?', source: 'VISITOU A LIXEIRA?' },
  { export: 'VISITOU A LIXEIRA?', source: 'VISITOU LIXEIRA?' },
  { export: 'OBSERVAÇÃO LIXEIRA', source: 'OBSERVAÇÃO LIXEIRA' },
  { export: 'OBSERVAÇÃO LIXEIRA', source: 'OBSERVACOES LIXEIRA' },
  { export: 'RELATÓRIO ASSINADO PELO GERENTE?', source: 'RELATÓRIO ASSINADO PELO GERENTE?' },
  { export: 'RELATÓRIO ASSINADO PELO GERENTE?', source: 'RELATORIO ASSINADO PELO GERENTE?' },
  { export: 'FOTO DA ASSINATURA DO GERENTE', source: 'FOTO DA ASSINATURA DO GERENTE' },
  { export: 'FOTO DA ASSINATURA DO GERENTE', source: 'FOTO ASSINATURA DO GERENTE' },
  { export: 'NOME DO GERENTE', source: 'NOME DO GERENTE' },
  { export: 'OBSERVAÇÕES SOBRE A LOJA', source: 'OBSERVAÇÕES SOBRE A LOJA' },
  { export: 'OBSERVAÇÕES SOBRE A LOJA', source: 'OBSERVACOES SOBRE A LOJA' }
];

const state = {
  files: [],
  activeIndex: 0,
  selectedRedes: new Set(),
  availableRedes: []
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const mappingSection = document.getElementById('mappingSection');
const previewSection = document.getElementById('previewSection');
const redeFilterSection = document.getElementById('redeFilterSection');
const redeCheckboxesContainer = document.getElementById('redeCheckboxesContainer');
const redeDropdownContainer = document.getElementById('redeDropdownContainer');
const redeDropdownTrigger = document.getElementById('redeDropdownTrigger');
const redeDropdownMenu = document.getElementById('redeDropdownMenu');
const redeDropdownSelectedText = document.getElementById('redeDropdownSelectedText');
const selectAllRedesBtn = document.getElementById('selectAllRedesBtn');
const deselectAllRedesBtn = document.getElementById('deselectAllRedesBtn');
const mappingTableBody = document.getElementById('mappingTableBody');
const previewWrap = document.getElementById('previewWrap');
const countRows = document.getElementById('countRows');
const countColumns = document.getElementById('countColumns');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const downloadExcelBtn = document.getElementById('downloadExcelBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const fileTabsContainer = document.querySelector('.file-tabs');

// Helper to show/hide loading
function toggleLoading(show) {
  if (show) {
    loadingOverlay.classList.remove('hidden');
  } else {
    loadingOverlay.classList.add('hidden');
  }
}

// Custom Alert with SweetAlert2 fallback
function showAlert(title, text, icon = 'info') {
  if (typeof Swal !== 'undefined') {
    Swal.fire({ title, text, icon, confirmButtonColor: '#f07f27' });
  } else {
    alert(`${title}\n\n${text}`);
  }
}

// Drag and Drop Events

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files && files.length) handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length) handleFiles(files);
});

loadSampleBtn.addEventListener('click', async () => {
  toggleLoading(true);
  try {
    state.files = [];
    state.activeIndex = 0;
    const response = await fetch('sample-deluc.csv');
    const content = await response.text();

    setTimeout(() => {
      const processed = processCsv(content, "exemplo_deluc");
      if (processed) {
        state.files.push(processed);
        renderApp();
      }
      toggleLoading(false);
    }, 100);
  } catch (error) {
    toggleLoading(false);
    showAlert('Erro', 'Não foi possível carregar o exemplo localmente.', 'error');
  }
});

async function handleFiles(fileList) {
  const files = Array.from(fileList).filter(f => {
    const ext = f.name.toLowerCase();
    return ext.endsWith('.csv') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
  });

  if (files.length === 0) {
    showAlert('Aviso', 'Nenhum arquivo .CSV, .XLSX ou .XLS válido selecionado.', 'warning');
    return;
  }

  toggleLoading(true);
  state.files = [];
  state.activeIndex = 0;

  try {
    for (const file of files) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const ext = file.name.toLowerCase();
      let processed = null;

      if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
        if (typeof XLSX !== 'undefined') {
          const buffer = await readFileAsArrayBuffer(file);
          const wb = XLSX.read(buffer, { type: 'array' });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const sheetRows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
          processed = processRows(sheetRows, baseName);
        } else {
          showAlert('Erro', 'Biblioteca de leitura do Excel (XLSX) não carregada.', 'error');
          continue;
        }
      } else {
        const content = await readFileAsTextSmart(file);
        processed = processCsv(content, baseName);
      }

      if (processed) {
        state.files.push(processed);
      }
    }

    if (state.files.length > 0) {
      renderApp();
    }
  } catch (e) {
    console.error(e);
    showAlert('Erro', 'Falha ao ler os arquivos selecionados. Verifique se o formato está correto.', 'error');
  } finally {
    toggleLoading(false);
  }
}

function normalizeHeader(value) {
  let str = String(value || '');
  str = str
    .replace(/Ã§/g, 'c').replace(/Ã§Ã£o/g, 'cao').replace(/Ã£/g, 'a')
    .replace(/Ã¡/g, 'a').replace(/Ã©/g, 'e').replace(/Ã/g, 'i')
    .replace(/Ã³/g, 'o').replace(/Ãº/g, 'u').replace(/Ãª/g, 'e')
    .replace(/Ã¢/g, 'a').replace(/Ã´/g, 'o');

  str = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  str = str.replace(/^_2_/i, '(2) ').replace(/^_3_/i, '(3) ');
  str = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();

  return str;
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsTextSmart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const buffer = e.target.result;
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        resolve(text.replace(/^\uFEFF/, ''));
      } catch (err) {
        const text = new TextDecoder('windows-1252').decode(buffer);
        resolve(text.replace(/^\uFEFF/, ''));
      }
    };
    reader.onerror = e => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file, encoding) {
  return readFileAsTextSmart(file);
}

const REDE_KEYS = [
  'REDE', 'REDE DO PDV', 'REDE_DO_PDV', 'NOME DA REDE', 'BANDEIRA',
  'REDE / BANDEIRA', 'REDE/BANDEIRA', 'REDE DE SUPERMERCADOS',
  'REDE SUPERMERCADOS', 'REDE COMERCIAL', 'NOME REDE', 'NOME DA BANDEIRA'
];

const PDV_KEYS = [
  'Local de Atendimento Descrição', 'Local de Atendimento Descricao',
  'Local de Atendimento Identificador Alternativo',
  'PDV', 'LOCAL', 'FANTASIA', 'LOJA', 'CLIENTE', 'PONTO DE VENDA', 'NOME DO PDV'
];

const PROMOTOR_KEYS = [
  'Pessoa Nome', 'Pessoa ID Para Integracao',
  'PROMOTOR', 'AGENTE', 'COLABORADOR', 'SUPERVISOR', 'NOME DO PROMOTOR'
];

const PRODUTO_KEYS = [
  'SKU', 'Itens Descrição', 'Itens Descricao', 'ITENS', 'PRODUTO',
  'DESCRICAO', 'DESCRIÇÃO', 'DESCRIÇÃO DO PRODUTO', 'NOME DO PRODUTO', 'ITEM',
  'Itens Identificador'
];

const DATA_KEYS = [
  'Data Hora Inicio Execucao Atividade Gerada Pelo Sistema (Dim Tempo)',
  'DATA HORA TAREFA',
  'DATA HORA FIM EXECUCAO ATIVIDADE GERADA PELO SISTEMA (DIM TEMPO)',
  'DATA', 'DATA DO DIA', 'DATA VISITA', 'DATA DA VISITA', 'DATA E HORA INÍCIO EXECUÇÃO', 'DATA E HORA INICIO EXECUCAO', 'DATA E HORA EXECUÇÃO'
];

const PRECO_KEYS = ['PRECO', 'PREÇO', 'VALOR', 'PREÇO UNITÁRIO', 'PRECO UNITARIO'];

const VALIDADE_KEYS = [
  'INFORME A VALIDADE', 'VALIDADE', 'DATA DE VALIDADE', 'INFORME_A_VALIDADE',
  '(2) INFORME A VALIDADE', '_2_INFORME_A_VALIDADE', '(2) VALIDADE',
  '(3) INFORME A VALIDADE', '_3_INFORME_A_VALIDADE', '(3) VALIDADE'
];

const CAIXAS_KEYS = ['QUANTAS CAIXAS FORAM ABASTECIDAS?', 'QTD. DE CAIXAS ABASTECIDAS', 'QTD DE CAIXAS ABASTECIDAS', 'CAIXAS ABASTECIDAS', 'CAIXAS', 'QTD CAIXAS', 'TOTAL REPOSIÇÕES', 'QUANTIDADE TOTAL', 'QUANTIDADE'];

const PONTO_EXTRA_KEYS = ['TEM PONTO EXTRA?', 'PONTO EXTRA'];

const AVARIA_KEYS = [
  'FOI RETIRADO PRODUTO DO PDV PARA AVARIA?',
  'FOI RETIRADO PRODUTO DO PDV PARA AVARIA',
  'QUAL MOTIVO DA AVARIA?',
  'QUAL MOTIVO DA AVARIA',
  'MOTIVO DA AVARIA',
  'MOTIVO AVARIA',
  'CITE O PESO DO PRODUTO',
  'PESO DO PRODUTO',
  'FOTO DO PRODUTO NA BALANÇA',
  'FOTO DO PRODUTO NA BALANCA',
  'CITE O LOTE DO PRODUTO',
  'LOTE DO PRODUTO',
  'COLOQUE O VALOR DA NOTA',
  'VALOR DA NOTA',
  'FOTO DA MESA'
];

const TECNICO_KEYS = [
  'VISITOU O ALMOXARIFADO?',
  'VISITOU ALMOXARIFADO?',
  'VISITOU A COZINHA?',
  'VISITOU COZINHA?',
  'VISITOU O AÇOUGUE?',
  'VISITOU ACOUGUE?',
  'VISITOU O SALGADO?',
  'VISITOU SALGADO?',
  'VISITOU O LATICÍNIOS?',
  'VISITOU LATICINIOS?',
  'VISITOU O FLV?',
  'VISITOU FLV?',
  'VISITOU A LIXEIRA?',
  'VISITOU LIXEIRA?',
  'RELATÓRIO ASSINADO PELO GERENTE?',
  'RELATORIO ASSINADO PELO GERENTE?',
  'RELATORIO TECNICO FINALIZADO?',
  'RELATÓRIO TÉCNICO FINALIZADO?',
  'CHECK LIST TÉCNICO',
  'CHECK LIST TECNICO',
  'PESQUISA START - TÉCNICO',
  'PESQUISA START - TECNICO',
  'VISITOU CLIENTE?',
  'VISITOU CLIENTE (CHECKOUT)?',
  'VISITOU CLIENTE (FOTO)?',
  'FOTO ENTRADA COM BIO',
  'TEM FOTO DA ENTRADA?',
  'CHECKIN COM GEOLOCALIZACAO FORA DE RAIO',
  'CHECKIN COM GEOLOCALIZAÇÃO FORA DE RAIO',
  'FOTO MOSTRANDO CONFORME CHECK-OUT',
  'TEM FOTO NO CHECKOUT?',
  'FOTO DAS VALIDADES E RUPTURAS',
  'TEM FOTO DE VALIDADE E RUPTURAS?'
];

const extractRede = (localStr) => {
  if (!localStr) return 'OUTROS';
  const str = String(localStr).trim();
  const knownMap = [
    { key: 'REDE MARKET', match: ['REDE MARKET', 'MARKET'] },
    { key: 'CARLÃO SUPERMERCADOS', match: ['CARLÃO', 'CARLAO'] },
    { key: 'ASSAÍ', match: ['ASSAÍ', 'ASSAI'] },
    { key: 'ATACADÃO', match: ['ATACADÃO', 'ATACADAO'] },
    { key: 'PREZUNIC', match: ['PREZUNIC'] },
    { key: 'HORTIFRUTI', match: ['HORTIFRUTI'] },
    { key: 'CARREFOUR', match: ['CARREFOUR'] },
    { key: 'GUANABARA', match: ['GUANABARA'] },
    { key: 'ROYAL', match: ['ROYAL'] },
    { key: 'MUNDIAL', match: ['MUNDIAL'] },
    { key: 'ZONA SUL', match: ['ZONASUL', 'ZONA SUL'] },
    { key: 'SPOLETO', match: ['SPOLETO'] },
    { key: 'ARAMAR', match: ['ARAMAR'] },
    { key: 'BIG', match: ['BIG'] },
    { key: 'BOMPREÇO', match: ['BOMPREÇO', 'BOMPRECO'] }
  ];

  const upperStr = str.toUpperCase();
  for (const item of knownMap) {
    if (item.match.some(m => upperStr.includes(m))) {
      return item.key;
    }
  }
  const parts = str.split(/[-–—]/);
  return parts[0].trim().toUpperCase();
};

const getRowVal = (row, keys) => {
  if (!row) return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
    const normK = normalizeHeader(k);
    if (row[normK] !== undefined && row[normK] !== null && String(row[normK]).trim() !== '') {
      return String(row[normK]).trim();
    }
  }
  return '';
};

function getRowRede(row) {
  if (!row) return '(SEM REDE / VAZIO)';
  const explicit = String(
    row['REDE'] || row['REDE DO PDV'] || row['REDE_DO_PDV'] ||
    row['NOME DA REDE'] || row['BANDEIRA'] ||
    getRowVal(row, REDE_KEYS) || ''
  ).trim();

  if (explicit && explicit.toUpperCase() !== 'OUTROS') {
    return explicit.toUpperCase();
  }

  const pdvVal = getRowVal(row, PDV_KEYS);
  if (pdvVal) {
    const extracted = extractRede(pdvVal);
    if (extracted && extracted !== 'OUTROS') {
      return extracted.toUpperCase();
    }
  }

  return '(SEM REDE / VAZIO)';
}

function getFilteredRows(fileObj) {
  if (!fileObj || !fileObj.rows) return [];
  if (!state.selectedRedes || state.selectedRedes.size === 0) return [];
  return fileObj.rows.filter(row => {
    const rede = getRowRede(row);
    return state.selectedRedes.has(rede);
  });
}

function updateAvailableRedes() {
  if (!state.files || state.files.length === 0) {
    state.availableRedes = [];
    state.selectedRedes.clear();
    return;
  }

  const countsMap = new Map();
  state.files.forEach(file => {
    (file.rows || []).forEach(row => {
      const rede = getRowRede(row);
      countsMap.set(rede, (countsMap.get(rede) || 0) + 1);
    });
  });

  const redesList = Array.from(countsMap.entries()).map(([name, count]) => ({ name, count }));

  redesList.sort((a, b) => {
    if (a.name === '(SEM REDE / VAZIO)') return 1;
    if (b.name === '(SEM REDE / VAZIO)') return -1;
    return a.name.localeCompare(b.name);
  });

  state.availableRedes = redesList;

  if (state.selectedRedes.size === 0) {
    redesList.forEach(r => state.selectedRedes.add(r.name));
  } else {
    const currentNames = new Set(redesList.map(r => r.name));
    for (const name of state.selectedRedes) {
      if (!currentNames.has(name)) {
        state.selectedRedes.delete(name);
      }
    }
    if (state.selectedRedes.size === 0) {
      redesList.forEach(r => state.selectedRedes.add(r.name));
    }
  }

  renderRedeFilter();
}

function updateDropdownTriggerText() {
  if (!redeDropdownSelectedText) return;
  const total = state.availableRedes ? state.availableRedes.length : 0;
  const selected = state.selectedRedes ? state.selectedRedes.size : 0;

  if (total === 0 || selected === 0) {
    redeDropdownSelectedText.textContent = 'Nenhuma rede selecionada';
  } else if (selected === total) {
    redeDropdownSelectedText.textContent = `Todas as redes selecionadas (${total})`;
  } else if (selected === 1) {
    const singleName = Array.from(state.selectedRedes)[0];
    redeDropdownSelectedText.textContent = singleName;
  } else {
    redeDropdownSelectedText.textContent = `${selected} redes selecionadas de ${total}`;
  }
}

if (redeDropdownTrigger && redeDropdownMenu && redeDropdownContainer) {
  redeDropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !redeDropdownMenu.classList.contains('hidden');
    if (isOpen) {
      redeDropdownMenu.classList.add('hidden');
      redeDropdownContainer.classList.remove('open');
    } else {
      redeDropdownMenu.classList.remove('hidden');
      redeDropdownContainer.classList.add('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (redeDropdownContainer && !redeDropdownContainer.contains(e.target)) {
      if (redeDropdownMenu) redeDropdownMenu.classList.add('hidden');
      if (redeDropdownContainer) redeDropdownContainer.classList.remove('open');
    }
  });
}

function renderRedeFilter() {
  if (!redeCheckboxesContainer) return;
  redeCheckboxesContainer.innerHTML = '';

  if (!state.availableRedes || state.availableRedes.length === 0) {
    if (redeFilterSection) redeFilterSection.classList.add('hidden');
    updateDropdownTriggerText();
    return;
  }

  if (redeFilterSection) redeFilterSection.classList.remove('hidden');

  state.availableRedes.forEach(item => {
    const isChecked = state.selectedRedes.has(item.name);
    const card = document.createElement('label');
    card.className = `custom-dropdown-item ${isChecked ? 'selected' : ''}`;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = item.name;
    cb.checked = isChecked;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'rede-name-label';
    labelSpan.textContent = item.name;

    const countSpan = document.createElement('span');
    countSpan.className = 'rede-count-badge';
    countSpan.textContent = `${item.count} ${item.count === 1 ? 'linha' : 'linhas'}`;

    cb.addEventListener('change', () => {
      if (cb.checked) {
        state.selectedRedes.add(item.name);
        card.classList.add('selected');
      } else {
        state.selectedRedes.delete(item.name);
        card.classList.remove('selected');
      }
      updateDropdownTriggerText();
      applyRedeFilter();
    });

    card.appendChild(cb);
    card.appendChild(labelSpan);
    card.appendChild(countSpan);
    redeCheckboxesContainer.appendChild(card);
  });

  updateDropdownTriggerText();
}

function applyRedeFilter() {
  if (!state.files.length) return;
  const activeFile = state.files[state.activeIndex];
  const filteredRows = getFilteredRows(activeFile);

  renderPreview(activeFile.columns, filteredRows);
  if (countRows) countRows.textContent = filteredRows.length;
}

if (selectAllRedesBtn) {
  selectAllRedesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.availableRedes.forEach(item => state.selectedRedes.add(item.name));
    renderRedeFilter();
    applyRedeFilter();
  });
}

if (deselectAllRedesBtn) {
  deselectAllRedesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.selectedRedes.clear();
    renderRedeFilter();
    applyRedeFilter();
  });
}

function renderApp() {
  if (state.files.length === 0) return;
  const activeFile = state.files[state.activeIndex];

  updateAvailableRedes();
  renderTabs();
  if (mappingTableBody) renderMapping(activeFile.columns);
  
  applyRedeFilter();

  if (countColumns) countColumns.textContent = activeFile.columns.length;

  if (mappingSection) mappingSection.classList.remove('hidden');
  if (previewSection) previewSection.classList.remove('hidden');
}

function renderTabs() {
  if (!fileTabsContainer) return;
  fileTabsContainer.innerHTML = '';

  if (state.files.length <= 1) return;

  state.files.forEach((f, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === state.activeIndex ? 'active' : ''}`;
    btn.textContent = f.originalFileName;
    btn.addEventListener('click', () => {
      state.activeIndex = idx;
      renderApp();
    });
    fileTabsContainer.appendChild(btn);
  });
}

// Download Handlers
downloadCsvBtn.addEventListener('click', async () => {
  if (!state.files.length) return;

  if (state.files.length === 1) {
    const activeFile = state.files[0];
    const filteredRows = getFilteredRows(activeFile);
    const csv = buildCsv(activeFile.columns, filteredRows);

    let fileNameExtra = '';
    if (state.selectedRedes.size === 1) {
      const selectedName = Array.from(state.selectedRedes)[0].replace(/[^a-zA-Z0-9_-]/g, '_');
      fileNameExtra = `_${selectedName}`;
    }

    downloadFile(csv, `${activeFile.originalFileName}${fileNameExtra}_final.csv`, 'text/csv;charset=utf-8;');
  } else {
    toggleLoading(true);
    try {
      const zip = new JSZip();
      for (const file of state.files) {
        const filteredRows = getFilteredRows(file);
        const csv = buildCsv(file.columns, filteredRows);
        zip.file(`${file.originalFileName}_final.csv`, csv);
      }
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Relatorios_CSV_Final.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showAlert('Erro', 'Falha ao criar o arquivo ZIP (CSV).', 'error');
    }
    toggleLoading(false);
  }
});


downloadExcelBtn.addEventListener('click', async () => {
  if (!state.files.length) return;

  try {
    toggleLoading(true);

    const OBJETIVA_LOGO_BASE64 = "data:image/png;base64,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";
    const BUTTON_IMAGES_B64 = {"PRE\u00c7O_active": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAABUCAYAAADkgn5aAAAKbklEQVR4nO3dC3AU9R0H8N//cpfkLk/yTkx4VUjAaW0tCqhVa6kjfSCDVKzQhzKt1dLSDurwEmgrY6UlnVZ0FNrKDKgtMoHRVlscaUdaakmljFAlIJMYQt5PkrtLcrnbzv+f3GZz2b3bu9vDu73vZ+Ym99j932Zlvv7++//vP0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACoYJXb7AABKEiVIkMltSpLki0H7AACqGGOWWISmkUEp2kI4AkCchaYUD0GpGZB1q8oNaB4AQJ/K/U0xCUxmdBcb4QgA8Raa0XbJmVFVJAISABIoMMMKS2XK6oWQBICEoSziFMUdi2VQssAvQSUJAPEuIKcm5ZiRQSk3LkmSV+XLAQDilj+vxvIrrLAMu+uNkAQAk4SlbnqDMuxSFQAgzunOtbC63qgmAcCkXfCogxJVJACYHTOq643ABACz0ZVtljDuvhnhPzHSDQAm6n6LXBvDjJxwDgCQVPReo0S3GwDMKmTGBQtKhCMAJBtmxDxKAACzMXQeJQBAUkJQAgAYMD0I3W4AMLugWYeKEgAgBAzmAECyY6E2QEUJABCCNdQGYC6OOQupYtMrkz+QJJJ8XpI8Q+Qd6KHB+tPU85c95K47MWEze+UNNPXxGu0vkHzkG3KT93IXDTW+T71H95Pzvb/rO4YgOg/+groO/1r1s/SZ11LOLSvIMWcBWaeUEktNJ6+zl4ab6mjg1FG6fOwAeQd6g7bP982a/1WyVy0ka24RWeyZ4jx4WuvJeeYY9f3tRRrpbQ/rmME8EJQwijFiKVbxsKRnkK2gnLLm3UltezdS71v79J8lZhH7izaKplLmvDup69Vd1Hng54afaR6IJat3UPZNyyZ9Zs0pFA/HNTdT/l0/oNbd62jg5JFJ26Vk5lLpQ09TxrWf12yD/88hf8ka6qzZSd2vPWv47wHxD11v0MYYFX97O6WWzYrqLPGQsc++3tAzzaw2qlj/smpIBkrJnEJla3eLSlbJ4siiis01qiE56ftsaVS4YiMVP2B84EP8Q0WZ5Bq3LSH3hydHK0FbGtlKplPBsnWiEhSYhfIWf4daf/eY+v4/WzbePWdMbM+rtCl3PED5S9fK2+Xcdi+5z9UGP4Yw8NBShq/7/H+o8+AvaZC3Y0mhtIoqyvvSg/LvwSvlwpVb6KPNi+V9iu9/ktLKZ8uvh9saqKtmJzlPHyOfq09047OuXyx+D4sjW2yTe/sq8R19bx8I63ghsSEoYfza4rCbhho/oOZdD9HMnf8ka36Z+Cht6hx9Z0mSiCSvuD7JrylmLVhCqSUzxEepJTON+0ebW0S5i74lv3a9f5yanrqPJO/4ilk8lC+dq6XSh3eRdUoxOU8dpYFTb8mfp027hrIXLpVf8+upjU/cTT5Xv/yep6ORul9/Xuw3bdtrogLlCu5+hC4fP0TSiMew3wniG4ISJuEBMHTxrByUKTmFEZ0lZkkZb1MRYtHKuuHLxGyp8uv2l36q2X7Ls2s021DiFbMyJJWGmz+kzkPVVLRyq3jNz4ujaiE5z7wdxW8BiQTXKGES3k1VVpF89Ff3gBDvvheUU9HKLWIwx0+r2x0Je+V8+flIXwcNNZwJuw3l9UpP20c0eOFU0O3733l14jFUjR8DmB8qShjFGFlS7WQrnk4Fyx8la16pfGYCpwgpBZ0qNIZ3xXuPvKDdxraJIRRouOUC1T96q/zaVnCV/NzT1hDRf0FrbrH8fKjpbMjtR3raRMXp734rzw+YH4IyyYUKKT6vsvfNvRG3P3zpHDU/831R+RnFYh8NK04aHoyoDT7g5OcbdOraxzfklIMyZWxwB5IDghI08et+Lc//mIZb68M+S+7z71LnKzvI9cG/xECRkXxDLvk5S3NE1sYgD73RsOOTy8MNaK9b/XommBOCEiYEozTkopHeNnLX1VL3G7vFQEYwfHrQ4IX/kq14huiy8+k0nH3WZylr/lfIdfYdIin4SQ53ehDvBtPoYDqlFk+P6L/gSE+r3H1Omzo35Pa2wgoxiV7ev7slou+FxISgTHKRzGFUGyUXXezfPEjl6/ZSxqdvF+/nfuEbopps27uJjOQ+X0uZ131RPE/Jzqf0GZ+iwfr3wmrDVXeC0j/xGfGcDz7xASJ33b81tw+c2B5sWzAfjHqDcSQftTz3Qxrpapbf4vMd5cnrBuk/8Wcin1d+Xfj1TWKkXg2/s2jq1sPi7iDlSH7/8cMTtitZ/ZS4g0dN+vRPUt6SNRMqWnFJAZIGghIMxRefaHlu7ejkc8UdMCkZOYZ9B5/Oo7wzxjH3JqrY8EexsAW//9uSnkn2q68Tk815UNtnzaOCe9ZT2do94q4dbrDhNPXXvi63kVp2NU174g3KueUecX83D14+vYkHbMXmg2JGgF/XoWqSPMOG/T4Q/9D1BsPxaosvpJG76Juj/8hyCqnwvsepdc8jEY28+++cadh4h/y6fd9W0eXmd9j45zVWbDqo3YDPS20vbJhQifLjSbtqtghJfxe85LvVQY+DB3Tv0RdDHi+YCypKiImOP2wnT2eT/Drn1nsnLUoR7ch34/blNHDyzdDbui5T89PfI9eZY5Peb/zJXTTw7l91XYftrKmm1j3rojpuSEyoKCEm+PSbtt8+RuXrX5LfK169gxo2LDLuO1z9dKn6fnLMvZGyP/c1clTNJ2tOkVhXk68d6WlvpP4TfxIPrdsTvc4+uvSr1aKrnn3zcrJXLSBbXomYduRz9omFMlz/+wf18vUoFddeIbkwHX9shz8skiSJizJ1q8qv3NEB6MQHakoffkbctcOrP37LZPu+LeTpuIhzCKoq94/2eBhjfOEAPtlXUjwmQEUJpjDS3UpNT64Qq6vzNSOzb1xKzJpKTTtWftyHBiaAa5SQ8Phthby7zRfv4M9Txm4zHOlGVxmMgYoSEl7+0h+JRXr905M8nRep4+Xt1HPk9x/3oYFJ4BolACSlyjCuUaLrDQAQAoISACAEBCUAgEFBGWKhLACAhBUy31BRAgBEGZSqI0AAACYTNOt0V5SMsTTlkDoAgAmmBolcM7LrjcoSAMxGV65hMAcAkp0UTVBO2pkxls5/ovsNACbodos80xOaeu719u+IgR0AMBPlLYuSkdcoJVSVAGCSalJ38adnepBaWIq/tIQuOAAkYEjaNUIy6ulBgSWq3CDCEgDiXUBOaeZZNEGplro+5YVQhCUAxCtlPo3lln9JNSUp0vUo1bab8Hd0xh5MkiSXf0P8TR0AiMOAdPiLPI21Jw0JSuW2yqBkamHph9AEgCtJrXcbEJLKn7pCUrQRYVBSQFgqA9MZRpsAADHBGMtQCUZltzsmQancXqu6nPCQJGkgzPYBACLGGMvUGKzRqiJ1TQ8KNyiV+6hdtwx8KD8HAIiVwBDUepDKz5AiDTDlfmqhqBWSCEwAMJKkIywDPwvcL6RogkstAPUGJAITAKIRbHpPqOox7JXQjAgspjM8Y/HdAJB8pBDva4VixEtFGhlWeqpGhCMAGEkt/MKaTK5HLIIrWJsISgAwknQlFhuPdXAhGAHgSsJfYgAAAAAAij//B5QfntciqL4jAAAAAElFTkSuQmCC", "PRE\u00c7O_inactive": "data:image/png;base64,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", "RUPTURA_active": "data:image/png;base64,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", "RUPTURA_inactive": "data:image/png;base64,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", "VALIDADE_active": "data:image/png;base64,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", "VALIDADE_inactive": "data:image/png;base64,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", "ABASTECIMENTO_active": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAABUCAYAAADkgn5aAAAOvklEQVR4nO2dCZQT9R3Hf5O9s1dgl12u5fAAFISKIIeCIIrVFlBE8QCKYqtUqI96PBRFVNAKilUf2Gp9HkCpiIBVwarggaKCCl4oAnItsOx938n0/f67MzvJTjaT3ZkQMt/Pe/Myk8yVf2a+87v+/xABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADpIdGrvHwAAtMh0igiZuk9Zlj0W7B8AAHSRJMlhhWiaKZRiXxBHAECYiaYcDkLpVyD3TOlqwu4BAMAYvVdmWyKYktkuNsQRABBuotlWl1wyy4qEQAIATiHBDEostSprFIgkAOCUQWvEaYw7yUqhlHwPAksSABDu+OhUMx0zUyjVncuy7NY5OAAAhC2KXjXqV1BiGbTrDZEEAESIWBrGqFAGbaoCAECYY1jXgnK9YU0CACLUBW+zUMKKBABEOpJZrjcEEwAQaRjSNkcQvW/q+RWZbgBABLnfQtcakcwsOAcAAFthNEYJtxsAEKkE1LiWhBLiCACwG5IZdZQAABBpmFpHCQAAtgRCCQAAJpQHwe0GAEQ6LWodLEoAAAgAkjkAALsjBVoBFiUAAAQAQgkAAAGAUAIAQACiA61gJ9In3U1pV96hLhe9+y/KXbnA7/oJvc+nbg+s879Dj5s8tVVUX5hDFT9spcK3llF9UY7p56HgiE2g1NE3UNLASym2Sy+KSmpHsruO3MV5VH3gWyr9bB2V7/zAaxs+Dh8vWA7OHUM12XvIedYwypr3elDb5q9dQgUbntb9LP60AZQ6cjI5zxpK0e06kRQbT+6KYqrN3kPlu7ZQ6dY15C4v9tom5YKJ1GnmM+ry/r8MpvrC42I+6dxLqMudL3utL7vrad+tfclTXeH1viMhmc74x/ckRXnfFkefnK62W1u/b8IZA6nbgv+qn+WuepiKNj2vu12PR9+juG5ni/kTL91LxZtXtPn38oXbOXnIOEroM4yiXRnkSEgid3kR1eUcENdsyYerqL44l+wOhFLBEUWpI6/1apyUEddQ3muPkVxX07rWdUSRIz6JYjufIaaUYRPoyKPXUs2Rn00/j7iuvajrPasoun0nr/el6BhyZHanmMzulDx0PJV/8x4de3Zm67+TRbAgdpyxWIieL9GpHcTk7HshpU2YTTnP3ym+R6uPFRVNCX2GUsWuzV7vswj6iqTVpE+cQ2Xb1lN9SV5IjxuV5KJOM5+lxAGj/bY3GwJp42dR/ronqfCt5WRn4Ho3kjRgdDORiUpMFU9bs4hKbk+dbnva9POQYmKpy90rmm2nu/+BYylj6kMUTrCYZ81drSuSvrCV3PmO54WotYXEc0Y2e8/ZbwSFGrZi0yffG9pjOpMp6/51uiLpixQTRx0m30eZN/+N7AwsykbYZVUo+/JtSh7yezHvGjOVSj9da6gxDz8ykar2bG9YkBwkRUVRTHqWECbloozr3pfisvr4tSpbcx5JAy+jmLQuDQuyTAVvPkOlW1+nusJj5IhzUkKv88WFzq6VOMZF11H+64vJXVYoXEJfNzh11PXU8ZYl6vK+mf3FuobaYMF4qtr3DQUD34gJvQary1V7v6L8tU9QNe/HESXaq/0Vt1LSoN+Kz9nq63DjfDp0/+VBHYddbsViTNQRxcR+F+qua/b39SV1xDVUvPlVqt6/K+C6ZvxemTc9JjwQhdoTB6lg3ZNU8f1W8lSWiJBH8uDLhZvvcKaIdVwXTxG/R8kna8iOwKLkp4UrgxIHXCwahONWJ16ZR3JttVhOOPM8caMGjewhub6OanN+pdwV870+im6Xaep5xHbsqc5zbI5jYnzxy3W1Ip7HbuqJl+9T12EBiO95DoUD/J1dl/xBXa7cvY2OLJxElT9+Sp6aSvJUlVHVLzvo6N9vodJtG6jyp88pb/UiOv5cUwzXKLwvbheGY7ja34HnYzufKeZrcw6IdUOGJFHmtIXi1Wr4QZ0y7Ep1uebwbjr0wOVU+tl6cpfmi2u2Lu8wFW78Jx1aMJ48lU3tkH71XcL6tyMQSn4ij5ysWg8ct3KXFlC5Jn7F1lxb8L246nIPm3oe2mB7dFpnkdiI79nfa53yr94VozorU8V3H1M4kHz+70ToQCH33w8La06P48tn0ZFF11DhO89R7dFfWnW8qt3b1PnEfk3ut7Nvk4VZufszChXVB74Tr/Gn/4ZSR3jHpq1qby05L97jJYZaao/to/z1S72uLWeftoU8TlUglJIkXBetuytev2jKTHLsjF3YoJAkIQD8BM+8+XH1bbaI2GIx8zzKv36X3BUlXut1f2Qjnb5sJ3WetVwIbEyHLApHEnoPUec5oVFz8AdLj8cWq4JTI5RaV1y7jtXkvjpfhEuY9MlzRczSSrSx3boThwK6+9rrj0no0/R72QnbxyidZ19AMRndRGNwKU/Ftx+Kebbk2P11xCeKizd52AQq+Wh1i43ZYqmQcOl+pePLZ5t+HuxeH192O3WZ86IIvqs/bmoHkenmiana+zUVrF9qqTWpLX3Ro/b4fjpw90Xqckx6F82N2+AWW4nWWnRyTJLdXVkWGfXWCGWw39cXjseWblsvHm78e6VP/CvlrrIu2Rbtago31GS3UH3RSH3RCWFxcgJIbG8gYRiJ2N6idGmSJxU7NwuRYjg2WL7zfdPcb74ZOQ7kqfGu3TPrPCq++4gOzruMSj/fIGKTenCck0uI0q++k8IFrQWlxGOthK3W2mN7xTwLE8d9tfHKmuxfRKwulOStXqjWdLrG3qTGSq0qC1LwrSP1h0dzzUY1Jnfshq2Fkst1kgY1ZU7Ltr/j9XnZF2+p8xzz8437BYUkCYHq/vBGiknvasl5cEzp+LJZtO/2AXTs6T9S0fsv6RYZp101R1iw4QAnbBSkYMMbraTSJ06pzXaHMj6pjTEXvNmQyeYYdcY06yxKrThycXmwDzN3KJNcYYStXe+UCyd5JVo6z36OiCc/cIkEB7+NlQdJJEXHUnRKOiWeO4Yybpgviqo5Q505/VHKfmKaZefBrlLZjk1iYthacl06ndLG3S7KlpjU0ddbIgrBlsuwa0eNSfvYzB4UKqFUMu0cp5TrmyzwYNvEjPIgpmjTC6JsK7bjaUK8k85rKIUyG+4ZprjPSq+fluDYtiM+sWn7xh5PdsPWFqVr1HVBrZ88/ErjwXZZFr1f6gqOUvEHr4ruZwpcU8ndDc04D07u9F5xmHqvzBYTC6KeGOWveVyNezJ8Q4YDVXt3qPNRKWlts9oNwgk1JYHi7DNEdOMTyB6q+vkLOhlwWU7uigfV5Ywp873izWZRqTzIRXy4q1cyTQ/fTgBVe74kO2JboeQCZ45NBQOLUsoFV7XqeFqrha1NR3I7U86DXVdt8bprzDRhufrCLp028200PmU1IszgcavLHa6f57fQO3P6Iur24AbRrS6u21mtPiYXYyttxm2lPHRqDu1u1o88lPCDTOlWGdOhG8V2Ot30Y5Rt2+C13HHG46K3kx7xPc6h9uNneT1wxUPGhtjW9db2gOEA//7Zg7xuWC09l3ysXrSui6cKC9EQkkPEgRL7jyLXJU2uNpfyCJfTpPMo2bqWMm5sKGrnHhdZ96yi/DeeoOpDPwrLifuZp181x0uQT5bl5AuXqHBvD6U0imOnWfe+RvlvLKGq/btIckSL7+QaezOlDG8olE44cxClXHRdQzbZT1sFovKnbc3EtuIkxCd9YauyR7+RlhV2Vx/8nsp2bKTkwVeIZb42ui/cRAXrlgqh5gExuF4yZeh4aj9+tpfnU7B+qd9EYaRjS6EUZTaNXQPVWrEWbjjuDph+7VwxzzcXjwCjF5cKVB6kULJlpTieWedR/MErImvOF71S69bSCDec1S167yWygkDlMkpvkIP3jfUSB3a5uea06fxb6DbqcYvRdForkkqcst1lM5q9F4rv2xLcc4jjle3H/ZmsIueFuyiuSy/1emEXvOOfmgrL9Sj5ZA0Vb1lFdsWWrje7rdonJdextQRbbBy/UkhtQ6kQx3jy1z9l6nlwLDR78ZSWRyXSBOOzF0813Hc7FHD44PCiSVT+zfuB160spWPP3kaVP2w1IU7Z1JYsulU/h0f8jTPgisdhBdyGhx+aQOVf/89Q7DR/3VLKeSF8SspOBra0KF2jbgiqdwJnCnnAgMT+DYXDKUPGUZ6B8SG5Kx6PB+mpKhelO+XbN1LxR6tU98Ws82BXvi4/W/TZTRk+UXRTY+tMxJ5kj3CnuEyo4tstVPLharVGM5zgTP3RpTeR8+zhYlg5TrJEp2aQ7HGL8hnu9lm2/W0x+etyF9zxSkVoguNwSldCT3U5hQMcP877z0IxDJpV8DVz9KkZwivhqgsedi6mfUdRouWpKBGWLfe3L+bxKAuOkd2RDPx9I08OWZbF3c39hAEA4FSHq0QYSZJ4sAF2L2TN5IUtXW8AAAgGCCUAAAQAQgkAAAGAUAIAQAAglAAAYJJQNssCAQBAhBBQ32BRAgBAG4VSt6YIAAAijBa1zrBFKUlSnLZIEwAAIqDY3NBYdsG43rAsAQCRhiFdQzIHAGB35LYIZbONJUkSI8LC/QYARIDbHW9UNI2MHqRsiMQOACCS0A6CIZsZo5RhVQIAIsSaNGz8GSkP0hNLMdosXHAAwCkokgl+RLLN5UG+Jqq6Q4glACDc8dEpv3rWFqHUU12PNhAKsQQAhCtafWrULWWQXi1ya0c411vPa9TzxkmSZblSWREjoAMAwlAgnYqR52c0c1OEUruuViglPbFUgGgCAEKJnnfrI5LaV0MiKfbRSqEkH7HUCmZFEPsEAABLkCQpUUcYtW63JUKpXd+fdek1ybIcHn9rBwCwBZIkJflJ1vizIg2VBwUrlNpt9OKWvpP2cwAAsApfEfQ3kc5rQForYNrt9ETRn0hCMAEAZiIbEEvfz3y3C0hbhEtPAI0KJAQTANAWWirvCWQ9Bj0SmhmCJRkUTyuODQCwH3KA9/2JYquHijRTrIxYjRBHAICZ6IlfUMXkRrBCuFraJ4QSAGAmcigGG7dauCCMAIBQgn9iAAAAAAAAFH78HxD5KP4vcw1ZAAAAAElFTkSuQmCC", "ABASTECIMENTO_inactive": "data:image/png;base64,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"};

    const generateExcelBlob = async (fileObj) => {
      let minDate = null;
      let maxDate = null;

      fileObj.rows.forEach(row => {
        let dateStr = row['DATA DO DIA'] || row['DATA'] || row['DATA E HORA INÍCIO EXECUÇÃO'];
        if (dateStr && typeof dateStr === 'string') {
          dateStr = dateStr.split(' ')[0];
          let d = null;
          if (dateStr.includes('/')) {
            const p = dateStr.split('/');
            if (p.length === 3) d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
          } else if (dateStr.includes('-')) {
            const p = dateStr.split('-');
            if (p.length === 3) d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
          }

          if (d && !isNaN(d.getTime())) {
            if (!minDate || d < minDate) minDate = d;
            if (!maxDate || d > maxDate) maxDate = d;
          }
        }
      });

      const formatDt = (d) => {
        if (!d) return '';
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      };

      let dateRangeStr = '';
      if (minDate && maxDate) {
        const minStr = formatDt(minDate);
        const maxStr = formatDt(maxDate);
        dateRangeStr = minStr === maxStr ? minStr : `${minStr} a ${maxStr}`;
      }

      let baseName = fileObj.originalFileName ? fileObj.originalFileName.replace(/\.csv$/i, '') : 'Relatorio';
      baseName = baseName.replace(/\s*\(\d+\)$/, '');
      const regexPesquisa = /^pesquisa[_\-\s]*/i;
      let cleanName = baseName;
      if (regexPesquisa.test(baseName)) {
        cleanName = baseName.replace(regexPesquisa, '');
      }

      const finalFileName = dateRangeStr 
        ? `RELATÓRIO ${cleanName.toUpperCase().replace(/_/g, ' ')} - ${dateRangeStr.replace(/\//g, '.')}.xlsx`
        : `RELATÓRIO ${cleanName.toUpperCase().replace(/_/g, ' ')}.xlsx`;

      const wb = new ExcelJS.Workbook();

      let logoImgId = null;
      if (OBJETIVA_LOGO_BASE64) {
        logoImgId = wb.addImage({
          base64: OBJETIVA_LOGO_BASE64,
          extension: 'png'
        });
      }

      // Adicionar imagens dos botões flutuantes ao workbook
      const buttonImageIds = {};
      for (const [key, b64Str] of Object.entries(BUTTON_IMAGES_B64)) {
        buttonImageIds[key] = wb.addImage({
          base64: b64Str,
          extension: 'png'
        });
      }

      // Cores oficiais
      const HEADER_COLOR = 'FFE26B0A';          // Laranja vibrante do cabeçalho (#E26B0A)
      const COL_A_BG = 'FFD9D9D9';              // Coluna A: Cinza Claro Limpo (#D9D9D9)
      const COL_B_BG = 'FFE26B0A';              // Coluna B: Laranja (#E26B0A)
      const COL_C_BG = 'FF595959';              // Coluna C: Cinza Escuro (#595959)
      
      const HEADER_FONT = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      const DATA_FONT = { name: "Calibri", size: 11, color: { argb: "FF000000" } };
      const ORANGE_BORDER = {
        top: { style: 'thin', color: { argb: "FFE26B0A" } },
        right: { style: 'thin', color: { argb: "FFE26B0A" } },
        bottom: { style: 'thin', color: { argb: "FFE26B0A" } },
        left: { style: 'thin', color: { argb: "FFE26B0A" } }
      };

      const parseDateVal = (val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        const str = String(val).trim().split(' ')[0];
        const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (matchIso) return new Date(Number(matchIso[1]), Number(matchIso[2]) - 1, Number(matchIso[3]));
        return null;
      };

      const parsePrice = (val) => {
        if (val === null || val === undefined || val === '') return null;
        if (typeof val === 'number') return val;
        let str = String(val).trim().replace(/^R\$\s*/i, '');
        if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(str);
        return isNaN(num) ? null : num;
      };

      // Renderizador do Painel Lateral LIMPO
      const addSidebarToSheet = (ws, activeSheetName, maxRows) => {
        const totalRows = Math.max(maxRows + 5, 45);
        for (let r = 1; r <= totalRows; r++) {
          const cellA = ws.getCell(r, 1);
          cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_A_BG } };
          cellA.border = {};
          cellA.value = null;

          const cellB = ws.getCell(r, 2);
          cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_B_BG } };
          cellB.border = {};
          cellB.value = null;

          const cellC = ws.getCell(r, 3);
          cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_C_BG } };
          cellC.border = {};
          cellC.value = null;
        }

        ws.getColumn(1).width = 48.71;
        ws.getColumn(2).width = 3.71;
        ws.getColumn(3).width = 3.71;

        // Logo Objetiva - dimensões exatas: 7,67 cm (290px) x 3,84 cm (145px)
        if (logoImgId !== null) {
          ws.addImage(logoImgId, {
            tl: { col: 0.08, row: 0.2 },
            ext: { width: 290, height: 145 }
          });
        }
      };

      const activeRows = getFilteredRows(fileObj);

      // Identificar quais abas possuem dados reais
      const hasPrices = activeRows.some(row => {
        const p = parsePrice(getRowVal(row, PRECO_KEYS));
        return p !== null && p > 0;
      });

      const validRupturaRows = activeRows.filter(row => {
        const pdvVal = getRowVal(row, PDV_KEYS);
        const produtoVal = getRowVal(row, PRODUTO_KEYS);
        if (!pdvVal || !produtoVal) return false;

        const rupTotalStr = String(row['RUPTURA TOTAL?'] || row['RUPTURA TOTAL'] || getRowVal(row, ['RUPTURA TOTAL?', 'RUPTURA TOTAL']) || '').toUpperCase();
        const isRupTotal = rupTotalStr.includes('SIM');

        const prodRupStr = String(row['PRODUTO EM RUPTURA?'] || row['PRODUTO EM RUPTURA'] || getRowVal(row, ['PRODUTO EM RUPTURA?', 'PRODUTO EM RUPTURA']) || '').toUpperCase();
        const isRupProd = prodRupStr.includes('SIM');

        const tipoRupStr = String(row['TIPO DE RUPTURA'] || getRowVal(row, ['TIPO DE RUPTURA']) || '').toUpperCase();
        const isTipoRup = tipoRupStr !== '' && !tipoRupStr.includes('NAO') && !tipoRupStr.includes('NÃO');

        if (normalizeHeader(produtoVal) === 'PADRAO') return isRupTotal;
        return isRupTotal || isRupProd || isTipoRup;
      });
      const hasRuptura = validRupturaRows.length > 0;

      const validValidadeRows = activeRows.filter(row => {
        const valStr = getRowVal(row, VALIDADE_KEYS);
        return !!valStr;
      });
      const hasValidade = validValidadeRows.length > 0;

      const validAbastecimentoRows = activeRows.filter(row => {
        const caixasVal = getRowVal(row, CAIXAS_KEYS);
        if (caixasVal === null || caixasVal === undefined || String(caixasVal).trim() === '') return false;
        const numCaixas = parseInt(String(caixasVal).replace(',', '.'), 10);
        return !isNaN(numCaixas) && numCaixas > 0;
      });
      const hasAbastecimento = validAbastecimentoRows.length > 0;

      const validPontoExtraRows = activeRows.filter(row => {
        const pontoExtraVal = getRowVal(row, PONTO_EXTRA_KEYS);
        return pontoExtraVal !== null && pontoExtraVal !== undefined && String(pontoExtraVal).trim() !== '';
      });
      const hasPontoExtra = validPontoExtraRows.length > 0;

      const validAvariaRows = activeRows.filter(row => {
        const avariaVal = getRowVal(row, AVARIA_KEYS);
        if (avariaVal === null || avariaVal === undefined || String(avariaVal).trim() === '') return false;
        const foiRetirado = String(getRowVal(row, ['FOI RETIRADO PRODUTO DO PDV PARA AVARIA?', 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA']) || '').trim().toUpperCase();
        if (foiRetirado === 'NÃO' || foiRetirado === 'NAO' || foiRetirado.startsWith('NÃO') || foiRetirado.startsWith('NAO')) return false;
        return true;
      });
      const hasAvaria = validAvariaRows.length > 0;

      const validTecnicoRows = activeRows.filter(row => {
        const tecVal = getRowVal(row, TECNICO_KEYS);
        if (tecVal !== null && tecVal !== undefined && String(tecVal).trim() !== '') return true;
        const secaoVal = String(
          row['SEÇAO'] || row['SEÇÃO'] || row['SECAO'] ||
          row['Atividades Descrição'] || row['ATIVIDADES DESCRICAO'] ||
          row['Atividade Descricao'] || row['ATIVIDADE DESCRICAO'] || ''
        ).toUpperCase();
        return secaoVal.includes('TECNICO') || secaoVal.includes('TÉCNICO');
      });
      const hasTecnico = validTecnicoRows.length > 0;

      // Lista dinâmica de abas ativas
      const activeTabDefs = [];
      if (hasPrices && !hasTecnico) {
        activeTabDefs.push({
          key: 'PRECO',
          sheetName: 'PREÇO',
          buttonLabel: 'PRECO',
          buttonDisplay: 'PREÇO',
          target: "#'PREÇO'!A1"
        });
      }
      if (!hasTecnico && (hasRuptura || activeTabDefs.length === 0)) {
        activeTabDefs.push({
          key: 'RUPTURA',
          sheetName: 'RUPTURA ',
          buttonLabel: 'RUPTURA',
          buttonDisplay: 'RUPTURA',
          target: "#'RUPTURA '!A1"
        });
      }
      if (hasValidade) {
        activeTabDefs.push({
          key: 'VALIDADE',
          sheetName: 'VALIDADE',
          buttonLabel: 'VALIDADE',
          buttonDisplay: 'VALIDADE',
          target: "#'VALIDADE'!A1"
        });
      }
      if (hasAbastecimento) {
        activeTabDefs.push({
          key: 'ABASTECIMENTO',
          sheetName: 'ABASTECIMENTO',
          buttonLabel: 'ABASTECIMENTO',
          buttonDisplay: 'ABASTECIMENTO',
          target: "#'ABASTECIMENTO'!A1"
        });
      }
      if (hasPontoExtra) {
        activeTabDefs.push({
          key: 'PONTO_EXTRA',
          sheetName: 'PONTO EXTRA',
          buttonLabel: 'PONTO_EXTRA',
          buttonDisplay: 'PONTO EXTRA',
          target: "#'PONTO EXTRA'!A1"
        });
      }
      if (hasAvaria) {
        activeTabDefs.push({
          key: 'AVARIA',
          sheetName: 'AVARIA',
          buttonLabel: 'AVARIA',
          buttonDisplay: 'AVARIA',
          target: "#'AVARIA'!A1"
        });
      }
      if (hasTecnico) {
        // Se for Relatório Técnico, a planilha conterá SOMENTE a aba TÉCNICO
        activeTabDefs.length = 0;
        activeTabDefs.push({
          key: 'TECNICO',
          sheetName: 'TÉCNICO',
          buttonLabel: 'TECNICO',
          buttonDisplay: 'TÉCNICO',
          target: "#'TÉCNICO'!A1"
        });
      }

      // ==========================================
      // ABA 1: PREÇO (se houver preços)
      // ==========================================
      if (hasPrices && !hasTecnico) {
        const wsPreco = wb.addWorksheet('PREÇO', { views: [{ showGridLines: true }] });
        wsPreco.getRow(1).height = 24;

        const headersPreco = ['Data', 'Local', 'Produto', 'Preço'];

        const rowHeaderPreco = wsPreco.getRow(1);
        headersPreco.forEach((h, idx) => {
          const cell = rowHeaderPreco.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rPrecoIdx = 2;
        activeRows.forEach(row => {
          const priceNum = parsePrice(getRowVal(row, PRECO_KEYS));
          if (priceNum !== null && priceNum > 0) {
            const rawDate = getRowVal(row, DATA_KEYS);
            const dateVal = parseDateVal(rawDate);
            const pdvVal = getRowVal(row, PDV_KEYS);
            const produtoVal = getRowVal(row, PRODUTO_KEYS);

            const r = wsPreco.getRow(rPrecoIdx++);
            r.getCell(4).value = dateVal || rawDate;
            if (dateVal) r.getCell(4).numFmt = 'dd/mm/yyyy';

            r.getCell(5).value = pdvVal;
            r.getCell(6).value = produtoVal;
            r.getCell(7).value = priceNum;
            r.getCell(7).numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';

            for (let i = 4; i <= 7; i++) {
              r.getCell(i).font = DATA_FONT;
              r.getCell(i).border = ORANGE_BORDER;
              r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
            }
          }
        });

        addSidebarToSheet(wsPreco, 'PREÇO', rPrecoIdx);

        wsPreco.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rPrecoIdx - 1, 1), column: 7 }
        };

        wsPreco.getColumn(4).width = 13;  // Data
        wsPreco.getColumn(5).width = 46;  // Local
        wsPreco.getColumn(6).width = 46;  // Produto
        wsPreco.getColumn(7).width = 13;  // Preço
      }

      // ==========================================
      // ABA 2: RUPTURA (se houver dados)
      // ==========================================
      if (!hasTecnico && (hasRuptura || activeTabDefs.some(t => t.key === 'RUPTURA'))) {
        const wsRuptura = wb.addWorksheet('RUPTURA ', { views: [{ showGridLines: true }] });
        wsRuptura.getRow(1).height = 24;

        const headersRuptura = [
          'Local',
          'Produto',
          'Tipo de Ruptura',
          'Total de Visitas',
          'Visitas Ruptura Total',
          'Visitas Ruptura Parcial',
          'Total Visitas com Ruptura',
          '% Ruptura Total',
          '% Ruptura Parcial',
          '% Ruptura Geral'
        ];
        
        const rowHeaderRuptura = wsRuptura.getRow(1);
        headersRuptura.forEach((h, idx) => {
          const cell = rowHeaderRuptura.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        const mapRuptura = new Map();
        activeRows.forEach(row => {
          const pdvVal = getRowVal(row, PDV_KEYS);
          const produtoVal = getRowVal(row, PRODUTO_KEYS);
          if (!pdvVal || !produtoVal) return;

          const rupTotalStr = String(row['RUPTURA TOTAL?'] || row['RUPTURA TOTAL'] || getRowVal(row, ['RUPTURA TOTAL?', 'RUPTURA TOTAL']) || '').toUpperCase();
          const isRupTotalFlag = rupTotalStr.includes('SIM');
          const isPadrao = normalizeHeader(produtoVal) === 'PADRAO';

          if (isPadrao && !isRupTotalFlag) return;

          const displayProduto = isPadrao ? 'RUPTURA TOTAL DO PDV' : produtoVal;

          const prodRupStr = String(row['PRODUTO EM RUPTURA?'] || row['PRODUTO EM RUPTURA'] || getRowVal(row, ['PRODUTO EM RUPTURA?', 'PRODUTO EM RUPTURA']) || '').toUpperCase();
          const tipoRupStr = String(row['TIPO DE RUPTURA'] || getRowVal(row, ['TIPO DE RUPTURA']) || '').toUpperCase();

          const isRupTotal = isPadrao || isRupTotalFlag || tipoRupStr.includes('TOTAL');
          const isRupParcial = !isRupTotal && (tipoRupStr.includes('PARCIAL'));
          const isRupGeneric = !isRupTotal && !isRupParcial && (prodRupStr.includes('SIM') || (tipoRupStr !== '' && !tipoRupStr.includes('NAO') && !tipoRupStr.includes('NÃO')));

          const key = `${pdvVal}|||${displayProduto}`;

          if (!mapRuptura.has(key)) {
            mapRuptura.set(key, {
              local: pdvVal,
              produto: displayProduto,
              totalVisitas: 0,
              rupturasTotais: 0,
              rupturasParciais: 0
            });
          }
          const item = mapRuptura.get(key);
          item.totalVisitas++;
          if (isRupTotal) {
            item.rupturasTotais++;
          } else if (isRupParcial) {
            item.rupturasParciais++;
          } else if (isRupGeneric) {
            item.rupturasTotais++;
          }
        });

        let rRupIdx = 2;
        mapRuptura.forEach(item => {
          const totalRupturas = item.rupturasTotais + item.rupturasParciais;

          let tipoRupText = 'NENHUMA';
          if (item.rupturasTotais > 0 && item.rupturasParciais > 0) {
            tipoRupText = 'RUPTURA TOTAL / RUPTURA PARCIAL';
          } else if (item.rupturasTotais > 0) {
            tipoRupText = 'RUPTURA TOTAL';
          } else if (item.rupturasParciais > 0) {
            tipoRupText = 'RUPTURA PARCIAL';
          }

          const r = wsRuptura.getRow(rRupIdx++);
          r.getCell(4).value = item.local;
          r.getCell(5).value = item.produto;
          r.getCell(6).value = tipoRupText;
          r.getCell(7).value = item.totalVisitas;
          r.getCell(8).value = item.rupturasTotais;
          r.getCell(9).value = item.rupturasParciais;
          r.getCell(10).value = `${totalRupturas}/${item.totalVisitas}`;

          const pctTotal = item.totalVisitas > 0 ? (item.rupturasTotais / item.totalVisitas) : 0;
          const pctParcial = item.totalVisitas > 0 ? (item.rupturasParciais / item.totalVisitas) : 0;
          const pctGeral = item.totalVisitas > 0 ? (totalRupturas / item.totalVisitas) : 0;

          r.getCell(11).value = pctTotal;
          r.getCell(11).numFmt = '0.0%';

          r.getCell(12).value = pctParcial;
          r.getCell(12).numFmt = '0.0%';

          r.getCell(13).value = pctGeral;
          r.getCell(13).numFmt = '0.0%';

          for (let i = 4; i <= 13; i++) {
            r.getCell(i).font = DATA_FONT;
            r.getCell(i).border = ORANGE_BORDER;
            r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          }

          if (tipoRupText === 'RUPTURA TOTAL') {
            r.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDEDEC' } };
          } else if (tipoRupText === 'RUPTURA PARCIAL') {
            r.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEEFDB' } };
          } else if (tipoRupText === 'RUPTURA TOTAL / RUPTURA PARCIAL') {
            r.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EEF8' } };
          }
        });

        addSidebarToSheet(wsRuptura, 'RUPTURA ', rRupIdx);

        wsRuptura.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rRupIdx - 1, 1), column: 13 }
        };

        wsRuptura.getColumn(4).width = 46;  // Local
        wsRuptura.getColumn(5).width = 46;  // Produto
        wsRuptura.getColumn(6).width = 34;  // Tipo de Ruptura
        wsRuptura.getColumn(7).width = 16;  // Total de Visitas
        wsRuptura.getColumn(8).width = 20;  // Visitas Ruptura Total
        wsRuptura.getColumn(9).width = 20;  // Visitas Ruptura Parcial
        wsRuptura.getColumn(10).width = 24; // Total Visitas com Ruptura
        wsRuptura.getColumn(11).width = 16; // % Ruptura Total
        wsRuptura.getColumn(12).width = 16; // % Ruptura Parcial
        wsRuptura.getColumn(13).width = 16; // % Ruptura Geral
      }

      // ==========================================
      // ABA 3: VALIDADE (se houver dados)
      // ==========================================
      if (hasValidade && !hasTecnico) {
        const wsValidade = wb.addWorksheet('VALIDADE', { views: [{ showGridLines: true }] });
        wsValidade.getRow(1).height = 24;

        const headersValidade = ['Data', 'Validade', 'Quantidade', 'Local', 'Produto', 'Agente', 'Dias Restantes'];
        
        const rowHeaderVal = wsValidade.getRow(1);
        headersValidade.forEach((h, idx) => {
          const cell = rowHeaderVal.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rValIdx = 2;
        activeRows.forEach(row => {
          const rawDateExec = getRowVal(row, DATA_KEYS);
          const dateExec = parseDateVal(rawDateExec);
          const pdvVal = getRowVal(row, PDV_KEYS);
          const produtoVal = getRowVal(row, PRODUTO_KEYS);
          const agenteVal = getRowVal(row, PROMOTOR_KEYS);

          const lotesDef = [
            {
              valKey: ['INFORME A VALIDADE', 'VALIDADE', 'DATA DE VALIDADE', 'INFORME_A_VALIDADE'],
              qtdKey: ['QUAL A QUANTIDADE EM UNIDADES?', 'QUANTIDADE', 'QUANTIDADE (UN)', 'QTD UNIDADES', 'QUAL_A_QUANTIDADE_EM_UNIDADES'],
              diasKey: ['DIAS PARA O VENCIMENTO', 'DIAS_PARA_O_VENCIMENTO', 'DIAS RESTANTES']
            },
            {
              valKey: ['(2) INFORME A VALIDADE', '_2_INFORME_A_VALIDADE', '(2) VALIDADE'],
              qtdKey: ['(2) QUAL A QUANTIDADE EM UNIDADES?', '(2) QUAL A QUANTIDADE EM UNIDADES', '_2_QUAL_A_QUANTIDADE_EM_UNIDADES'],
              diasKey: ['(2) DIAS PARA O VENCIMENTO', '_2_DIAS_PARA_O_VENCIMENTO']
            },
            {
              valKey: ['(3) INFORME A VALIDADE', '_3_INFORME_A_VALIDADE', '(3) VALIDADE'],
              qtdKey: ['(3) QUAL A QUANTIDADE EM UNIDADES?', '(3) QUAL A QUANTIDADE EM UNIDADES', '_3_QUAL_A_QUANTIDADE_EM_UNIDADES'],
              diasKey: ['(3) DIAS PARA O VENCIMENTO', '_3_DIAS_PARA_O_VENCIMENTO']
            }
          ];

          lotesDef.forEach(lote => {
            const valStr = getRowVal(row, lote.valKey);
            if (valStr) {
              const dateVal = parseDateVal(valStr);
              const qtdVal = parseInt(getRowVal(row, lote.qtdKey) || '0', 10) || 0;

              let diasRestantes = null;
              if (dateExec && dateVal) {
                const diffMs = dateVal.getTime() - dateExec.getTime();
                diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              } else {
                diasRestantes = parseInt(getRowVal(row, lote.diasKey) || '0', 10) || 0;
              }

              const r = wsValidade.getRow(rValIdx++);
              r.getCell(4).value = dateExec || rawDateExec;
              if (dateExec) r.getCell(4).numFmt = 'dd/mm/yyyy';

              r.getCell(5).value = dateVal || valStr;
              if (dateVal) r.getCell(5).numFmt = 'dd/mm/yyyy';

              r.getCell(6).value = qtdVal;
              r.getCell(7).value = pdvVal;
              r.getCell(8).value = produtoVal;
              r.getCell(9).value = agenteVal;
              r.getCell(10).value = diasRestantes;

              for (let i = 4; i <= 10; i++) {
                r.getCell(i).font = DATA_FONT;
                r.getCell(i).border = ORANGE_BORDER;
                r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
              }
            }
          });
        });

        addSidebarToSheet(wsValidade, 'VALIDADE', rValIdx);

        wsValidade.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rValIdx - 1, 1), column: 10 }
        };

        wsValidade.getColumn(4).width = 13;  // Data
        wsValidade.getColumn(5).width = 14;  // Validade
        wsValidade.getColumn(6).width = 15;  // Quantidade
        wsValidade.getColumn(7).width = 40;  // Local
        wsValidade.getColumn(8).width = 46;  // Produto
        wsValidade.getColumn(9).width = 32;  // Agente
        wsValidade.getColumn(10).width = 18; // Dias Restantes
      }

      // ==========================================
      // ABA 4: ABASTECIMENTO (se houver dados)
      // ==========================================
      if (hasAbastecimento && !hasTecnico) {
        const wsAbastecimento = wb.addWorksheet('ABASTECIMENTO', { views: [{ showGridLines: true }] });
        wsAbastecimento.getRow(1).height = 24;

        const headersAbastecimento = ['DATA', 'PDV', 'PROMOTOR', 'QUANTAS CAIXAS FORAM ABASTECIDAS?'];
        const rowHeaderAbastecimento = wsAbastecimento.getRow(1);
        headersAbastecimento.forEach((h, idx) => {
          const cell = rowHeaderAbastecimento.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rAbastIdx = 2;
        activeRows.forEach(row => {
          const rawDate = getRowVal(row, DATA_KEYS);
          const dateVal = parseDateVal(rawDate);
          const pdvVal = getRowVal(row, PDV_KEYS);
          const promotorVal = getRowVal(row, PROMOTOR_KEYS);
          const caixasVal = getRowVal(row, CAIXAS_KEYS);

          if (caixasVal === null || caixasVal === undefined || String(caixasVal).trim() === '') return;

          const numCaixas = parseInt(String(caixasVal).replace(',', '.'), 10);
          if (isNaN(numCaixas) || numCaixas <= 0) return;

          const r = wsAbastecimento.getRow(rAbastIdx++);
          r.getCell(4).value = dateVal || rawDate;
          if (dateVal) r.getCell(4).numFmt = 'dd/mm/yyyy';

          r.getCell(5).value = pdvVal;
          r.getCell(6).value = promotorVal;
          r.getCell(7).value = numCaixas;

          for (let i = 4; i <= 7; i++) {
            r.getCell(i).font = DATA_FONT;
            r.getCell(i).border = ORANGE_BORDER;
            r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });

        addSidebarToSheet(wsAbastecimento, 'ABASTECIMENTO', rAbastIdx);

        wsAbastecimento.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rAbastIdx - 1, 1), column: 7 }
        };

        wsAbastecimento.getColumn(4).width = 14;  // DATA
        wsAbastecimento.getColumn(5).width = 46;  // PDV
        wsAbastecimento.getColumn(6).width = 32;  // PROMOTOR
        wsAbastecimento.getColumn(7).width = 36;  // QUANTAS CAIXAS FORAM ABASTECIDAS?
      }

      // ==========================================
      // ABA 5: PONTO EXTRA (se houver dados)
      // ==========================================
      if (hasPontoExtra && !hasTecnico) {
        const wsPontoExtra = wb.addWorksheet('PONTO EXTRA', { views: [{ showGridLines: true }] });
        wsPontoExtra.getRow(1).height = 24;

        const headersPontoExtra = ['DATA', 'PDV', 'PROMOTOR', 'TEM PONTO EXTRA?'];
        const rowHeaderPontoExtra = wsPontoExtra.getRow(1);
        headersPontoExtra.forEach((h, idx) => {
          const cell = rowHeaderPontoExtra.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rPontoExtraIdx = 2;
        activeRows.forEach(row => {
          const rawDate = getRowVal(row, DATA_KEYS);
          const dateVal = parseDateVal(rawDate);
          const pdvVal = getRowVal(row, PDV_KEYS);
          const promotorVal = getRowVal(row, PROMOTOR_KEYS);
          const pontoExtraVal = getRowVal(row, PONTO_EXTRA_KEYS);

          if (pontoExtraVal === null || pontoExtraVal === undefined || String(pontoExtraVal).trim() === '') return;

          const r = wsPontoExtra.getRow(rPontoExtraIdx++);
          r.getCell(4).value = dateVal || rawDate;
          if (dateVal) r.getCell(4).numFmt = 'dd/mm/yyyy';

          r.getCell(5).value = pdvVal;
          r.getCell(6).value = promotorVal;
          r.getCell(7).value = pontoExtraVal;

          for (let i = 4; i <= 7; i++) {
            r.getCell(i).font = DATA_FONT;
            r.getCell(i).border = ORANGE_BORDER;
            r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });

        addSidebarToSheet(wsPontoExtra, 'PONTO EXTRA', rPontoExtraIdx);

        wsPontoExtra.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rPontoExtraIdx - 1, 1), column: 7 }
        };

        wsPontoExtra.getColumn(4).width = 14;  // DATA
        wsPontoExtra.getColumn(5).width = 46;  // PDV
        wsPontoExtra.getColumn(6).width = 32;  // PROMOTOR
        wsPontoExtra.getColumn(7).width = 24;  // TEM PONTO EXTRA?
      }

      // ==========================================
      // ABA 6: AVARIA (se houver dados)
      // ==========================================
      if (hasAvaria && !hasTecnico) {
        const wsAvaria = wb.addWorksheet('AVARIA', { views: [{ showGridLines: true }] });
        wsAvaria.getRow(1).height = 24;

        const headersAvaria = [
          'DATA E HORA INICIO EXECUCAO',
          'PDV',
          'PROMOTOR',
          'SKU',
          'FOI RETIRADO PRODUTO DO PDV PARA AVARIA?',
          'QUAL MOTIVO DA AVARIA?',
          'CITE O PESO DO PRODUTO',
          'FOTO DO PRODUTO NA BALANÇA',
          'CITE O LOTE DO PRODUTO',
          'COLOQUE O VALOR DA NOTA',
          'FOTO DA MESA'
        ];
        const rowHeaderAvaria = wsAvaria.getRow(1);
        headersAvaria.forEach((h, idx) => {
          const cell = rowHeaderAvaria.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rAvariaIdx = 2;
        activeRows.forEach(row => {
          const avariaVal = getRowVal(row, AVARIA_KEYS);
          if (avariaVal === null || avariaVal === undefined || String(avariaVal).trim() === '') return;

          const foiRetirado = getRowVal(row, ['FOI RETIRADO PRODUTO DO PDV PARA AVARIA?', 'FOI RETIRADO PRODUTO DO PDV PARA AVARIA']);
          const foiRetiradoNorm = String(foiRetirado || '').trim().toUpperCase();
          if (foiRetiradoNorm === 'NÃO' || foiRetiradoNorm === 'NAO' || foiRetiradoNorm.startsWith('NÃO') || foiRetiradoNorm.startsWith('NAO')) {
            return;
          }

          const rawDate = getRowVal(row, DATA_KEYS);
          const dateVal = parseDateVal(rawDate);
          const pdvVal = getRowVal(row, PDV_KEYS);
          const promotorVal = getRowVal(row, PROMOTOR_KEYS);
          const skuVal = getRowVal(row, PRODUTO_KEYS);

          const motivoAvaria = getRowVal(row, ['QUAL MOTIVO DA AVARIA?', 'QUAL MOTIVO DA AVARIA', 'MOTIVO DA AVARIA', 'MOTIVO AVARIA']);
          const pesoProduto = getRowVal(row, ['CITE O PESO DO PRODUTO', 'PESO DO PRODUTO', 'PESO']);
          const fotoBalanca = getRowVal(row, ['FOTO DO PRODUTO NA BALANÇA', 'FOTO DO PRODUTO NA BALANCA', 'FOTO BALANCA', 'FOTO BALANÇA']);
          const loteProduto = getRowVal(row, ['CITE O LOTE DO PRODUTO', 'LOTE DO PRODUTO', 'LOTE']);
          const valorNota = getRowVal(row, ['COLOQUE O VALOR DA NOTA', 'VALOR DA NOTA', 'VALOR DA NOTA FISCAL']);
          const fotoMesa = getRowVal(row, ['FOTO DA MESA']);

          const r = wsAvaria.getRow(rAvariaIdx++);
          r.getCell(4).value = dateVal || rawDate;
          if (dateVal) r.getCell(4).numFmt = 'dd/mm/yyyy hh:mm';

          r.getCell(5).value = pdvVal;
          r.getCell(6).value = promotorVal;
          r.getCell(7).value = skuVal;
          r.getCell(8).value = foiRetirado;
          r.getCell(9).value = motivoAvaria;
          r.getCell(10).value = pesoProduto;
          r.getCell(11).value = fotoBalanca;
          r.getCell(12).value = loteProduto;
          r.getCell(13).value = valorNota;
          r.getCell(14).value = fotoMesa;

          for (let i = 4; i <= 14; i++) {
            r.getCell(i).font = DATA_FONT;
            r.getCell(i).border = ORANGE_BORDER;
            r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });

        addSidebarToSheet(wsAvaria, 'AVARIA', rAvariaIdx);

        wsAvaria.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rAvariaIdx - 1, 1), column: 14 }
        };

        wsAvaria.getColumn(4).width = 24;  // DATA E HORA INICIO EXECUCAO
        wsAvaria.getColumn(5).width = 46;  // PDV
        wsAvaria.getColumn(6).width = 32;  // PROMOTOR
        wsAvaria.getColumn(7).width = 35;  // SKU
        wsAvaria.getColumn(8).width = 35;  // FOI RETIRADO...
        wsAvaria.getColumn(9).width = 30;  // QUAL MOTIVO...
        wsAvaria.getColumn(10).width = 22; // PESO
        wsAvaria.getColumn(11).width = 30; // FOTO BALANÇA
        wsAvaria.getColumn(12).width = 22; // LOTE
        wsAvaria.getColumn(13).width = 22; // VALOR NOTA
        wsAvaria.getColumn(14).width = 30; // FOTO MESA
      }

      // ==========================================
      // ABA 7: TÉCNICO (se for relatório técnico)
      // ==========================================
      if (hasTecnico) {
        const wsTecnico = wb.addWorksheet('TÉCNICO', { views: [{ showGridLines: true }] });
        wsTecnico.getRow(1).height = 24;

        const headersTecnico = [
          'DATA E HORA INICIO EXECUCAO',
          'PDV',
          'PROMOTOR',
          'SEÇAO',
          'VISITOU O ALMOXARIFADO?',
          'OBSERVAÇÃO ALMOXARIFADO',
          'VISITOU A COZINHA?',
          'OBSERVAÇÃO COZINHA',
          'VISITOU O AÇOUGUE?',
          'OBSERVAÇÃO AÇOUGUE',
          'VISITOU O SALGADO?',
          'OBSERVAÇÃO SALGADO',
          'VISITOU O LATICÍNIOS?',
          'OBSERVAÇÃO LATICÍNIOS',
          'VISITOU O FLV?',
          'OBSERVAÇÃO FLV',
          'VISITOU A LIXEIRA?',
          'OBSERVAÇÃO LIXEIRA',
          'RELATÓRIO ASSINADO PELO GERENTE?',
          'FOTO DA ASSINATURA DO GERENTE',
          'NOME DO GERENTE',
          'OBSERVAÇÕES SOBRE A LOJA'
        ];

        const rowHeaderTecnico = wsTecnico.getRow(1);
        headersTecnico.forEach((h, idx) => {
          const cell = rowHeaderTecnico.getCell(idx + 4);
          cell.value = h;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
          cell.font = HEADER_FONT;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let rTecnicoIdx = 2;
        activeRows.forEach(row => {
          const rawDate = getRowVal(row, ['DATA E HORA INICIO EXECUCAO', 'DATA E HORA INÍCIO EXECUÇÃO', 'DATA HORA DA TAREFA', ...DATA_KEYS]);
          const dateVal = parseDateVal(rawDate);
          const pdvVal = getRowVal(row, PDV_KEYS);
          const promotorVal = getRowVal(row, ['PROMOTOR', 'NOME PROMOTOR', ...PROMOTOR_KEYS]);
          const secaoVal = getRowVal(row, ['SEÇAO', 'SEÇÃO', 'SECAO']);

          const visitouAlmoxarifado = getRowVal(row, ['VISITOU O ALMOXARIFADO?', 'VISITOU ALMOXARIFADO?']);
          const obsAlmoxarifado = getRowVal(row, ['OBSERVAÇÃO ALMOXARIFADO', 'OBSERVAÇÃO ALMOXARIFADO?', 'OBSERVACOES ALMOXARIFADO']);

          const visitouCozinha = getRowVal(row, ['VISITOU A COZINHA?', 'VISITOU COZINHA?']);
          const obsCozinha = getRowVal(row, ['OBSERVAÇÃO COZINHA', 'OBSERVACOES COZINHA']);

          const visitouAcougue = getRowVal(row, ['VISITOU O AÇOUGUE?', 'VISITOU ACOUGUE?']);
          const obsAcougue = getRowVal(row, ['OBSERVAÇÃO AÇOUGUE', 'OBSERVACOES ACOUGUE']);

          const visitouSalgado = getRowVal(row, ['VISITOU O SALGADO?', 'VISITOU SALGADO?']);
          const obsSalgado = getRowVal(row, ['OBSERVAÇÃO SALGADO', 'OBSERVACOES SALGADO']);

          const visitouLaticinios = getRowVal(row, ['VISITOU O LATICÍNIOS?', 'VISITOU LATICINIOS?']);
          const obsLaticinios = getRowVal(row, ['OBSERVAÇÃO LATICÍNIOS', 'OBSERVACOES LATICINIOS']);

          const visitouFlv = getRowVal(row, ['VISITOU O FLV?', 'VISITOU FLV?']);
          const obsFlv = getRowVal(row, ['OBSERVAÇÃO FLV', 'OBSERVACOES FLV']);

          const visitouLixeira = getRowVal(row, ['VISITOU A LIXEIRA?', 'VISITOU LIXEIRA?']);
          const obsLixeira = getRowVal(row, ['OBSERVAÇÃO LIXEIRA', 'OBSERVACOES LIXEIRA']);

          const relatorioAssinado = getRowVal(row, ['RELATÓRIO ASSINADO PELO GERENTE?', 'RELATORIO ASSINADO PELO GERENTE?']);
          const fotoAssinatura = getRowVal(row, ['FOTO DA ASSINATURA DO GERENTE', 'FOTO ASSINATURA DO GERENTE']);
          const nomeGerente = getRowVal(row, ['NOME DO GERENTE']);
          const obsLoja = getRowVal(row, ['OBSERVAÇÕES SOBRE A LOJA', 'OBSERVACOES SOBRE A LOJA']);

          const r = wsTecnico.getRow(rTecnicoIdx++);
          r.getCell(4).value = dateVal || rawDate;
          if (dateVal) r.getCell(4).numFmt = 'dd/mm/yyyy hh:mm';

          r.getCell(5).value = pdvVal;
          r.getCell(6).value = promotorVal;
          r.getCell(7).value = secaoVal;
          r.getCell(8).value = visitouAlmoxarifado;
          r.getCell(9).value = obsAlmoxarifado;
          r.getCell(10).value = visitouCozinha;
          r.getCell(11).value = obsCozinha;
          r.getCell(12).value = visitouAcougue;
          r.getCell(13).value = obsAcougue;
          r.getCell(14).value = visitouSalgado;
          r.getCell(15).value = obsSalgado;
          r.getCell(16).value = visitouLaticinios;
          r.getCell(17).value = obsLaticinios;
          r.getCell(18).value = visitouFlv;
          r.getCell(19).value = obsFlv;
          r.getCell(20).value = visitouLixeira;
          r.getCell(21).value = obsLixeira;
          r.getCell(22).value = relatorioAssinado;
          r.getCell(23).value = fotoAssinatura;
          r.getCell(24).value = nomeGerente;
          r.getCell(25).value = obsLoja;

          for (let i = 4; i <= 25; i++) {
            r.getCell(i).font = DATA_FONT;
            r.getCell(i).border = ORANGE_BORDER;
            r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });

        addSidebarToSheet(wsTecnico, 'TÉCNICO', rTecnicoIdx);

        wsTecnico.autoFilter = {
          from: { row: 1, column: 4 },
          to: { row: Math.max(rTecnicoIdx - 1, 1), column: 25 }
        };

        wsTecnico.getColumn(4).width = 24;  // DATA E HORA INICIO EXECUCAO
        wsTecnico.getColumn(5).width = 46;  // PDV
        wsTecnico.getColumn(6).width = 32;  // PROMOTOR
        wsTecnico.getColumn(7).width = 24;  // SEÇAO
        wsTecnico.getColumn(8).width = 26;  // VISITOU O ALMOXARIFADO?
        wsTecnico.getColumn(9).width = 30;  // OBSERVAÇÃO ALMOXARIFADO
        wsTecnico.getColumn(10).width = 24; // VISITOU A COZINHA?
        wsTecnico.getColumn(11).width = 30; // OBSERVAÇÃO COZINHA
        wsTecnico.getColumn(12).width = 24; // VISITOU O AÇOUGUE?
        wsTecnico.getColumn(13).width = 30; // OBSERVAÇÃO AÇOUGUE
        wsTecnico.getColumn(14).width = 24; // VISITOU O SALGADO?
        wsTecnico.getColumn(15).width = 30; // OBSERVAÇÃO SALGADO
        wsTecnico.getColumn(16).width = 24; // VISITOU O LATICÍNIOS?
        wsTecnico.getColumn(17).width = 30; // OBSERVAÇÃO LATICÍNIOS
        wsTecnico.getColumn(18).width = 20; // VISITOU O FLV?
        wsTecnico.getColumn(19).width = 30; // OBSERVAÇÃO FLV
        wsTecnico.getColumn(20).width = 22; // VISITOU A LIXEIRA?
        wsTecnico.getColumn(21).width = 30; // OBSERVAÇÃO LIXEIRA
        wsTecnico.getColumn(22).width = 32; // RELATÓRIO ASSINADO PELO GERENTE?
        wsTecnico.getColumn(23).width = 32; // FOTO DA ASSINATURA DO GERENTE
        wsTecnico.getColumn(24).width = 26; // NOME DO GERENTE
        wsTecnico.getColumn(25).width = 35; // OBSERVAÇÕES SOBRE A LOJA
      }

      const buffer = await wb.xlsx.writeBuffer();
      
      // POS-PROCESSAMENTO: Injetar botoes nativos OpenXML dinâmicos com hiperlinks reais
      if (typeof JSZip !== 'undefined') {
        const zip = await JSZip.loadAsync(buffer);

        const sheetsConfig = activeTabDefs.map((tab, idx) => ({
          drawingIdx: idx + 1,
          activeIdx: idx
        }));

        const buttonDefs = activeTabDefs.map(tab => ({
          label: tab.buttonLabel,
          labelDisplay: tab.buttonDisplay,
          target: tab.target
        }));

        const BTN_X_OFF = 67236;
        const BTN_WIDTH  = 3349086;
        const BTN_HEIGHT = 762001;

        function generateButtonsForSheet(activeIdx, existingMaxRelId) {
          let relId = existingMaxRelId + 1;
          const rels   = [];
          const shapes = [];

          buttonDefs.forEach((btn, i) => {
            const isActive   = (i === activeIdx);
            const fillColor  = isActive ? "E26B0A" : "FFFFFF";
            const textColor  = isActive ? "FFFFFF" : "000000";
            const shapeId    = 200 + i;
            const rId        = "rIdNativeBtn" + (relId);

            const fromRow    = 11 + (i * 5) - 1;  // linhas 10,15,20,25 (0-based)
            const toRow      = fromRow + 4;

            rels.push('<Relationship Id="' + rId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + btn.target + '"/>');

            shapes.push(
              '<xdr:twoCellAnchor editAs="oneCell">' +
              '<xdr:from><xdr:col>0</xdr:col><xdr:colOff>' + BTN_X_OFF + '</xdr:colOff><xdr:row>' + fromRow + '</xdr:row><xdr:rowOff>145676</xdr:rowOff></xdr:from>' +
              '<xdr:to><xdr:col>1</xdr:col><xdr:colOff>235324</xdr:colOff><xdr:row>' + toRow + '</xdr:row><xdr:rowOff>145677</xdr:rowOff></xdr:to>' +
              '<xdr:sp macro="" textlink="">' +
                '<xdr:nvSpPr>' +
                  '<xdr:cNvPr id="' + shapeId + '" name="ShapeBtn_' + btn.label + '">' +
                    '<a:hlinkClick xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="' + rId + '"/>' +
                  '</xdr:cNvPr>' +
                  '<xdr:cNvSpPr/>' +
                '</xdr:nvSpPr>' +
                '<xdr:spPr>' +
                  '<a:xfrm><a:off x="' + BTN_X_OFF + '" y="0"/><a:ext cx="' + BTN_WIDTH + '" cy="' + BTN_HEIGHT + '"/></a:xfrm>' +
                  '<a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>' +
                  '<a:solidFill><a:srgbClr val="' + fillColor + '"/></a:solidFill>' +
                  '<a:ln w="25400"><a:solidFill><a:srgbClr val="CCCCCC"/></a:solidFill></a:ln>' +
                  '<a:effectLst><a:outerShdw blurRad="63500" dist="12700" dir="5400000" algn="ctr"><a:srgbClr val="000000"><a:alpha val="25000"/></a:srgbClr></a:outerShdw></a:effectLst>' +
                '</xdr:spPr>' +
                '<xdr:style>' +
                  '<a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef>' +
                  '<a:fillRef idx="1"><a:schemeClr val="lt1"/></a:fillRef>' +
                  '<a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>' +
                  '<a:fontRef idx="minor"><a:schemeClr val="dk1"/></a:fontRef>' +
                '</xdr:style>' +
                '<xdr:txBody>' +
                  '<a:bodyPr vertOverflow="clip" horzOverflow="clip" rtlCol="0" anchor="ctr"/>' +
                  '<a:lstStyle/>' +
                  '<a:p><a:pPr algn="ctr"/><a:r>' +
                    '<a:rPr lang="pt-BR" sz="1400" b="1"><a:solidFill><a:srgbClr val="' + textColor + '"/></a:solidFill></a:rPr>' +
                    '<a:t>' + btn.labelDisplay + '</a:t>' +
                  '</a:r></a:p>' +
                '</xdr:txBody>' +
              '</xdr:sp>' +
              '<xdr:clientData/></xdr:twoCellAnchor>'
            );

            relId++;
          });

          return { rels, shapes };
        }

        for (const cfg of sheetsConfig) {
          const drawingFile = 'xl/drawings/drawing' + cfg.drawingIdx + '.xml';
          const relsFile    = 'xl/drawings/_rels/drawing' + cfg.drawingIdx + '.xml.rels';

          if (!zip.files[drawingFile]) continue;

          let drawingXml = await zip.files[drawingFile].async('string');
          let relsXml = zip.files[relsFile]
            ? await zip.files[relsFile].async('string')
            : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

          const relMatches = [...relsXml.matchAll(/Id="rId(\d+)"/g)];
          let maxRelId = 10;
          for (const m of relMatches) {
            const n = parseInt(m[1]);
            if (!isNaN(n) && n > maxRelId) maxRelId = n;
          }

          const { rels, shapes } = generateButtonsForSheet(cfg.activeIdx, maxRelId);

          for (const rel of rels) {
            relsXml = relsXml.replace('</Relationships>', '  ' + rel + '\n</Relationships>');
          }

          for (const shape of shapes) {
            drawingXml = drawingXml.replace('</xdr:wsDr>', shape + '\n</xdr:wsDr>');
          }

          zip.file(drawingFile, drawingXml);
          zip.file(relsFile, relsXml);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return { blob: zipBlob, fileName: finalFileName };
      }

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return { blob, fileName: finalFileName };
    };

    if (state.files.length === 1) {
      const { blob, fileName } = await generateExcelBlob(state.files[0]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      for (const f of state.files) {
        const { blob, fileName } = await generateExcelBlob(f);
        zip.file(fileName, blob);
      }
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Relatorios_Excel_Objetiva.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }

    toggleLoading(false);

  } catch (e) {
    toggleLoading(false);
    showAlert('Erro', 'Houve um problema ao gerar o arquivo Excel formatado. Verifique os dados.', 'error');
    console.error(e);
  }
});

function autoDetectDelimiter(text) {
  const firstLines = (text || '').split(/\r?\n/).slice(0, 5).join('\n');
  const countSemi = (firstLines.match(/;/g) || []).length;
  const countComma = (firstLines.match(/,/g) || []).length;
  const countTab = (firstLines.match(/\t/g) || []).length;

  if (countSemi >= countComma && countSemi >= countTab) return ';';
  if (countTab >= countComma && countTab >= countSemi) return '\t';
  return ',';
}

function processCsv(content, originalFileName) {
  const delimiter = autoDetectDelimiter(content);
  const parsed = parseDelimitedCsv(content, delimiter);
  if (parsed.length < 1) {
    showAlert('Erro', 'O arquivo possui formato inválido ou está vazio.', 'error');
    return null;
  }
  return processRows(parsed, originalFileName);
}

function detectHeaderRow(rows) {
  if (!rows || rows.length === 0) return 0;
  
  const knownKeywords = [
    'PDV', 'PROMOTOR', 'AGENTE', 'COLABORADOR', 'SKU', 'ITENS', 'PRODUTO',
    'DATA', 'INICIO', 'EXECUCAO', 'VISITA', 'RUPTURA', 'PRECO', 'ESTOQUE',
    'VALIDADE', 'LOTE', 'FANTASIA', 'RAZAO SOCIAL', 'CLIENTE', 'LOJA',
    'MOTIVO', 'STATUS', 'CIDADE', 'ESTADO', 'COD', 'AVARIA', 'RETIRADO', 'PESO', 'BALANCA', 'NOTA', 'MESA',
    'TECNICO', 'CHECKIN', 'CHECKOUT', 'BIO', 'FACHADA', 'GEOLOCALIZACAO',
    'ALMOXARIFADO', 'COZINHA', 'ACOUGUE', 'AÇOUGUE', 'SALGADO', 'LATICINIOS', 'LATICÍNIOS', 'FLV', 'LIXEIRA', 'GERENTE'
  ];

  let bestRow = 0;
  let maxScore = -1;

  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row)) continue;
    
    let score = 0;
    const filledCells = row.filter(c => String(c || '').trim() !== '');
    if (filledCells.length <= 1) continue;

    filledCells.forEach(cell => {
      const norm = normalizeHeader(cell);
      if (knownKeywords.some(kw => norm.includes(kw))) {
        score += 3;
      } else if (isNaN(norm) && norm.length > 1) {
        score += 1;
      }
    });

    if (r > 0 && filledCells.length > (rows[0]?.filter(c => String(c || '').trim() !== '').length || 0) + 3) {
      score += 5;
    }

    if (score > maxScore) {
      maxScore = score;
      bestRow = r;
    }
  }

  return bestRow;
}

function processRows(parsedRows, originalFileName) {
  if (!parsedRows || parsedRows.length < 1) return null;

  const headerRowIdx = detectHeaderRow(parsedRows);
  const rawHeaders = (parsedRows[headerRowIdx] || []).map(c => String(c ?? '').trim());
  const normalizedHeaders = rawHeaders.map(h => normalizeHeader(h));
  
  const BLACKLIST = [
    'ID DA VISITA',
    'ID DA TAREFA',
    'SECAO',
    'FILIAL',
    'FOTO DO MIX',
    'O QUE SE RESOLVEU COM O GERENTE?',
    'POSICAO ATUAL',
    'TEM ALGUMA OBSERVACAO SOBRE O PDV',
    'TEM_ALGUMA_OBSERVACAO_SOBRE_O_PDV',
    'OBSERVACAO DO PDV',
    'OBSERVACAO_DO_PDV'
  ];

  const body = parsedRows.slice(headerRowIdx + 1).filter((row) => row && row.some((cell) => String(cell || '').trim() !== ''));

  const mappingRules = {};
  EXPORT_MODEL.forEach(rule => {
    const srcNorm = normalizeHeader(rule.source);
    if (!mappingRules[srcNorm]) mappingRules[srcNorm] = [];
    mappingRules[srcNorm].push(rule);
  });

  const transformed = body.map((row) => {
    const obj = {};
    rawHeaders.forEach((header, index) => {
      const normH = normalizedHeaders[index];
      const val = String(row[index] ?? '').trim();
      
      if (BLACKLIST.includes(normH)) return;
      
      // Sempre armazena o valor pelo nome original da coluna
      obj[header] = val;

      const rules = mappingRules[normH];
      if (rules) {
        rules.forEach(rule => {
          const transformedVal = applyTransform(val, rule.transform);
          // Não sobrescreve um valor já preenchido por uma string vazia
          if (transformedVal !== '' || !obj[rule.export]) {
            obj[rule.export] = transformedVal;
          }
        });
      }
    });
    return obj;
  });

  const mainColumns = [];
  const extraColumns = [];

  rawHeaders.forEach((header, index) => {
    const normH = normalizedHeaders[index];
    if (BLACKLIST.includes(normH)) return;
    
    const rules = mappingRules[normH];
    if (rules) {
      rules.forEach((rule, rIdx) => {
        if (rIdx > 0 || rule.export === 'DATA DO DIA') {
          if (!extraColumns.includes(rule.export)) extraColumns.push(rule.export);
        } else {
          if (!mainColumns.includes(rule.export)) mainColumns.push(rule.export);
        }
      });
    } else {
      if (!mainColumns.includes(header)) mainColumns.push(header);
    }
  });

  let allPossibleColumns = [...mainColumns, ...extraColumns];

  const targetCol = 'TEM SKU VENCENDO EM 60 DIAS?';
  const dataCol = 'DATA DO DIA';
  if (allPossibleColumns.includes(dataCol) && allPossibleColumns.includes(targetCol)) {
    allPossibleColumns = allPossibleColumns.filter(c => c !== dataCol);
    const targetIdx = allPossibleColumns.indexOf(targetCol);
    allPossibleColumns.splice(targetIdx + 1, 0, dataCol);
  }

  const isPriceColName = (name) => {
    const norm = normalizeHeader(name);
    return norm === 'PRECO' || norm === 'PREÇO' || norm.includes('PRECO') || norm.includes('PREÇO');
  };

  const isCaixasColName = (name) => {
    const norm = normalizeHeader(name);
    return norm.includes('QUANTAS CAIXAS FORAM ABASTECIDAS') || norm.includes('QTD. DE CAIXAS ABASTECIDAS') || norm.includes('QTD DE CAIXAS ABASTECIDAS') || norm.includes('CAIXAS ABASTECIDAS');
  };

  const exportColumns = allPossibleColumns.filter(col => {
    if (isPriceColName(col)) {
      return transformed.some(row => {
        const p = parsePrice(row[col]);
        return p !== null && p > 0;
      });
    }
    if (isCaixasColName(col)) {
      return transformed.some(row => {
        const val = row[col];
        if (val === null || val === undefined || String(val).trim() === '') return false;
        const num = parseInt(String(val).replace(',', '.'), 10);
        return !isNaN(num) && num > 0;
      });
    }
    return transformed.some(row => String(row[col] ?? '').trim() !== '');
  });

  return { originalFileName, rows: transformed, columns: exportColumns };
}

function parsePrice(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  let str = String(val).trim().replace(/^R\$\s*/i, '');
  if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function normalizeHeader(value) {
  let str = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  str = str.replace(/^_2_/i, '(2) ').replace(/^_3_/i, '(3) ');
  str = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  return str;
}

function applyTransform(value, transform) {
  if (!value) return '';
  if (transform === 'date' || transform === 'datetime') {
    let dateStr = value.split(' ')[0] || '';
    if (dateStr.includes('-')) {
      const p = dateStr.split('-');
      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return dateStr;
  }
  return value;
}

function parseDelimitedCsv(text, delimiter) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      current.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      current.push(field);
      rows.push(current);
      current = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length || current.length) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

function renderMapping(exportColumns) {
  if (!mappingTableBody) return;
  mappingTableBody.innerHTML = '';
  
  exportColumns.forEach(colName => {
    // Busca se existe tradução no modelo reserva de minas
    const rule = EXPORT_MODEL.find(m => m.export === colName);
    
    const tr = document.createElement('tr');
    if (rule) {
      tr.innerHTML = `
        <td><strong>${escapeHtml(colName)}</strong></td>
        <td>${rule.transform === 'date'
          ? `<span class="badge">Sintetizada de</span> ${escapeHtml(rule.source)}`
          : escapeHtml(rule.source)}</td>
      `;
    } else {
      // Coluna extra que não estava no modelo original mas tem dado
      tr.innerHTML = `
        <td><strong>${escapeHtml(colName)}</strong></td>
        <td>${escapeHtml(colName)} <span class="badge" style="background:#555">Original</span></td>
      `;
    }
    mappingTableBody.appendChild(tr);
  });
}

function renderPreview(columns, rows) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `<tr>${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr>`;
  rows.slice(0, 200).forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = columns.map((col) => `<td>${escapeHtml(row[col] ?? '')}</td>`).join('');
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  previewWrap.innerHTML = '';
  previewWrap.appendChild(table);
}

function buildCsv(columns, rows) {
  const lines = [columns.join(';')];
  for (const row of rows) {
    const values = columns.map((col) => csvEscape(row[col] ?? ''));
    lines.push(values.join(';'));
  }
  return '\uFEFF' + lines.join('\r\n');
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[";\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// --- Sync & Patterns ---
const syncChannel = new BroadcastChannel('app_sync');
syncChannel.onmessage = (event) => {
  if (event.data.type === 'THEME_CHANGE') {
    document.documentElement.setAttribute('data-theme', event.data.theme);
  }
};

// Persistence for Mapping Rules
window.saveCurrentRules = () => {
  if (!state.files.length) return;
  const activeFile = state.files[state.activeIndex];
  const rules = activeFile.columns.map(c => ({
    source: c.original,
    target: c.target,
    transform: c.transform
  }));
  localStorage.setItem('relatorios_last_rules', JSON.stringify(rules));
  if (window.showToast) window.showToast('Regras de mapeamento salvas!', 'success');
  else alert('Regras de mapeamento salvas!');
};
