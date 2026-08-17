window.stateProductivityDetails = { shortVisits: [], openVisits: [], displayCycleText: '' };

window.openKpiDetailsModal = function(type) {
    const modal = document.getElementById('kpi-details-modal');
    const title = document.getElementById('kpi-modal-title');
    const subtitle = document.getElementById('kpi-modal-subtitle');
    const tbody = document.getElementById('kpi-modal-table-body');
    
    if(!modal || !title || !subtitle || !tbody) return;

    let items = [];
    if(type === 'curtas') {
        title.innerHTML = '⚡ Visitas Curtas (&lt; 30 min)';
        items = window.stateProductivityDetails.shortVisits || [];
    } else {
        title.innerHTML = '🏪 Lojas em Aberto (Sem Check-Out)';
        items = window.stateProductivityDetails.openVisits || [];
    }
    
    subtitle.textContent = window.stateProductivityDetails.displayCycleText;
    
    if(items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-dim);">Nenhum registro encontrado para este filtro.</td></tr>`;
    } else {
        tbody.innerHTML = items.map(item => {
            const inStr = item.inTime ? item.inTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--';
            const outStr = item.outTime ? item.outTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--';
            const durationText = item.durationMin > 0 ? `${item.durationMin} min` : (type === 'abertas' ? 'Em andamento' : '0 min');
            const statusColor = type === 'abertas' ? '#ef4444' : '#f59e0b';
            
            return `
                <tr style="border-bottom: 1px solid rgba(128,128,128,0.1); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'" onclick="window.openVisitAuditModal('${item.agentName}', '${item.clientId}', '${inStr}', '${outStr}', '${item.durationMin}', '${item.laivonLocalId || ''}')">
                    <td style="padding: 12px 14px; font-weight: 800; color: var(--text-main);">${item.agentName}</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: var(--text-dim);">${item.clientId}</td>
                    <td style="padding: 12px 14px; text-align: center; font-weight: 700;">${inStr}</td>
                    <td style="padding: 12px 14px; text-align: center; font-weight: 700;">${outStr}</td>
                    <td style="padding: 12px 14px; text-align: center; font-weight: 800; color: ${statusColor};">${durationText}</td>
                </tr>
            `;
        }).join('');
    }
    
    modal.classList.remove('hidden');
};

window.closeKpiDetailsModal = function() {
    const modal = document.getElementById('kpi-details-modal');
    if(modal) modal.classList.add('hidden');
};

