document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        activeTab: localStorage.getItem('activeTab') || 'home',
        theme: localStorage.getItem('theme') || 'dark'
    };

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const mobileBtns = document.querySelectorAll('.nav-tab-mobile');
    const views = document.querySelectorAll('.view-container');
    const themeToggle = document.getElementById('theme-toggle');
    const installBtn = document.getElementById('installApp');
    let deferredPrompt;

    // --- Core Functions ---

    // 1. Initialize Application
    const init = () => {
        applyTheme(state.theme);
        switchTab(state.activeTab, false);

        // Listen for messages from iframes (for notifications)
        window.addEventListener('message', handleIframeMessage);

        // PWA Install Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installBtn) installBtn.style.display = 'block';
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        installBtn.style.display = 'none';
                    }
                    deferredPrompt = null;
                }
            });
        }
    };

    // 2. Tab Switching
    const switchTab = (targetId, save = true) => {
        // Update Buttons
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        // Update Mobile Buttons
        mobileBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        // Update Views
        views.forEach(view => {
            view.classList.toggle('active', view.id === targetId);
        });

        if (save) {
            state.activeTab = targetId;
            localStorage.setItem('activeTab', targetId);
        }

        // Sync styles with iframes
        syncIframeStyles();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Expose for Global Access (used by shortcut cards)
    window.app = { switchTab };

    // 3. Theme Management
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        state.theme = theme;
        syncIframeStyles();
    };

    // 4. Iframe Context Sync
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
                    const root = doc.documentElement.style;
                    root.setProperty('--primary', themeVars.primary);
                    root.setProperty('--primary-soft', themeVars.primarySoft);
                    root.setProperty('--bg-main', themeVars.bg);
                    root.setProperty('--bg-card', themeVars.card);
                    root.setProperty('--text-main', themeVars.text);
                    root.setProperty('--text-muted', themeVars.textMuted);
                    root.setProperty('--border', themeVars.border);
                }
            } catch (e) {
                // Silently ignore cross-origin errors
            }
        });
    };

    // 5. Global Message Handler
    const handleIframeMessage = (event) => {
        const data = event.data;
        if (data.type === 'ACTION_COMPLETED') {
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

    mobileBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-target')));
    });

    themeToggle.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    document.querySelectorAll('iframe').forEach(iframe => {
        iframe.onload = syncIframeStyles;
    });

    init();
});
