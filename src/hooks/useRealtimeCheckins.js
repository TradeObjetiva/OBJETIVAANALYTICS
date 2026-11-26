import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase.js';

function parseCheckinItem(item) {
  const actParts = (item.activity_id || '').split(';');
  const agentName = actParts[0]?.trim() || 'Agente';
  const parsedPhoto = actParts.find((p) => p.trim().toLowerCase().startsWith('http'))?.trim() || null;
  const photoUrl = item.photo_url || item.photoUrl || parsedPhoto || null;

  const clientParts = (item.client_id || '').split(';');
  const storeName = clientParts[0]?.trim() || 'Loja não informada';
  const laivonLocalId = clientParts[1]?.trim() || null;

  const taskUpper = (item.task_id || '').toUpperCase();
  const isCheckout =
    taskUpper.includes('OUT') || taskUpper.includes('SAIDA') || taskUpper.includes('SAÍDA');

  const eventDate = new Date(item.history_id || item.created_at);
  const validDate = isNaN(eventDate.getTime()) ? new Date(item.created_at) : eventDate;

  return {
    agentName,
    storeName,
    laivonLocalId,
    photoUrl,
    isCheckout,
    eventDate: validDate,
  };
}

/**
 * Pareia eventos brutos de check-in e check-out do dia em visitas unificadas.
 */
function pairTodayVisits(rawEvents) {
  const chronological = [...rawEvents].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const openByPair = new Map();
  const visits = [];

  for (const ev of chronological) {
    const { agentName, storeName, laivonLocalId, photoUrl, isCheckout, eventDate } =
      parseCheckinItem(ev);
    const pairKey = `${agentName.toUpperCase()}__${storeName.toUpperCase()}`;

    if (!isCheckout) {
      const visit = {
        id: `visit-${ev.id || `${pairKey}-${eventDate.getTime()}`}`,
        agentName,
        storeName,
        laivonLocalId,
        inTime: ev.created_at,
        outTime: null,
        inDate: eventDate,
        outDate: null,
        inPhotoUrl: photoUrl,
        outPhotoUrl: null,
        durationMin: 0,
        status: 'em_loja',
        lastActivityAt: eventDate.getTime(),
      };
      openByPair.set(pairKey, visit);
      visits.push(visit);
    } else {
      const openVisit = openByPair.get(pairKey);
      if (openVisit) {
        const durationMin = Math.max(0, Math.round((eventDate - openVisit.inDate) / 60000));
        openVisit.outTime = ev.created_at;
        openVisit.outDate = eventDate;
        openVisit.outPhotoUrl = photoUrl;
        openVisit.durationMin = durationMin;
        openVisit.status = durationMin < 30 ? 'curta' : 'concluida';
        openVisit.lastActivityAt = eventDate.getTime();
        if (!openVisit.laivonLocalId && laivonLocalId) {
          openVisit.laivonLocalId = laivonLocalId;
        }
        openByPair.delete(pairKey);
      } else {
        visits.push({
          id: `visit-out-${ev.id || `${pairKey}-${eventDate.getTime()}`}`,
          agentName,
          storeName,
          laivonLocalId,
          inTime: null,
          outTime: ev.created_at,
          inDate: null,
          outDate: eventDate,
          inPhotoUrl: null,
          outPhotoUrl: photoUrl,
          durationMin: 0,
          status: 'sem_entrada',
          lastActivityAt: eventDate.getTime(),
        });
      }
    }
  }

  return visits.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

export function useRealtimeCheckins() {
  const [allTodayCheckins, setAllTodayCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | em_loja | curta | concluida
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  const fetchCheckins = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let rows = [];
      let page = 0;
      const batchSize = 1000;
      const MAX_BATCHES = 5;

      while (page < MAX_BATCHES) {
        const { data, error } = await supabase
          .from('checkins')
          .select('*')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false })
          .range(page * batchSize, (page + 1) * batchSize - 1);

        if (error) {
          console.error('[useRealtimeCheckins] Erro na query:', error);
          break;
        }
        if (!data || data.length === 0) break;
        rows = rows.concat(data);
        if (data.length < batchSize) break;
        page++;
      }

      setAllTodayCheckins(rows);
    } catch (err) {
      console.error('[useRealtimeCheckins] Erro ao buscar feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  // Recarrega os eventos de hoje assim que o usuário faz login ou a sessão é restaurada
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        fetchCheckins();
      } else if (event === 'SIGNED_OUT') {
        setAllTodayCheckins([]);
      }
    });

    const handleAuthReady = () => fetchCheckins();
    window.addEventListener('objetiva:auth-ready', handleAuthReady);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('objetiva:auth-ready', handleAuthReady);
    };
  }, [fetchCheckins]);

  // Escuta novos check-ins inseridos em tempo real via Supabase Channel
  useEffect(() => {
    const channel = supabase
      .channel('realtime:checkins_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'checkins' },
        (payload) => {
          const newRecord = payload.new;
          setAllTodayCheckins((prev) => {
            if (newRecord.id && prev.some((item) => item.id === newRecord.id)) {
              return prev;
            }
            return [newRecord, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Visitas unificadas (Entrada + Saída)
  const allUnifiedVisits = useMemo(() => pairTodayVisits(allTodayCheckins), [allTodayCheckins]);

  const statusCounts = useMemo(() => {
    const counts = { all: allUnifiedVisits.length, em_loja: 0, curta: 0, concluida: 0 };
    for (const v of allUnifiedVisits) {
      if (v.status === 'em_loja') counts.em_loja++;
      else if (v.status === 'curta') counts.curta++;
      else if (v.status === 'concluida') counts.concluida++;
    }
    return counts;
  }, [allUnifiedVisits]);

  const filteredVisits = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return allUnifiedVisits.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (!term) return true;
      return (
        v.agentName.toLowerCase().includes(term) ||
        v.storeName.toLowerCase().includes(term)
      );
    });
  }, [allUnifiedVisits, statusFilter, searchQuery]);

  const filteredRawCheckins = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return allTodayCheckins;
    return allTodayCheckins.filter((c) => {
      return (
        (c.activity_id || '').toLowerCase().includes(term) ||
        (c.client_id || '').toLowerCase().includes(term) ||
        (c.task_id || '').toLowerCase().includes(term)
      );
    });
  }, [allTodayCheckins, searchQuery]);

  const paginatedVisits = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredVisits.slice(start, start + pageSize);
  }, [filteredVisits, currentPage]);

  const paginatedRawCheckins = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRawCheckins.slice(start, start + pageSize);
  }, [filteredRawCheckins, currentPage]);

  return {
    visits: paginatedVisits,
    totalVisitsCount: filteredVisits.length,
    checkins: paginatedRawCheckins,
    totalCount: allTodayCheckins.length,
    filteredRawCount: filteredRawCheckins.length,
    statusCounts,
    statusFilter,
    setStatusFilter: (f) => {
      setStatusFilter(f);
      setCurrentPage(0);
    },
    loading,
    searchQuery,
    setSearchQuery: (q) => {
      setSearchQuery(q);
      setCurrentPage(0);
    },
    currentPage,
    setCurrentPage,
    pageSize,
    refetch: fetchCheckins,
  };
}
