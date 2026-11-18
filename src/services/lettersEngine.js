import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getValue(row, key) {
  const target = normalizeText(key).toUpperCase();
  for (const currentKey of Object.keys(row || {})) {
    if (normalizeText(currentKey).toUpperCase() === target) {
      return row[currentKey];
    }
  }
  return '';
}

export function limparMarca(texto) {
  let valor = String(texto || '').trim();
  valor = valor.replace(/^PESQUISA\s+/i, '');
  valor = valor.replace(/^DE\s+AVARIA\s*-\s*/i, '');
  valor = valor.replace(/^AVARIA\s*-\s*/i, '');
  return valor.trim();
}

export function uniqueNormalized(arr) {
  const used = new Set();
  return (arr || []).filter((item) => {
    const key = normalizeText(item).toUpperCase();
    if (!key || used.has(key)) return false;
    used.add(key);
    return true;
  });
}

export function montarEndereco(row) {
  const logradouro = String(getValue(row, 'LOGRADOURO') || '').trim();
  const bairro = String(getValue(row, 'BAIRRO') || '').trim();
  const municipio = String(getValue(row, 'MUNICÍPIO') || getValue(row, 'MUNICIPIO') || '').trim();

  const partes = [logradouro, bairro, municipio].filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} - ${partes[1]}`;
  return `${partes[0]}, ${partes[1]} - ${partes[2]}`;
}

export function getTextoResponsabilidade(destinatario) {
  const texto =
    'Declaramos para os devidos fins que o(a) referido(a) funcionário(a) não possui nenhum vínculo empregatício com o <b>[DESTINATARIO]</b>, sendo de nossa inteira responsabilidade todo e qualquer ônus trabalhistas, previdenciário e outros.';
  return texto.replaceAll('[DESTINATARIO]', destinatario || 'DESTINATÁRIO');
}

export function rgb01(r, g, b) {
  return [r / 255, g / 255, b / 255];
}

export function baixarArquivo(bytes, fileName, mimeType = 'application/pdf') {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function formatCpf(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 10) {
    return ('0' + digits).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return String(val).trim();
}

export function dataAtualExtenso() {
  const data = new Date();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  return `Rio de Janeiro, ${dia} de ${mes} de ${ano}.`;
}

export function agruparLojas(rows) {
  const map = new Map();
  const registroCpfAgentes = new Map();
  const registroRgAgentes = new Map();
  const registroCtpsAgentes = new Map();
  const avisos = [];

  // Primeiro passo: Mapear todos os CPFs, RGs e CTPSs disponíveis por Agente
  rows.forEach((row, index) => {
    const agente = String(getValue(row, 'AGENTE') || '').trim();
    const local = String(getValue(row, 'LOCAL') || '').trim();
    const cpf = formatCpf(String(getValue(row, 'CPF') || getValue(row, 'DOC') || '').trim());
    const rg = String(getValue(row, 'RG') || '').trim();
    const ctps = String(getValue(row, 'CTPS') || '').trim();

    const linhaReal = index + 2; // +1 zero-indexed, +1 header

    if (!agente) {
      avisos.push(`Linha ${linhaReal}: Nome do Agente faltando.`);
    }
    if (!local) {
      avisos.push(`Linha ${linhaReal}: Nome da Loja (Local) faltando.`);
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
    const local = String(getValue(row, 'LOCAL') || '').trim();
    const agente = String(getValue(row, 'AGENTE') || '').trim();
    if (!local || !agente) return;

    const nomeNormalizado = normalizeText(agente).toUpperCase();
    const key = `${nomeNormalizado}|${normalizeText(local).toUpperCase()}`;

    if (!map.has(key)) {
      map.set(key, {
        local,
        agente,
        cpf: formatCpf(registroCpfAgentes.get(nomeNormalizado) || String(getValue(row, 'CPF') || getValue(row, 'DOC') || '').trim()),
        rg: registroRgAgentes.get(nomeNormalizado) || String(getValue(row, 'RG') || '').trim(),
        ctps: registroCtpsAgentes.get(nomeNormalizado) || String(getValue(row, 'CTPS') || '').trim(),
        endereco: montarEndereco(row),
        rede: String(getValue(row, 'REDE') || '').trim(),
        razaoSocial: String(getValue(row, 'RAZÃO SOCIAL') || getValue(row, 'RAZAO SOCIAL') || '').trim(),
        marcas: [],
        cargo: null,
      });
    }

    const grupo = map.get(key);
    const marca = limparMarca(getValue(row, 'FORM'));
    if (marca) grupo.marcas.push(marca);

    const cpfLinha = formatCpf(String(getValue(row, 'CPF') || getValue(row, 'DOC') || '').trim());
    if (!grupo.cpf && cpfLinha) grupo.cpf = cpfLinha;

    const rgLinha = String(getValue(row, 'RG') || '').trim();
    if (!grupo.rg && rgLinha) grupo.rg = rgLinha;

    const ctpsLinha = String(getValue(row, 'CTPS') || '').trim();
    if (!grupo.ctps && ctpsLinha) grupo.ctps = ctpsLinha;

    if (!grupo.endereco) grupo.endereco = montarEndereco(row);
    if (!grupo.rede) grupo.rede = String(getValue(row, 'REDE') || '').trim();
    if (!grupo.razaoSocial) {
      grupo.razaoSocial = String(getValue(row, 'RAZÃO SOCIAL') || getValue(row, 'RAZAO SOCIAL') || '').trim();
    }
  });

  const grouped = [...map.values()].map((grupo) => ({
    ...grupo,
    marcas: uniqueNormalized(grupo.marcas),
  }));

  return { grouped, avisos };
}

export async function processExcelFile(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const { grouped, avisos } = agruparLojas(rows);
  return { rows, grouped, avisos };
}

export function sZ(text) {
  return String(text || '')
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en/em dashes
    .replace(/[\u2026]/g, '...') // ellipsis
    .replace(/[^\x00-\xFF]/g, ''); // strip any non-WinAnsi/Latin1 char that breaks pdf-lib
}

export function drawWrappedText(page, text, options) {
  const { font, boldFont, size, x, y, maxWidth, lineHeight, firstLineIndent = 0, color = rgb01(0, 0, 0) } = options;

  const parts = String(text || '').split(/(<b>|<\/b>|\s+)/g).filter(Boolean);

  let isBold = false;
  let lines = [];
  let currentLine = [];
  let currentLineWidth = 0;

  for (const part of parts) {
    if (part === '<b>') { isBold = true; continue; }
    if (part === '</b>') { isBold = false; continue; }

    let cFont = (isBold && boldFont) ? boldFont : font;
    let cWidth = cFont.widthOfTextAtSize(part, size);
    let actualMaxWidth = lines.length === 0 ? maxWidth - firstLineIndent : maxWidth;

    if (part.trim() === '') {
      if (currentLineWidth === 0) continue;
      currentLine.push({ text: part, font: cFont, width: cWidth });
      currentLineWidth += cWidth;
      continue;
    }

    if (currentLineWidth + cWidth > actualMaxWidth && currentLineWidth > 0) {
      lines.push(currentLine);
      currentLine = [{ text: part, font: cFont, width: cWidth }];
      currentLineWidth = cWidth;
    } else {
      currentLine.push({ text: part, font: cFont, width: cWidth });
      currentLineWidth += cWidth;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);

  let currentY = y;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let currentX = x + (i === 0 ? firstLineIndent : 0);
    let grouped = [];
    for (const seg of line) {
      if (grouped.length > 0 && grouped[grouped.length - 1].font === seg.font) {
        grouped[grouped.length - 1].text += seg.text;
      } else {
        grouped.push({ text: seg.text, font: seg.font });
      }
    }

    for (const g of grouped) {
      page.drawText(g.text, { x: currentX, y: currentY, size, font: g.font, color });
      currentX += g.font.widthOfTextAtSize(g.text, size);
    }
    currentY -= lineHeight;
  }

  return currentY;
}

export async function buildPdfBytes({
  targetGroups,
  templateBytes,
  attachments = [],
  cidadeData = '',
  cargoDefault = 'Promotor de Merchandising',
  docTipo = 'CPF',
  empresaRemetente = 'O+ MARKETING E RECURSOS HUMANOS LTDA',
  textoVinculoModo = 'rede',
  onProgress = null
}) {
  if (!templateBytes) {
    throw new Error('Modelo PDF (CARTA.pdf) não foi carregado.');
  }
  if (!targetGroups || !targetGroups.length) {
    throw new Error('Nenhuma loja/carta selecionada para geração.');
  }

  const outputPdf = await PDFDocument.create();
  const templatePdfDoc = await PDFDocument.load(templateBytes);

  const helvetica = await outputPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await outputPdf.embedFont(StandardFonts.HelveticaBold);

  const total = targetGroups.length;

  // Pré-carrega documentos de anexo
  const attachmentDocs = [];
  if (attachments && attachments.length > 0) {
    for (const attach of attachments) {
      try {
        const ext = (attach.type || attach.name.split('.').pop() || '').toLowerCase();
        if (ext === 'pdf') {
          const attachDoc = await PDFDocument.load(attach.bytes);
          attachmentDocs.push({ type: 'pdf', doc: attachDoc });
        } else if (ext === 'jpg' || ext === 'jpeg') {
          const embeddedImg = await outputPdf.embedJpg(attach.bytes);
          attachmentDocs.push({ type: 'image', img: embeddedImg, name: attach.name });
        } else if (ext === 'png') {
          const embeddedImg = await outputPdf.embedPng(attach.bytes);
          attachmentDocs.push({ type: 'image', img: embeddedImg, name: attach.name });
        }
      } catch (err) {
        console.error(`Erro ao carregar anexo ${attach.name}:`, err);
      }
    }
  }

  for (let i = 0; i < total; i++) {
    const grupo = targetGroups[i];

    if (onProgress) {
      const percent = Math.round(((i + 1) / total) * 100);
      onProgress(i + 1, total, percent);
    }

    const [copiedPage] = await outputPdf.copyPages(templatePdfDoc, [0]);
    const page = outputPdf.addPage(copiedPage);

    const marcas = grupo.marcas ? grupo.marcas.join(', ') : '';

    let destinatario = sZ(grupo.local) || '-';
    if (textoVinculoModo === 'razao' && grupo.razaoSocial) destinatario = sZ(grupo.razaoSocial);
    if (textoVinculoModo === 'rede' && grupo.rede) destinatario = sZ(grupo.rede);

    const responsabilidade = getTextoResponsabilidade(destinatario);

    // Cidade e Data
    page.drawText(sZ(cidadeData) || dataAtualExtenso(), {
      x: 95,
      y: 750,
      size: 11.5,
      font: helveticaBold,
      color: rgb(...rgb01(20, 20, 20)),
    });

    // Remetente (DE)
    drawWrappedText(page, `<b>DE:</b> ${sZ(empresaRemetente)}`, {
      font: helvetica,
      boldFont: helveticaBold,
      size: 11.5,
      x: 95,
      y: 690,
      maxWidth: 440,
      lineHeight: 15,
      color: rgb(...rgb01(20, 20, 20)),
    });

    // Destinatário (PARA)
    drawWrappedText(page, `<b>PARA:</b> ${sZ(grupo.local) || '-'}`, {
      font: helvetica,
      boldFont: helveticaBold,
      size: 11.5,
      x: 95,
      y: 670,
      maxWidth: 440,
      lineHeight: 15,
      color: rgb(...rgb01(20, 20, 20)),
    });

    // Endereço
    let cy = 600;
    if (sZ(grupo.endereco)) {
      let addrY = drawWrappedText(page, `<b>Endereço:</b> ${sZ(grupo.endereco)}`, {
        font: helvetica,
        boldFont: helveticaBold,
        size: 11.2,
        x: 95,
        y: 650,
        maxWidth: 440,
        lineHeight: 15,
        color: rgb(...rgb01(20, 20, 20)),
      });
      cy = addrY - 40;
    }

    // Documento
    let docText = '';
    const tipoD = sZ(docTipo || 'CPF');
    const cpfFormatado = formatCpf(grupo.cpf) || '-';
    if (tipoD === 'CPF') {
      docText = `CPF: <b>${sZ(cpfFormatado)}</b>`;
    } else if (tipoD === 'RG') {
      docText = `RG: <b>${sZ(grupo.rg || '-')}</b>`;
    } else if (tipoD === 'CPF e RG') {
      docText = `CPF: <b>${sZ(cpfFormatado)}</b> e RG: <b>${sZ(grupo.rg || '-')}</b>`;
    } else if (tipoD === 'CTPS DIGITAL, RG e CPF') {
      docText = `CTPS DIGITAL: <b>${sZ(grupo.ctps || '-')}</b>, RG: <b>${sZ(grupo.rg || '-')}</b> e CPF: <b>${sZ(cpfFormatado)}</b>`;
    } else {
      docText = `${tipoD}: <b>${sZ(cpfFormatado)}</b>`;
    }

    const cg = sZ(grupo.cargo || cargoDefault || 'Promotor de Merchandising');

    const paragrafo1 =
      `Viemos por meio desta, apresentar o(a) nosso(a) funcionário(a) Sr(a) ` +
      `<b>${sZ(grupo.agente) || '-'}</b>, portador(a) do ${docText}, ` +
      `que atuará na função de ${cg} ` +
      `dos produtos da empresa <b>${sZ(marcas) || '-'}</b>, no <b>${sZ(grupo.local) || '-'}</b>.`;

    cy = drawWrappedText(page, paragrafo1, {
      font: helvetica,
      boldFont: helveticaBold,
      size: 11.4,
      x: 95,
      y: cy,
      maxWidth: 450,
      lineHeight: 18,
      firstLineIndent: 30,
      color: rgb(...rgb01(20, 20, 20)),
    });

    cy -= 25;

    cy = drawWrappedText(page, responsabilidade, {
      font: helvetica,
      boldFont: helveticaBold,
      size: 11.4,
      x: 95,
      y: cy,
      maxWidth: 450,
      lineHeight: 18,
      firstLineIndent: 30,
      color: rgb(...rgb01(20, 20, 20)),
    });

    page.drawText('Atenciosamente,', {
      x: 95,
      y: cy - 50,
      size: 11.5,
      font: helveticaBold,
      color: rgb(...rgb01(20, 20, 20)),
    });

    // Intercala páginas de anexos
    for (const attachItem of attachmentDocs) {
      try {
        if (attachItem.type === 'pdf') {
          const pageIndices = Array.from({ length: attachItem.doc.getPageCount() }, (_, idx) => idx);
          const copiedAttachPages = await outputPdf.copyPages(attachItem.doc, pageIndices);
          for (const attachPage of copiedAttachPages) {
            outputPdf.addPage(attachPage);
          }
        } else if (attachItem.type === 'image') {
          const imgPage = outputPdf.addPage([595, 842]);
          const { width: imgW, height: imgH } = attachItem.img;
          const maxW = 555;
          const maxH = 802;
          const scale = Math.min(maxW / imgW, maxH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const x = (595 - drawW) / 2;
          const y = (842 - drawH) / 2;
          imgPage.drawImage(attachItem.img, { x, y, width: drawW, height: drawH });
        }
      } catch (err) {
        console.error('Erro ao mesclar anexo:', err);
      }
    }
  }

  return await outputPdf.save();
}

export async function loadDefaultTemplate() {
  const possiblePaths = [
    '/subsystems/sistema-cartas/CARTA.pdf',
    './public/subsystems/sistema-cartas/CARTA.pdf',
    '/CARTA.pdf',
    './CARTA.pdf'
  ];

  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch (e) {
      // Tenta próximo
    }
  }
  return null;
}

