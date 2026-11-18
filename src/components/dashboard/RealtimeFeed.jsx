import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, User, Image as ImageIcon } from 'lucide-react';
import { useRealtimeCheckins } from '../../hooks/useRealtimeCheckins.js';

export function RealtimeFeed({ onSelectCheckin }) {
  const {
    checkins,
    totalCount,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
  } = useRealtimeCheckins();

  const [expandedPhoto, setExpandedPhoto] = useState(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const parseActivity = (activityId) => {
    if (!activityId) return { name: 'Agente', photoUrl: null };
    const parts = activityId.split(';');
    const name = parts[0]?.trim() || 'Agente';
    const photoPart = parts.find((p) => p.trim().toLowerCase().startsWith('http'));
    return {
      name,
      photoUrl: photoPart ? photoPart.trim() : null,
    };
  };

  const parseClient = (clientId) => {
    if (!clientId) return 'Loja não informada';
    return clientId.split(';')[0]?.trim() || clientId;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
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
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
          {totalCount} eventos hoje
        </div>
      </div>

      {/* Busca Compacta */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
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

      {/* Lista de Eventos com Rolagem */}
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
        ) : checkins.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            Nenhum check-in registrado para esta pesquisa.
          </div>
        ) : (
          checkins.map((item, idx) => {
            const { name, photoUrl: parsedPhoto } = parseActivity(item.activity_id);
            const photoUrl =
              item.photo_url ||
              item.photoUrl ||
              parsedPhoto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128&bold=true`;

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
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                {/* Foto Ampliada do Promotor / Check-in com fallback */}
                <div
                  onClick={(e) => {
                    if (parsedPhoto) {
                      e.stopPropagation();
                      setExpandedPhoto(parsedPhoto);
                    }
                  }}
                  title={parsedPhoto ? 'Clique para ampliar a foto' : name}
                  style={{
                    width: '66px',
                    height: '66px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#111',
                    border: `2px solid ${isCheckout ? '#ef4444' : '#10b981'}`,
                    boxShadow: `0 4px 14px ${isCheckout ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                    flexShrink: 0,
                    position: 'relative',
                    cursor: parsedPhoto ? 'zoom-in' : 'pointer',
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128&bold=true`;
                    }}
                  />
                  {/* Badge de tipo de registro no cantinho da foto */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '2px solid #000',
                      background: isCheckout ? '#ef4444' : '#10b981',
                      boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1, minWidth: 0, paddingLeft: '4px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      lineHeight: '1.2',
                    }}
                  >
                    <MapPin size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {storeName}
                    </span>
                  </div>
                </div>

                {/* Horário e Badge */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isCheckout ? '#ef4444' : '#10b981',
                      display: 'block',
                    }}
                  >
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

      {/* Lightbox / Zoom da Foto ao Clicar */}
      {expandedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setExpandedPhoto(null)}
        >
          <img
            src={expandedPhoto}
            alt="Foto do Check-in"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '14px',
              objectFit: 'contain',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  );
}
