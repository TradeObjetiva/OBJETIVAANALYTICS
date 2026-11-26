import { SUPABASE_URL } from './supabase.js';

const PROXY_BASE = `${SUPABASE_URL}/functions/v1/laivon-proxy`;
const OLD_LAIVON_KEY = 'pk_live_W4OMfCgBGyhp.ofbx_r2HlbcXsXH98jm8HW0wut3K_6Y-vSgmOzq2xj8';
const DEFAULT_LAIVON_KEY = 'pk_live_uvq5Eqe4cZ3p.Up_FNAo8HoxsmHjEu7GNjNiBnROlxyEUV2y0vtwVHzE';

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos
let auditCache = { data: null, timestamp: 0, apiKey: '' };
let inFlightRequest = null;

/**
 * Obtém a chave de API da Laivon configurada (localStorage, variável de ambiente ou fallback)
 */
export function getLaivonApiKey() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('laivon_api_key');
    if (saved === OLD_LAIVON_KEY) {
      localStorage.removeItem('laivon_api_key');
    } else if (saved && saved.trim().length > 10) {
      return saved.trim();
    }
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LAIVON_API_KEY) ||
    DEFAULT_LAIVON_KEY
  );
}

/**
 * Limpa o cache em memória dos dados de auditoria da Laivon
 */
export function clearLaivonCache() {
  auditCache = { data: null, timestamp: 0, apiKey: '' };
}

async function fetchJsonSafe(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao consultar ${url}`);
  }
  return res.json();
}

/**
 * Busca fotos, tarefas e locais da API da Laivon de forma paralela, resiliente e com cache TTL
 */
export async function fetchLaivonAuditData(apiKey = getLaivonApiKey(), { forceRefresh = false } = {}) {
  const now = Date.now();
  if (
    !forceRefresh &&
    auditCache.data &&
    auditCache.apiKey === apiKey &&
    now - auditCache.timestamp < CACHE_TTL_MS
  ) {
    return auditCache.data;
  }

  if (!forceRefresh && inFlightRequest) {
    return inFlightRequest;
  }

  const headers = { 'X-API-Key': apiKey };

  inFlightRequest = Promise.allSettled([
    fetchJsonSafe(`${PROXY_BASE}/photos?limit=200`, headers),
    fetchJsonSafe(`${PROXY_BASE}/tasks?limit=200`, headers),
    fetchJsonSafe(`${PROXY_BASE}/locals?limit=500`, headers),
  ])
    .then(([photosRes, tasksRes, localsRes]) => {
      const result = {
        photos: photosRes.status === 'fulfilled' && Array.isArray(photosRes.value?.data) ? photosRes.value.data : [],
        tasks: tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value?.data) ? tasksRes.value.data : [],
        locals: localsRes.status === 'fulfilled' && Array.isArray(localsRes.value?.data) ? localsRes.value.data : [],
      };
      auditCache = { data: result, timestamp: Date.now(), apiKey };
      return result;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

