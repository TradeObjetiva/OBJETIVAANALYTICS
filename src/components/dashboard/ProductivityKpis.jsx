import React from 'react';
import { Zap, Store, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

export function ProductivityKpis({ metrics, loading, onOpenModal }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              height: '90px',
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    );
  }

  const shortRate =
    metrics.completedVisits > 0
      ? Math.round((metrics.shortVisitsCount / metrics.completedVisits) * 100)
      : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {/* 1. DESTAQUE PRINCIPAL: Visitas Curtas (< 30 min) */}
      <div
        className="metric-card interactive"
        onClick={() => onOpenModal && onOpenModal('curtas')}
        title="Clique para auditar as visitas menores que 30 minutos"
        style={{
          padding: '18px',
          borderRadius: '16px',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), var(--bg-card))',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={15} /> Visitas Curtas (&lt; 30 min)
          </span>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800,
            }}
          >
            {shortRate}% das visitas
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#f59e0b',
            marginTop: '8px',
            letterSpacing: '-0.5px',
          }}
        >
          {metrics.shortVisitsCount}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            marginTop: '4px',
            fontWeight: 600,
          }}
        >
          atendimentos abaixo do tempo mínimo
        </div>
      </div>

      {/* 2. Total de Visitas Concluídas */}
      <div
        className="metric-card"
        style={{
          padding: '18px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Visitas Concluídas
          </span>
          <Store size={18} color="var(--primary)" />
        </div>
        <div
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginTop: '8px',
          }}
        >
          {metrics.completedVisits}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#10b981',
            marginTop: '4px',
            fontWeight: 600,
          }}
        >
          de {metrics.totalVisits} registros totais
        </div>
      </div>

      {/* 3. Lojas em Aberto */}
      <div
        className="metric-card interactive"
        onClick={() => onOpenModal && onOpenModal('abertas')}
        title="Clique para auditar lojas que ainda não tiveram saída registrada"
        style={{
          padding: '18px',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          background: 'var(--bg-card)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#ef4444',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={14} /> Lojas em Aberto
          </span>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800,
            }}
          >
            Sem Check-Out
          </span>
        </div>
        <div
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: '#ef4444',
            marginTop: '8px',
          }}
        >
          {metrics.openVisitsCount}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#ef4444',
            marginTop: '4px',
            fontWeight: 600,
          }}
        >
          atendimentos ainda não finalizados
        </div>
      </div>

      {/* 4. Horas Acumuladas em Loja */}
      <div
        className="metric-card"
        style={{
          padding: '18px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Horas em Loja
          </span>
          <Clock size={18} color="#10b981" />
        </div>
        <div
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: '#10b981',
            marginTop: '8px',
          }}
        >
          {metrics.totalHoursStr}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            marginTop: '4px',
            fontWeight: 600,
          }}
        >
          tempo total acumulado no período
        </div>
      </div>
    </div>
  );
}
