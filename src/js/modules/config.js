import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuração Central do Supabase
export const SUPABASE_URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';

// Inicializa o cliente único
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Para casos onde precisamos da biblioteca original (ex: criar clientes temporários)
export const supabaseLib = { createClient };

console.log('📦 Módulo Supabase carregado.');
