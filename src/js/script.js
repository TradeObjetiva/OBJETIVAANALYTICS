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
            window.location.hash = targetId;
        }

        // Auto-load data based on tab
        if (targetId === 'colaboradores-base') loadStaffBaseList();
        if (targetId === 'users') loadUsersList();

        // Sync styles with iframes
        syncIframeStyles();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    window.app = { ...window.app, showToast };

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

            // Populate Skeletons after a small visual delay
            setTimeout(() => populateDashboardData(displayName), 800);

            // Show/Hide restricted menu
            const adminUploadArea = document.getElementById('admin-upload-area');
            const adminQuickActions = document.getElementById('admin-quick-actions');
            if (isMaster) {
                if (navUsers) navUsers.classList.remove('hidden');
                const mobileNavUsers = document.getElementById('mobile-nav-users');
                if (mobileNavUsers) mobileNavUsers.classList.remove('hidden');
                if(adminUploadArea) adminUploadArea.style.display = 'block';
                if(adminQuickActions) adminQuickActions.style.display = 'flex';
                loadUsersList();
            } else {
                navUsers.classList.add('hidden');
                if(adminUploadArea) adminUploadArea.style.display = 'none';
                if(adminQuickActions) adminQuickActions.style.display = 'none';
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
                <div class="avatar">${displayName[0].toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">
                        ${displayName} 
                        ${isMaster ? '<span style="font-size: 10px; background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">Mestre</span>' : ''}
                    </div>
                </div>
                <button class="logout-btn" id="logout-btn">Sair</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            loginOverlay.classList.remove('hidden');
            userProfile.innerHTML = '';
            if (welcomeName) welcomeName.textContent = 'Objetiva Analytics';
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


        } catch (err) {
            console.warn('Erro ao ler tb_planilha:', err.message);
            [clientesEl, redesEl, lojasEl, municipiosEl, horasEl].forEach(el => {
                if(el) { el.classList.remove('skeleton'); el.innerHTML = '-'; }
            });
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

    function setupLiveFeed() {
        const activityList = document.getElementById('activity-list');
        const liveStatusText = document.querySelector('.live-status-text');
        if (!activityList) return;

        let hasActivities = false;

        window.addDashboardCheckin = function(checkinData, prepend = false) {
            if (!hasActivities) {
                activityList.innerHTML = '';
                hasActivities = true;
            }

            let agentName = "Agente";
            let agentPhoto = "";
            
            if (checkinData.activityId && checkinData.activityId.includes(';')) {
                const parts = checkinData.activityId.split(';').filter(p => p.trim() !== '');
                agentName = parts[0] || "Agente";
                agentPhoto = parts.length > 1 ? parts[parts.length - 1] : "";
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
            const dateFormatted = isNaN(dateObj.getTime()) ? "--/--/----" : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

            const item = document.createElement('div');
            item.className = 'checkin-row';
            
            item.innerHTML = `
                <div class="col-promotor">
                    ${avatarHtml}
                    <div class="name">${agentName}</div>
                </div>
                <div class="col-pdv">${checkinData.clientId || 'Visita Técnica'}</div>
                <div class="col-data">${dateFormatted}</div>
                <div class="col-hora">${timeFormatted}</div>
                <div class="col-foto">
                    ${agentPhoto ? `<img src="${agentPhoto}" class="checkin-photo-thumb" onclick="window.open('${agentPhoto}', '_blank')">` : '<span style="color:var(--text-dim); font-size:11px;">Sem Foto</span>'}
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
            markPresenceAuto(agentName);
        };

        async function markPresenceAuto(agentName) {
            if (!agentName || agentName === "Agente") return;
            
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

        // 1. Busca Iniciais do Dia (Com Suporte a Paginação)
        const loadCheckins = async (page = 0) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const from = page * state.checkinsPerPage;
            const to = from + state.checkinsPerPage - 1;

            const { data, error, count } = await window.supabase
                .from('checkins')
                .select('*', { count: 'exact' })
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false })
                .range(from, to);

            if (!error && data) {
                if (page === 0) activityList.innerHTML = '';
                
                if (data.length > 0) {
                    hasActivities = true;
                    // Se for página 0, limpamos e re-populamos. Se for página > 0, podemos adicionar ao final ou substituir.
                    if (page === 0) activityList.innerHTML = '';
                    
                    data.forEach(row => {
                        window.addDashboardCheckin({
                            historyId: row.created_at,
                            activityId: row.activity_id,
                            clientId: row.client_id
                        }, false);
                    });

                    // Atualizar contador de total
                    const countEl = document.getElementById('checkins-count');
                    if (countEl) countEl.textContent = `Total: ${count || data.length} check-ins hoje`;
                    
                    updatePaginationUI(count || 0, page);
                } else if (page === 0 && !hasActivities) {
                    activityList.innerHTML = `
                        <div class="activity-item">
                            <div class="activity-info">
                                <span class="title" style="color:var(--text-muted)">Aguardando Webhooks...</span>
                            </div>
                        </div>
                    `;
                }
            }
        };

        const updatePaginationUI = (total, currentPage) => {
            const controls = document.querySelector('.pagination-controls');
            if (!controls) return;

            const totalPages = Math.ceil(total / state.checkinsPerPage);
            let html = `<span style="margin-right: 8px;">Página</span>`;
            
            for (let i = 0; i < Math.min(totalPages, 5); i++) {
                html += `<div class="page-num ${i === currentPage ? 'active' : ''}" onclick="changeFeedPage(${i})">${i + 1}</div>`;
            }
            
            if (totalPages > 5) html += `<div class="page-num">...</div>`;
            controls.innerHTML = html;
        };

        window.changeFeedPage = (page) => {
            state.checkinsPage = page;
            loadCheckins(page);
        };

        loadCheckins(0);

        // 2. Assinar novos Insets
        window.supabase
            .channel('public:checkins_main')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, payload => {
                window.addDashboardCheckin({
                    historyId: payload.new.created_at, 
                    activityId: payload.new.activity_id,
                    clientId: payload.new.client_id
                }, true); // Prepend para novos caírem no topo
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

        usersListBody.innerHTML = data.map(u => `
            <tr>
                <td>
                    <strong>${u.full_name || 'Sem nome'}</strong><br>
                    <span style="font-size: 11px; color: var(--text-dim);">${u.email || '-'}</span>
                </td>
                <td style="font-family: monospace; font-size: 11px;">${u.id.substring(0,8)}...</td>
                <td>
                    <select class="custom-select small" onchange="updateUserRole('${u.id}', this.value)" style="padding: 4px; border-radius: 6px; background: var(--bg-accent); color: var(--text-main); border: 1px solid var(--border);">
                        <option value="user" ${u.role === 'user' ? 'selected' : ''}>Colaborador</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        <option value="master" ${u.role === 'master' ? 'selected' : ''}>Mestre</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn small delete" onclick="deleteProfile('${u.id}')">Remover</button>
                </td>
            </tr>
        `).join('');
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
                        email: email
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

    excelWorker.onmessage = function(e) {
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
            reader.onload = function(event) {
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
                            uniqueStaff[name] = { nome: name, projeto: row.projeto || 'PROMOTOR' };
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

        listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">Carregando colaboradores...</td></tr>';

        const { data, error } = await window.supabase
            .from('tb_colaboradores')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            showToast('Erro ao carregar colaboradores: ' + error.message, 'error');
            return;
        }

        if (!data || data.length === 0) {
            listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">Nenhum colaborador na base. Use o botão "Novo" ou importe um Excel.</td></tr>';
            return;
        }

        listBody.innerHTML = data.map(s => {
            const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
            const scaleHtml = days.map(d => {
                const isActive = s[d];
                return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 18px; font-size: 9px; font-weight: 700; border-radius: 4px; margin-right: 4px; 
                    background: ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.03)'}; 
                    color: ${isActive ? 'white' : 'var(--text-dim)'}; 
                    border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}; 
                    box-shadow: ${isActive ? '0 2px 4px rgba(79, 70, 229, 0.2)' : 'none'};">
                    ${d.toUpperCase()}
                </span>`;
            }).join('');

            return `
                <tr style="height: 70px;">
                    <td>
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--text-accent)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: white; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);">
                                ${s.nome[0]}
                            </div>
                            <strong style="font-size: 14px; letter-spacing: -0.2px;">${s.nome}</strong>
                        </div>
                    </td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted); font-size: 11px; padding: 6px 12px; border-radius: 8px; font-weight: 600;">${s.projeto || 'PROMOTOR DE MERCHANDISING'}</span></td>
                    <td><div style="display: flex; align-items: center;">${scaleHtml}</div></td>
                    <td style="color: var(--text-dim); font-size: 12px; font-weight: 500;">${new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style="text-align: right;">
                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                            <button class="action-icon-btn" onclick="openEditStaffModal('${s.nome}')" title="Editar" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); width: 36px; height: 36px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-icon-btn" onclick="deleteBaseStaff('${s.nome}')" title="Excluir" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; width: 36px; height: 36px;">
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
                '<label style="color: var(--text-muted);">Função / Projeto:</label>' +
                '<input id="swal-project" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px;" placeholder="Ex: PROMOTOR">' +
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
                    projeto: document.getElementById('swal-project').value.toUpperCase().trim() || 'PROMOTOR',
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
                '<label style="color: var(--text-muted);">Função / Projeto:</label>' +
                `<input id="swal-project" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px;" value="${data.projeto || ''}">` +
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
                    projeto: document.getElementById('swal-project').value.toUpperCase().trim() || 'PROMOTOR',
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
            title: 'Excluir Colaborador?',
            text: `Deseja remover ${nome} da base fixa? Isso não apaga check-ins passados.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Não',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
        });

        if (result.isConfirmed) {
            const { error } = await window.supabase.from('tb_colaboradores').delete().eq('nome', nome);
            if (error) showToast(error.message, 'error');
            else {
                showToast('Colaborador removido!', 'success');
                loadStaffBaseList();
                syncChannel.postMessage({ type: 'STAFF_UPDATED' });
            }
        }
    };

    // --- Importação de Base Fixa via Planilha ---
    window.downloadStaffBaseTemplate = () => {
        const data = [
            ["NOME", "PROJETO"],
            ["JOAO SILVA", "PROMOTOR"],
            ["MARIA SOUZA", "PROMOTOR"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Base Fixa");
        XLSX.writeFile(wb, "modelo_base_fixa_objetiva.xlsx");
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
                    projeto: (row.PROJETO || row.projeto || row.FUNCAO || row.funcao || "PROMOTOR").toString().trim().toUpperCase()
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
