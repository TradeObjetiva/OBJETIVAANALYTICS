/**
 * Configuração Central do Supabase
 * Substitua os valores abaixo pelas chaves do seu projeto no painel do Supabase
 */
const SUPABASE_URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';

// Inicializa o cliente usando o objeto global injetado pela biblioteca CDN
const supabaseLib = supabase; // Guardamos a biblioteca original
const supabaseInstance = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY);

// Exportar para uso global no sistema
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
window.supabase = supabaseInstance;
window.supabaseLib = supabaseLib; // Guardamos a biblioteca para novos clientes

/**
 * SQL Sugerido para o Editor de SQL do Supabase:
 * 
 * -- Tabela de Perfis
 * create table profiles (
 *   id uuid references auth.users not null primary key,
 *   full_name text,
 *   avatar_url text,
 *   role text,
 *   updated_at timestamp with time zone
 * );
 * 
 * -- Tabela de Métricas do Dashboard
 * create table dashboard_metrics (
 *   id serial primary key,
 *   label text not null,
 *   value text not null,
 *   trend text,
 *   updated_at timestamp with time zone default now()
 * );
 * 
 * -- Tabela de Histórico de Roteiros
 * create table roteiro_logs (
 *   id uuid default gen_random_uuid() primary key,
 *   promotor_nome text,
 *   total_lojas int,
 *   created_at timestamp with time zone default now()
 * );
 */
