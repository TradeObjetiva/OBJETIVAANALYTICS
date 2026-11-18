import React, { useState } from 'react';
import { RefreshCw, Filter, Calendar, Zap } from 'lucide-react';
import { useProductivity } from '../hooks/useProductivity.js';
import { ShortVisitsTable } from '../components/dashboard/ShortVisitsTable.jsx';
import { RealtimeFeed } from '../components/dashboard/RealtimeFeed.jsx';
import { KpiDetailsModal } from '../components/modals/KpiDetailsModal.jsx';
import { VisitAuditModal } from '../components/modals/VisitAuditModal.jsx';

export function Dashboard() {
  const {
    loading,
    projects,
    selectedProject,
    setSelectedProject,
    periodDays,
    setPeriodDays,
    metrics,
    detailedShortVisits,
    detailedOpenVisits,
    refetch,
  } = useProductivity();

  // Estados dos modais
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [kpiModalType, setKpiModalType] = useState('curtas');

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const handleOpenKpiModal = (type) => {
    setKpiModalType(type);
    setKpiModalOpen(true);
  };

  const handleAuditVisit = (visitItem) => {
    setSelectedVisit(visitItem);
    setAuditModalOpen(true);
  };

  const handleSelectCheckinFromFeed = (checkinItem) => {
    const parts = (checkinItem.activity_id || '').split(';');
    const clientParts = (checkinItem.client_id || '').split(';');
    const agentName = parts[0]?.trim() || 'Agente';
    const storeName = clientParts[0]?.trim() || 'Loja';
    const localId = clientParts[1]?.trim() || null;

    setSelectedVisit({
      agentName,
      clientId: storeName,
      laivonLocalId: localId,
      inTime: checkinItem.created_at,
      outTime: checkinItem.task_id?.toUpperCase().includes('OUT') ? checkinItem.created_at : null,
      durationMin: 0,
    });
    setAuditModalOpen(true);
  };

  const getCycleDisplayText = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const days = parseInt(periodDays, 10) || 0;
    if (days === 0) return `${today} (Hoje)`;
    const past = new Date();
    past.setDate(past.getDate() - days);
    return `${past.toLocaleDateString('pt-BR')} até ${today}`;
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '10px 0' }}>
      {/* Topo do Dashboard */}
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
            <Zap size={24} color="#f59e0b" />
            Dashboard de Visitas Curtas &amp; Produtividade
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
            Audite atendimentos abaixo de 30 minutos e acompanhe os check-ins em tempo real.
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Barra de Filtros (Projeto e Ciclo) */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro Projeto */}
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Filter size={12} /> PROJETO:
            </span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                marginTop: '4px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="TODOS">TODOS OS PROJETOS</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Ciclo */}
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={12} /> PERÍODO DO CICLO:
            </span>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              style={{
                marginTop: '4px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={0}>📅 Hoje (Dia Atual)</option>
              <option value={7}>🗓️ Últimos 7 dias</option>
              <option value={15}>🗓️ Últimos 15 dias</option>
              <option value={30}>🗓️ Últimos 30 dias (Ciclo Completo)</option>
            </select>
          </div>
        </div>

        {/* Data formatada */}
        <div style={{ textTransform: 'capitalize', textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
            Período Selecionado:
          </span>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {getCycleDisplayText()}
          </div>
        </div>
      </div>

      {/* Grid Principal: Visitas Curtas à Esquerda + Feed Realtime com Fotos Ampliadas à Direita */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 440px)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Coluna Esquerda: Somente a Tabela de Visitas Curtas (< 30 min) */}
        <div>
          <ShortVisitsTable
            shortVisits={detailedShortVisits}
            loading={loading}
            onAuditVisit={handleAuditVisit}
          />
        </div>

        {/* Coluna Direita: Feed Realtime com Fotos */}
        <div>
          <RealtimeFeed onSelectCheckin={handleSelectCheckinFromFeed} />
        </div>
      </div>

      {/* Modais */}
      <KpiDetailsModal
        isOpen={kpiModalOpen}
        type={kpiModalType}
        items={kpiModalType === 'curtas' ? detailedShortVisits : detailedOpenVisits}
        cycleText={getCycleDisplayText()}
        onClose={() => setKpiModalOpen(false)}
        onSelectVisit={handleAuditVisit}
      />

      <VisitAuditModal
        isOpen={auditModalOpen}
        visit={selectedVisit}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
