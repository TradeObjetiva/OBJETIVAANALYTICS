import React from 'react';
import { X, Clock, AlertTriangle, Zap, Store } from 'lucide-react';

export function KpiDetailsModal({ isOpen, type, items, cycleText, onClose, onSelectVisit }) {
  if (!isOpen) return null;

  const isShort = type === 'curtas';
  const title = isShort ? '⚡ Visitas Curtas (< 30 min)' : '🏪 Lojas em Aberto (Sem Check-Out)';
  const subtitle = cycleText || 'Período atual';

  const formatTime = (dateObj) => {
    if (!dateObj) return '--:--';
    try {
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '92%',
          maxWidth: '820px',
          maxHeight: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: isShort ? '#f59e0b' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isShort ? <Zap size={20} /> : <AlertTriangle size={20} />}
              {title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
              {subtitle} • {items.length} ocorrências encontradas
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabela de Ocorrências */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Nenhum registro encontrado para este filtro.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '10px 12px' }}>Colaborador</th>
                  <th style={{ padding: '10px 12px' }}>Loja / PDV</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Entrada</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Saída</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Tempo / Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const inStr = formatTime(item.inTime);
                  const outStr = formatTime(item.outTime);
                  const durationText =
                    item.durationMin > 0
                      ? `${item.durationMin} min`
                      : isShort
                      ? '0 min'
                      : 'Em andamento';
                  const statusColor = isShort ? '#f59e0b' : '#ef4444';

                  return (
                    <tr
                      key={idx}
                      onClick={() => onSelectVisit && onSelectVisit(item)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      title="Clique para auditar fotos e tarefas desta visita"
                    >
                      <td style={{ padding: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {item.agentName}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {item.clientId}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{inStr}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{outStr}</td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 800,
                          color: statusColor,
                        }}
                      >
                        {durationText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

