document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        activeTab: (window.location.hash.replace('#', '').split('?')[0]) || 'home',
        theme: localStorage.getItem('theme') || 'dark'
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
            // Use only the first name (first word)
            const displayName = rawName.trim().split(/\s+/)[0];
            const fullName = rawName.trim();
            const isMaster = profile?.role === 'admin' || profile?.role === 'master';

            // Populate Skeletons after a small visual delay
            setTimeout(() => populateDashboardData(displayName), 800);

            // Show/Hide restricted menu
            if (isMaster) {
                navUsers.classList.remove('hidden');
                loadUsersList();
            } else {
                navUsers.classList.add('hidden');
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

    const populateDashboardData = (name) => {
        // Hiding skeletons and setting values
        const effectiveness = document.getElementById('metric-effectiveness');
        const critical = document.getElementById('metric-critical');
        const stores = document.getElementById('metric-stores');
        const activityList = document.getElementById('activity-list');

        if (effectiveness) {
            effectiveness.classList.remove('skeleton', 'skeleton-title');
            effectiveness.innerHTML = '92% <span class="trend">↑ 4%</span>';
        }
        if (critical) {
            critical.classList.remove('skeleton', 'skeleton-title');
            critical.innerHTML = '8 <span class="trend" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">-2</span>';
        }
        if (stores) {
            stores.classList.remove('skeleton', 'skeleton-title');
            stores.innerHTML = '+ 450 Lojas';
        }

        if (activityList) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-marker" style="background: var(--color-relatorios);"></div>
                    <div class="activity-info">
                        <span class="title">Relatório Consolidado</span>
                        <span class="time">há 5 minutos • Deluc</span>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-marker" style="background: var(--color-analytics);"></div>
                    <div class="activity-info">
                        <span class="title">Atualização de Malha</span>
                        <span class="time">há 12 minutos • Geo</span>
                    </div>
                </div>
            `;
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
            // Usamos a biblioteca original (supabaseLib) para criar o cliente
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

    init();
});
