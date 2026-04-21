document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        activeTab: (window.location.hash.replace('#', '').split('?')[0]) || 'home',
        theme: localStorage.getItem('theme') || 'dark',
        homeChart: null,
        lastRefresh: null
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
            window.location.hash = targetId;
        }

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
                navUsers.classList.remove('hidden');
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

        // 1. Busca Iniciais do Dia
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        window.supabase
            .from('checkins')
            .select('*')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false }) // os mais recentes primeiro
            .limit(20)
            .then(({ data, error }) => {
                if (!error && data && data.length > 0) {
                    activityList.innerHTML = '';
                    hasActivities = true;
                    data.forEach(row => {
                        window.addDashboardCheckin({
                            historyId: row.created_at,
                            activityId: row.activity_id,
                            clientId: row.client_id
                        }, false); // Usa append, assim eles ficam na ordem natural
                    });
                } else if (!hasActivities) {
                    activityList.innerHTML = `
                        <div class="activity-item">
                            <div class="activity-info">
                                <span class="title" style="color:var(--text-muted)">Aguardando Webhooks...</span>
                            </div>
                        </div>
                    `;
                }
            });

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

    // --- Excel Upload Handling ---
    const excelInput = document.getElementById('excel-upload');
    const btnProcessExcel = document.getElementById('btn-process-excel');
    let parsedExcelData = [];

    if (excelInput) {
        excelInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                btnProcessExcel.style.display = 'none';
                return;
            }
            
            // Usando SheetJS para ler arquivos do Excel verdadeiros (.xlsx)
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = window.XLSX.read(data, {type: 'array'});
                    
                    // Pegar a primeira aba da planilha
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Converter para JSON as linhas, onde a primeira linha é o cabeçalho
                    parsedExcelData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    
                    btnProcessExcel.style.display = 'inline-block';
                    btnProcessExcel.textContent = `Salvar ${parsedExcelData.length} registros`;
                } catch (error) {
                    Swal.fire('Erro no Arquivo', 'Não foi possível ler este arquivo excel. Ele está corrompido ou em um formato desconhecido.', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if (btnProcessExcel) {
        btnProcessExcel.addEventListener('click', async () => {
            if (parsedExcelData.length === 0) return;
            
            btnProcessExcel.disabled = true;
            btnProcessExcel.textContent = 'Limpando base e enviando...';

            try {
                // Prepare Data de forma super tolerante a falhas (ANTES DE APAGAR O BANCO)
                let registrosEncontrados = 0;
                const rowsToInsert = parsedExcelData.map(row => {
                    let mappedRow = {};
                    const colMap = {
                        'LÍDER': 'lider', 'LIDER': 'lider',
                        'REGIÃO': 'regiao', 'REGIAO': 'regiao',
                        'PROJETO': 'projeto',
                        'CPF': 'cpf',
                        'AGENTE': 'agente',
                        'RAZÃO SOCIAL': 'razao_social', 'RAZAO SOCIAL': 'razao_social',
                        'LOCAL': 'local',
                        'REDE': 'rede',
                        'CEP': 'cep',
                        'LOGRADOURO': 'logradouro',
                        'BAIRRO': 'bairro',
                        'MUNICÍPIO': 'municipio', 'MUNICIPIO': 'municipio',
                        'ESTADO': 'estado',
                        'FORM': 'form',
                        'VALOR': 'valor',
                        'VALOR SEMANAL': 'valor_semanal',
                        'HORAS POR VISITA': 'horas_por_visita',
                        'DOM': 'dom',
                        'SEG': 'seg',
                        'TER': 'ter',
                        'QUA': 'qua',
                        'QUI': 'qui',
                        'SEX': 'sex',
                        'SAB': 'sab',
                        'FREQ. SEMANAL': 'freq_semanal', 'FREQ SEMANAL': 'freq_semanal',
                        'LOCAL_ID': 'local_id',
                        'FORM_ID': 'form_id',
                        'AGENT_ID': 'agent_id'
                    };
                    
                    for (let key in row) {
                        if (typeof key === 'string') {
                            const limpaKey = key.trim().toUpperCase();
                            if (colMap[limpaKey]) {
                                mappedRow[colMap[limpaKey]] = String(row[key]).trim();
                            }
                        }
                    }
                    return mappedRow;
                }).filter(r => {
                    if (Object.keys(r).length > 0) {
                        registrosEncontrados++;
                        return true;
                    }
                    return false;
                });

                if (rowsToInsert.length === 0) {
                    throw new Error(`O arquivo foi lido, mas nenhuma coluna esperada foi localizada na primeira aba. Tenha certeza que os cabeçalhos existem na primeira linha.`);
                }

                // SOMENTE APAGA SE TIVERMOS DADOS VÁLIDOS PARA INSERIR
                const { error: delError } = await window.supabase.from('tb_planilha').delete().neq('id', -1);
                
                if (delError && !delError.message.includes('does not exist')) {
                    throw delError;
                }
                
                const batchSize = 1000;
                for (let i = 0; i < rowsToInsert.length; i += batchSize) {
                    const batch = rowsToInsert.slice(i, i + batchSize);
                    const { error } = await window.supabase.from('tb_planilha').insert(batch);
                    if (error) {
                        if(error.message.includes("relation") && error.message.includes("does not exist")){
                            throw new Error('A tabela "tb_planilha" não foi criada no banco de dados ainda.');
                        } else if (error.message.toLowerCase().includes("column")) {
                             throw new Error('Algumas colunas estão faltando na tabela tb_planilha.');
                        } else if (error.message.toLowerCase().includes("row-level security")) {
                             throw new Error('As permissões RLS (Row Level Security) estão bloqueando. Vá no Supabase e desative o RLS para a tabela "tb_planilha".');
                        }
                        throw error;
                    }
                }

                Swal.fire('Pronto!', `Nova planilha salva! ${registrosEncontrados} registros validos foram processados.`, 'success');
                excelInput.value = '';
                btnProcessExcel.style.display = 'none';
                populateDashboardData(); 

            } catch (err) {
                console.error(err);
                if (err.message.includes('não foi criada') || err.message.includes('faltando')) {
                    Swal.fire({
                        title: 'Atenção (Admin)',
                        html: `A tabela está faltando ou precisa de colunas.<br>No Painel Supabase > SQL Editor, apague a tabela antiga (se houver) e rode isso:<br><br><pre style="text-align:left; font-size:11px; background:#eee; color:#333; padding:10px; border-radius:5px; max-height: 15e0px; overflow-y: auto;">DROP TABLE IF EXISTS tb_planilha;
CREATE TABLE tb_planilha (
  id SERIAL PRIMARY KEY,
  lider TEXT,
  regiao TEXT,
  projeto TEXT,
  cpf TEXT,
  agente TEXT,
  razao_social TEXT,
  local TEXT,
  rede TEXT,
  cep TEXT,
  logradouro TEXT,
  bairro TEXT,
  municipio TEXT,
  estado TEXT,
  form TEXT,
  valor TEXT,
  valor_semanal TEXT,
  horas_por_visita TEXT,
  dom TEXT,
  seg TEXT,
  ter TEXT,
  qua TEXT,
  qui TEXT,
  sex TEXT,
  sab TEXT,
  freq_semanal TEXT,
  local_id TEXT,
  form_id TEXT,
  agent_id TEXT
);</pre>`,
                        icon: 'warning',
                        confirmButtonText: 'Entendi'
                    });
                } else if (err.message.includes('RLS')) {
                    Swal.fire({
                        title: 'Bloqueio de Segurança!',
                        html: `O Supabase está bloqueando o envio por causa do RLS.<br><br>Vá no Painel Supabase > <b>SQL Editor</b> e rode este código para liberar acesso:<br><br><pre style="text-align:left; font-size:11px; background:#eee; color:#333; padding:10px; border-radius:5px;">ALTER TABLE tb_planilha DISABLE ROW LEVEL SECURITY;</pre>`,
                        icon: 'error',
                        confirmButtonText: 'Feito!'
                    });
                } else if (err.message.includes('row-level security') || (err.details && err.details.includes('row-level security'))) {
                    // Catch direct supabase errors if they slipped out
                    Swal.fire({
                        title: 'Bloqueio de Segurança!',
                        html: `O Supabase está bloqueando o envio por causa do RLS.<br><br>Vá no Painel Supabase > <b>SQL Editor</b> e rode este código para liberar acesso:<br><br><pre style="text-align:left; font-size:11px; background:#eee; color:#333; padding:10px; border-radius:5px;">ALTER TABLE tb_planilha DISABLE ROW LEVEL SECURITY;</pre>`,
                        icon: 'error',
                        confirmButtonText: 'Feito!'
                    });
                } else {
                    Swal.fire('Erro!', err.message, 'error');
                }
            } finally {
                btnProcessExcel.disabled = false;
                btnProcessExcel.textContent = 'Processar e Salvar';
            }
        });
    }

    init();
});
