/**
 * Configuração Central do Supabase - Versão Universal (Compatível com Módulos e Scripts Clássicos)
 */
(function() {
    // Chaves de Acesso
    var DEFAULT_URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
    var DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';

    var finalUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) || DEFAULT_URL;
    var finalKey = (typeof window !== 'undefined' && window.SUPABASE_KEY) || DEFAULT_KEY;

    function initSupabase() {
        if (typeof window === 'undefined') return;
        if (window.supabase && typeof window.supabase.from === 'function') {
            return;
        }

        var lib = window.supabase;
        if (lib && typeof lib.createClient === 'function') {
            window.supabase = lib.createClient(finalUrl, finalKey);
            window.supabaseLib = lib;
            console.log('Supabase configurado com sucesso.');
        } else {
            setTimeout(initSupabase, 100);
        }
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'complete') {
            initSupabase();
        } else {
            window.addEventListener('load', initSupabase);
            initSupabase();
        }
    }

    if (typeof window !== 'undefined') {
        window.SUPABASE_URL = finalUrl;
        window.SUPABASE_KEY = finalKey;
    }
})();
