import { api } from './api.js';
import { ui } from './ui.js';
import { auth } from './auth.js';

export const staff = {
    async loadList() {
        const listBody = document.getElementById('staff-base-list');
        if (!listBody) return;

        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Carregando colaboradores...</td></tr>';

        try {
            const data = await api.getStaffList();

            if (!data || data.length === 0) {
                listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Nenhum colaborador na base.</td></tr>';
                return;
            }

            listBody.innerHTML = data.map(s => this.renderRow(s)).join('');
        } catch (err) {
            ui.showToast('Erro ao carregar colaboradores: ' + err.message, 'error');
        }
    },

    renderRow(s) {
        const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        const scaleHtml = days.map(d => {
            const isActive = s[d];
            return `<span class="day-badge ${isActive ? 'active' : ''}">${d.toUpperCase()}</span>`;
        }).join('');

        // Controle de renderização baseado em permissão (Refatoração Profissional)
        const canEdit = auth.isAdmin();

        return `
            <tr style="height: 70px;">
                <td>
                    <div class="staff-info">
                        <div class="staff-avatar">${s.nome[0]}</div>
                        <strong>${s.nome}</strong>
                    </div>
                </td>
                <td><span class="badge">${s.projeto || 'PROMOTOR'}</span></td>
                <td><div class="scale-row">${scaleHtml}</div></td>
                <td class="date-col">${new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                <td style="text-align: right;">
                    ${canEdit ? `
                        <div class="action-group">
                            <button class="action-icon-btn edit" data-nome="${s.nome}" title="Editar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-icon-btn delete" data-nome="${s.nome}" title="Excluir">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    ` : '<span style="color:var(--text-dim); font-size:11px;">Apenas Leitura</span>'}
                </td>
            </tr>
        `;
    },

    async openAddModal() {
        if (!auth.requireAdmin()) return;

        const { value: formValues } = await Swal.fire({
            title: 'Novo Colaborador',
            html: this.generateModalHtml(),
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Cadastrar',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            preConfirm: () => this.getModalValues()
        });

        if (formValues && formValues.nome) {
            try {
                await api.upsertStaff(formValues);
                ui.showToast('Colaborador salvo!', 'success');
                this.loadList();
            } catch (err) {
                ui.showToast(err.message, 'error');
            }
        }
    },

    async openEditModal(currentNome) {
        if (!auth.requireAdmin()) return;

        try {
            const { data: staffData, error } = await supabase
                .from('tb_colaboradores')
                .select('*')
                .eq('nome', currentNome)
                .single();
            
            if (error) throw error;

            const { value: formValues } = await Swal.fire({
                title: 'Editar Colaborador',
                html: this.generateModalHtml(staffData),
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Atualizar',
                cancelButtonText: 'Cancelar',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                preConfirm: () => this.getModalValues()
            });

            if (formValues) {
                await api.upsertStaff(formValues); // Upsert handles update if name is same and unique constraint is on name
                ui.showToast('Alterações salvas!', 'success');
                this.loadList();
            }
        } catch (err) {
            ui.showToast('Erro ao carregar dados: ' + err.message, 'error');
        }
    },

    async deleteStaff(nome) {
        if (!auth.requireAdmin()) return;

        const result = await Swal.fire({
            title: 'Excluir Colaborador?',
            text: `Deseja remover ${nome} da base fixa?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sim, excluir',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteStaff(nome);
                ui.showToast('Colaborador removido!', 'success');
                this.loadList();
            } catch (err) {
                ui.showToast(err.message, 'error');
            }
        }
    },

    generateModalHtml(data = null) {
        const days = [
            { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' },
            { id: 'qua', label: 'Qua' }, { id: 'qui', label: 'Qui' },
            { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' },
            { id: 'dom', label: 'Dom' }
        ];

        const checkboxes = days.map(d => `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px;">
                <input type="checkbox" id="check-${d.id}" ${(!data && d.id !== 'dom') || (data && data[d.id]) ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--primary);">
                ${d.label}
            </label>
        `).join('');

        return `
            <div style="text-align: left; font-size: 14px;">
                <label style="color: var(--text-muted);">Nome Completo:</label>
                <input id="swal-name" class="swal2-input" style="margin-top: 5px; margin-bottom: 15px;" value="${data?.nome || ''}" placeholder="Ex: JOÃO SILVA">
                <label style="color: var(--text-muted);">Função / Projeto:</label>
                <input id="swal-project" class="swal2-input" style="margin-top: 5px; margin-bottom: 20px;" value="${data?.projeto || ''}" placeholder="Ex: PROMOTOR">
                <label style="color: var(--text-muted); display: block; margin-bottom: 10px;">Escala de Trabalho:</label>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid var(--border);">
                    ${checkboxes}
                </div>
            </div>
        `;
    },

    getModalValues() {
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
        };
    }
};
