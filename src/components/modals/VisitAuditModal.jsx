import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, CheckCircle, AlertTriangle, Zap, Camera, FileText } from 'lucide-react';
import { fetchLaivonAuditData } from '../../services/laivon.js';

export function VisitAuditModal({ isOpen, visit, onClose }) {
  const [loadingLaivon, setLoadingLaivon] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (!isOpen || !visit) return;

    let isMounted = true;
    setLoadingLaivon(true);
    setTasks([]);
    setPhotos([]);

    fetchLaivonAuditData()
      .then(({ photos: allPhotos, tasks: allTasks, locals }) => {
        if (!isMounted) return;

        const cleanStr = (s) =>
          (s || '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const agentClean = cleanStr(visit.agentName);
        const storeClean = cleanStr(visit.clientId);
        const localId = visit.laivonLocalId;

        // 1. Filtrar tarefas pertinentes
        const matchedTasks = allTasks.filter((t) => {
          if (localId && (String(t.id_integration) === String(localId) || String(t.id) === String(localId))) {
            return true;
          }
          const taskAgent = cleanStr(t.user_name || t.agent_name || '');
          const taskStore = cleanStr(t.local_name || t.store_name || '');
          return taskAgent.includes(agentClean) || taskStore.includes(storeClean);
        });

        // 2. Filtrar fotos pertinentes
        const matchedPhotos = allPhotos.filter((p) => {
          if (localId && String(p.id_local) === String(localId)) return true;
          const photoAgent = cleanStr(p.user_name || '');
          const photoStore = cleanStr(p.local_name || '');
          return photoAgent.includes(agentClean) || photoStore.includes(storeClean);
        });

        setTasks(matchedTasks.slice(0, 15));
        setPhotos(matchedPhotos.slice(0, 20));
      })
      .catch((err) => {
        console.error('[VisitAuditModal] Erro ao carregar dados Laivon:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingLaivon(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, visit]);

  if (!isOpen || !visit) return null;

  const inTimeStr = visit.inTime
    ? (visit.inTime instanceof Date ? visit.inTime : new Date(visit.inTime)).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const outTimeStr = visit.outTime
    ? (visit.outTime instanceof Date ? visit.outTime : new Date(visit.outTime)).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const isPending = !visit.outTime;
  const isShort = !isPending && visit.durationMin > 0 && visit.durationMin < 30;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '94%',
          maxWidth: '920px',
          maxHeight: '90vh',
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
        {/* Header do Modal com Avatar e Loja */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              {visit.agentName ? visit.agentName.substring(0, 2).toUpperCase() : 'AG'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {visit.agentName}
              </h3>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <MapPin size={13} /> {visit.clientId}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isPending ? (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertTriangle size={14} /> Em Aberto
              </span>
            ) : isShort ? (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Zap size={14} /> Visita Curta
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle size={14} /> Visita Padrão
              </span>
            )}
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
        </div>

        {/* Corpo Dividido: Metadados à Esquerda + Laivon à Direita */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 300px) 1fr',
            gap: '20px',
          }}
        >
          {/* Painel Esquerdo: Registro de Presença */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Registro de Presença
            </h4>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                Entrada (Check-In)
              </span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                {inTimeStr}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                Saída (Check-Out)
              </span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {outTimeStr}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                Tempo em Loja
              </span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                {visit.durationMin > 0 ? `${visit.durationMin} min` : isPending ? 'Em andamento' : '0 min'}
              </div>
            </div>

            {/* Diagnóstico */}
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                fontSize: '12px',
                lineHeight: '1.4',
                background: isPending
                  ? 'rgba(239, 68, 68, 0.08)'
                  : isShort
                  ? 'rgba(245, 158, 11, 0.08)'
                  : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${
                  isPending
                    ? 'rgba(239, 68, 68, 0.25)'
                    : isShort
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(16, 185, 129, 0.25)'
                }`,
                color: isPending ? '#ef4444' : isShort ? '#f59e0b' : '#10b981',
                fontWeight: 600,
              }}
            >
              {isPending
                ? '⚠️ O promotor ainda não registrou a saída. A permanência continua ativa.'
                : isShort
                ? '⚡ Visita com duração inferior a 30 minutos. Audite as evidências e tarefas ao lado.'
                : '✅ Tempo de atendimento adequado ao padrão do roteiro.'}
            </div>
          </div>

          {/* Painel Direito: Laivon API Evidências */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tarefas e Formulários */}
            <div>
              <h4
                style={{
                  margin: '0 0 10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={16} color="var(--primary)" />
                Tarefas e Pesquisas Registradas (API Laivon)
              </h4>
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--bg-card)',
                  padding: '8px',
                }}
              >
                {loadingLaivon ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Consultando tarefas na Laivon...
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Nenhuma tarefa vinculada diretamente a este atendimento.
                  </div>
                ) : (
                  tasks.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {t.name || t.title || 'Tarefa Laivon'}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                        {t.status || 'Concluída'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Galeria de Fotos */}
            <div>
              <h4
                style={{
                  margin: '0 0 10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Camera size={16} color="var(--primary)" />
                Evidências Fotográficas da Loja
              </h4>
              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--bg-card)',
                  padding: '12px',
                }}
              >
                {loadingLaivon ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Buscando fotos da visita...
                  </div>
                ) : photos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Nenhuma foto enviada para este local no período.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {photos.map((p, idx) => {
                      const imgUrl = p.url || p.photo_url || p.thumb_url;
                      return (
                        <div
                          key={p.id || idx}
                          onClick={() => setSelectedPhoto(imgUrl)}
                          style={{
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            position: 'relative',
                            background: '#000',
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt="Evidência"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            🔗 Dados cruzados via <strong>uMov.me Webhook</strong> &amp; <strong>Laivon API</strong>
          </div>
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

      {/* Lightbox / Zoom de Foto */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Evidência Expandida"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}

