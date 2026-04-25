/**
 * Helpers de Interface e Manipulação de DOM
 */
export const ui = {
    state: {
        activeTab: localStorage.getItem('activeTab') || 'home',
        theme: localStorage.getItem('theme') || 'dark'
    },

    init() {
        this.applyTheme(this.state.theme);
        
        // Broadcast Channel para sincronizar abas
        this.syncChannel = new BroadcastChannel('app_sync');
        this.syncChannel.onmessage = (event) => {
            if (event.data.type === 'THEME_CHANGE') {
                this.applyTheme(event.data.theme, false);
            }
        };
    },

    applyTheme(theme, broadcast = true) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.state.theme = theme;
        this.syncIframeStyles();

        if (broadcast && this.syncChannel) {
            this.syncChannel.postMessage({ type: 'THEME_CHANGE', theme });
        }
    },

    switchTab(targetId, save = true) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const mobileBtns = document.querySelectorAll('.nav-tab-mobile');
        const views = document.querySelectorAll('.view-container');

        tabBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === targetId));
        mobileBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === targetId));
        views.forEach(view => view.classList.toggle('active', view.id === targetId));

        if (save) {
            this.state.activeTab = targetId;
            localStorage.setItem('activeTab', targetId);
            // Use history.replaceState instead of location.hash to avoid "jumping" scroll
            history.replaceState(null, null, `#${targetId}`);
        }

        this.syncIframeStyles();
        
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        this.closeSidebar();
    },

    openSidebar() {
        const mobileSidebar = document.getElementById('mobile-sidebar');
        const sidebarOverlay = document.getElementById('mobile-sidebar-overlay');
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.add('open');
            sidebarOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    },

    closeSidebar() {
        const mobileSidebar = document.getElementById('mobile-sidebar');
        const sidebarOverlay = document.getElementById('mobile-sidebar-overlay');
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-content">${message}</div>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    syncIframeStyles() {
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
                    Object.keys(themeVars).forEach(key => {
                        const cssVar = `--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`;
                        // Mapeamento manual se necessário, mas aqui os nomes batem quase todos
                        root.setProperty(cssVar, themeVars[key]);
                    });
                    // Correções específicas de nomes de variáveis se divergirem
                    root.setProperty('--bg-main', themeVars.bg);
                    root.setProperty('--bg-card', themeVars.card);
                    root.setProperty('--text-main', themeVars.text);
                    root.setProperty('--text-muted', themeVars.textMuted);
                }
            } catch (e) {
                // Erro de cross-origin esperado em alguns contextos
            }
        });
    }
};
// Expor para o escopo global para compatibilidade com handlers inline (onclick)
window.ui = ui;
