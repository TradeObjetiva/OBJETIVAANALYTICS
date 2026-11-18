import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { OBJETIVA_LOGO_BASE64, BUTTON_IMAGES_B64 } from './reportAssets.js';

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
  const res = processRows(parsed, originalFileName);
  if (res) {
    res.rawContent = content;
  }
  return res;
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

  return { originalFileName, rows: transformed, columns: exportColumns, rawParsedRows: parsedRows };
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

// Função para calcular redes disponíveis e contagem
export function getAvailableRedesFromRows(rows) {
  if (!rows || rows.length === 0) return [];
  const countsMap = new Map();
  rows.forEach(row => {
    const rede = getRowRede(row);
    countsMap.set(rede, (countsMap.get(rede) || 0) + 1);
  });
  const list = Array.from(countsMap.entries()).map(([name, count]) => ({ name, count }));
  list.sort((a, b) => {
    if (a.name === '(SEM REDE / VAZIO)') return 1;
    if (b.name === '(SEM REDE / VAZIO)') return -1;
    return a.name.localeCompare(b.name);
  });
  return list;
}

// Filtra linhas pelas redes selecionadas
export function filterRowsByRedes(rows, selectedRedes) {
  if (!rows) return [];
  if (!selectedRedes || selectedRedes.size === 0) return rows;
  const set = selectedRedes instanceof Set ? selectedRedes : new Set(selectedRedes);
  return rows.filter(row => set.has(getRowRede(row)));
}

// ==========================================
// EXPORTAÇÃO: MODELO OFICIAL TRADE MARKETING
// ==========================================
export async function generateOfficialExcelBlob(fileObj, selectedRedes) {
  const getFilteredRows = (fObj) => {
    if (!fObj || !fObj.rows) return [];
    if (!selectedRedes || selectedRedes.size === 0) return fObj.rows;
    const set = selectedRedes instanceof Set ? selectedRedes : new Set(selectedRedes);
    return fObj.rows.filter(row => set.has(getRowRede(row)));
  };

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
      'Total Visitas com Ruptura',
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

      const r = wsRuptura.getRow(rRupIdx++);
      r.getCell(4).value = item.local;
      r.getCell(5).value = item.produto;
      r.getCell(6).value = `${totalRupturas}/${item.totalVisitas}`;

      const pctGeral = item.totalVisitas > 0 ? (totalRupturas / item.totalVisitas) : 0;

      r.getCell(7).value = pctGeral;
      r.getCell(7).numFmt = '0.0%';

      for (let i = 4; i <= 7; i++) {
        r.getCell(i).font = DATA_FONT;
        r.getCell(i).border = ORANGE_BORDER;
        r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    addSidebarToSheet(wsRuptura, 'RUPTURA ', rRupIdx);

    wsRuptura.autoFilter = {
      from: { row: 1, column: 4 },
      to: { row: Math.max(rRupIdx - 1, 1), column: 7 }
    };

    wsRuptura.getColumn(4).width = 46;  // Local
    wsRuptura.getColumn(5).width = 46;  // Produto
    wsRuptura.getColumn(6).width = 24;  // Total Visitas com Ruptura
    wsRuptura.getColumn(7).width = 16;  // % Ruptura Geral
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

  return await generateExcelBlob(fileObj);
}

// ==========================================
// EXPORTAÇÃO: MODELO EXECUÇÃO DE VISITAS
// ==========================================
export async function generateVisitsExecutionBlob(fileObj, selectedRedes) {
  const state = {
    files: [fileObj],
    activeIndex: 0,
    selectedRedes: selectedRedes instanceof Set ? selectedRedes : new Set(selectedRedes || [])
  };
  const getFilteredRows = (fObj) => {
    if (!fObj || !fObj.rows) return [];
    if (!selectedRedes || selectedRedes.size === 0) return fObj.rows;
    const set = selectedRedes instanceof Set ? selectedRedes : new Set(selectedRedes);
    return fObj.rows.filter(row => set.has(getRowRede(row)));
  };

  // Extrair geração sem depender de UI alert
  const visits = {};
  const rows = getFilteredRows(fileObj);

  rows.forEach((row, idx) => {
    const rawData = getRowVal(row, DATA_KEYS);
    let dateStr = '';
    let horaInicio = '';
    if (rawData) {
      const parts = rawData.split(' ');
      dateStr = parts[0] || '';
      horaInicio = parts[1] || '';
    }
    const pdvName = getRowVal(row, PDV_KEYS) || 'PDV SEM IDENTIFICAÇÃO';
    const promotorName = getRowVal(row, PROMOTOR_KEYS) || 'PROMOTOR NÃO IDENTIFICADO';
    const redeName = getRowRede(row);
    const key = `${dateStr}_${pdvName}_${promotorName}`;

    if (!visits[key]) {
      visits[key] = {
        data: dateStr,
        horaInicio,
        horaFim: '',
        rede: redeName,
        pdv: pdvName,
        promotor: promotorName,
        codigoVisita: `VISITA-${idx + 1}`,
        produtos: {},
        caixas: 0,
        motivoNaoVisita: '',
        fotos: []
      };
    }
    const cx = parseInt(getRowVal(row, CAIXAS_KEYS), 10);
    if (!isNaN(cx) && cx > 0) visits[key].caixas += cx;
  });

  const visitList = Object.values(visits);
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet('Execução de Visitas', { views: [{ showGridLines: true }] });
  ws.columns = [
    { header: 'Data', key: 'data', width: 14 },
    { header: 'Início', key: 'horaInicio', width: 10 },
    { header: 'Rede', key: 'rede', width: 22 },
    { header: 'PDV / Loja', key: 'pdv', width: 35 },
    { header: 'Promotor', key: 'promotor', width: 30 },
    { header: 'Caixas Abastecidas', key: 'caixas', width: 18 },
    { header: 'Código da Visita', key: 'codigoVisita', width: 20 },
  ];

  // Header styling
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };

  visitList.forEach(v => {
    ws.addRow({
      data: v.data,
      horaInicio: v.horaInicio,
      rede: v.rede,
      pdv: v.pdv,
      promotor: v.promotor,
      caixas: v.caixas,
      codigoVisita: v.codigoVisita
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `execucao_visitas_${dateFormatted}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return { blob, fileName };
}

// ==========================================
// PARSER DE ARQUIVOS (.CSV, .XLSX, .XLS)
// ==========================================
export async function parseReportFile(file) {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = file.name.toLowerCase();

  let processed = null;

  if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    const sheetRows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
    processed = processRows(sheetRows, baseName);
  } else {
    const buffer = await file.arrayBuffer();
    let text = '';
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
    } catch {
      text = new TextDecoder('windows-1252').decode(buffer).replace(/^\uFEFF/, '');
    }
    processed = processCsv(text, baseName);
  }

  if (processed) {
    processed.availableRedes = getAvailableRedesFromRows(processed.rows);
  }

  return processed;
}

// Carrega arquivo de exemplo Deluc
export async function loadSampleReportData() {
  const res = await fetch('public/subsystems/sistema-relatorios/sample-deluc.csv');
  if (!res.ok) throw new Error('Não foi possível carregar o arquivo de exemplo.');
  const text = await res.text();
  const processed = processCsv(text, 'exemplo_deluc');
  if (processed) {
    processed.availableRedes = getAvailableRedesFromRows(processed.rows);
  }
  return processed;
}

export { EXPORT_MODEL, getRowRede, getRowVal, buildCsv, downloadFile };
