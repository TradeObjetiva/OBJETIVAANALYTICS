document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        activeTab: localStorage.getItem('activeTab') || 'home',
        theme: localStorage.getItem('theme') || 'dark',
        history: JSON.parse(localStorage.getItem('userHistory') || '[]')
    };

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view-container');
    const themeToggle = document.getElementById('theme-toggle');
    const historyList = document.getElementById('global-history');

    // --- Core Functions ---

    // 1. Initialize Application
    const init = () => {
        applyTheme(state.theme);
        switchTab(state.activeTab, false);
        renderHistory();

        // Listen for messages from iframes (for notifications/history)
        window.addEventListener('message', handleIframeMessage);
    };

    // 2. Tab Switching
    const switchTab = (targetId, save = true) => {
        // Update Buttons
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        // Update Views
        views.forEach(view => {
            view.classList.toggle('active', view.id === targetId);
        });

        if (save) {
            state.activeTab = targetId;
            localStorage.setItem('activeTab', targetId);
            addHistory(`Acessou ferramenta: ${targetId}`);
        }

        // Sync styles with iframes
        syncIframeStyles();
    };

    // 3. Theme Management
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        state.theme = theme;
        syncIframeStyles();
    };

    // 4. History Management
    const addHistory = (action) => {
        const entry = {
            id: Date.now(),
            action,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        state.history.unshift(entry);
        state.history = state.history.slice(0, 10); // Keep last 10
        localStorage.setItem('userHistory', JSON.stringify(state.history));
        renderHistory();
    };

    const renderHistory = () => {
        if (!historyList) return;

        if (state.history.length === 0) {
            historyList.innerHTML = '<div class="empty-state"><p>Nenhuma atividade recente.</p></div>';
            return;
        }

        historyList.innerHTML = state.history.map(item => `
            <div class="history-item" style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 500;">${item.action}</span>
                <span style="font-size: 12px; color: var(--text-muted);">${item.time}</span>
            </div>
        `).join('');
    };

    // 5. Iframe Context Sync (Premium UI Integration)
    const syncIframeStyles = () => {
        const iframes = document.querySelectorAll('iframe');
        const themeVars = {
            primary: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
            primarySoft: getComputedStyle(document.documentElement).getPropertyValue('--primary-soft'),
            bg: getComputedStyle(document.documentElement).getPropertyValue('--bg-main'),
            card: getComputedStyle(document.documentElement).getPropertyValue('--bg-card'),
            text: getComputedStyle(document.documentElement).getPropertyValue('--text-main'),
            textMuted: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
            border: getComputedStyle(document.documentElement).getPropertyValue('--border')
        };

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc && doc.documentElement) {
                    // Force inject variables to sub-systems for visual harmony
                    const root = doc.documentElement.style;
                    root.setProperty('--primary', themeVars.primary);
                    root.setProperty('--primary-soft', themeVars.primarySoft);
                    root.setProperty('--bg-main', themeVars.bg);
                    root.setProperty('--bg-card', themeVars.card);
                    root.setProperty('--text-main', themeVars.text);
                    root.setProperty('--text-muted', themeVars.textMuted);
                    root.setProperty('--border', themeVars.border);

                    // Fallback mapping for older/simpler CSS vars in sub-systems
                    root.setProperty('--bg', themeVars.bg);
                    root.setProperty('--card', themeVars.card);
                    root.setProperty('--text', themeVars.text);
                    root.setProperty('--line', themeVars.border);
                }
            } catch (e) {
                // Cross-origin safe (if apps were on different domains) - here they are local
                console.warn("Could not sync styles with iframe (Cross-origin/Not ready)");
            }
        });
    };

    // 6. Global Message Handler (Future Integration)
    const handleIframeMessage = (event) => {
        const data = event.data;
        if (data.type === 'ACTION_COMPLETED') {
            addHistory(data.message);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: data.message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    // --- Event Listeners ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-target')));
    });

    themeToggle.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Handle iframe load to sync styles immediately
    document.querySelectorAll('iframe').forEach(iframe => {
        iframe.onload = syncIframeStyles;
    });

    // Run Init
    init();
});
