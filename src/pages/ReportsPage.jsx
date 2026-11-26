import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Layers,
  Store,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  parseReportFile,
  loadSampleReportData,
  filterRowsByRedes,
  generateOfficialExcelBlob,
  generateVisitsExecutionBlob,
  buildCsv,
  downloadFile,
  getRowRede,
} from '../services/reportEngine.js';

export function ReportsPage() {
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [selectedRedes, setSelectedRedes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const activeFile = files[activeFileIndex] || null;

  // Atualiza redes selecionadas quando novo arquivo é carregado
  const handleFileLoaded = (newFiles) => {
    setFiles(newFiles);
    setActiveFileIndex(0);
    if (newFiles.length > 0 && newFiles[0].availableRedes) {
      const allRedes = new Set(newFiles[0].availableRedes.map((r) => r.name));
      setSelectedRedes(allRedes);
    }
  };

  // Upload via Drag & Drop ou input
  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setLoading(true);
    setLoadingMessage('Lendo e estruturando arquivos...');
    try {
      const parsedList = [];
      for (const f of Array.from(fileList)) {
        const ext = f.name.toLowerCase();
        if (ext.endsWith('.csv') || ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
          const res = await parseReportFile(f);
          if (res) parsedList.push(res);
        }
      }
      if (parsedList.length > 0) {
        handleFileLoaded(parsedList);
      } else {
        alert('Nenhum arquivo válido (.csv, .xlsx, .xls) encontrado.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar arquivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carrega exemplo Deluc
  const handleLoadSample = async () => {
    setLoading(true);
    setLoadingMessage('Carregando exemplo oficial Deluc...');
    try {
      const sample = await loadSampleReportData();
      if (sample) {
        handleFileLoaded([sample]);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar exemplo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Linhas filtradas pelas redes selecionadas
  const filteredRows = useMemo(() => {
    if (!activeFile || !activeFile.rows) return [];
    return filterRowsByRedes(activeFile.rows, selectedRedes);
  }, [activeFile, selectedRedes]);

  // Linhas com busca textual da tabela
  const searchedRows = useMemo(() => {
    if (!tableSearch.trim()) return filteredRows;
    const term = tableSearch.toLowerCase();
    return filteredRows.filter((row) => {
      return Object.values(row).some((val) =>
        String(val || '').toLowerCase().includes(term)
      );
    });
  }, [filteredRows, tableSearch]);

  // Paginação
  const totalPages = Math.ceil(searchedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedRows.slice(start, start + pageSize);
  }, [searchedRows, currentPage]);

  // Métricas rápidas
  const stats = useMemo(() => {
    if (!filteredRows.length) {
      return { totalRows: 0, uniqueStores: 0, uniquePromoters: 0, ruptures: 0 };
    }
    const stores = new Set();
    const promoters = new Set();
    let ruptures = 0;

    filteredRows.forEach((r) => {
      const pdv = r['PDV'] || r['Loja'] || r['LOCAL'] || '';
      if (pdv) stores.add(pdv);
      const prom = r['PROMOTOR'] || r['Pessoa Nome'] || '';
      if (prom) promoters.add(prom);
      const rup = String(r['RUPTURA TOTAL?'] || r['PRODUTO EM RUPTURA?'] || '').toUpperCase();
      if (rup === 'SIM' || rup === 'S') ruptures++;
    });

    return {
      totalRows: filteredRows.length,
      uniqueStores: stores.size,
      uniquePromoters: promoters.size,
      ruptures,
    };
  }, [filteredRows]);

  // Alternar rede selecionada
  const toggleRede = (redeName) => {
    const next = new Set(selectedRedes);
    if (next.has(redeName)) {
      next.delete(redeName);
    } else {
      next.add(redeName);
    }
    setSelectedRedes(next);
    setCurrentPage(1);
  };

  const selectAllRedes = () => {
    if (!activeFile?.availableRedes) return;
    const all = new Set(activeFile.availableRedes.map((r) => r.name));
    setSelectedRedes(all);
    setCurrentPage(1);
  };

  const deselectAllRedes = () => {
    setSelectedRedes(new Set());
    setCurrentPage(1);
  };

  const exportExcelBatchOrSingle = async (generatorFn, zipPrefix) => {
    if (!activeFile) return;
    setLoading(true);
    try {
      if (files.length <= 1) {
        setLoadingMessage('Construindo Relatório Excel...');
        const { blob, fileName } = await generatorFn(activeFile, selectedRedes);
        downloadFile(blob, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return;
      }

      const zip = new JSZip();
      const usedNames = new Set();
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        setLoadingMessage(`Gerando arquivo ${i + 1} de ${files.length}: ${fileItem.originalFileName}...`);
        const fileRedes =
          i === activeFileIndex
            ? selectedRedes
            : new Set((fileItem.availableRedes || []).map((r) => r.name));
        const { blob, fileName } = await generatorFn(fileItem, fileRedes);
        let finalName = fileName;
        let counter = 2;
        while (usedNames.has(finalName)) {
          finalName = fileName.replace(/(\.[^.]+)$/, `_${counter}$1`);
          counter++;
        }
        usedNames.add(finalName);
        zip.file(finalName, blob);
      }

      setLoadingMessage('Compactando relatórios em arquivo .ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadFile(zipBlob, `${zipPrefix}_${dateStr}.zip`, 'application/zip');
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório Excel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Exportar Excel Oficial (único ou lote .ZIP)
  const handleExportOfficial = () =>
    exportExcelBatchOrSingle(generateOfficialExcelBlob, 'relatorios_oficiais');

  // Exportar Execução de Visitas (único ou lote .ZIP)
  const handleExportExecution = () =>
    exportExcelBatchOrSingle(generateVisitsExecutionBlob, 'execucao_visitas');

  // Exportar CSV (único ou lote .ZIP)
  const handleExportCsv = async () => {
    if (!activeFile) return;
    try {
      if (files.length <= 1) {
        const csv = buildCsv(activeFile.columns, filteredRows);
        const name = `${activeFile.originalFileName}_tratado.csv`;
        downloadFile(csv, name, 'text/csv;charset=utf-8;');
        return;
      }

      setLoading(true);
      setLoadingMessage('Compactando CSVs em arquivo .ZIP...');
      const zip = new JSZip();
      files.forEach((fileItem, i) => {
        const fileRedes =
          i === activeFileIndex
            ? selectedRedes
            : new Set((fileItem.availableRedes || []).map((r) => r.name));
        const rows = filterRowsByRedes(fileItem.rows || [], fileRedes);
        const csv = buildCsv(fileItem.columns, rows);
        zip.file(`${fileItem.originalFileName}_tratado.csv`, csv);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadFile(zipBlob, `relatorios_csv_${dateStr}.zip`, 'application/zip');
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar CSV: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '10px 0 80px 0', boxSizing: 'border-box' }}>
      {/* Header do Sistema de Relatórios */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0,
            }}
          >
            <FileSpreadsheet size={26} color="#f59e0b" />
            Sistema de Relatórios (Trade Marketing &amp; Deluc)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
            Converta dados brutos do uMov.me / Deluc no padrão dinâmico da Objetiva, com filtragem por redes e formatação nativa.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={16} />
          Usar Exemplo Deluc
        </button>
      </div>

      {/* Dropzone de Upload: compacto se já tiver arquivo, ou completo se estiver vazio */}
      {!activeFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#f59e0b';
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-card)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-card)';
            if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
          }}
          style={{
            background: 'var(--bg-card)',
            border: '2px dashed var(--border)',
            borderRadius: '18px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onClick={() => document.getElementById('report-file-input').click()}
        >
          <input
            id="report-file-input"
            type="file"
            accept=".csv, .xlsx, .xls"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) handleUploadFiles(e.target.files);
            }}
          />
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Upload size={30} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
            Arraste seus arquivos CSV ou Excel (.xlsx, .xls) aqui
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
            ou <span style={{ color: 'var(--primary)', fontWeight: 700 }}>clique para navegar</span> e selecionar do computador
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeFile.originalFileName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                ({activeFile.rows?.length?.toLocaleString('pt-BR')} linhas carregadas)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="report-file-input"
              type="file"
              accept=".csv, .xlsx, .xls"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) handleUploadFiles(e.target.files);
              }}
            />
            <button
              onClick={() => document.getElementById('report-file-input').click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-accent)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={13} />
              Importar Outro Arquivo
            </button>
          </div>
        </div>
      )}

      {/* Tabs se múltiplos arquivos forem carregados */}
      {files.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {files.map((f, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFileIndex(idx);
                if (f.availableRedes) {
                  setSelectedRedes(new Set(f.availableRedes.map((r) => r.name)));
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: idx === activeFileIndex ? '#f59e0b' : 'var(--border)',
                background: idx === activeFileIndex ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                color: idx === activeFileIndex ? '#f59e0b' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📄 {f.originalFileName}
            </button>
          ))}
        </div>
      )}

      {/* Se houver arquivo carregado */}
      {activeFile && (
        <>
          {/* Cards de Métricas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>
                <Layers size={14} color="#f59e0b" />
                TOTAL DE REGISTROS
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {stats.totalRows.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Linhas de atendimento ativas
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>
                <Store size={14} color="var(--primary)" />
                LOJAS / PDVS ÚNICOS
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {stats.uniqueStores}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Pontos de venda identificados
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>
                <Users size={14} color="#10b981" />
                PROMOTORES
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {stats.uniquePromoters}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Colaboradores em campo
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700 }}>
                <AlertCircle size={14} color="#ef4444" />
                RUPTURAS DETECTADAS
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
                {stats.ruptures}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Produtos em falta na gôndola
              </span>
            </div>
          </div>

          {/* Filtro por Rede Comercial */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Filter size={16} color="var(--primary)" />
                  Filtrar por Rede Comercial ({selectedRedes.size} de {activeFile.availableRedes?.length || 0} selecionadas)
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
                  Clique nas redes para incluir ou remover da prévia e da exportação do relatório.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={selectAllRedes}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-accent)',
                    color: 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Selecionar Todas
                </button>
                <button
                  onClick={deselectAllRedes}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-accent)',
                    color: 'var(--text-dim)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Limpar Seleção
                </button>
              </div>
            </div>

            {/* Badges clicáveis das Redes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {(activeFile.availableRedes || []).map((r) => {
                const isSelected = selectedRedes.has(r.name);
                return (
                  <button
                    key={r.name}
                    onClick={() => toggleRede(r.name)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'var(--border)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-accent)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-dim)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} color="var(--primary)" />}
                    <span>{r.name}</span>
                    <span
                      style={{
                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#fff' : 'var(--text-dim)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                      }}
                    >
                      {r.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barra de Ações de Exportação */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '18px',
              padding: '18px 22px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>
                🚀 Exportação Rápida
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Exporte os dados tratados com estilo executivo, fórmulas e cabeçalhos automáticos.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportOfficial}
                disabled={loading || filteredRows.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <Download size={15} />
                {files.length > 1
                  ? `Exportar Todos em Excel (${files.length} arquivos .ZIP)`
                  : 'Exportar Relatório Excel Oficial'}
              </button>

              <button
                onClick={handleExportExecution}
                disabled={loading || filteredRows.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FileSpreadsheet size={15} />
                Modelo Execução de Visitas
              </button>

              <button
                onClick={handleExportCsv}
                disabled={loading || filteredRows.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FileText size={15} />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Prévia dos Dados em Tabela */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Prévia dos Dados Tratados ({searchedRows.length.toLocaleString('pt-BR')} registros)
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
                  Mostrando página {currentPage} de {totalPages} ({pageSize} registros por página).
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Search
                    size={14}
                    color="var(--text-dim)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Filtrar dados da tabela..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-accent)',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-accent)',
                      color: 'var(--text-main)',
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage <= 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-accent)',
                      color: 'var(--text-main)',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage >= totalPages ? 0.4 : 1,
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela com scroll horizontal e vertical */}
            <div
              style={{
                maxHeight: '600px',
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-dim)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Data</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Rede</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Loja / PDV</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Promotor</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Item / SKU</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Ruptura</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Preço</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                        Nenhum registro encontrado para os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => {
                      const rede = getRowRede(row);
                      const isRupture = String(row['RUPTURA TOTAL?'] || row['PRODUTO EM RUPTURA?'] || '').toUpperCase() === 'SIM';

                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '8px 14px', color: 'var(--text-dim)' }}>
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>
                            {row['DATA DO DIA'] || row['DATA'] || '--'}
                          </td>
                          <td style={{ padding: '8px 14px' }}>
                            <span
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '11px',
                              }}
                            >
                              {rede}
                            </span>
                          </td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {row['PDV'] || row['Loja'] || '--'}
                          </td>
                          <td style={{ padding: '8px 14px', color: 'var(--text-dim)' }}>
                            {row['PROMOTOR'] || '--'}
                          </td>
                          <td style={{ padding: '8px 14px', color: 'var(--text-main)' }}>
                            {row['ITENS'] || row['SKU'] || '--'}
                          </td>
                          <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                            {isRupture ? (
                              <span style={{ color: '#ef4444', fontWeight: 800 }}>SIM</span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>NÃO</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {row['PRECO'] || '--'}
                          </td>
                          <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {row['QTD. UNIDADE NO ESTOQUE'] || row['ESTOQUE'] || '--'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <RefreshCw size={36} color="#f59e0b" className="animate-spin" />
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>
            {loadingMessage || 'Processando dados...'}
          </div>
        </div>
      )}
    </div>
  );
}

