import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Paperclip,
  Download,
  Eye,
  Edit3,
  X,
  Filter
} from 'lucide-react';
import '../css/cartas.css';
import {
  processExcelFile,
  buildPdfBytes,
  loadDefaultTemplate,
  dataAtualExtenso,
  baixarArquivo,
  formatCpf
} from '../services/lettersEngine.js';

export function LettersPage() {
  // Dados principais
  const [templateBytes, setTemplateBytes] = useState(null);
  const [templateFileName, setTemplateFileName] = useState('CARTA.pdf (Padrão)');
  const [excelFileName, setExcelFileName] = useState('');
  const [groupedList, setGroupedList] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Configurações do formulário
  const [cidadeData, setCidadeData] = useState(dataAtualExtenso());
  const [docTipo, setDocTipo] = useState('CPF');
  const [empresaRemetente, setEmpresaRemetente] = useState('O+ MARKETING E RECURSOS HUMANOS LTDA');
  const [cargoDefault, setCargoDefault] = useState('Promotor de Merchandising');
  const [textoVinculoModo, setTextoVinculoModo] = useState('rede');
  const [zipName, setZipName] = useState(() => `cartas_lojas_${new Date().toISOString().slice(0, 10)}.pdf`);

  // Filtros em cascata
  const [selectedAgentes, setSelectedAgentes] = useState([]);
  const [selectedRedes, setSelectedRedes] = useState([]);
  const [selectedLocais, setSelectedLocais] = useState([]);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');

  // Prévia e Edição
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditingIndividual, setIsEditingIndividual] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0, active: false });

  // Refs para inputs ocultos
  const excelInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const attachInputRef = useRef(null);

  // Carrega modelo PDF permanente ao montar
  useEffect(() => {
    let isMounted = true;
    loadDefaultTemplate().then((bytes) => {
      if (isMounted && bytes) {
        setTemplateBytes(bytes);
        setTemplateFileName('CARTA.pdf (Padrão Carregado)');
      }
    });
    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  // Grupos filtrados
  const filteredGroups = useMemo(() => {
    if (!groupedList || groupedList.length === 0) return [];
    return groupedList.filter((g) => {
      const matchAgente = selectedAgentes.length === 0 || selectedAgentes.includes(g.agente);
      const matchRede = selectedRedes.length === 0 || selectedRedes.includes(g.rede);
      const matchLocal = selectedLocais.length === 0 || selectedLocais.includes(g.local);
      return matchAgente && matchRede && matchLocal;
    });
  }, [groupedList, selectedAgentes, selectedRedes, selectedLocais]);

  // Opções para filtros em cascata
  const availableAgentes = useMemo(() => {
    if (!groupedList) return [];
    return [...new Set(
      groupedList
        .filter((g) => (selectedRedes.length === 0 || selectedRedes.includes(g.rede)) && (selectedLocais.length === 0 || selectedLocais.includes(g.local)))
        .map((g) => g.agente)
        .filter(Boolean)
    )].sort();
  }, [groupedList, selectedRedes, selectedLocais]);

  const availableRedes = useMemo(() => {
    if (!groupedList) return [];
    return [...new Set(
      groupedList
        .filter((g) => (selectedAgentes.length === 0 || selectedAgentes.includes(g.agente)) && (selectedLocais.length === 0 || selectedLocais.includes(g.local)))
        .map((g) => g.rede)
        .filter(Boolean)
    )].sort();
  }, [groupedList, selectedAgentes, selectedLocais]);

  const availableLocais = useMemo(() => {
    if (!groupedList) return [];
    return [...new Set(
      groupedList
        .filter((g) => (selectedAgentes.length === 0 || selectedAgentes.includes(g.agente)) && (selectedRedes.length === 0 || selectedRedes.includes(g.rede)))
        .map((g) => g.local)
        .filter(Boolean)
    )].sort();
  }, [groupedList, selectedAgentes, selectedRedes]);

  // Upload planilha
  const handleExcelUpload = async (file) => {
    if (!file) return;
    try {
      setExcelFileName(file.name);
      const { grouped, avisos } = await processExcelFile(file);

      // Auto-completar CPFs faltantes usando a base de colaboradores do Supabase
      try {
        if (typeof window !== 'undefined' && window.supabase) {
          const { data: staffList } = await window.supabase.from('tb_colaboradores').select('nome, cpf');
          if (staffList && staffList.length > 0) {
            const staffCpfMap = new Map();
            staffList.forEach((s) => {
              if (s.nome && s.cpf) staffCpfMap.set(s.nome.trim().toUpperCase(), s.cpf);
            });
            grouped.forEach((g) => {
              if (!g.cpf && g.agente) {
                const found = staffCpfMap.get(g.agente.trim().toUpperCase());
                if (found) g.cpf = formatCpf(found);
              } else if (g.cpf) {
                g.cpf = formatCpf(g.cpf);
              }
            });
          }
        }
      } catch (cpfErr) {
        console.warn('Auto-completar CPF via base de colaboradores:', cpfErr);
      }

      setGroupedList(grouped);
      setWarnings(avisos);
      setSelectedAgentes([]);
      setSelectedRedes([]);
      setSelectedLocais([]);
    } catch (err) {
      console.error('Erro ao ler planilha:', err);
      alert('Erro ao ler a planilha: ' + (err.message || err));
    }
  };

  // Upload modelo PDF
  const handlePdfUpload = async (file) => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      setTemplateBytes(bytes);
      setTemplateFileName(file.name);
    } catch (err) {
      console.error('Erro ao ler PDF:', err);
      alert('Erro ao carregar o modelo PDF.');
    }
  };

  // Upload anexos
  const handleAttachUpload = async (files) => {
    if (!files || files.length === 0) return;
    const newAttachs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      try {
        const bytes = await file.arrayBuffer();
        newAttachs.push({ name: file.name, bytes, type: ext });
      } catch (err) {
        console.error('Erro ao carregar anexo:', err);
      }
    }
    setAttachments((prev) => [...prev, ...newAttachs]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Atualização individual
  const handleIndividualFieldChange = (index, field, value) => {
    setGroupedList((prev) => {
      const copy = [...prev];
      if (field === 'marcasText') {
        copy[index] = {
          ...copy[index],
          marcasText: value,
          marcas: value.split(',').map((m) => m.trim()).filter(Boolean)
        };
      } else if (field === 'cpf') {
        copy[index] = { ...copy[index], cpf: formatCpf(value) };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  // Gerar Prévia
  const handleGeneratePreview = async () => {
    if (!templateBytes) {
      alert('O modelo PDF (CARTA.pdf) ainda não foi carregado.');
      return;
    }
    if (!filteredGroups || filteredGroups.length === 0) {
      alert('Nenhuma carta encontrada para o filtro atual.');
      return;
    }

    try {
      setIsPreviewLoading(true);
      const groupsToPreview = filteredGroups.slice(0, 30);
      const pdfBytes = await buildPdfBytes({
        targetGroups: groupsToPreview,
        templateBytes,
        attachments,
        cidadeData,
        cargoDefault,
        docTipo,
        empresaRemetente,
        textoVinculoModo
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newUrl = URL.createObjectURL(blob);
      setPreviewUrl(newUrl);
    } catch (err) {
      console.error('Erro ao gerar prévia:', err);
      alert('Erro ao gerar prévia: ' + err.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Gerar PDF Final
  const handleGenerateFinalPdf = async () => {
    if (!templateBytes) {
      alert('O modelo PDF (CARTA.pdf) ainda não foi carregado.');
      return;
    }
    if (!filteredGroups || filteredGroups.length === 0) {
      alert('Nenhuma carta encontrada para os filtros atuais.');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress({ current: 0, total: filteredGroups.length, percent: 0, active: true });

      const pdfBytes = await buildPdfBytes({
        targetGroups: filteredGroups,
        templateBytes,
        attachments,
        cidadeData,
        cargoDefault,
        docTipo,
        empresaRemetente,
        textoVinculoModo,
        onProgress: (current, total, percent) => {
          setProgress({ current, total, percent, active: true });
        }
      });

      let finalName = zipName.trim() || `cartas_lojas_${new Date().toISOString().slice(0, 10)}.pdf`;
      if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf';

      baixarArquivo(pdfBytes, finalName, 'application/pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF final:', err);
      alert('Erro ao gerar PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress((p) => ({ ...p, active: false }));
      }, 1200);
    }
  };

  const toggleFilterItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedAgentes([]);
    setSelectedRedes([]);
    setSelectedLocais([]);
    setOpenDropdown(null);
  };

  return (
    <div className="cartas-shell">
      {/* PAINEL ESQUERDO: Formulário, Uploads & Filtros */}
      <aside className="cartas-panel form-panel">
        <h1>
          <FileText size={22} style={{ color: 'var(--primary)' }} />
          Gerador de Carta de Loja
        </h1>
        <p className="cartas-subtitle">
          Importe a planilha, preencha os dados e gere 1 carta por loja no padrão do modelo.
        </p>

        {/* 1. Upload Planilha Excel */}
        <div className="field-group drag-zone">
          <label>Planilha Excel (.xlsx, .xls, .csv)</label>
          <div
            className="drop-area"
            onClick={() => excelInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              if (e.dataTransfer.files?.[0]) handleExcelUpload(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => handleExcelUpload(e.target.files?.[0])}
            />
            <div style={{ marginBottom: '8px', color: 'var(--primary)' }}>
              <FileSpreadsheet size={28} />
            </div>
            <p className="drop-text">
              {excelFileName ? (
                <strong style={{ color: '#10b981' }}>✓ {excelFileName} ({groupedList.length} lojas)</strong>
              ) : (
                'Arraste a planilha aqui ou clique para selecionar'
              )}
            </p>
          </div>
        </div>

        {/* 2. PDF Modelo */}
        <div className="field-group drag-zone">
          <label>
            PDF modelo <span className="badge-default">Padrão Ativo</span>
          </label>
          <div
            className="drop-area"
            onClick={() => pdfInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => handlePdfUpload(e.target.files?.[0])}
            />
            <div style={{ marginBottom: '6px', color: '#10b981' }}>
              <FileText size={24} />
            </div>
            <p className="drop-text">
              <strong>{templateFileName}</strong>
              <br />
              <span style={{ fontSize: '11px', opacity: 0.8 }}>Arraste outro arquivo se desejar substituir</span>
            </p>
          </div>
        </div>

        {/* 3. Documentos Anexos (Múltiplos) */}
        <div className="field-group drag-zone">
          <label>Documentos Anexos (ASO, docs - PDF, JPG, PNG)</label>
          <div
            className="drop-area"
            onClick={() => attachInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              if (e.dataTransfer.files) handleAttachUpload(e.dataTransfer.files);
            }}
          >
            <input
              ref={attachInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleAttachUpload(e.target.files)}
            />
            <div style={{ marginBottom: '6px', color: 'var(--primary)' }}>
              <Paperclip size={24} />
            </div>
            <p className="drop-text">
              {attachments.length > 0 ? (
                <strong style={{ color: 'var(--primary)' }}>✓ {attachments.length} documento(s) anexado(s)</strong>
              ) : (
                'Arraste PDF, JPG ou PNG aqui — múltiplos permitidos'
              )}
            </p>
          </div>

          {/* Chips de Anexos */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {attachments.map((att, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: 'var(--text-main)'
                  }}
                >
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Alertas da Planilha */}
        {warnings.length > 0 && (
          <div className="warning-panel">
            <h3>⚠️ Alertas na Planilha ({warnings.length})</h3>
            <ul>
              {warnings.slice(0, 8).map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
              {warnings.length > 8 && <li>... e mais {warnings.length - 8} alertas.</li>}
            </ul>
          </div>
        )}

        {/* 5. Campos do Formulário */}
        <div className="field-group">
          <label>Cidade e data</label>
          <input
            type="text"
            value={cidadeData}
            onChange={(e) => setCidadeData(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label>Tipo do documento</label>
            <select value={docTipo} onChange={(e) => setDocTipo(e.target.value)}>
              <option value="CPF">CPF</option>
              <option value="RG">RG</option>
              <option value="CPF e RG">CPF e RG</option>
              <option value="CTPS DIGITAL, RG e CPF">CTPS DIGITAL, RG e CPF</option>
            </select>
          </div>

          <div className="field-group">
            <label>Cargo Padrão</label>
            <input
              type="text"
              value={cargoDefault}
              onChange={(e) => setCargoDefault(e.target.value)}
            />
          </div>
        </div>

        <div className="field-group">
          <label>Empresa Remetente</label>
          <select value={empresaRemetente} onChange={(e) => setEmpresaRemetente(e.target.value)}>
            <option value="O+ MARKETING E RECURSOS HUMANOS LTDA">O+ MARKETING E RECURSOS HUMANOS LTDA</option>
            <option value="OBJETIVA MARKETING E RECURSOS HUMANOS LTDA">OBJETIVA MARKETING E RECURSOS HUMANOS LTDA</option>
          </select>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label>Texto de vínculo</label>
            <select value={textoVinculoModo} onChange={(e) => setTextoVinculoModo(e.target.value)}>
              <option value="rede">Usar rede</option>
              <option value="local">Nome da loja (LOCAL)</option>
              <option value="razao">Usar razão social</option>
            </select>
          </div>

          <div className="field-group">
            <label>Nome do PDF final</label>
            <input
              type="text"
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
            />
          </div>
        </div>

        {/* 6. Filtros Multi-Select */}
        {groupedList.length > 0 && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> Filtros ({filteredGroups.length} de {groupedList.length})
              </span>
              {(selectedAgentes.length > 0 || selectedRedes.length > 0 || selectedLocais.length > 0) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✕ Limpar Filtros
                </button>
              )}
            </div>

            {/* Agente */}
            <div className="field-group">
              <label>Filtrar por Agente</label>
              <div className="multi-select-dropdown">
                <button
                  type="button"
                  className={`multi-select-summary ${selectedAgentes.length > 0 ? 'has-selection' : ''}`}
                  onClick={() => { setOpenDropdown(openDropdown === 'agente' ? null : 'agente'); setFilterSearch(''); }}
                >
                  <span>{selectedAgentes.length === 0 ? 'Todos os Agentes' : `${selectedAgentes.length} selecionado(s)`}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {openDropdown === 'agente' && (
                  <div className="multi-select-list">
                    <input
                      type="text"
                      className="multi-select-search"
                      placeholder="Pesquisar agente..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                    <label className="multi-select-item select-all-row">
                      <input
                        type="checkbox"
                        checked={selectedAgentes.length === 0}
                        onChange={() => setSelectedAgentes([])}
                      />
                      Todos os Agentes
                    </label>
                    {availableAgentes
                      .filter((a) => a.toLowerCase().includes(filterSearch.toLowerCase()))
                      .map((a) => (
                        <label key={a} className="multi-select-item">
                          <input
                            type="checkbox"
                            checked={selectedAgentes.includes(a)}
                            onChange={() => toggleFilterItem(selectedAgentes, setSelectedAgentes, a)}
                          />
                          {a}
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rede */}
            <div className="field-group">
              <label>Filtrar por Rede</label>
              <div className="multi-select-dropdown">
                <button
                  type="button"
                  className={`multi-select-summary ${selectedRedes.length > 0 ? 'has-selection' : ''}`}
                  onClick={() => { setOpenDropdown(openDropdown === 'rede' ? null : 'rede'); setFilterSearch(''); }}
                >
                  <span>{selectedRedes.length === 0 ? 'Todas as Redes' : `${selectedRedes.length} selecionada(s)`}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {openDropdown === 'rede' && (
                  <div className="multi-select-list">
                    <input
                      type="text"
                      className="multi-select-search"
                      placeholder="Pesquisar rede..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                    <label className="multi-select-item select-all-row">
                      <input
                        type="checkbox"
                        checked={selectedRedes.length === 0}
                        onChange={() => setSelectedRedes([])}
                      />
                      Todas as Redes
                    </label>
                    {availableRedes
                      .filter((r) => r.toLowerCase().includes(filterSearch.toLowerCase()))
                      .map((r) => (
                        <label key={r} className="multi-select-item">
                          <input
                            type="checkbox"
                            checked={selectedRedes.includes(r)}
                            onChange={() => toggleFilterItem(selectedRedes, setSelectedRedes, r)}
                          />
                          {r}
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Local */}
            <div className="field-group">
              <label>Filtrar por Local (Loja)</label>
              <div className="multi-select-dropdown">
                <button
                  type="button"
                  className={`multi-select-summary ${selectedLocais.length > 0 ? 'has-selection' : ''}`}
                  onClick={() => { setOpenDropdown(openDropdown === 'local' ? null : 'local'); setFilterSearch(''); }}
                >
                  <span>{selectedLocais.length === 0 ? 'Todos os Locais' : `${selectedLocais.length} selecionado(s)`}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {openDropdown === 'local' && (
                  <div className="multi-select-list">
                    <input
                      type="text"
                      className="multi-select-search"
                      placeholder="Pesquisar loja..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                    <label className="multi-select-item select-all-row">
                      <input
                        type="checkbox"
                        checked={selectedLocais.length === 0}
                        onChange={() => setSelectedLocais([])}
                      />
                      Todos os Locais
                    </label>
                    {availableLocais
                      .filter((l) => l.toLowerCase().includes(filterSearch.toLowerCase()))
                      .map((l) => (
                        <label key={l} className="multi-select-item">
                          <input
                            type="checkbox"
                            checked={selectedLocais.includes(l)}
                            onChange={() => toggleFilterItem(selectedLocais, setSelectedLocais, l)}
                          />
                          {l}
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. Barra de Progresso */}
        {progress.active && (
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${progress.percent}%` }}></div>
            </div>
            <span className="progress-text">
              Gerando carta {progress.current} de {progress.total} ({progress.percent}%)...
            </span>
          </div>
        )}

        {/* 8. Botões de Ação */}
        <div className="button-row">
          <button
            type="button"
            className="cartas-btn"
            onClick={handleGeneratePreview}
            disabled={isPreviewLoading || groupedList.length === 0}
          >
            <Eye size={15} style={{ color: 'var(--primary)' }} />
            {isPreviewLoading ? 'Gerando...' : 'Atualizar prévia'}
          </button>

          <button
            type="button"
            className="cartas-btn primary"
            onClick={handleGenerateFinalPdf}
            disabled={isGenerating || groupedList.length === 0}
          >
            <Download size={15} />
            {isGenerating ? 'Exportando...' : 'Gerar PDF Final'}
          </button>
        </div>
      </aside>

      {/* PAINEL DIREITO: Prévia do PDF / Editor Individual */}
      <main className="cartas-panel preview-panel">
        <div className="preview-header">
          <h2>
            {isEditingIndividual ? 'Editar Dados Individuais' : 'Prévia das Cartas Geradas'}
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginLeft: '10px' }}>
              ({filteredGroups.length} carta(s) selecionada(s))
            </span>
          </h2>

          {groupedList.length > 0 && (
            <button
              type="button"
              className="cartas-btn"
              onClick={() => setIsEditingIndividual(!isEditingIndividual)}
            >
              <Edit3 size={14} style={{ color: 'var(--primary)' }} />
              {isEditingIndividual ? 'Ver Prévia do PDF' : 'Editar Dados Individuais'}
            </button>
          )}
        </div>

        {/* Conteúdo Dinâmico */}
        {isEditingIndividual ? (
          /* Editor Individual de Cada Carta */
          <div className="card-manager">
            <p className="cartas-subtitle">
              Altere os dados de cada carta individualmente antes da exportação:
            </p>
            <div className="card-list">
              {filteredGroups.map((grupo, idx) => (
                <div key={idx} className="editable-card-item">
                  <h4>
                    <span>{grupo.agente}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>{grupo.local}</span>
                  </h4>
                  <div className="edit-fields">
                    <div>
                      <label>Nome do Agente</label>
                      <input
                        type="text"
                        value={grupo.agente || ''}
                        onChange={(e) => handleIndividualFieldChange(idx, 'agente', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label>CPF</label>
                        <input
                          type="text"
                          value={grupo.cpf || ''}
                          onChange={(e) => handleIndividualFieldChange(idx, 'cpf', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>RG</label>
                        <input
                          type="text"
                          value={grupo.rg || ''}
                          onChange={(e) => handleIndividualFieldChange(idx, 'rg', e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label>CTPS</label>
                        <input
                          type="text"
                          value={grupo.ctps || ''}
                          onChange={(e) => handleIndividualFieldChange(idx, 'ctps', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Cargo Sobrescrito</label>
                        <input
                          type="text"
                          value={grupo.cargo || ''}
                          placeholder={`Padrão: ${cargoDefault}`}
                          onChange={(e) => handleIndividualFieldChange(idx, 'cargo', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label>Endereço da Loja</label>
                      <input
                        type="text"
                        value={grupo.endereco || ''}
                        onChange={(e) => handleIndividualFieldChange(idx, 'endereco', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Marcas / Produtos (separados por vírgula)</label>
                      <input
                        type="text"
                        value={grupo.marcasText !== undefined ? grupo.marcasText : (grupo.marcas ? grupo.marcas.join(', ') : '')}
                        onChange={(e) => handleIndividualFieldChange(idx, 'marcasText', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : previewUrl ? (
          /* Prévia do PDF via Iframe */
          <div className="preview-iframe-wrapper">
            <iframe
              src={previewUrl}
              title="Prévia do PDF"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        ) : (
          /* Estado Vazio */
          <div className="preview-empty">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Nenhuma prévia carregada
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 20px 0', maxWidth: '380px', lineHeight: 1.5 }}>
              Importe sua planilha de promotores e lojas no painel ao lado e clique em{' '}
              <strong>"Atualizar prévia"</strong> para visualizar o documento PDF montado em tempo real.
            </p>
            {groupedList.length > 0 && (
              <button
                type="button"
                className="cartas-btn primary"
                onClick={handleGeneratePreview}
              >
                <Eye size={15} />
                Gerar Prévia Agora ({filteredGroups.length} cartas)
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
