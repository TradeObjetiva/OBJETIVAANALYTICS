import { api } from './api.js';
import { ui } from './ui.js';
import { auth } from './auth.js';

export const users = {
    async loadList() {
        const usersListBody = document.getElementById('users-list-body');
        if (!usersListBody) return;

        try {
            const data = await api.getAllProfiles();

            usersListBody.innerHTML = data.map(u => `
                <tr>
                    <td>
                        <strong>${u.full_name || 'Sem nome'}</strong><br>
                        <span style="font-size: 11px; color: var(--text-dim);">${u.email || '-'}</span>
                    </td>
                    <td style="font-family: monospace; font-size: 11px;">${u.id.substring(0,8)}...</td>
                    <td>
                        <select class="custom-select small role-select" data-id="${u.id}">
                            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Colaborador</option>
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            <option value="master" ${u.role === 'master' ? 'selected' : ''}>Mestre</option>
                        </select>
                    </td>
                    <td>
                        <button class="action-btn small delete delete-user-btn" data-id="${u.id}">Remover</button>
                    </td>
                </tr>
            `).join('');

            // Add Event Listeners
            usersListBody.querySelectorAll('.role-select').forEach(select => {
                select.onchange = (e) => this.updateRole(select.dataset.id, e.target.value);
            });

            usersListBody.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.onclick = () => this.deleteUser(btn.dataset.id);
            });

        } catch (err) {
            console.error('Erro ao listar usuários:', err.message);
        }
    },

    async updateRole(userId, newRole) {
        try {
            await api.updateProfile(userId, { role: newRole });
            ui.showToast('Nível de acesso atualizado!', 'success');
            this.loadList();
        } catch (err) {
            ui.showToast(err.message, 'error');
        }
    },

    async deleteUser(userId) {
        if (!confirm('Deseja remover este perfil?')) return;
        try {
            await api.deleteProfile(userId);
            this.loadList();
        } catch (err) {
            ui.showToast(err.message, 'error');
        }
    },

    async handleCreateProfile(e) {
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
            await auth.createNewUser(email, password, full_name, role);
            alert('✅ Usuário cadastrado com sucesso!');
            e.target.reset();
            this.loadList();
        } catch (err) {
            console.error('Erro no cadastro:', err);
            alert('❌ Erro: ' + (err.message || 'Erro desconhecido.'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
};
