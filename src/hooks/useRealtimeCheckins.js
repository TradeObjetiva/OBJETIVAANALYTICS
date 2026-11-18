import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase.js';

export function useRealtimeCheckins() {
  const [checkins, setCheckins] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  const fetchCheckins = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let query = supabase
        .from('checkins')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(
          `activity_id.ilike.%${searchQuery}%,client_id.ilike.%${searchQuery}%,task_id.ilike.%${searchQuery}%`
        );
      }

      const from = currentPage * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data) {
        setCheckins(data);
        if (count !== null) setTotalCount(count);
      }
    } catch (err) {
      console.error('[useRealtimeCheckins] Erro ao buscar feed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCheckins();
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
          setCheckins((prev) => [newRecord, ...prev.slice(0, pageSize - 1)]);
          setTotalCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    checkins,
    totalCount,
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

