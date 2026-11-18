import React, { useState, useMemo } from 'react';
import { Search, Zap, MapPin } from 'lucide-react';

export function ShortVisitsTable({ shortVisits, loading, onAuditVisit }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return shortVisits;
    const term = searchTerm.toLowerCase();
    return shortVisits.filter(
      (v) =>
        (v.agentName || '').toLowerCase().includes(term) ||
        (v.clientId || '').toLowerCase().includes(term)
    );
  }, [shortVisits, searchTerm]);

  const formatTime = (time) => {
    if (!time) return '--:--';
    try {
      const d = time instanceof Date ? time : new Date(time);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '18px',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header da Tabela */}
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
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
            }}
          >
            <Zap size={18} color="#f59e0b" />
            Tabela de Visitas Curtas (&lt; 30 min)
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            Atendimentos com tempo em loja inferior a 30 minutos detectados no período.
          </p>
        </div>

        {/* Busca e Contador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={14}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por promotor ou loja..."
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

          <span
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {filtered.length} visitas
          </span>
        </div>
      </div>

      {/* Container com Rolagem da Tabela */}
      <div
        style={{
          maxHeight: '640px',
          overflowY: 'auto',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-dim)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <th style={{ padding: '12px 16px' }}>Promotor</th>
              <th style={{ padding: '12px 16px' }}>Loja / PDV</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Entrada</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Saída</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tempo em Loja</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-dim)' }}>
                  Carregando visitas curtas...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-dim)' }}>
                  🎉 Nenhuma visita curta encontrada para este filtro!
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const inStr = formatTime(item.inTime);
                const outStr = formatTime(item.outTime);
                const duration = item.durationMin > 0 ? `${item.durationMin} min` : '0 min';

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          {item.agentName ? item.agentName.substring(0, 2).toUpperCase() : 'AG'}
                        </div>
                        {item.agentName}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} color="var(--primary)" />
                        {item.clientId}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>
                      <span style={{ color: '#10b981' }}>{inStr}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>
                      <span style={{ color: 'var(--primary)' }}>{outStr}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '12px',
                        }}
                      >
                        ⚡ {duration}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

