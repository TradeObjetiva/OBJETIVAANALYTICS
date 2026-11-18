import { SUPABASE_URL } from './supabase.js';

const PROXY_BASE = `${SUPABASE_URL}/functions/v1/laivon-proxy`;

/**
 * Obtém a chave de API da Laivon configurada (variável de ambiente ou localStorage)
 */
export function getLaivonApiKey() {
  return (
    localStorage.getItem('laivon_api_key') ||
    import.meta.env.VITE_LAIVON_API_KEY ||
    ''
  );
}

/**
 * Busca fotos, tarefas e locais da API da Laivon de forma paralela e resiliente
 */
export async function fetchLaivonAuditData(apiKey = getLaivonApiKey()) {
  const headers = { 'X-API-Key': apiKey };

  const [photosRes, tasksRes, localsRes] = await Promise.allSettled([
    fetch(`${PROXY_BASE}/photos?limit=200`, { headers }).then((r) => r.json()),
    fetch(`${PROXY_BASE}/tasks?limit=200`, { headers }).then((r) => r.json()),
    fetch(`${PROXY_BASE}/locals?limit=500`, { headers }).then((r) => r.json()),
  ]);

  return {
    photos: photosRes.status === 'fulfilled' && photosRes.value?.data ? photosRes.value.data : [],
    tasks: tasksRes.status === 'fulfilled' && tasksRes.value?.data ? tasksRes.value.data : [],
    locals: localsRes.status === 'fulfilled' && localsRes.value?.data ? localsRes.value.data : [],
  };
}

