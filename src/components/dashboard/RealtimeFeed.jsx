import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useRealtimeCheckins } from '../../hooks/useRealtimeCheckins.js';

const STATUS_META = {
  em_loja: {
    label: 'Em Loja',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  curta: {
    label: 'Visita Curta',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  concluida: {
    label: 'Concluída',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.14)',
    border: 'rgba(99, 102, 241, 0.35)',
  },
  sem_entrada: {
    label: 'Sem Entrada',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.35)',
  },
};

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  try {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function RealtimeFeed({ onSelectCheckin, allowedProjects = null, selectedProject = 'TODOS', staffProjectMap = {} }) {
  const {
    visits,
    totalVisitsCount,
    checkins,
    totalCount,
    filteredRawCount,
    statusCounts,
    statusFilter,
    setStatusFilter,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
  } = useRealtimeCheckins({ allowedProjects, selectedProject, staffProjectMap });

  const [viewMode, setViewMode] = useState('visits'); // 'visits' | 'events'
  const [expandedPhotos, setExpandedPhotos] = useState(null); // { inUrl, outUrl, title }

  const activeTotal = viewMode === 'visits' ? totalVisitsCount : filteredRawCount;
  const totalPages = Math.ceil(activeTotal / pageSize) || 1;

  const fallbackAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128&bold=true`;

  const parseActivity = (activityId) => {
    if (!activityId) return { name: 'Agente', photoUrl: null };
    const parts = activityId.split(';');
    const name = parts[0]?.trim() || 'Agente';
    const photoPart = parts.find((p) => p.trim().toLowerCase().startsWith('http'));
    return { name, photoUrl: photoPart ? photoPart.trim() : null };
  };

  const parseClient = (clientId) => {
    if (!clientId) return 'Loja não informada';
    return clientId.split(';')[0]?.trim() || clientId;
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '850px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Header do Feed */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'pulse 2s infinite',
            }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '0.5px',
            }}
          >
            AO VIVO COM FOTOS
          </h3>
        </div>

        {/* Toggle Visitas (Unificado) vs Eventos (Bruto) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-accent)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border)',
            }}
          >
            {[
              { id: 'visits', label: `Visitas (${statusCounts.all})` },
              { id: 'events', label: `Eventos (${totalCount})` },
            ].map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setViewMode(tab.id);
                    setCurrentPage(0);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-dim)',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtros de Status (no modo Visitas) + Busca */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {viewMode === 'visits' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `Todas (${statusCounts.all})`, color: 'var(--primary)' },
              { id: 'em_loja', label: `🟢 Em Loja (${statusCounts.em_loja})`, color: '#10b981' },
              { id: 'curta', label: `⚡ Curtas (${statusCounts.curta})`, color: '#f59e0b' },
              { id: 'concluida', label: `✅ Concluídas (${statusCounts.concluida})`, color: '#6366f1' },
            ].map((pill) => {
              const active = statusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  style={{
                    border: `1px solid ${active ? pill.color : 'var(--border)'}`,
                    background: active ? `${pill.color}22` : 'transparent',
                    color: active ? 'var(--text-main)' : 'var(--text-dim)',
                    borderRadius: '999px',
                    padding: '3px 9px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por promotor ou loja..."
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              borderRadius: '8px',
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

      {/* Lista Unificada ou Bruta */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            Sincronizando eventos...
          </div>
        ) : viewMode === 'visits' ? (
          visits.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Nenhuma visita registrada para este filtro.
            </div>
          ) : (
            visits.map((visit) => {
              const meta = STATUS_META[visit.status] || STATUS_META.concluida;
              const inTimeStr = formatTime(visit.inTime);
              const outTimeStr = formatTime(visit.outTime);
              const mainPhoto = visit.outPhotoUrl || visit.inPhotoUrl || fallbackAvatar(visit.agentName);
              const hasBothPhotos = Boolean(visit.inPhotoUrl && visit.outPhotoUrl);

              return (
                <div
                  key={visit.id}
                  onClick={() => onSelectCheckin && onSelectCheckin(visit)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${visit.status === 'em_loja' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor =
                      visit.status === 'em_loja' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  {/* Miniatura(s) de Entrada / Saída */}
                  <div
                    onClick={(e) => {
                      if (visit.inPhotoUrl || visit.outPhotoUrl) {
                        e.stopPropagation();
                        setExpandedPhotos({
                          inUrl: visit.inPhotoUrl,
                          outUrl: visit.outPhotoUrl,
                          title: `${visit.agentName} • ${visit.storeName}`,
                        });
                      }
                    }}
                    title={visit.inPhotoUrl || visit.outPhotoUrl ? 'Clique para ampliar fotos da visita' : visit.agentName}
                    style={{
                      position: 'relative',
                      width: hasBothPhotos ? '74px' : '62px',
                      height: '62px',
                      flexShrink: 0,
                      cursor: visit.inPhotoUrl || visit.outPhotoUrl ? 'zoom-in' : 'pointer',
                    }}
                  >
                    {hasBothPhotos ? (
                      <>
                        <img
                          src={visit.inPhotoUrl}
                          alt="Entrada"
                          loading="lazy"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '2px solid #10b981',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            background: '#111',
                          }}
                        />
                        <img
                          src={visit.outPhotoUrl}
                          alt="Saída"
                          loading="lazy"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '2px solid #ef4444',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: '#111',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                          }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          width: '62px',
                          height: '62px',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: `2px solid ${meta.color}`,
                          background: '#111',
                        }}
                      >
                        <img
                          src={mainPhoto}
                          alt={visit.agentName}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackAvatar(visit.agentName);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Informações + Timeline Entrada -> Saída */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {visit.agentName}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: meta.color,
                          background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          padding: '2px 6px',
                          borderRadius: '5px',
                          textTransform: 'uppercase',
                          flexShrink: 0,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '3px',
                      }}
                    >
                      <MapPin size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {visit.storeName}
                      </span>
                    </div>

                    {/* Timeline Unificada */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {visit.inTime ? (
                        <span style={{ color: '#10b981' }}>🟢 {inTimeStr}</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}>⚠️ --:--</span>
                      )}

                      <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>──</span>

                      {visit.outTime ? (
                        <>
                          <span style={{ color: visit.status === 'curta' ? '#f59e0b' : 'var(--text-main)' }}>
                            {formatDuration(visit.durationMin)}
                          </span>
                          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>──</span>
                          <span style={{ color: '#ef4444' }}>🔴 {outTimeStr}</span>
                        </>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 700 }}>
                          Atendendo agora...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : checkins.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            Nenhum check-in registrado para esta pesquisa.
          </div>
        ) : (
          checkins.map((item, idx) => {
            const { name, photoUrl: parsedPhoto } = parseActivity(item.activity_id);
            const photoUrl = item.photo_url || item.photoUrl || parsedPhoto || fallbackAvatar(name);
            const storeName = parseClient(item.client_id);
            const timeStr = formatTime(item.created_at);
            const isCheckout =
              item.task_id?.toUpperCase().includes('OUT') ||
              item.task_id?.toUpperCase().includes('SAIDA') ||
              item.task_id?.toUpperCase().includes('SAÍDA');

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectCheckin && onSelectCheckin(item)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  onClick={(e) => {
                    if (parsedPhoto) {
                      e.stopPropagation();
                      setExpandedPhotos({
                        inUrl: !isCheckout ? parsedPhoto : null,
                        outUrl: isCheckout ? parsedPhoto : null,
                        title: `${name} • ${storeName}`,
                      });
                    }
                  }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#111',
                    border: `2px solid ${isCheckout ? '#ef4444' : '#10b981'}`,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackAvatar(name);
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>{name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <MapPin size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: isCheckout ? '#ef4444' : '#10b981', display: 'block' }}>
                    {timeStr}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      color: isCheckout ? '#ef4444' : '#10b981',
                      background: isCheckout ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      display: 'inline-block',
                      marginTop: '2px',
                    }}
                  >
                    {isCheckout ? 'Saída' : 'Entrada'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer com Paginação */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Página {currentPage + 1} de {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-accent)',
              color: currentPage === 0 ? 'var(--text-dim)' : 'var(--text-main)',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-accent)',
              color: currentPage >= totalPages - 1 ? 'var(--text-dim)' : 'var(--text-main)',
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Lightbox Comparativo Entrada / Saída */}
      {expandedPhotos && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(6px)',
            zIndex: 10002,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '16px',
            overflowY: 'auto',
          }}
          onClick={() => setExpandedPhotos(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: expandedPhotos.inUrl && expandedPhotos.outUrl ? '1080px' : '640px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{expandedPhotos.title}</div>
              <button
                type="button"
                onClick={() => setExpandedPhotos(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  expandedPhotos.inUrl && expandedPhotos.outUrl ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                gap: '16px',
                alignItems: 'start',
              }}
            >
              {expandedPhotos.inUrl && (
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <div style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>
                    🟢 ENTRADA
                  </div>
                  <div
                    style={{
                      background: '#0b0f1a',
                      borderRadius: '14px',
                      border: '2px solid #10b981',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxHeight: '68vh',
                    }}
                  >
                    <img
                      src={expandedPhotos.inUrl}
                      alt="Entrada"
                      style={{
                        width: '100%',
                        maxHeight: '68vh',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              )}
              {expandedPhotos.outUrl && (
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>
                    🔴 SAÍDA
                  </div>
                  <div
                    style={{
                      background: '#0b0f1a',
                      borderRadius: '14px',
                      border: '2px solid #ef4444',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxHeight: '68vh',
                    }}
                  >
                    <img
                      src={expandedPhotos.outUrl}
                      alt="Saída"
                      style={{
                        width: '100%',
                        maxHeight: '68vh',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
