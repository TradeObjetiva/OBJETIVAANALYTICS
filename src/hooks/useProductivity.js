import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase.js';

function normalizeName(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function getRestrictedProjectsFromProfile(profileOverride = null) {
  try {
    const profile = profileOverride || JSON.parse(localStorage.getItem('currentUserProfile') || 'null');
    if (!profile) return null;
    if (Array.isArray(profile?.allowed_projects) && profile.allowed_projects.length > 0) {
      return profile.allowed_projects.map((p) => String(p).trim().toUpperCase()).filter(Boolean);
    }
    return null;
  } catch {
    return null;
  }
}

export function useProductivity() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [allowedProjects, setAllowedProjects] = useState(() => getRestrictedProjectsFromProfile());
  const [selectedProject, setSelectedProject] = useState('TODOS');
  const [periodDays, setPeriodDays] = useState(0); // 0 = Hoje, 7, 15, 30

  const [rawCheckins, setRawCheckins] = useState([]);

  // 1. Carregar lista de colaboradores para mapeamento de projeto e equipe
  const fetchStaff = useCallback(async () => {
    try {
      const { data, error: staffErr } = await supabase
        .from('tb_colaboradores')
        .select('nome, projeto, equipe');

      if (!staffErr && data) {
        setStaffList(data);
      }
    } catch (err) {
      console.error('[useProductivity] Erro ao buscar colaboradores:', err);
    }
  }, []);

  // 2. Carregar checkins com paginação inteligente para o ciclo selecionado
  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const startCycle = new Date(today);
      startCycle.setHours(0, 0, 0, 0);

      const days = parseInt(periodDays, 10) || 0;
      if (days > 0) {
        startCycle.setDate(startCycle.getDate() - days);
      }

      let checkins = [];
      let page = 0;
      const pageSize = 1000;
      const MAX_PAGES = 50;
      let fetchMore = true;

      while (fetchMore && page < MAX_PAGES) {
        const { data: pageData, error: pageErr } = await supabase
          .from('checkins')
          .select('activity_id, created_at, task_id, client_id, history_id')
          .gte('created_at', startCycle.toISOString())
          .order('created_at', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (pageErr) {
          throw new Error(pageErr.message || 'Erro ao consultar checkins');
        }
        if (!pageData || pageData.length === 0) {
          fetchMore = false;
        } else {
          checkins = checkins.concat(pageData);
          if (pageData.length < pageSize) fetchMore = false;
          else page++;
        }
      }

      setRawCheckins(checkins);
    } catch (err) {
      console.error('[useProductivity] Erro ao buscar checkins:', err);
      setError(err.message || 'Erro ao carregar dados de visitas');
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  // Recarrega colaboradores e check-ins de hoje após login / restauração de sessão
  useEffect(() => {
    const syncAuthAndData = (evt) => {
      const restricted = getRestrictedProjectsFromProfile(evt?.detail || null);
      setAllowedProjects(restricted);
      if (restricted && restricted.length === 1) {
        setSelectedProject(restricted[0]);
      } else {
        setSelectedProject('TODOS');
      }
      fetchStaff();
      fetchCheckins();
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        syncAuthAndData();
      } else if (event === 'SIGNED_OUT') {
        setAllowedProjects(null);
        setStaffList([]);
        setRawCheckins([]);
      }
    });

    window.addEventListener('objetiva:auth-ready', syncAuthAndData);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('objetiva:auth-ready', syncAuthAndData);
    };
  }, [fetchStaff, fetchCheckins]);

  // 3. Processamento e cálculo de métricas de permanência e produtividade
  const processedData = useMemo(() => {
    const visitsMap = {};

    rawCheckins.forEach((c) => {
      const parts = (c.activity_id || '').split(';');
      const name = parts[0]?.trim().toUpperCase();
      if (!name) return;

      const timestampStr = c.history_id || c.created_at;
      let eventDate = new Date(timestampStr);
      if (isNaN(eventDate.getTime())) eventDate = new Date(c.created_at);

      const dateStr = eventDate.toISOString().split('T')[0];
      const key = `${name}_${dateStr}`;

      if (!visitsMap[key]) visitsMap[key] = [];
      visitsMap[key].push({
        name,
        clientId: c.client_id ? c.client_id.split(';')[0].trim().toUpperCase() : 'LOJA NÃO INFORMADA',
        laivonLocalId: c.client_id && c.client_id.includes(';') ? c.client_id.split(';')[1].trim() : null,
        taskId: (c.task_id || 'CHECK IN').trim().toUpperCase(),
        timestamp: eventDate,
      });
    });

    let totalVisits = 0;
    let completedVisits = 0;
    let openVisitsCount = 0;
    let shortVisitsCount = 0;
    let totalDurationMin = 0;

    const promoterMap = {};
    const detailedShortVisits = [];
    const detailedOpenVisits = [];

    Object.keys(visitsMap).forEach((key) => {
      const lastIdx = key.lastIndexOf('_');
      const name = key.substring(0, lastIdx);

      const normName = normalizeName(name);
      const person = staffList.find((s) => normalizeName(s.nome) === normName);
      const proj = (person?.projeto || 'GERAL').trim().toUpperCase();
      const eq = person?.equipe || 'GERAL';

      // Segue à risca a restrição de projetos permitidos do usuário
      if (allowedProjects && !allowedProjects.includes(proj)) return;
      if (selectedProject !== 'TODOS' && proj !== selectedProject.toUpperCase()) return;

      const events = visitsMap[key];
      events.sort((a, b) => a.timestamp - b.timestamp);

      const sessions = [];
      const openIns = {};

      events.forEach((ev) => {
        const store = ev.clientId;
        const task = ev.taskId;
        if (task.includes('CHECK IN') || task.includes('CHECK-IN') || task.includes('ENTRADA')) {
          openIns[store] = ev;
        } else if (
          task.includes('CHECK OUT') ||
          task.includes('CHECK-OUT') ||
          task.includes('SAIDA') ||
          task.includes('SAÍDA')
        ) {
          const inEv = openIns[store] || Object.values(openIns)[0];
          if (inEv) {
            const durationMs = ev.timestamp - inEv.timestamp;
            const durationMin = Math.max(1, Math.round(durationMs / 60000));
            const isShort = durationMin < 30;

            sessions.push({
              clientId: store,
              laivonLocalId: inEv.laivonLocalId || ev.laivonLocalId,
              durationMin,
              isShort,
              isOpen: false,
              inTime: inEv.timestamp,
              outTime: ev.timestamp,
            });
            delete openIns[inEv.clientId];
          } else {
            sessions.push({
              clientId: store,
              laivonLocalId: ev.laivonLocalId,
              durationMin: 0,
              isShort: false,
              isOpen: false,
              inTime: null,
              outTime: ev.timestamp,
            });
          }
        }
      });

      Object.values(openIns).forEach((inEv) => {
        sessions.push({
          clientId: inEv.clientId,
          laivonLocalId: inEv.laivonLocalId,
          durationMin: 0,
          isShort: false,
          isOpen: true,
          inTime: inEv.timestamp,
          outTime: null,
        });
      });

      sessions.forEach((sess) => {
        totalVisits++;
        if (sess.isOpen) {
          openVisitsCount++;
          detailedOpenVisits.push({
            agentName: name,
            clientId: sess.clientId,
            laivonLocalId: sess.laivonLocalId,
            inTime: sess.inTime,
            outTime: null,
            durationMin: 0,
          });
        } else {
          completedVisits++;
          totalDurationMin += sess.durationMin;
          if (sess.isShort) {
            shortVisitsCount++;
            detailedShortVisits.push({
              agentName: name,
              clientId: sess.clientId,
              laivonLocalId: sess.laivonLocalId,
              inTime: sess.inTime,
              outTime: sess.outTime,
              durationMin: sess.durationMin,
            });
          }
        }

        if (!promoterMap[name]) {
          promoterMap[name] = {
            name,
            project: proj,
            equipe: eq,
            visitsCount: 0,
            completedCount: 0,
            totalDurationMin: 0,
          };
        }
        promoterMap[name].visitsCount++;
        if (!sess.isOpen) {
          promoterMap[name].completedCount++;
          promoterMap[name].totalDurationMin += sess.durationMin;
        }
      });
    });

    const promoters = Object.values(promoterMap).sort(
      (a, b) => b.totalDurationMin - a.totalDurationMin
    );

    return {
      metrics: {
        totalVisits,
        completedVisits,
        shortVisitsCount,
        openVisitsCount,
        totalDurationMin,
        totalHoursStr: (totalDurationMin / 60).toFixed(1) + 'h',
      },
      promoters,
      detailedShortVisits,
      detailedOpenVisits,
    };
  }, [rawCheckins, staffList, selectedProject, allowedProjects]);

  const projects = useMemo(() => {
    const all = [...new Set(staffList.map((s) => (s.projeto || '').trim().toUpperCase()).filter(Boolean))].sort();
    if (allowedProjects) {
      return all.filter((p) => allowedProjects.includes(p));
    }
    return all;
  }, [staffList, allowedProjects]);

  const staffProjectMap = useMemo(() => {
    const map = {};
    staffList.forEach((s) => {
      const n = normalizeName(s.nome);
      if (n) map[n] = (s.projeto || 'GERAL').trim().toUpperCase();
    });
    return map;
  }, [staffList]);

  return {
    loading,
    error,
    projects,
    allowedProjects,
    staffProjectMap,
    selectedProject,
    setSelectedProject,
    periodDays,
    setPeriodDays,
    metrics: processedData.metrics,
    promoters: processedData.promoters,
    detailedShortVisits: processedData.detailedShortVisits,
    detailedOpenVisits: processedData.detailedOpenVisits,
    refetch: fetchCheckins,
  };
}