window.openVisitAuditModal = async function(agentName, storeName, inTime, outTime, durationMin, laivonLocalId = '') {
    const modal = document.getElementById('visit-audit-modal');
    if(!modal) return;
    
    document.getElementById('audit-agent-name').textContent = agentName;
    document.getElementById('audit-store-name').textContent = storeName;
    
    const avatarStr = agentName ? agentName.substring(0,2).toUpperCase() : 'AG';
    document.getElementById('audit-agent-avatar').textContent = avatarStr;
    
    document.getElementById('audit-checkin-time').textContent = inTime;
    document.getElementById('audit-checkout-time').textContent = outTime;
    document.getElementById('audit-duration-display').textContent = durationMin > 0 ? `${durationMin} min` : 'Em andamento';
    
    const diagnosis = document.getElementById('audit-diagnosis-box');
    const badge = document.getElementById('audit-status-badge');
    
    if(!outTime || outTime === '--:--') {
        badge.innerHTML = `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 13px;">⚠️ Em Aberto</span>`;
        diagnosis.innerHTML = `<span style="color: #ef4444;">⚠️ O promotor ainda não registrou a saída no uMov.me. A presença continua contando.</span>`;
    } else if(durationMin < 30) {
        badge.innerHTML = `<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 13px;">⚡ Visita Curta</span>`;
        diagnosis.innerHTML = `<span style="color: #f59e0b;">⚡ Atenção: Esta visita teve duração menor que 30 minutos. Verifique as fotos e pesquisas enviadas na Laivon para auditar a qualidade da execução.</span>`;
    } else {
        badge.innerHTML = `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 13px;">✅ Visita Padrão</span>`;
        diagnosis.innerHTML = `<span style="color: #10b981;">✅ Tempo de permanência adequado.</span>`;
    }
    
    const tasksList = document.getElementById('audit-laivon-tasks-list');
    const photosGrid = document.getElementById('audit-laivon-photos-grid');

    tasksList.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-dim); font-size: 13px;">Buscando tarefas da Laivon... ⏳</div>`;
    photosGrid.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-dim); font-size: 13px; grid-column: 1/-1;">Buscando fotos da Laivon... ⏳</div>`;
    
    modal.classList.remove('hidden');

    try {
        const supabaseProxyBase = (window.SUPABASE_URL || 'https://xgbvokegqxqxpgznpxiq.supabase.co') + '/functions/v1/laivon-proxy';
        const apiKey = localStorage.getItem('laivon_api_key') || 'pk_live_W4OMfCgBGyhp.ofbx_r2HlbcXsXH98jm8HW0wut3K_6Y-vSgmOzq2xj8';
        const headers = { 'X-API-Key': apiKey };
        
        const [photosRes, tasksRes, localsRes] = await Promise.allSettled([
            fetch(`${supabaseProxyBase}/photos?limit=200`, { headers }).then(r => r.json()),
            fetch(`${supabaseProxyBase}/tasks?limit=200`, { headers }).then(r => r.json()),
            fetch(`${supabaseProxyBase}/locals?limit=500`, { headers }).then(r => r.json())
        ]);
        
        let photos = photosRes.status === 'fulfilled' && photosRes.value.data ? photosRes.value.data : [];
        let tasks = tasksRes.status === 'fulfilled' && tasksRes.value.data ? tasksRes.value.data : [];
        let locals = localsRes.status === 'fulfilled' && localsRes.value.data ? localsRes.value.data : [];

        const cleanStr = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        const agentClean = cleanStr(agentName);
        const storeClean = cleanStr(storeName);

        // 1. Encontrar a Tarefa do Atendimento (por id_integration ou id)
        let targetTask = null;
        if (laivonLocalId) {
            targetTask = tasks.find(t => String(t.id_integration) === String(laivonLocalId) || String(t.id) === String(laivonLocalId));
        }

        // 2. Encontrar a Loja (Local) por id da tarefa, id_integration ou nome da loja
        let targetLocal = null;
        if (targetTask && targetTask.id_local) {
            targetLocal = locals.find(l => l.id === targetTask.id_local);
        }
        if (!targetLocal && laivonLocalId) {
            targetLocal = locals.find(l => String(l.id_integration) === String(laivonLocalId) || String(l.id) === String(laivonLocalId));
        }

        if (!targetLocal && storeClean && locals.length > 0) {
            const snParts = storeClean.split(' ').filter(p => p.length > 2);
            let bestScore = 0;
            
            locals.forEach(l => {
                const lnClean = cleanStr(l.name || l.corporate_name);
                if (!lnClean) return;
                let score = 0;
                if (lnClean === storeClean) score += 100;
                snParts.forEach(p => {
                    if (lnClean.includes(p)) score += 15;
                });
                if (score > bestScore) {
                    bestScore = score;
                    targetLocal = l;
                }
            });
        }

        const matchedLocalId = targetLocal ? targetLocal.id : null;
        const matchedTaskId = targetTask ? targetTask.id : null;

        // 3. Tarefas / Formulários do Atendimento
        let matchedTasks = [];
        if (targetTask) matchedTasks.push(targetTask);

        let agentTasks = tasks.filter(t => t.agent_name && cleanStr(t.agent_name).includes(agentClean));
        if (agentTasks.length === 0) {
            const agentParts = agentClean.split(' ').filter(p => p.length > 2);
            if (agentParts.length > 0) {
                agentTasks = tasks.filter(t => {
                    if (!t.agent_name) return false;
                    const tn = cleanStr(t.agent_name);
                    return agentParts.some(ap => tn.includes(ap));
                });
            }
        }

        if (matchedLocalId) {
            agentTasks = agentTasks.filter(t => t.id_local === matchedLocalId);
        }

        agentTasks.forEach(t => {
            if (!matchedTasks.some(mt => mt.id === t.id)) matchedTasks.push(t);
        });

        // Filtrar 'Jornada de Trabalho' genérica se houver tarefas de visita específicas
        const specificTasks = matchedTasks.filter(t => (t.type || '').toUpperCase() !== 'JORNADA DE TRABALHO');
        if (specificTasks.length > 0) {
            matchedTasks = specificTasks;
        }

        matchedTasks = matchedTasks.slice(0, 10);

        if (matchedTasks.length > 0) {
            tasksList.innerHTML = matchedTasks.map(t => {
                const isCompleted = !!(t.real_final_dt || t.situation_id === 50 || t.situation_id === 2);
                const taskTitle = (t.type && t.type !== 'Visitas agendadas') ? t.type : 'Pesquisa / Atendimento de Loja';
                const timeLabel = t.real_final_dt 
                    ? new Date(t.real_final_dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : (t.insert_dt ? new Date(t.insert_dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

                return `
                    <div style="padding: 10px 12px; border-bottom: 1px solid rgba(128,128,128,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">📋 ${taskTitle}</div>
                            ${timeLabel ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Horário: ${timeLabel}</div>` : ''}
                        </div>
                        <span style="color: ${isCompleted ? '#10b981' : '#f59e0b'}; font-weight: 800; font-size: 11px; padding: 4px 10px; background: ${isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; border-radius: 6px;">
                            ${isCompleted ? '✅ Concluído' : '⏳ Pendente'}
                        </span>
                    </div>
                `;
            }).join('');
        } else {
            tasksList.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-dim); font-size: 12px;">Nenhum formulário ou pesquisa preenchida nesta loja hoje.</div>`;
        }

        // 4. Fotos de Evidência do Atendimento
        let matchedPhotos = [];
        if (matchedTaskId) {
            matchedPhotos = photos.filter(p => p.task_id === matchedTaskId);
        }
        if (matchedLocalId) {
            photos.forEach(p => {
                if ((p.local_id === matchedLocalId || p.client_id === matchedLocalId) && !matchedPhotos.some(mp => mp.id === p.id)) {
                    matchedPhotos.push(p);
                }
            });
        }

        matchedPhotos = matchedPhotos.slice(0, 12);

        if (matchedPhotos.length > 0) {
            photosGrid.innerHTML = matchedPhotos.map(p => `
                <div style="aspect-ratio: 1; border-radius: 8px; background: url('${p.photo}') center/cover; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; position: relative;" onclick="window.open('${p.photo}', '_blank')" title="${p.description || 'Evidência Fotográfica'}">
                    ${p.description ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.75); color: #fff; font-size: 9px; font-weight: 700; padding: 3px 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-bottom-left-radius: 7px; border-bottom-right-radius: 7px;">${p.description}</div>` : ''}
                </div>
            `).join('');
        } else {
            photosGrid.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-dim); font-size: 12px; grid-column: 1/-1;">Nenhuma foto registrada nesta loja.</div>`;
        }
        
    } catch (e) {
        tasksList.innerHTML = `<div style="padding: 15px; text-align: center; color: #ef4444; font-size: 12px;">Falha ao carregar tarefas.</div>`;
        photosGrid.innerHTML = `<div style="padding: 15px; text-align: center; color: #ef4444; font-size: 12px; grid-column: 1/-1;">Falha ao carregar fotos.</div>`;
    }
};

window.closeVisitAuditModal = function() {
    const modal = document.getElementById('visit-audit-modal');
    if(modal) modal.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        activeTab: (window.location.hash.replace('#', '').split('?')[0]) || 'home',
        theme: localStorage.getItem('theme') || 'dark',
        homeChart: null,
        lastRefresh: null,
        checkinsPage: 0,
        checkinsPerPage: 100
    };

    // Broadcast Channel for cross-tab/iframe sync
    const syncChannel = new BroadcastChannel('app_sync');

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const mobileBtns = document.querySelectorAll('.nav-tab-mobile');
    const views = document.querySelectorAll('.view-container');
    const themeToggle = document.getElementById('theme-toggle');
    const installBtn = document.getElementById('installApp');
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const userProfile = document.getElementById('user-profile');
    const loginError = document.getElementById('login-error');
    const navUsers = document.getElementById('nav-users');
    const usersListBody = document.getElementById('users-list-body');
    const createProfileForm = document.getElementById('create-profile-form');
    const welcomeName = document.getElementById('welcome-name');
    const updateMyProfileForm = document.getElementById('update-my-profile-form');
    const pwaBanner = document.getElementById('pwa-install-banner');

    // Mobile Sidebar Elements
    const sidebarEl = document.getElementById('sidebar-nav') || document.querySelector('.sidebar-nav');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

    let deferredPrompt;

    // --- Core Functions ---

    // 1. Initialize Application
    const init = () => {
        applyTheme(state.theme);
        switchTab(state.activeTab, false);

        // Listen for messages from iframes (for notifications)
        window.addEventListener('message', handleIframeMessage);

        // Listen for BroadcastChannel messages
        syncChannel.onmessage = (event) => {
            if (event.data.type === 'THEME_CHANGE') {
                applyTheme(event.data.theme, false);
            }
        };

        // Deep Linking
        window.addEventListener('hashchange', () => {
            const target = window.location.hash.replace('#', '').split('?')[0];
            if (target) switchTab(target, true);
        });

        // Check Auth State
        checkAuth();

        // PWA Install Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (pwaBanner) pwaBanner.style.display = 'flex';
        });

        const installBtns = document.querySelectorAll('#installApp');
        installBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        if (pwaBanner) pwaBanner.style.display = 'none';
                    }
                    deferredPrompt = null;
                }
            });
        });

        // Solicitar permissão para Notificações Nativas (Windows/Chrome)
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }
    };

    // 2. Tab Switching
    const analyticsSubItems = ['analytics', 'relatorio', 'cartas', 'roteiro'];
    const assiduidadeSubItems = ['assiduidade', 'almoco'];

    const switchTab = (targetId, save = true) => {
        // Update all tab buttons
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        // Update sub-items inside accordion
        const subItems = document.querySelectorAll('.tab-btn.sub-item');
        subItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-target') === targetId);
        });

        // Manage Analytics accordion state
        const accordion = document.getElementById('analytics-accordion');
        const isAnalyticsSubItem = analyticsSubItems.includes(targetId);
        if (accordion) {
            accordion.classList.toggle('has-active', isAnalyticsSubItem);
            if (isAnalyticsSubItem) {
                accordion.classList.add('open');
            }
        }

        // Manage Assiduidade accordion state
        const assiduidadeAccordion = document.getElementById('assiduidade-accordion');
        const isAssiduidadeSubItem = assiduidadeSubItems.includes(targetId);
        if (assiduidadeAccordion) {
            assiduidadeAccordion.classList.toggle('has-active', isAssiduidadeSubItem);
            if (isAssiduidadeSubItem) {
                assiduidadeAccordion.classList.add('open');
            }
        }

        // Update Mobile Buttons
        mobileBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        // Determine effective view ID
        const effectiveViewId = targetId === 'almoco' ? 'assiduidade' : targetId;

        // Update Views
        views.forEach(view => {
            view.classList.toggle('active', view.id === effectiveViewId);
        });

        if (save) {
            state.activeTab = targetId;
            localStorage.setItem('activeTab', targetId);
            window.location.hash = targetId;
        }

        // Dispatch view toggle to Assiduidade iframe
        if (targetId === 'assiduidade' || targetId === 'almoco') {
            const toggleAssiduidadeSubView = () => {
                const iframe = document.querySelector('#assiduidade iframe');
                if (iframe && iframe.contentWindow) {
                    if (targetId === 'almoco') {
                        if (typeof iframe.contentWindow.showLunchControlFullView === 'function') {
                            iframe.contentWindow.showLunchControlFullView();
                        } else {
                            iframe.contentWindow.postMessage({ type: 'SHOW_LUNCH_VIEW' }, '*');
                        }
                    } else {
                        if (typeof iframe.contentWindow.showAssiduidadeGridView === 'function') {
                            iframe.contentWindow.showAssiduidadeGridView();
                        } else {
                            iframe.contentWindow.postMessage({ type: 'SHOW_GRID_VIEW' }, '*');
                        }
                    }
                }
            };
            setTimeout(toggleAssiduidadeSubView, 100);
            setTimeout(toggleAssiduidadeSubView, 400);
        }

        // Auto-load data based on tab
        if (targetId === 'colaboradores-base') loadStaffBaseList();
        if (targetId === 'users') {
            loadUsersList();
            populateProjectCheckboxes();
        }

        // Sync styles with iframes
        syncIframeStyles();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close mobile sidebar if open
        closeSidebar();
    };

    // Accordion Toggle for Analytics
    const accordionBtn = document.getElementById('analytics-accordion-btn');
    if (accordionBtn) {
        accordionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const accordion = document.getElementById('analytics-accordion');
            if (accordion) {
                accordion.classList.toggle('open');
            }
        });
    }

    // Accordion Toggle for Assiduidade
    const assiduidadeAccordionBtn = document.getElementById('assiduidade-accordion-btn');
    if (assiduidadeAccordionBtn) {
        assiduidadeAccordionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const accordion = document.getElementById('assiduidade-accordion');
            if (accordion) {
                accordion.classList.toggle('open');
            }
        });
    }

    // Mobile Sidebar Logic (Drawer)
    const openSidebar = () => {
        if (sidebarEl) sidebarEl.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeSidebar = () => {
        if (sidebarEl) sidebarEl.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('open');
        document.body.style.overflow = ''; // Restore scroll
    };

    // Expose for Global Access (used by shortcut cards)
    window.app = { switchTab };

    // 3. Theme Management
    const applyTheme = (theme, broadcast = true) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        state.theme = theme;
        syncIframeStyles();

        if (broadcast) {
            syncChannel.postMessage({ type: 'THEME_CHANGE', theme });
        }
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
            // Re-sync whenever an iframe finish loading to ensure styles are applied
            if (!iframe.dataset.listenerAdded) {
                iframe.addEventListener('load', () => syncIframeStyles());
                iframe.dataset.listenerAdded = 'true';
            }

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
            showToast(data.message, 'success');
        }
    };

    // 6. Toast System
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // 7. WhatsApp-Style Check-in Notification System
    const showCheckinNotification = (agentName, storeName, photoUrl, timeStr) => {
        const container = document.getElementById('checkin-notification-container');
        if (!container) return;

        // Limita a 4 notificações visíveis
        while (container.children.length >= 4) {
            container.firstChild.remove();
        }

        const notif = document.createElement('div');
        notif.className = 'checkin-notification';

        const avatarHtml = photoUrl
            ? `<img src="${photoUrl}" class="checkin-notif-avatar" onerror="this.outerHTML='<div class=\\'checkin-notif-avatar-placeholder\\'>${agentName[0]}</div>'">`
            : `<div class="checkin-notif-avatar-placeholder">${agentName[0]}</div>`;

        const now = timeStr || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const storeText = storeName || 'Visita em campo';

        notif.innerHTML = `
            ${avatarHtml}
            <div class="checkin-notif-body">
                <div class="checkin-notif-header">
                    <span class="checkin-notif-app-name">CHECK-IN</span>
                    <span class="checkin-notif-time">${now}</span>
                </div>
                <div class="checkin-notif-name">${agentName}</div>
                <div class="checkin-notif-message">
                    <svg class="notif-icon-checkin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ${storeText}
                </div>
            </div>
            <button class="checkin-notif-close" onclick="event.stopPropagation(); this.closest('.checkin-notification').classList.add('dismissing'); setTimeout(() => this.closest('.checkin-notification')?.remove(), 400);">✕</button>
            <div class="checkin-notif-progress"></div>
        `;

        // Click para ir ao dashboard
        notif.addEventListener('click', () => {
            if (window.app && window.app.switchTab) {
                window.app.switchTab('home');
            }
            notif.classList.add('dismissing');
            setTimeout(() => notif.remove(), 400);
        });

        container.appendChild(notif);

        // Som de notificação sutil (Web Audio API)
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            // Ignora erro de áudio (pode falhar antes de interação do usuário)
        }

        // --- NOTIFICAÇÃO NATIVA (WINDOWS/DESKTOP) ---
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                const nativeNotif = new Notification(`Check-in: ${agentName}`, {
                    body: storeText,
                    icon: photoUrl || 'https://cdn-icons-png.flaticon.com/512/3261/3261301.png',
                    tag: 'checkin-alert', // Evita flood de janelas se chegarem várias
                    silent: true // Já tocamos o som via Web Audio
                });

                nativeNotif.onclick = () => {
                    window.focus();
                    if (window.app && window.app.switchTab) window.app.switchTab('home');
                    nativeNotif.close();
                };
            } catch (err) {
                console.error("Erro ao disparar notificação nativa:", err);
            }
        }

        // Auto-dismiss após 6 segundos
        setTimeout(() => {
            if (notif.parentElement) {
                notif.classList.add('dismissing');
                setTimeout(() => notif.remove(), 400);
            }
        }, 6000);
    };

    window.app = { ...window.app, showToast, showCheckinNotification };

    // --- Event Listeners ---
    // Navigation click handler - handles .tab-btn with data-target but NOT accordion-toggle (handled separately above)
    document.addEventListener('click', (e) => {
        // Skip if clicking inside import dropdown
        if (e.target.closest('#import-dropdown')) return;
        // Skip accordion toggle (handled by its own listener)
        if (e.target.closest('#analytics-accordion-btn') || e.target.closest('#assiduidade-accordion-btn')) return;

        const btn = e.target.closest('.tab-btn[data-target], .sub-item[data-target]');
        if (btn) {
            const target = btn.getAttribute('data-target');
            if (target) {
                e.preventDefault();
                switchTab(target, true);
            }
        }
    });

    // Navigation handled by hashchange listener in init()

    themeToggle.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Mobile Sidebar Triggers
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
    }

    document.querySelectorAll('iframe').forEach(iframe => {
        iframe.onload = syncIframeStyles;
    });

    // Refresh Dashboard Button
    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const btn = refreshBtn;
            const icon = btn.querySelector('svg');
            if (icon) icon.style.transform = 'rotate(360deg)';

            // Re-run population
            checkAuth();

            setTimeout(() => {
                if (icon) icon.style.transform = 'rotate(0deg)';
            }, 600);
        });
    }

    // Search Check-ins
    const checkinSearch = document.getElementById('checkin-search');
    if (checkinSearch) {
        checkinSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.checkin-row');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? 'grid' : 'none';
            });
        });
    }

    // Fechar dropdown de importação ao clicar fora
    document.addEventListener('click', (e) => {
        const importDropdown = document.getElementById('import-dropdown');
        const importBtn = document.getElementById('import-btn');
        if (importDropdown && importDropdown.style.display === 'block') {
            if (!importDropdown.contains(e.target) && (!importBtn || !importBtn.contains(e.target))) {
                importDropdown.style.display = 'none';
            }
        }
    });

    // --- Auth Functions ---

    const checkAuth = async () => {
        if (!window.supabase) return;
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            const profile = await fetchUserProfile(session.user.id);
            updateUIForAuth(session, profile);
        } else {
            updateUIForAuth(null);
        }
    };

    const fetchUserProfile = async (userId) => {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
            console.warn('Erro ao buscar perfil:', error.message);
        }
        return data;
    };

    const updateUIForAuth = (session, profile) => {
        if (session) {
            loginOverlay.classList.add('hidden');
            const user = session.user;
            const rawName = profile?.full_name || user.email.split('@')[0];
            // Use literally the first word strictly and clean it
            const displayName = rawName.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ').trim().split(' ')[0];
            const fullName = rawName.trim();
            const isMaster = profile?.role === 'admin' || profile?.role === 'master';

            // Salva perfil no localStorage para os subsistemas (iframes)
            localStorage.setItem('currentUserProfile', JSON.stringify(profile));

            // Populate Skeletons after a small visual delay
            setTimeout(() => populateDashboardData(displayName), 800);

            // Show/Hide restricted menu
            const adminUploadArea = document.getElementById('admin-upload-area');
            const adminQuickActions = document.getElementById('admin-quick-actions');
            if (isMaster) {
                console.log("Master access granted");
                if (navUsers) navUsers.classList.remove('hidden');
                const mobileNavUsers = document.getElementById('mobile-nav-users');
                if (mobileNavUsers) mobileNavUsers.classList.remove('hidden');
                if (adminUploadArea) adminUploadArea.style.display = 'block';
                if (adminQuickActions) adminQuickActions.style.display = 'flex';
                loadUsersList();

                tabBtns.forEach(btn => btn.classList.remove('hidden'));
                mobileBtns.forEach(btn => btn.classList.remove('hidden'));
            } else {
                console.log("Restricted access for:", displayName, "Allowed Tabs:", profile?.allowed_tabs);
                if (navUsers) navUsers.classList.add('hidden');
                const mobileNavUsers = document.getElementById('mobile-nav-users');
                if (mobileNavUsers) mobileNavUsers.classList.add('hidden');
                if (adminUploadArea) adminUploadArea.style.display = 'none';
                if (adminQuickActions) adminQuickActions.style.display = 'none';

                const allowedTabs = profile?.allowed_tabs || [];

                const enforceVisibility = (btn) => {
                    const target = btn.getAttribute('data-target');
                    if (target === 'profile') {
                        btn.classList.remove('hidden');
                        return;
                    }
                    if (target === 'users') {
                        btn.classList.add('hidden');
                        return;
                    }

                    // Se houver restrições definidas
                    if (allowedTabs.length > 0) {
                        if (allowedTabs.includes(target)) {
                            btn.classList.remove('hidden');
                        } else {
                            btn.classList.add('hidden');
                        }
                    } else {
                        // Se não houver restrições no banco, mostra tudo (exceto usuários)
                        btn.classList.remove('hidden');
                    }
                };

                tabBtns.forEach(enforceVisibility);
                mobileBtns.forEach(enforceVisibility);

                if (state.activeTab !== 'profile' && state.activeTab !== 'home' && allowedTabs.length > 0 && !allowedTabs.includes(state.activeTab)) {
                    switchTab(allowedTabs[0] || 'profile');
                } else if (state.activeTab === 'users') {
                    switchTab('home');
                }
            }
            // Update Home Welcome
            if (welcomeName) {
                welcomeName.classList.remove('skeleton', 'skeleton-text');
                welcomeName.removeAttribute('style'); // Remove inline skeleton styles
                welcomeName.textContent = displayName; // Only first name
            }

            // Update Profile View (My Profile)
            const profileNameDisplay = document.getElementById('profile-name-display');
            const profileEmailDisplay = document.getElementById('profile-email-display');
            const profileAvatarBig = document.getElementById('profile-avatar-big');
            const myFullNameInput = document.getElementById('my-full-name');

            if (profileNameDisplay) profileNameDisplay.textContent = fullName; // Full name in profile
            if (profileEmailDisplay) profileEmailDisplay.textContent = user.email;
            if (profileAvatarBig) {
                profileAvatarBig.textContent = displayName[0].toUpperCase();
                profileAvatarBig.classList.remove('skeleton');
            }
            if (myFullNameInput && profile) myFullNameInput.value = profile.full_name || '';

            userProfile.innerHTML = `
                <div class="user-info">
                    <div class="user-name">
                        ${displayName} 
                        ${isMaster ? '<span style="font-size: 10px; background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">Mestre</span>' : ''}
                    </div>
                </div>
                <div class="avatar">${displayName[0].toUpperCase()}</div>
                <button class="logout-btn" id="logout-btn">Sair</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            loginOverlay.classList.remove('hidden');
            userProfile.innerHTML = '';
            if (welcomeName) welcomeName.textContent = 'FP Analytics';
        }
    };

    const populateDashboardData = async (name) => {
        // Hiding skeletons and setting values from Database
        const clientesEl = document.getElementById('metric-clientes');
        const redesEl = document.getElementById('metric-redes');
        const lojasEl = document.getElementById('metric-lojas');
        const activityList = document.getElementById('activity-list');
        const municipiosEl = document.getElementById('metric-municipios');
        const horasEl = document.getElementById('metric-horas');

        try {
            // Update Sync Time
            const syncEl = document.getElementById('last-sync-time');
            if (syncEl) syncEl.textContent = `Sincronizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

            // 1. Tentar puxar dados otimizados via RPC (MUITO MAIS RÁPIDO)
            const { data: rpcData, error: rpcError } = await window.supabase.rpc('get_dashboard_metrics');

            let metrics = null;

            if (!rpcError && rpcData) {
                metrics = {
                    clientes: rpcData.clientes || 0,
                    redes: rpcData.redes || 0,
                    lojas: rpcData.lojas || 0,
                    municipios: rpcData.municipios || 0,
                    horas: rpcData.horas || 0
                };
            } else {
                // 2. Fallback: Se o RPC não existir, faz do jeito antigo
                console.warn('RPC "get_dashboard_metrics" não encontrado ou erro. Usando busca completa...');
                let allData = [];
                let page = 0;
                const pageSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error } = await window.supabase
                        .from('tb_planilha')
                        .select('local, form, municipio, horas_por_visita, rede, seg, ter, qua, qui, sex, sab')
                        .range(page * pageSize, (page + 1) * pageSize - 1);

                    if (error) throw error;
                    if (data && data.length > 0) allData = allData.concat(data);
                    if (!data || data.length < pageSize) hasMore = false;
                    page++;
                }

                const clientesSet = new Set();
                const redesSet = new Set();
                const lojasSet = new Set();
                const municipiosSet = new Set();
                let totalHoras = 0;

                allData.forEach(row => {
                    if (row.form) {
                        let formName = row.form.toUpperCase().replace(/PESQUISA/g, '').trim();
                        if (formName) clientesSet.add(formName);
                    }
                    if (row.municipio) municipiosSet.add(row.municipio.trim().toUpperCase());

                    ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'].forEach(dia => {
                        if (row[dia]) {
                            let val = parseFloat(String(row[dia]).replace(',', '.'));
                            if (!isNaN(val)) totalHoras += val;
                        }
                    });

                    if (row.rede) {
                        let rede = row.rede.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        if (rede) redesSet.add(rede);
                    }
                    if (row.local) lojasSet.add(row.local.trim().toUpperCase());
                });

                metrics = {
                    clientes: clientesSet.size,
                    redes: redesSet.size,
                    lojas: lojasSet.size,
                    municipios: municipiosSet.size,
                    horas: totalHoras
                };
            }

            // Update UI
            if (clientesEl) {
                clientesEl.classList.remove('skeleton', 'skeleton-title');
                clientesEl.innerHTML = `${metrics.clientes} <span class="trend" style="font-size:11px;">Ativos</span>`;
            }
            if (redesEl) {
                redesEl.classList.remove('skeleton', 'skeleton-title');
                redesEl.innerHTML = `${metrics.redes} <span class="trend" style="font-size:11px;">Canais</span>`;
            }
            if (lojasEl) {
                lojasEl.classList.remove('skeleton', 'skeleton-title');
                lojasEl.innerHTML = `${metrics.lojas} <span class="trend" style="font-size:11px;">PDVs</span>`;
            }
            if (municipiosEl) {
                municipiosEl.classList.remove('skeleton', 'skeleton-title');
                municipiosEl.innerHTML = `${metrics.municipios} <span class="trend" style="font-size:11px;">Cidades</span>`;
            }
            if (horasEl) {
                horasEl.classList.remove('skeleton', 'skeleton-title');
                const horasFormatadas = metrics.horas.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                horasEl.innerHTML = `${horasFormatadas} <span class="trend" style="font-size:11px;">Mensais</span>`;
            }


            // Carrega o Dashboard de Produtividade & Permanência em Loja embarcado
            await loadMainDashboardProductivity('TODOS');

        } catch (err) {
            console.warn('Erro ao ler métricas:', err.message);
        }
    };

    const loadMainDashboardProductivity = async (selectedProject = 'TODOS') => {
        const promotersBody = document.getElementById('main-prod-promoters-body');
        const projSelect = document.getElementById('main-prod-proj-select');
        const periodSelect = document.getElementById('main-prod-period-select');

        if (!promotersBody) return;

        try {
            let { data: staffData } = await window.supabase
                .from('tb_colaboradores')
                .select('nome, projeto, equipe');

            const staffList = staffData || [];

            if (projSelect && projSelect.options.length <= 1) {
                const projects = [...new Set(staffList.map(s => s.projeto).filter(Boolean))].sort();
                projects.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p;
                    opt.textContent = p;
                    projSelect.appendChild(opt);
                });

                projSelect.onchange = (e) => {
                    loadMainDashboardProductivity(e.target.value);
                };
            }

            if (periodSelect && !periodSelect.dataset.listenerBound) {
                periodSelect.dataset.listenerBound = 'true';
                periodSelect.onchange = () => {
                    loadMainDashboardProductivity(projSelect ? projSelect.value : 'TODOS');
                };
            }

            const today = new Date();
            const todayFormatted = today.toLocaleDateString('pt-BR');
            let daysBack = parseInt(periodSelect?.value ?? '0', 10);
            if (isNaN(daysBack) || daysBack < 0 || daysBack > 30) daysBack = 0;

            const startCycle = new Date(today);
            startCycle.setHours(0, 0, 0, 0);
            if (daysBack > 0) {
                startCycle.setDate(startCycle.getDate() - daysBack);
            }
            const startCycleFormatted = startCycle.toLocaleDateString('pt-BR');

            const cycleDisplay = document.getElementById('main-cycle-display');
            if (cycleDisplay) {
                if (daysBack === 0) {
                    cycleDisplay.textContent = `${todayFormatted} (Hoje)`;
                } else {
                    cycleDisplay.textContent = `${startCycleFormatted} até ${todayFormatted}`;
                }
            }

            let checkins = [];
            let page = 0;
            const pageSize = 1000;
            let fetchMore = true;

            while (fetchMore) {
                const { data: pageData, error } = await window.supabase
                    .from('checkins')
                    .select('activity_id, created_at, task_id, client_id, history_id')
                    .gte('created_at', startCycle.toISOString())
                    .order('created_at', { ascending: true })
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error || !pageData || pageData.length === 0) {
                    fetchMore = false;
                } else {
                    checkins = checkins.concat(pageData);
                    if (pageData.length < pageSize) fetchMore = false;
                    else page++;
                }
            }

            const visitsMap = {};
            checkins.forEach(c => {
                const parts = (c.activity_id || '').split(';');
                const name = parts[0]?.trim().toUpperCase();
                if (!name) return;

                let timestampStr = c.history_id || c.created_at;
                let eventDate = new Date(timestampStr);
                if (isNaN(eventDate.getTime())) eventDate = new Date(c.created_at);

                const dateStr = eventDate.toISOString().split('T')[0];
                const key = `${name}_${dateStr}`;

                if (!visitsMap[key]) visitsMap[key] = [];
                visitsMap[key].push({
                    name: name,
                    clientId: (c.client_id ? c.client_id.split(';')[0].trim().toUpperCase() : 'LOJA NÃO INFORMADA'),
                    laivonLocalId: (c.client_id && c.client_id.includes(';')) ? c.client_id.split(';')[1].trim() : null,
                    taskId: (c.task_id || 'CHECK IN').trim().toUpperCase(),
                    timestamp: eventDate
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

            Object.keys(visitsMap).forEach(key => {
                const lastIdx = key.lastIndexOf('_');
                const name = key.substring(0, lastIdx);

                const person = staffList.find(s => s.nome === name);
                const proj = person ? (person.projeto || 'GERAL') : 'GERAL';
                const eq = person ? (person.equipe || 'GERAL') : 'GERAL';

                if (selectedProject !== 'TODOS' && proj !== selectedProject) return;

                const events = visitsMap[key];
                events.sort((a, b) => a.timestamp - b.timestamp);

                const sessions = [];
                const openIns = {};

                events.forEach(ev => {
                    const store = ev.clientId;
                    if (ev.taskId.includes('CHECK IN') || ev.taskId.includes('CHECK-IN') || ev.taskId.includes('ENTRADA')) {
                        openIns[store] = ev;
                    } else if (ev.taskId.includes('CHECK OUT') || ev.taskId.includes('CHECK-OUT') || ev.taskId.includes('SAIDA') || ev.taskId.includes('SAÍDA')) {
                        const inEv = openIns[store] || Object.values(openIns)[0];
                        if (inEv) {
                            const durationMs = ev.timestamp - inEv.timestamp;
                            const durationMin = Math.max(1, Math.round(durationMs / 60000));
                            const isShort = durationMin < 30;

                            sessions.push({
                                clientId: store,
                                laivonLocalId: inEv.laivonLocalId || ev.laivonLocalId,
                                durationMin: durationMin,
                                isShort: isShort,
                                isOpen: false,
                                inTime: inEv.timestamp,
                                outTime: ev.timestamp
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
                                outTime: ev.timestamp
                            });
                        }
                    }
                });

                Object.values(openIns).forEach(inEv => {
                    sessions.push({
                        clientId: inEv.clientId,
                        laivonLocalId: inEv.laivonLocalId,
                        durationMin: 0,
                        isShort: false,
                        isOpen: true,
                        inTime: inEv.timestamp,
                        outTime: null
                    });
                });

                sessions.forEach(sess => {
                    totalVisits++;
                    if (sess.isOpen) {
                        openVisitsCount++;
                        detailedOpenVisits.push({
                            agentName: name,
                            clientId: sess.clientId,
                            laivonLocalId: sess.laivonLocalId,
                            inTime: sess.inTime,
                            outTime: null,
                            durationMin: 0
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
                                durationMin: sess.durationMin
                            });
                        }
                    }

                    if (!promoterMap[name]) {
                        promoterMap[name] = {
                            name: name,
                            project: proj,
                            equipe: eq,
                            visitsCount: 0,
                            completedCount: 0,
                            totalDurationMin: 0
                        };
                    }
                    promoterMap[name].visitsCount++;
                    if (!sess.isOpen) {
                        promoterMap[name].completedCount++;
                        promoterMap[name].totalDurationMin += sess.durationMin;
                    }
                });
            });

            window.stateProductivityDetails = {
                shortVisits: detailedShortVisits,
                openVisits: detailedOpenVisits,
                displayCycleText: cycleDisplay?.textContent || ''
            };

            const kpiTotal = document.getElementById('main-kpi-total-visitas');
            const kpiConcl = document.getElementById('main-kpi-concluidas');
            const kpiCurtasTotal = document.getElementById('main-kpi-curtas-total');
            const kpiCurtasDetail = document.getElementById('main-kpi-curtas-detail');
            const kpiHoras = document.getElementById('main-kpi-horas-loja');
            const kpiAbertasTotal = document.getElementById('main-kpi-abertas-total');
            const kpiAbertasDetail = document.getElementById('main-kpi-abertas-detail');

            const formatMin = (m) => {
                if (!m) return '0min';
                const h = Math.floor(m / 60);
                const r = m % 60;
                return h > 0 ? `${h}h ${r}min` : `${r}min`;
            };

            if (kpiTotal) kpiTotal.textContent = totalVisits;
            if (kpiConcl) kpiConcl.textContent = `${completedVisits} concluídas`;
            if (kpiCurtasTotal) kpiCurtasTotal.textContent = shortVisitsCount;
            if (kpiCurtasDetail) kpiCurtasDetail.textContent = `atendimentos < 30 min (clique para ver)`;
            if (kpiHoras) kpiHoras.textContent = `${(totalDurationMin / 60).toFixed(1)}h`;
            if (kpiAbertasTotal) kpiAbertasTotal.textContent = openVisitsCount;
            if (kpiAbertasDetail) kpiAbertasDetail.textContent = `sem check-out (clique para ver)`;

            const sortedPromoters = Object.values(promoterMap).sort((a, b) => b.totalDurationMin - a.totalDurationMin);
            if (sortedPromoters.length === 0) {
                promotersBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 25px; color: var(--text-dim);">Nenhum promotor encontrado.</td></tr>`;
            } else {
                promotersBody.innerHTML = sortedPromoters.map(p => {
                    const avg = p.completedCount > 0 ? Math.round(p.totalDurationMin / p.completedCount) : 0;
                    return `
                        <tr style="border-bottom: 1px solid rgba(128,128,128,0.05);">
                            <td style="padding: 12px 14px; font-weight: 700; color: var(--text-main);">${p.name}</td>
                            <td style="padding: 12px 14px; color: var(--text-dim); font-size: 11px;">${p.project} / ${p.equipe}</td>
                            <td style="padding: 12px 14px; text-align: center; font-weight: 600;">${p.visitsCount}</td>
                            <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #6366f1;">${formatMin(avg)}</td>
                            <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #10b981;">${formatMin(p.totalDurationMin)}</td>
                        </tr>
                    `;
                }).join('');
            }

        } catch (e) {
            console.warn('Erro ao carregar produtividade do dashboard:', e);
        }
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        loginError.textContent = 'Autenticando...';

        try {
            const { error } = await window.supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error('Login error:', error);
                // Translate common Supabase error messages
                if (error.message.includes('Invalid login credentials')) {
                    loginError.textContent = 'E-mail ou senha incorretos.';
                } else if (error.message.includes('Email not confirmed')) {
                    loginError.textContent = 'E-mail não confirmado. Verifique sua caixa de entrada.';
                } else {
                    loginError.textContent = error.message;
                }
            } else {
                loginError.textContent = '';
                checkAuth(); // Update entire UI after successful login
            }
        } catch (err) {
            console.error('Login exception:', err);
            loginError.textContent = 'Erro de conexão. Verifique sua internet.';
        }
    };

    const handleLogout = async () => {
        await window.supabase.auth.signOut();
        checkAuth(); // Update UI after logout
    };

    // Listen for auth state changes globally (handles token refresh, external logout, etc.)
    if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkAuth();
            } else if (event === 'SIGNED_OUT') {
                updateUIForAuth(null);
            }
        });

        // Configuração do Feed de Check-ins (webhook) na tela principal
        setupLiveFeed();
    }

    function updateOperationalAlertsToday(allEvents) {
        const alertsContainer = document.getElementById('dashboard-operational-alerts-list');
        const badgeCount = document.getElementById('alerts-badge-count');
        if (!alertsContainer) return;

        if (!allEvents || allEvents.length === 0) {
            alertsContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; color: #10b981; font-size: 13px; font-weight: 600;">
                    ✅ Nenhuma anomalia de permanência detectada no dia de hoje.
                </div>
            `;
            if (badgeCount) {
                badgeCount.textContent = '0 Alertas';
                badgeCount.style.background = 'rgba(16, 185, 129, 0.15)';
                badgeCount.style.color = '#10b981';
            }
            return;
        }

        const groups = {};
        
        allEvents.forEach(ev => {
            const parts = (ev.activity_id || '').split(';');
            const agentName = parts[0]?.trim() || "Agente";
            const storeName = (ev.client_id || 'Loja não informada').trim().toUpperCase();
            const taskId = (ev.task_id || 'CHECK IN').trim().toUpperCase();
            const timestamp = new Date(ev.created_at);

            const key = `${agentName}_${storeName}`;
            if (!groups[key]) {
                groups[key] = { agentName, storeName, inEvents: [], outEvents: [] };
            }

            if (taskId.includes('CHECK IN') || taskId.includes('CHECK-IN') || taskId.includes('ENTRADA')) {
                groups[key].inEvents.push(timestamp);
            } else if (taskId.includes('CHECK OUT') || taskId.includes('CHECK-OUT') || taskId.includes('SAIDA') || taskId.includes('SAÍDA')) {
                groups[key].outEvents.push(timestamp);
            }
        });

        const alerts = [];
        const now = new Date();

        Object.values(groups).forEach(g => {
            g.inEvents.sort((a, b) => a - b);
            g.outEvents.sort((a, b) => a - b);

            g.inEvents.forEach(inTime => {
                const outIdx = g.outEvents.findIndex(outTime => outTime >= inTime);
                if (outIdx !== -1) {
                    const outTime = g.outEvents[outIdx];
                    const durationMin = Math.round((outTime - inTime) / 60000);
                    if (durationMin < 20) {
                        const inFmt = inTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        const outFmt = outTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        alerts.push({
                            type: 'SHORT_VISIT',
                            title: `⚠️ Visita Curta (${durationMin} min)`,
                            detail: `${g.agentName} em ${g.storeName}`,
                            subdetail: `Entrada: ${inFmt} | Saída: ${outFmt}`,
                            time: outFmt
                        });
                    }
                } else {
                    const ageHours = (now - inTime) / (1000 * 3600);
                    if (ageHours > 8) {
                        const inFmt = inTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        alerts.push({
                            type: 'FORGOTTEN_CHECKOUT',
                            title: `⚠️ Check-Out Pendente (>8h)`,
                            detail: `${g.agentName} em ${g.storeName}`,
                            subdetail: `Em atendimento desde ${inFmt}`,
                            time: inFmt
                        });
                    }
                }
            });
        });

        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; color: #10b981; font-size: 13px; font-weight: 600;">
                    ✅ Nenhuma anomalia de permanência detectada no dia de hoje.
                </div>
            `;
            if (badgeCount) {
                badgeCount.textContent = '0 Alertas';
                badgeCount.style.background = 'rgba(16, 185, 129, 0.15)';
                badgeCount.style.color = '#10b981';
            }
        } else {
            alertsContainer.innerHTML = alerts.map(a => `
                <div style="padding: 12px 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div>
                        <div style="font-size: 12px; font-weight: 800; color: #ef4444;">${a.title}</div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-top: 2px;">${a.detail}</div>
                        <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${a.subdetail}</div>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: #ef4444; background: rgba(239, 68, 68, 0.12); padding: 4px 8px; border-radius: 6px;">${a.time}</span>
                </div>
            `).join('');

            if (badgeCount) {
                badgeCount.textContent = `${alerts.length} Alerta${alerts.length > 1 ? 's' : ''}`;
                badgeCount.style.background = 'rgba(239, 68, 68, 0.2)';
                badgeCount.style.color = '#ef4444';
            }
        }
    }

    function setupLiveFeed() {
        const activityList = document.getElementById('activity-list');
        const liveStatusText = document.querySelector('.live-status-text');
        if (!activityList) return;

        let hasActivities = false;

        window.addDashboardCheckin = function (checkinData, prepend = false) {
            if (!hasActivities) {
                activityList.innerHTML = '';
                hasActivities = true;
            }

            let agentName = "Agente";
            let agentPhoto = "";

            if (checkinData.activityId && checkinData.activityId.includes(';')) {
                const parts = checkinData.activityId.split(';');
                agentName = parts[0]?.trim() || "Agente";
                const photoPart = parts.find(p => p.trim().toLowerCase().includes('http'));
                agentPhoto = photoPart ? photoPart.trim() : "";
            } else {
                agentName = checkinData.agentName || "Agente";
                agentPhoto = checkinData.photoUrl || "";
            }

            const avatarHtml = agentPhoto
                ? `<img src="${agentPhoto}" class="avatar-mini" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=3b82f6&color=fff'">`
                : `<div class="avatar-mini">${agentName[0]}</div>`;

            const dateStr = checkinData.historyId || new Date().toISOString();
            const dateObj = new Date(dateStr.replace(' ', 'T'));
            const timeFormatted = isNaN(dateObj.getTime()) ? "--:--" : `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            const dateFormatted = isNaN(dateObj.getTime()) ? "--/--/----" : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

            let storeName = checkinData.clientId || 'Visita Técnica';
            let laivonLocalId = '';
            if (storeName.includes(';')) {
                const sp = storeName.split(';');
                storeName = sp[0].trim();
                laivonLocalId = sp[1].trim();
            }

            const item = document.createElement('div');
            item.className = 'checkin-row';
            item.style.cursor = 'pointer';
            item.style.transition = 'background 0.2s';
            item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.03)';
            item.onmouseout = () => item.style.background = 'transparent';

            const isCheckIn = checkinData.taskId && checkinData.taskId.toUpperCase().includes('IN');
            const inTimeStr = isCheckIn ? timeFormatted : '--:--';
            const outTimeStr = isCheckIn ? '--:--' : timeFormatted;

            item.onclick = (e) => {
                // Prevent opening modal if they clicked the photo specifically
                if (e.target.tagName.toLowerCase() === 'img') return;
                window.openVisitAuditModal(agentName, storeName, inTimeStr, outTimeStr, 0, laivonLocalId);
            };

            item.innerHTML = `
                <div class="col-foto">
                    ${agentPhoto ? `<img src="${agentPhoto}" class="checkin-photo-thumb" onclick="window.open('${agentPhoto}', '_blank')" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'color:var(--text-dim); font-size:11px;\\'>Sem Foto</span>';">` : '<span style="color:var(--text-dim); font-size:11px;">Sem Foto</span>'}
                </div>
                <div class="checkin-content">
                    <div class="col-promotor">
                        <div class="name">${agentName}</div>
                    </div>
                    <div class="col-pdv">${storeName}</div>
                    <div class="col-hora">${timeFormatted}</div>
                </div>
                <div class="col-actions">
                    <div class="action-icon-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                </div>
            `;

            if (prepend) {
                activityList.insertBefore(item, activityList.firstChild);
            } else {
                activityList.appendChild(item);
            }

            // Update Count
            const countEl = document.getElementById('checkins-count');
            if (countEl) countEl.textContent = `Total: ${activityList.children.length} check-ins`;

            if (activityList.children.length > 50) {
                activityList.lastChild.remove();
            }

            // Real-time Attendance Logic
            markPresenceAuto(agentName, checkinData.taskId);
        };

        async function markPresenceAuto(agentName, taskId) {
            if (!agentName || agentName === "Agente") return;

            // Filtro Crítico: Apenas 'CHECK IN' conta como presença
            if (taskId !== 'CHECK IN') return;

            const today = new Date().toISOString().split('T')[0];

            try {
                // Check if already marked today
                const { data, error: fetchError } = await window.supabase
                    .from('tb_assiduidade')
                    .select('id')
                    .eq('collaborator_name', agentName)
                    .eq('date', today)
                    .maybeSingle();

                if (!fetchError && !data) {
                    // Not marked yet, insert 'P' (Presença)
                    await window.supabase
                        .from('tb_assiduidade')
                        .insert([{
                            collaborator_name: agentName,
                            date: today,
                            status: 'P',
                            checkin_time: new Date().toLocaleTimeString('pt-BR'),
                            is_manual: false
                        }]);

                    console.log(`Assiduidade: ${agentName} marcado como PRESENTE automaticamente.`);
                }
            } catch (err) {
                console.error('Erro ao marcar assiduidade automática:', err);
            }
        }

        const feedState = {
            currentPage: 0,
            perPage: 5,
            searchQuery: ''
        };

        const updatePaginationUI = (total, currentPage) => {
            const controls = document.querySelector('.pagination-controls');
            if (!controls) return;

            const totalPages = Math.ceil(total / feedState.perPage);
            if (totalPages <= 1) {
                controls.innerHTML = '';
                return;
            }

            let html = '';
            const maxVisible = 5;
            let startPage = Math.max(0, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisible);

            if (endPage - startPage < maxVisible) {
                startPage = Math.max(0, endPage - maxVisible);
            }

            for (let i = startPage; i < endPage; i++) {
                html += `<div class="page-num ${i === currentPage ? 'active' : ''}" onclick="window.changeFeedPage(${i})">${i + 1}</div>`;
            }

            controls.innerHTML = html;
        };

        window.changeFeedPage = (page) => {
            feedState.currentPage = page;
            loadCheckins(page);
        };

        const loadCheckins = async (page = feedState.currentPage) => {
            const activityList = document.getElementById('activity-list');
            if (!activityList) return;

            const searchInput = document.getElementById('checkin-search');
            if (searchInput && !searchInput.dataset.bound) {
                searchInput.dataset.bound = 'true';
                searchInput.addEventListener('input', (e) => {
                    feedState.searchQuery = (e.target.value || '').toLowerCase().trim();
                    feedState.currentPage = 0;
                    loadCheckins(0);
                });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await window.supabase
                .from('checkins')
                .select('created_at, activity_id, client_id, task_id, history_id')
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: true });

            if (!error && data) {
                activityList.innerHTML = '';

                const storeVisits = [];
                const groups = {};

                data.forEach(row => {
                    let agentName = "Agente";
                    let agentPhoto = "";
                    if (row.activity_id && row.activity_id.includes(';')) {
                        const parts = row.activity_id.split(';');
                        agentName = parts[0]?.trim() || "Agente";
                        const photoPart = parts.find(p => p.trim().toLowerCase().includes('http'));
                        agentPhoto = photoPart ? photoPart.trim() : "";
                    } else {
                        agentName = row.activityId || "Agente";
                        agentPhoto = row.photoUrl || "";
                    }

                    let storeName = (row.client_id || 'Visita Técnica').trim().toUpperCase();
                    let laivonLocalId = '';
                    if (storeName.includes(';')) {
                        const sp = storeName.split(';');
                        storeName = sp[0].trim();
                        laivonLocalId = sp[1].trim();
                    }
                    const taskId = (row.task_id || 'CHECK IN').trim().toUpperCase();
                    
                    let timestampStr = row.history_id || row.created_at;
                    let eventTime = new Date(timestampStr);
                    if (isNaN(eventTime.getTime())) eventTime = new Date(row.created_at);

                    const key = `${agentName}_${storeName}`;

                    if (taskId.includes('CHECK IN') || taskId.includes('CHECK-IN') || taskId.includes('ENTRADA')) {
                        if (!groups[key]) {
                            groups[key] = {
                                agentName,
                                photoUrl: agentPhoto,
                                storeName,
                                laivonLocalId,
                                inTime: eventTime,
                                outTime: null
                            };
                            storeVisits.push(groups[key]);
                        } else {
                            groups[key].inTime = eventTime;
                        }
                        markPresenceAuto(agentName, 'CHECK IN');
                    } else if (taskId.includes('CHECK OUT') || taskId.includes('CHECK-OUT') || taskId.includes('SAIDA') || taskId.includes('SAÍDA')) {
                        if (groups[key]) {
                            groups[key].outTime = eventTime;
                        } else {
                            const newVisit = {
                                agentName,
                                photoUrl: agentPhoto,
                                storeName,
                                laivonLocalId,
                                inTime: null,
                                outTime: eventTime
                            };
                            groups[key] = newVisit;
                            storeVisits.push(newVisit);
                        }
                    }
                });

                if (storeVisits.length === 0) {
                    activityList.innerHTML = `
                        <div style="padding: 40px; text-align: center; color: var(--text-dim); font-size: 13px;">
                            Nenhum check-in registrado hoje.
                        </div>
                    `;
                    const countEl = document.getElementById('checkins-count');
                    if (countEl) countEl.textContent = `Total: 0 visitas hoje`;
                    updatePaginationUI(0, 0);
                    return;
                }

                storeVisits.reverse();

                let filteredVisits = storeVisits;
                if (feedState.searchQuery) {
                    filteredVisits = storeVisits.filter(v => 
                        v.agentName.toLowerCase().includes(feedState.searchQuery) ||
                        v.storeName.toLowerCase().includes(feedState.searchQuery)
                    );
                }

                const totalVisits = filteredVisits.length;
                const totalPages = Math.ceil(totalVisits / feedState.perPage) || 1;
                if (page >= totalPages) page = totalPages - 1;
                if (page < 0) page = 0;
                feedState.currentPage = page;

                const pagedVisits = filteredVisits.slice(page * feedState.perPage, (page + 1) * feedState.perPage);

                const now = new Date();
                pagedVisits.forEach(visit => {
                    const isOpen = !visit.outTime;
                    const inStr = visit.inTime ? visit.inTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                    const outStr = visit.outTime ? visit.outTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                    let durationMin = 0;
                    if (visit.inTime && visit.outTime) {
                        durationMin = Math.max(1, Math.round((visit.outTime - visit.inTime) / 60000));
                    } else if (visit.inTime && !visit.outTime) {
                        durationMin = Math.max(0, Math.round((now - visit.inTime) / 60000));
                    }

                    const formatMinText = (min) => {
                        if (!min || min <= 0) return '0min';
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        return h > 0 ? `${h}h ${m}min` : `${m}min`;
                    };

                    const item = document.createElement('div');
                    item.className = 'checkin-row';
                    item.style.padding = '12px 14px';
                    item.style.borderBottom = '1px solid var(--border)';
                    item.style.display = 'flex';
                    item.style.gap = '12px';
                    item.style.alignItems = 'flex-start';
                    item.style.cursor = 'pointer';
                    item.style.transition = 'background 0.2s';
                    item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.03)';
                    item.onmouseout = () => item.style.background = 'transparent';

                    item.onclick = (e) => {
                        if (e.target.tagName.toLowerCase() === 'img') return;
                        window.openVisitAuditModal(visit.agentName, visit.storeName, inStr, outStr, durationMin, visit.laivonLocalId || '');
                    };

                    item.innerHTML = `
                        <div class="col-foto">
                            ${visit.photoUrl ? `<img src="${visit.photoUrl}" class="checkin-photo-thumb" onclick="window.open('${visit.photoUrl}', '_blank')" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'color:var(--text-dim); font-size:12px;\\'>Sem Foto</span>';">` : '<span style="color:var(--text-dim); font-size:12px;">Sem Foto</span>'}
                        </div>

                        <div class="checkin-content" style="flex: 1; font-family: 'Inter', sans-serif;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px;">
                                <strong style="font-size: 15px; font-weight: 800; color: var(--text-main); line-height: 1.3;">${visit.agentName}</strong>
                                <span style="font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 8px; white-space: nowrap; ${isOpen ? 'background: rgba(16, 185, 129, 0.18); color: #059669;' : 'background: rgba(99, 102, 241, 0.18); color: #4f46e5;'}">
                                    ${isOpen ? '🟢 EM LOJA' : '✅ FINALIZADA'}
                                </span>
                            </div>

                            <div style="font-size: 13px; color: var(--text-muted); font-weight: 700; margin-bottom: 8px;">
                                ${visit.storeName}
                            </div>

                            <div style="display: flex; gap: 12px; font-size: 13px; color: var(--text-main); background: rgba(0,0,0,0.04); padding: 8px 12px; border-radius: 10px; flex-wrap: wrap; align-items: center;">
                                <span>In: <strong style="color: var(--text-main); font-size: 14px; font-weight: 800;">${inStr}</strong></span>
                                <span>Out: <strong style="color: var(--text-main); font-size: 14px; font-weight: 800;">${outStr}</strong></span>
                                <span style="color: ${isOpen ? '#059669' : '#4f46e5'}; font-weight: 800; font-size: 13px; margin-left: auto;">
                                    ${isOpen ? 'Em loja:' : 'Permanência:'} ${formatMinText(durationMin)}
                                </span>
                            </div>
                        </div>
                    `;

                    activityList.appendChild(item);
                });

                const countEl = document.getElementById('checkins-count');
                if (countEl) countEl.textContent = `Total: ${storeVisits.length} visitas hoje`;

                updatePaginationUI(totalVisits, feedState.currentPage);

                updateOperationalAlertsToday(data);
            }
        };

        loadCheckins(0);

        // 2. Assinar novos Insets
        window.supabase
            .channel('public:checkins_main')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, payload => {
                const checkinData = {
                    historyId: payload.new.created_at,
                    activityId: payload.new.activity_id,
                    clientId: payload.new.client_id,
                    taskId: payload.new.task_id
                };

                loadCheckins(feedState.currentPage);

                // WhatsApp-Style Notification para TODOS os usuários
                let notifName = 'Agente';
                let notifPhoto = '';
                if (checkinData.activityId && checkinData.activityId.includes(';')) {
                    const parts = checkinData.activityId.split(';');
                    notifName = parts[0]?.trim() || 'Agente';
                    const photoPart = parts.find(p => p.trim().toLowerCase().includes('http'));
                    notifPhoto = photoPart ? photoPart.trim() : '';
                }

                const dateStr = checkinData.historyId || new Date().toISOString();
                const dateObj = new Date(dateStr.replace(' ', 'T'));
                const timeFormatted = isNaN(dateObj.getTime()) ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

                showCheckinNotification(
                    notifName,
                    checkinData.clientId || 'Visita Técnica',
                    notifPhoto,
                    timeFormatted
                );
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED' && liveStatusText) {
                    liveStatusText.textContent = 'CONECTADO';
                    liveStatusText.style.color = '#10b981';
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    if (liveStatusText) {
                        liveStatusText.textContent = 'OFFLINE';
                        liveStatusText.style.color = '#ef4444';
                    }
                }
            });
    }

    // --- Users Management Functions ---

    const loadUsersList = async () => {
        if (!window.supabase || !usersListBody) return;

        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Erro ao listar usuários:', error.message);
            return;
        }

        usersListBody.innerHTML = data.map(u => {
            const allowedProjs = u.allowed_projects || [];
            const projsStr = allowedProjs.length > 0 ? allowedProjs.join(', ') : 'Todos';

            const allowedTabs = u.allowed_tabs || [];
            const tabsStr = allowedTabs.length > 0 ? allowedTabs.join(', ') : 'Padrão';

            return `
            <tr>
                <td>
                    <strong>${u.full_name || 'Sem nome'}</strong><br>
                    <span style="font-size: 11px; color: var(--text-dim);">${u.email || '-'}</span>
                </td>
                <td style="font-family: monospace; font-size: 11px;">${u.id.substring(0, 8)}...</td>
                <td>
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;" title="Projetos: ${projsStr}">
                        📌 ${u.role === 'user' ? projsStr : 'Acesso Total'}
                    </div>
                    <div style="font-size: 10px; color: var(--text-dim);" title="Módulos: ${tabsStr}">
                        🧩 ${u.role === 'user' ? (allowedTabs.length ? allowedTabs.join('/') : 'Todas') : 'Todos'}
                    </div>
                    <select class="custom-select small" onchange="updateUserRole('${u.id}', this.value)" style="padding: 4px; border-radius: 6px; background: var(--bg-accent); color: var(--text-main); border: 1px solid var(--border); margin-top: 5px;">
                        <option value="user" ${u.role === 'user' ? 'selected' : ''}>Colaborador</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        <option value="master" ${u.role === 'master' ? 'selected' : ''}>Mestre</option>
                    </select>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn small" onclick="openEditPermissions('${u.id}')" style="background: var(--primary); border: none;">Editar Acesso</button>
                        <button class="action-btn small delete" onclick="deleteProfile('${u.id}')">Remover</button>
                    </div>
                </td>
            </tr>
        `}).join('');
    };

    window.updateUserRole = async (userId, newRole) => {
        const { error } = await window.supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) showToast(error.message, 'error');
        else {
            showToast('Nível de acesso atualizado!', 'success');
            loadUsersList();
        }
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button');
        const originalText = submitBtn.textContent;

        const email = document.getElementById('new-user-email').value;
        const password = document.getElementById('new-user-password').value;
        const full_name = document.getElementById('new-user-name').value;
        const role = document.getElementById('new-user-role').value;

        // Projetos selecionados
        const allowedProjects = Array.from(document.querySelectorAll('#project-checkboxes input:checked')).map(cb => cb.value);
        // Módulos selecionados
        const allowedTabs = Array.from(document.querySelectorAll('#module-checkboxes input:checked')).map(cb => cb.value);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando acesso...';

        try {
            // Criar um cliente temporário para não deslogar o Master atual
            // Usamos a biblioteca original (supabase) para criar o cliente
            const tempClient = window.supabaseLib.createClient(window.SUPABASE_URL, window.SUPABASE_KEY, {
                auth: { persistSession: false }
            });

            // 1. Criar o usuário no Auth
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email,
                password
            });

            if (authError) throw authError;

            if (authData.user) {
                submitBtn.textContent = 'Salvando perfil...';
                const userId = authData.user.id;

                // 2. Criar o perfil (inserindo o email também)
                const { error: profileError } = await window.supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name,
                        role,
                        email: email,
                        allowed_projects: allowedProjects,
                        allowed_tabs: allowedTabs
                    });

                if (profileError) {
                    if (profileError.message.includes('not found')) {
                        throw new Error('A tabela "profiles" não foi encontrada. Você precisa rodar o comando SQL no painel do Supabase primeiro.');
                    }
                    throw profileError;
                }

                alert('✅ Usuário cadastrado com sucesso!');
                e.target.reset();
                loadUsersList();
            }
        } catch (err) {
            console.error('Erro no cadastro:', err);
            alert('❌ Erro: ' + (err.message || 'Erro desconhecido ao cadastrar.'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    };

    const handleUpdateMyProfile = async (e) => {
        e.preventDefault();
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) return;

        const full_name = document.getElementById('my-full-name').value;

        const { error } = await window.supabase
            .from('profiles')
            .upsert({ id: session.user.id, full_name }, { onConflict: 'id' });

        if (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } else {
            alert('Perfil atualizado com sucesso!');
            checkAuth(); // Refresh UI
        }
    };

    // Expose for click events
    window.deleteProfile = async (id) => {
        if (!confirm('Deseja remover este perfil? O acesso do usuário não será excluído do Supabase, apenas os dados deste sistema.')) return;
        const { error } = await window.supabase.from('profiles').delete().eq('id', id);
        if (error) alert('Erro ao excluir: ' + error.message);
        else loadUsersList();
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (createProfileForm) {
        createProfileForm.addEventListener('submit', handleCreateProfile);
    }

    if (updateMyProfileForm) {
        updateMyProfileForm.addEventListener('submit', handleUpdateMyProfile);
    }

    // --- Excel Upload Handling with Web Worker ---
    const excelInput = document.getElementById('excel-upload');
    const btnProcessExcel = document.getElementById('btn-process-excel');
    let parsedExcelData = [];
    const excelWorker = new Worker('/excel-worker.js');

    excelWorker.onmessage = function (e) {
        const { type, data, message } = e.data;
        if (type === 'SUCCESS') {
            parsedExcelData = data;
            btnProcessExcel.style.display = 'inline-block';
            btnProcessExcel.textContent = `Salvar ${parsedExcelData.length} registros`;
            btnProcessExcel.disabled = false;
        } else {
            Swal.fire('Erro!', message, 'error');
            btnProcessExcel.disabled = false;
        }
    };

    if (excelInput) {
        excelInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                btnProcessExcel.style.display = 'none';
                return;
            }

            btnProcessExcel.style.display = 'inline-block';
            btnProcessExcel.textContent = 'Lendo arquivo...';
            btnProcessExcel.disabled = true;

            const reader = new FileReader();
            reader.onload = function (event) {
                excelWorker.postMessage({ type: 'PARSE_EXCEL', data: new Uint8Array(event.target.result) });
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if (btnProcessExcel) {
        btnProcessExcel.addEventListener('click', async () => {
            if (parsedExcelData.length === 0) return;

            btnProcessExcel.disabled = true;
            btnProcessExcel.textContent = 'Enviando para o banco...';

            try {
                // 1. Limpa a base atual
                const { error: delError } = await window.supabase.from('tb_planilha').delete().neq('id', -1);
                if (delError && !delError.message.includes('does not exist')) throw delError;

                // 2. Insere os novos dados em lotes
                const batchSize = 1000;
                for (let i = 0; i < parsedExcelData.length; i += batchSize) {
                    const batch = parsedExcelData.slice(i, i + batchSize);
                    const { error } = await window.supabase.from('tb_planilha').insert(batch);
                    if (error) throw error;
                }

                // 3. ATUALIZAÇÃO AUTOMÁTICA DE COLABORADORES (Melhoria B)
                const uniqueStaff = {};
                parsedExcelData.forEach(row => {
                    if (row.agente) {
                        const name = row.agente.trim().toUpperCase();
                        if (!uniqueStaff[name]) {
                            uniqueStaff[name] = {
                                nome: name,
                                projeto: row.projeto || 'GERAL',
                                cargo: row.funcao || row.cargo || 'PROMOTOR'
                            };
                        }
                    }
                });

                const staffArray = Object.values(uniqueStaff);
                if (staffArray.length > 0) {
                    await window.supabase.from('tb_colaboradores').upsert(staffArray, { onConflict: 'nome' });
                }

                Swal.fire('Sucesso!', `Base atualizada com ${parsedExcelData.length} registros e lista de colaboradores sincronizada.`, 'success');
                excelInput.value = '';
                btnProcessExcel.style.display = 'none';
                populateDashboardData();

            } catch (err) {
                console.error(err);
                Swal.fire('Erro!', err.message, 'error');
            } finally {
                btnProcessExcel.disabled = false;
            }
        });
    }

    // --- Staff Base (Colaboradores) Management ---

    const loadStaffBaseList = async () => {
        const listBody = document.getElementById('staff-base-list');
        if (!listBody || !window.supabase) return;

        listBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Carregando colaboradores...</td></tr>';

        const { data, error } = await window.supabase
            .from('tb_colaboradores')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            showToast('Erro ao carregar colaboradores: ' + error.message, 'error');
            return;
        }

        if (!data || data.length === 0) {
            listBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Nenhum colaborador na base. Use o botão "Novo" ou importe um Excel.</td></tr>';
            return;
        }

        listBody.innerHTML = data.map(s => {
            const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
            const scaleHtml = days.map(d => `<span style="font-size: 9px; margin-right: 3px; color: ${s[d] ? 'var(--primary)' : 'var(--text-dim)'}; font-weight: ${s[d] ? '800' : '400'}">${d[0].toUpperCase()}</span>`).join('');

            const isAtivo = s.ativo !== false;
            const statusHtml = isAtivo
                ? '<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Ativo</span>'
                : '<span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Inativo</span>';

            const actionHtml = isAtivo
                ? `<button class="action-icon-btn" onclick="deactivateStaffFromBase('${s.nome}')" title="Demissão" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; width: 36px; height: 36px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
                   </button>`
                : `<button class="action-icon-btn" onclick="reactivateStaffFromBase('${s.nome}')" title="Reativar" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); color: #10b981; width: 36px; height: 36px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                   </button>`;

            // Função segura para formatar data ISO (YYYY-MM-DD) para BR (DD/MM/YYYY)
            const formatDateSafe = (dateStr) => {
                if (!dateStr) return null;
                const parts = dateStr.split('T')[0].split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return dateStr;
            };

            const admFmt = formatDateSafe(s.data_admissao);
            const demFmt = formatDateSafe(s.data_desativacao);

            return `
                <tr style="height: 70px; ${!isAtivo ? 'opacity: 0.6;' : ''}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, ${isAtivo ? 'var(--primary)' : '#444'}, ${isAtivo ? 'var(--text-accent)' : '#666'}); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                ${s.nome[0]}
                            </div>
                            <div>
                                <strong style="font-size: 14px; letter-spacing: -0.2px;">${s.nome}</strong>
                                <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
                                    ${admFmt ? 'Adm: ' + admFmt : 'Sem data adm.'}
                                    ${demFmt ? ' | Dem: ' + demFmt : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted); font-size: 11px; padding: 6px 12px; border-radius: 8px; font-weight: 600;">${s.cargo || 'PROMOTOR'}</span></td>
                    <td><span class="badge" style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); font-size: 11px; padding: 6px 12px; border-radius: 8px; font-weight: 600;">${s.projeto || 'GERAL'}</span></td>
                    <td><div style="display: flex; align-items: center;">${scaleHtml}</div></td>
                    <td style="text-align: center;">${statusHtml}</td>
                    <td style="text-align: right;">
                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                            <button class="action-icon-btn" onclick="openEditStaffModal('${s.nome}')" title="Editar" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); width: 36px; height: 36px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            ${actionHtml}
                            <button class="action-icon-btn" onclick="deleteBaseStaff('${s.nome}')" title="Excluir Permanente" style="background: rgba(0,0,0,0.1); border: 1px solid var(--border); width: 36px; height: 36px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.openAddStaffModal = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Novo Colaborador',
            html:
                '<div style="text-align: left; font-size: 14px;">' +
                '<label style="color: var(--text-muted);">Nome Completo:</label>' +
                '<input id="swal-name" class="swal2-input" style="margin-top: 5px; margin-bottom: 15px;" placeholder="Ex: JOÃO SILVA">' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">' +
                '<div>' +
                '<label style="color: var(--text-muted);">Função:</label>' +
                '<input id="swal-cargo" class="swal2-input" style="margin-top: 5px; width: 100%;" placeholder="Ex: PROMOTOR">' +
                '</div>' +
                '<div>' +
                '<label style="color: var(--text-muted);">Projeto:</label>' +
                '<input id="swal-project" class="swal2-input" style="margin-top: 5px; width: 100%;" placeholder="Ex: GERAL">' +
                '</div>' +
                '</div>' +
                '<label style="color: var(--text-muted);">Equipe:</label>' +
                '<input id="swal-equipe" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px; width: 100%;" placeholder="Ex: EQUIPE ALPHA">' +
                '<label style="color: var(--text-muted);">Data de Admissão:</label>' +
                '<input id="swal-admission" type="date" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px; width: 100%;">' +
                '<label style="color: var(--text-muted); display: block; margin-bottom: 10px;">Escala de Trabalho (Dias Ativos):</label>' +
                generateWeekCheckboxes() +
                '</div>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Cadastrar',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            preConfirm: () => {
                const nome = document.getElementById('swal-name').value.toUpperCase().trim();
                if (!nome) { Swal.showValidationMessage('O nome é obrigatório'); return false; }
                return {
                    nome: nome,
                    cargo: document.getElementById('swal-cargo').value.toUpperCase().trim() || 'PROMOTOR',
                    projeto: document.getElementById('swal-project').value.toUpperCase().trim() || 'GERAL',
                    equipe: document.getElementById('swal-equipe').value.toUpperCase().trim() || 'GERAL',
                    data_admissao: document.getElementById('swal-admission').value || null,
                    seg: document.getElementById('check-seg').checked,
                    ter: document.getElementById('check-ter').checked,
                    qua: document.getElementById('check-qua').checked,
                    qui: document.getElementById('check-qui').checked,
                    sex: document.getElementById('check-sex').checked,
                    sab: document.getElementById('check-sab').checked,
                    dom: document.getElementById('check-dom').checked
                }
            }
        });

        if (formValues && formValues.nome) {
            const { error } = await window.supabase.from('tb_colaboradores').upsert(formValues, { onConflict: 'nome' });
            if (error) showToast(error.message, 'error');
            else {
                showToast('Colaborador salvo com sucesso!', 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            }
        }
    };

    window.openEditStaffModal = async (currentNome) => {
        const { data, error } = await window.supabase
            .from('tb_colaboradores')
            .select('*')
            .eq('nome', currentNome)
            .single();

        if (error) { showToast('Erro ao carregar dados.', 'error'); return; }

        const { value: formValues } = await Swal.fire({
            title: 'Editar Colaborador',
            html:
                '<div style="text-align: left; font-size: 14px;">' +
                '<label style="color: var(--text-muted);">Nome Completo:</label>' +
                `<input id="swal-name" class="swal2-input" style="margin-top: 5px; margin-bottom: 15px;" value="${data.nome}">` +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">' +
                '<div>' +
                '<label style="color: var(--text-muted);">Função:</label>' +
                `<input id="swal-cargo" class="swal2-input" style="margin-top: 5px; width: 100%;" value="${data.cargo || ''}">` +
                '</div>' +
                '<div>' +
                '<label style="color: var(--text-muted);">Projeto:</label>' +
                `<input id="swal-project" class="swal2-input" style="margin-top: 5px; width: 100%;" value="${data.projeto || ''}">` +
                '</div>' +
                '</div>' +
                '<label style="color: var(--text-muted);">Equipe:</label>' +
                `<input id="swal-equipe" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px; width: 100%;" value="${data.equipe || ''}">` +
                '<label style="color: var(--text-muted);">Data de Admissão:</label>' +
                `<input id="swal-admission" type="date" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px; width: 100%;" value="${data.data_admissao || ''}">` +
                '<label style="color: var(--text-muted); display: block; margin-bottom: 10px;">Escala de Trabalho (Dias Ativos):</label>' +
                generateWeekCheckboxes(data) +
                '</div>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Atualizar',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            preConfirm: () => {
                const nome = document.getElementById('swal-name').value.toUpperCase().trim();
                if (!nome) { Swal.showValidationMessage('O nome é obrigatório'); return false; }
                return {
                    nome: nome,
                    cargo: document.getElementById('swal-cargo').value.toUpperCase().trim() || 'PROMOTOR',
                    projeto: document.getElementById('swal-project').value.toUpperCase().trim() || 'GERAL',
                    equipe: document.getElementById('swal-equipe').value.toUpperCase().trim() || 'GERAL',
                    data_admissao: document.getElementById('swal-admission').value || null,
                    seg: document.getElementById('check-seg').checked,
                    ter: document.getElementById('check-ter').checked,
                    qua: document.getElementById('check-qua').checked,
                    qui: document.getElementById('check-qui').checked,
                    sex: document.getElementById('check-sex').checked,
                    sab: document.getElementById('check-sab').checked,
                    dom: document.getElementById('check-dom').checked
                }
            }
        });

        if (formValues) {
            const { error: updateError } = await window.supabase
                .from('tb_colaboradores')
                .update(formValues)
                .eq('nome', currentNome);

            if (updateError) showToast(updateError.message, 'error');
            else {
                showToast('Alterações salvas!', 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            }
        }
    };

    function generateWeekCheckboxes(data = null) {
        const days = [
            { id: 'seg', label: 'Seg' },
            { id: 'ter', label: 'Ter' },
            { id: 'qua', label: 'Qua' },
            { id: 'qui', label: 'Qui' },
            { id: 'sex', label: 'Sex' },
            { id: 'sab', label: 'Sáb' },
            { id: 'dom', label: 'Dom' }
        ];

        return `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid var(--border);">
                ${days.map(d => `
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px;">
                        <input type="checkbox" id="check-${d.id}" ${(!data && d.id !== 'dom') || (data && data[d.id]) ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--primary);">
                        ${d.label}
                    </label>
                `).join('')}
            </div>
        `;
    }

    window.deleteBaseStaff = async (nome) => {
        const result = await Swal.fire({
            title: 'Excluir Permanente?',
            text: `ATENÇÃO: Isso removerá ${nome} COMPLETAMENTE da base fixa. Para apenas desligar o colaborador, use a opção de Demissão.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sim, excluir permanentemente',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
        });

        if (result.isConfirmed) {
            const { error } = await window.supabase.from('tb_colaboradores').delete().eq('nome', nome);
            if (error) showToast(error.message, 'error');
            else {
                showToast('Colaborador removido permanentemente!', 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            }
        }
    };

    window.deactivateStaffFromBase = async (nome) => {
        const today = new Date().toISOString().split('T')[0];
        const { value: date } = await Swal.fire({
            title: 'Confirmar Demissão',
            text: 'Informe a data de demissão para ' + nome + ':',
            input: 'date',
            inputValue: today,
            showCancelButton: true,
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
        });

        if (date) {
            const { error } = await window.supabase
                .from('tb_colaboradores')
                .update({ ativo: false, data_desativacao: date })
                .eq('nome', nome);

            if (error) showToast(error.message, 'error');
            else {
                showToast('Colaborador demitido!', 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            }
        }
    };

    window.reactivateStaffFromBase = async (nome) => {
        const { error } = await window.supabase
            .from('tb_colaboradores')
            .update({ ativo: true, data_desativacao: null })
            .eq('nome', nome);

        if (error) showToast(error.message, 'error');
        else {
            showToast('Colaborador reativado!', 'success');
            loadStaffBaseList();
            syncChannel.postMessage({ type: 'STAFF_UPDATED' });
        }
    };

    // --- Importação de Base Fixa via Planilha ---
    window.downloadStaffBaseTemplate = () => {
        const data = [
            ["NOME", "FUNCAO", "PROJETO", "EQUIPE"],
            ["JOAO SILVA", "PROMOTOR", "GERAL", "EQUIPE A"],
            ["MARIA SOUZA", "PROMOTOR", "GERAL", "EQUIPE B"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Base Fixa");
        XLSX.writeFile(wb, "modelo_base_fixa_objetiva.xlsx");
    };

    window.exportStaffBaseList = async () => {
        try {
            const { value: filterChoice } = await Swal.fire({
                title: 'Exportar Lista de Colaboradores',
                text: 'Selecione o filtro dos colaboradores para a exportação:',
                icon: 'question',
                input: 'radio',
                inputOptions: {
                    'todos': 'Todos os Colaboradores (Ativos e Inativos)',
                    'ativos': 'Apenas Colaboradores Ativos',
                    'inativos': 'Apenas Colaboradores Inativos (Demitidos)'
                },
                inputValue: 'todos',
                showCancelButton: true,
                confirmButtonText: 'Exportar Excel',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#f07f27',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                customClass: {
                    popup: 'swal2-dark-custom'
                }
            });

            if (!filterChoice) return; // Cancelou

            const { data, error } = await window.supabase
                .from('tb_colaboradores')
                .select('nome, cargo, projeto, equipe, ativo, data_admissao, data_desativacao, seg, ter, qua, qui, sex, sab, dom')
                .order('nome', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                Swal.fire('Aviso', 'Não há colaboradores cadastrados para exportar.', 'info');
                return;
            }

            // Filtrar conforme escolha do usuário
            let filteredData = data;
            if (filterChoice === 'ativos') {
                filteredData = data.filter(s => s.ativo !== false);
            } else if (filterChoice === 'inativos') {
                filteredData = data.filter(s => s.ativo === false);
            }

            if (filteredData.length === 0) {
                Swal.fire('Aviso', `Nenhum colaborador encontrado para o filtro "${filterChoice.toUpperCase()}".`, 'info');
                return;
            }

            // Função segura para formatar data ISO (YYYY-MM-DD) para BR (DD/MM/YYYY)
            const formatDateSafe = (dateStr) => {
                if (!dateStr) return '';
                const parts = dateStr.split('T')[0].split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return dateStr;
            };

            // Mapear para um formato amigável para Excel
            const exportData = filteredData.map(s => {
                const isAtivo = s.ativo !== false;
                return {
                    'NOME': s.nome,
                    'FUNÇÃO': s.cargo || '',
                    'PROJETO': s.projeto || '',
                    'EQUIPE': s.equipe || '',
                    'STATUS': isAtivo ? 'ATIVO' : 'INATIVO',
                    'DATA ADMISSÃO': formatDateSafe(s.data_admissao),
                    'DATA DEMISSÃO': formatDateSafe(s.data_desativacao),
                    'SEG': s.seg ? 'SIM' : 'NÃO',
                    'TER': s.ter ? 'SIM' : 'NÃO',
                    'QUA': s.qua ? 'SIM' : 'NÃO',
                    'QUI': s.qui ? 'SIM' : 'NÃO',
                    'SEX': s.sex ? 'SIM' : 'NÃO',
                    'SAB': s.sab ? 'SIM' : 'NÃO',
                    'DOM': s.dom ? 'SIM' : 'NÃO'
                };
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();

            let sheetName = "Colaboradores";
            if (filterChoice === 'ativos') sheetName = "Ativos";
            else if (filterChoice === 'inativos') sheetName = "Inativos";

            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Gerar nome do arquivo com data
            const date = new Date().toISOString().split('T')[0];
            const fileName = `lista_colaboradores_${filterChoice}_${date}.xlsx`;
            XLSX.writeFile(wb, fileName);

            showToast(`Lista de colaboradores (${filterChoice}) exportada com sucesso!`, 'success');
        } catch (err) {
            console.error('Erro ao exportar:', err);
            Swal.fire('Erro!', 'Falha ao exportar lista: ' + err.message, 'error');
        }
    };

    window.importStaffBaseFile = async (input) => {
        const file = input.files[0];
        if (!file) return;

        Swal.fire({
            title: 'Processando...',
            text: 'Lendo sua planilha de colaboradores',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error("A planilha está vazia ou no formato incorreto.");
                }

                const staffToUpsert = jsonData.map(row => ({
                    nome: (row.NOME || row.nome || "").toString().trim().toUpperCase(),
                    cargo: (row.FUNCAO || row.funcao || row.CARGO || row.cargo || "PROMOTOR").toString().trim().toUpperCase(),
                    projeto: (row.PROJETO || row.projeto || "GERAL").toString().trim().toUpperCase(),
                    equipe: (row.EQUIPE || row.equipe || "GERAL").toString().trim().toUpperCase(),
                    data_admissao: row.ADMISSAO || row.admissao || null
                })).filter(s => s.nome !== "");

                if (staffToUpsert.length === 0) {
                    throw new Error("Nenhum colaborador válido encontrado. Verifique se as colunas NOME e PROJETO existem.");
                }

                const { error } = await window.supabase
                    .from('tb_colaboradores')
                    .upsert(staffToUpsert, { onConflict: 'nome' });

                if (error) throw error;

                Swal.fire('Sucesso!', `${staffToUpsert.length} colaboradores foram sincronizados na base fixa.`, 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            } catch (err) {
                console.error('Erro na importação:', err);
                Swal.fire('Erro!', err.message, 'error');
            } finally {
                input.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Filtro de busca na base
    const staffSearch = document.getElementById('staff-search');
    if (staffSearch) {
        staffSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#staff-base-list tr');
            rows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? 'table-row' : 'none';
            });
        });
    }

    init();
});

window.openEditPermissions = async (userId) => {
    const { data: user, error: userError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError) {
        showToast('Erro ao buscar usuário', 'error');
        return;
    }

    // Buscar todos os projetos disponíveis
    const { data: staffData } = await window.supabase.from('tb_colaboradores').select('projeto');
    const allProjects = [...new Set(staffData?.map(item => item.projeto || 'GERAL') || [])].sort();

    const modules = [
        { id: 'home', label: 'Dashboard' },
        { id: 'relatorio', label: 'Relatórios' },
        { id: 'cartas', label: 'Cartas' },
        { id: 'roteiro', label: 'Rotas' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'assiduidade', label: 'Assiduidade' },
        { id: 'colaboradores-base', label: 'Colaboradores' }
    ];

    const userProjs = user.allowed_projects || [];
    const userTabs = user.allowed_tabs || [];

    const projectsHtml = allProjects.map(p => `
            <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #fff; cursor: pointer; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px;">
                <input type="checkbox" class="edit-proj-cb" value="${p}" ${userProjs.includes(p) ? 'checked' : ''} style="accent-color: #6366f1; width: 16px; height: 16px;">
                ${p}
            </label>
        `).join('');

    const modulesHtml = modules.map(m => `
            <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #fff; cursor: pointer; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px;">
                <input type="checkbox" class="edit-tab-cb" value="${m.id}" ${userTabs.includes(m.id) ? 'checked' : ''} style="accent-color: #6366f1; width: 16px; height: 16px;">
                ${m.label}
            </label>
        `).join('');

    Swal.fire({
        title: `<span style="color: #fff">Editar Acessos: ${user.full_name}</span>`,
        html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px;">
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #6366f1; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">Projetos Permitidos</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${projectsHtml}
                        </div>
                    </div>
                    <div>
                        <h4 style="color: #6366f1; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">Módulos do Sistema</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${modulesHtml}
                        </div>
                    </div>
                </div>
            `,
        background: '#121216',
        showCancelButton: true,
        confirmButtonText: 'Salvar Alterações',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#3f3f46',
        width: '600px',
        preConfirm: () => {
            const selectedProjs = Array.from(document.querySelectorAll('.edit-proj-cb:checked')).map(cb => cb.value);
            const selectedTabs = Array.from(document.querySelectorAll('.edit-tab-cb:checked')).map(cb => cb.value);
            return { selectedProjs, selectedTabs };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { selectedProjs, selectedTabs } = result.value;

            const { error: updateError } = await window.supabase
                .from('profiles')
                .update({
                    allowed_projects: selectedProjs,
                    allowed_tabs: selectedTabs
                })
                .eq('id', userId);

            if (updateError) showToast(updateError.message, 'error');
            else {
                showToast('Acessos atualizados com sucesso!', 'success');
                loadUsersList();
            }
        }
    });
};

const populateProjectCheckboxes = async () => {
    const container = document.getElementById('project-checkboxes');
    if (!container || !window.supabase) return;

    const { data, error } = await window.supabase
        .from('tb_colaboradores')
        .select('projeto');

    if (error) {
        container.innerHTML = '<div style="color: #ef4444; font-size: 11px;">Erro ao carregar projetos</div>';
        return;
    }

    const projects = [...new Set(data.map(item => item.projeto || 'GERAL'))].sort();

    container.innerHTML = projects.map(p => `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-main);">
                <input type="checkbox" value="${p}" style="accent-color: var(--primary);">
                ${p}
            </label>
        `).join('') || '<div style="font-size: 11px; color: var(--text-dim);">Nenhum projeto encontrado</div>';
};
