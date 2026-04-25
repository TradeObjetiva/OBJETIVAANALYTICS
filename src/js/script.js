import { ui } from './modules/ui.js';
import { auth } from './modules/auth.js';
import { dashboard } from './modules/dashboard.js';
import { staff } from './modules/staff.js';
import { users } from './modules/users.js';
import { excel } from './modules/excel.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar UI e Temas
    ui.init();

    // 2. Inicializar Módulos de Dados
    excel.init();

    // 3. Verificar Autenticação
    const authState = await auth.checkSession();
    updateUIForAuth(authState);

    // 4. Configurar Listeners Globais
    setupGlobalListeners();

    // 5. Inicializar Aba Ativa
    ui.switchTab(ui.state.activeTab, false);
});

/**
 * Atualiza a interface baseada no estado de autenticação
 */
async function updateUIForAuth(authState) {
    const loginOverlay = document.getElementById('login-overlay');
    const userProfile = document.getElementById('user-profile');
    const welcomeName = document.getElementById('welcome-name');
    const adminUploadArea = document.getElementById('admin-upload-area');
    const adminQuickActions = document.getElementById('admin-quick-actions');
    const navUsers = document.getElementById('nav-users');
    const mobileNavUsers = document.getElementById('mobile-nav-users');

    if (authState) {
        const { session, profile } = authState;
        loginOverlay.classList.add('hidden');
        
        const rawName = profile?.full_name || session.user.email.split('@')[0];
        const displayName = rawName.trim().split(' ')[0];
        const isMaster = auth.isAdmin();

        // Welcome e Dashboard
        if (welcomeName) {
            welcomeName.classList.remove('skeleton', 'skeleton-text');
            welcomeName.textContent = displayName;
        }
        setTimeout(() => dashboard.populateMetrics(), 500);
        dashboard.setupLiveFeed();

        // Restrições de Admin
        if (isMaster) {
            if (navUsers) navUsers.classList.remove('hidden');
            if (mobileNavUsers) mobileNavUsers.classList.remove('hidden');
            if (adminUploadArea) adminUploadArea.style.display = 'block';
            if (adminQuickActions) adminQuickActions.style.display = 'flex';
            users.loadList();
        } else {
            if (navUsers) navUsers.classList.add('hidden');
            if (adminUploadArea) adminUploadArea.style.display = 'none';
            if (adminQuickActions) adminQuickActions.style.display = 'none';
        }

        // Perfil Header
        userProfile.innerHTML = `
            <div class="user-info">
                <div class="user-name">
                    ${displayName} 
                    ${isMaster ? '<span class="admin-badge">Mestre</span>' : ''}
                </div>
            </div>
            <div class="avatar">${displayName[0].toUpperCase()}</div>
            <button class="logout-btn" id="logout-btn">Sair</button>
        `;
        document.getElementById('logout-btn').onclick = handleLogout;

        // Populate Profile View
        updateProfileView(session.user, profile, displayName);

    } else {
        loginOverlay.classList.remove('hidden');
        userProfile.innerHTML = '';
        if (welcomeName) welcomeName.textContent = 'FP Analytics';
    }
}

function updateProfileView(user, profile, displayName) {
    const pName = document.getElementById('profile-name-display');
    const pEmail = document.getElementById('profile-email-display');
    const pAvatar = document.getElementById('profile-avatar-big');
    const pInput = document.getElementById('my-full-name');

    if (pName) pName.textContent = profile?.full_name || user.email;
    if (pEmail) pEmail.textContent = user.email;
    if (pAvatar) {
        pAvatar.textContent = displayName[0].toUpperCase();
        pAvatar.classList.remove('skeleton');
    }
    if (pInput) pInput.value = profile?.full_name || '';
}

/**
 * Handlers de Eventos Globais
 */
function setupGlobalListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn, .nav-tab-mobile').forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-target');
            ui.switchTab(target);
            if (target === 'colaboradores-base') staff.loadList();
            if (target === 'users') users.loadList();
        };
    });

    // Theme
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => ui.applyTheme(ui.state.theme === 'dark' ? 'light' : 'dark');
    }

    // Sidebar
    const logoTrigger = document.getElementById('mobile-logo-trigger');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    if (logoTrigger) logoTrigger.onclick = ui.openSidebar;
    if (closeSidebarBtn) closeSidebarBtn.onclick = ui.closeSidebar;
    if (sidebarOverlay) sidebarOverlay.onclick = ui.closeSidebar;

    // Forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.onsubmit = handleLogin;

    const createProfileForm = document.getElementById('create-profile-form');
    if (createProfileForm) createProfileForm.onsubmit = (e) => users.handleCreateProfile(e);

    // Refresh Dashboard
    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.onclick = () => dashboard.populateMetrics();
    }

    // Search
    const staffSearch = document.getElementById('staff-search');
    if (staffSearch) {
        staffSearch.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#staff-base-list tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? 'table-row' : 'none';
            });
        };
    }

    const checkinSearch = document.getElementById('checkin-search');
    if (checkinSearch) {
        checkinSearch.oninput = (e) => dashboard.handleSearch(e.target.value);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = 'Autenticando...';

    try {
        await auth.login(email, password);
        const authState = await auth.checkSession();
        updateUIForAuth(authState);
    } catch (err) {
        errorEl.textContent = 'Erro: ' + err.message;
    }
}

async function handleLogout() {
    await auth.logout();
    updateUIForAuth(null);
}

// Global Exports for inline HTML calls (temporary)
window.app = { 
    switchTab: (t) => ui.switchTab(t),
    showToast: (m, t) => ui.showToast(m, t)
};
window.openAddStaffModal = () => staff.openAddModal();
window.downloadStaffBaseTemplate = () => {
    const data = [{ nome: 'NOME COMPLETO', projeto: 'PROMOTOR', seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "modelo_base_colaboradores.xlsx");
};

window.importStaffBaseFile = (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
            
            const staffArray = rows.map(r => ({
                nome: String(r.nome || r.NOME || '').toUpperCase().trim(),
                projeto: String(r.projeto || r.PROJETO || 'PROMOTOR').toUpperCase().trim(),
                seg: !!(r.seg || r.SEG),
                ter: !!(r.ter || r.TER),
                qua: !!(r.qua || r.QUA),
                qui: !!(r.qui || r.QUI),
                sex: !!(r.sex || r.SEX),
                sab: !!(r.sab || r.SAB),
                dom: !!(r.dom || r.DOM)
            })).filter(r => r.nome);

            if (staffArray.length > 0) {
                await api.upsertStaff(staffArray);
                ui.showToast(`${staffArray.length} colaboradores importados!`, 'success');
                staff.loadList();
            }
        } catch (err) {
            ui.showToast('Erro ao importar: ' + err.message, 'error');
        }
        input.value = '';
    };
    reader.readAsArrayBuffer(file);
};
// Expor módulos para o escopo global (necessário para handlers onclick no HTML)
window.ui = ui;
window.auth = auth;
window.dashboard = dashboard;
window.staff = staff;
window.users = users;
window.excel = excel;
