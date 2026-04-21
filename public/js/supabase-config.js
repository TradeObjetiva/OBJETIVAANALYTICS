/**
 * Configuração Central do Supabase - Versão Universal (Compatível com Módulos e Scripts Comuns)
 */
(function() {
    // Chaves de Acesso (Fallbacks seguros)
    const DEFAULT_URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
    const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';

    // Tenta obter de variáveis de ambiente se estiver no Vite, mas sem quebrar o código comum
    let finalUrl = DEFAULT_URL;
    let finalKey = DEFAULT_KEY;

    // Inicialização Protegida
    function initSupabase() {
        // Se já existe uma instância funcional, não faz nada
        if (window.supabase && typeof window.supabase.from === 'function') {
            return;
        }

        const lib = window.supabase; // Referência à biblioteca carregada via CDN
        
        if (lib && typeof lib.createClient === 'function') {
            window.supabase = lib.createClient(finalUrl, finalKey);
            window.supabaseLib = lib; // Guarda a biblioteca para outros usos
            console.log('Supabase configurado com sucesso.');
        } else {
            // Se cair aqui, a biblioteca CDN ainda não carregou
            console.warn('Aguardando biblioteca Supabase...');
            setTimeout(initSupabase, 100);
        }
    }

    // Inicia o processo
    if (document.readyState === 'complete') {
        initSupabase();
    } else {
        window.addEventListener('load', initSupabase);
        // Tenta também imediatamente caso o script tenha sido carregado após o load
        initSupabase();
    }

    // Exporta URLs para debug se necessário
    window.SUPABASE_URL = finalUrl;
    window.SUPABASE_KEY = finalKey;
})();
