import React, { useState, useMemo } from 'react';
import { Search, User, Briefcase, Clock, Store } from 'lucide-react';

export function PromoterHoursTable({ promoters, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPromoters = useMemo(() => {
    if (!searchTerm.trim()) return promoters;
    const term = searchTerm.toLowerCase();
    return promoters.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.project.toLowerCase().includes(term) ||
        p.equipe.toLowerCase().includes(term)
    );
  }, [promoters, searchTerm]);

  const formatMin = (m) => {
    if (!m) return '0min';
    const h = Math.floor(m / 60);
    const r = m % 60;
    return h > 0 ? `${h}h ${r}min` : `${r}min`;
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        padding: '20px',
        marginTop: '10px',
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
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
            }}
          >
            <User size={18} color="var(--primary)" />
            Carga Horária Efetiva por Promotor
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            Métrica calculada pelo intervalo exato entre Check-in e Check-out
          </p>
        </div>

        {/* Campo de Busca Rápida */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por promotor ou equipe..."
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
      </div>

      {/* Container da Tabela */}
      <div
        style={{
          maxHeight: '480px',
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
              <th style={{ padding: '12px 16px' }}>Projeto / Equipe</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Lojas Atendidas</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Média / Loja</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total em Loja</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-dim)' }}>
                  Carregando produtividade da equipe...
                </td>
              </tr>
            ) : filteredPromoters.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-dim)' }}>
                  Nenhum registro encontrado para este filtro.
                </td>
              </tr>
            ) : (
              filteredPromoters.map((p, idx) => {
                const avgMin =
                  p.completedCount > 0 ? Math.round(p.totalDurationMin / p.completedCount) : 0;
                return (
                  <tr
                    key={p.name + idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          {p.name.substring(0, 2)}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#818cf8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {p.project}
                        </span>
                        {p.equipe && p.equipe !== 'GERAL' && (
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-dim)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                            }}
                          >
                            {p.equipe}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-main)' }}>{p.visitsCount}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '4px' }}>
                        ({p.completedCount} ok)
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: avgMin < 30 && avgMin > 0 ? '#f59e0b' : 'var(--text-main)',
                      }}
                    >
                      {formatMin(avgMin)}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontWeight: 800,
                        color: '#10b981',
                      }}
                    >
                      {formatMin(p.totalDurationMin)}
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

