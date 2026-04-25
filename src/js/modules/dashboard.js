import { api } from './api.js';
import { supabase } from './config.js';

export const dashboard = {
    state: {
        checkinsPage: 0,
        checkinsPerPage: 15, // Reduzido para melhor performance mobile
        hasActivities: false,
        totalCheckins: 0,
        searchQuery: '',
        searchTimeout: null
    },

    async populateMetrics() {
        const elements = {
            clientes: document.getElementById('metric-clientes'),
            redes: document.getElementById('metric-redes'),
            lojas: document.getElementById('metric-lojas'),
            municipios: document.getElementById('metric-municipios'),
            horas: document.getElementById('metric-horas'),
            sync: document.getElementById('last-sync-time')
        };

        try {
            if (elements.sync) {
                elements.sync.textContent = `Sincronizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }

            let metrics = await api.getDashboardMetrics();

            // Fallback se o RPC falhar
            if (!metrics) {
                console.warn('Iniciando busca manual de métricas (Fallback)...');
                metrics = await this.calculateMetricsManually();
            }

            this.updateMetricUI(elements.clientes, metrics.clientes, 'Ativos');
            this.updateMetricUI(elements.redes, metrics.redes, 'Canais');
            this.updateMetricUI(elements.lojas, metrics.lojas, 'PDVs');
            this.updateMetricUI(elements.municipios, metrics.municipios, 'Cidades');
            
            if (elements.horas) {
                elements.horas.classList.remove('skeleton', 'skeleton-title');
                const horasFormatadas = Math.round(metrics.horas).toLocaleString('pt-BR');
                elements.horas.innerHTML = `${horasFormatadas} <span class="trend" style="font-size:11px;">Mensais</span>`;
            }

        } catch (err) {
            console.error('Erro ao popular dashboard:', err);
        }
    },

    updateMetricUI(el, value, label) {
        if (!el) return;
        el.classList.remove('skeleton', 'skeleton-title');
        el.innerHTML = `${value} <span class="trend" style="font-size:11px;">${label}</span>`;
    },

    async calculateMetricsManually() {
        let allData = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('tb_planilha')
                .select('local, form, municipio, rede, seg, ter, qua, qui, sex, sab')
                .range(page * pageSize, (page + 1) * pageSize - 1);
            
            if (error) throw error;
            if (data && data.length > 0) allData = allData.concat(data);
            if (!data || data.length < pageSize) hasMore = false;
            page++;
        }

        const stats = {
            clientes: new Set(),
            redes: new Set(),
            lojas: new Set(),
            municipios: new Set(),
            horas: 0
        };

        allData.forEach(row => {
            if (row.form) stats.clientes.add(row.form.toUpperCase().trim());
            if (row.municipio) stats.municipios.add(row.municipio.trim().toUpperCase());
            if (row.rede) stats.redes.add(row.rede.toUpperCase().trim());
            if (row.local) stats.lojas.add(row.local.trim().toUpperCase());
            
            ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'].forEach(dia => {
                if (row[dia]) {
                    let val = parseFloat(String(row[dia]).replace(',', '.'));
                    if (!isNaN(val)) stats.horas += val;
                }
            });
        });

        return {
            clientes: stats.clientes.size,
            redes: stats.redes.size,
            lojas: stats.lojas.size,
            municipios: stats.municipios.size,
            horas: stats.horas
        };
    },

    /**
     * Inicializa o Feed e a Escuta Realtime
     */
    setupLiveFeed() {
        this.loadCheckins(0);

        // Pedir permissão para notificações
        if (window.Notification && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Realtime Subscription
        supabase
            .channel('dashboard-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, payload => {
                const newCheckin = payload.new;
                
                this.addCheckinToUI({
                    historyId: newCheckin.created_at, 
                    activityId: newCheckin.activity_id,
                    clientId: newCheckin.client_id,
                    taskId: newCheckin.task_id
                }, true);
                
                this.state.totalCheckins++;
                this.updateCountUI();

                // Notificação se estiver em segundo plano
                if (document.hidden && newCheckin.task_id === 'CHECK IN') {
                    const parts = newCheckin.activity_id?.split(';').filter(p => p.trim() !== '') || [];
                    const name = parts[0] || 'Colaborador';
                    const photo = parts.length > 1 ? parts[parts.length - 1] : 'https://cdn-icons-png.flaticon.com/512/10435/10435137.png';
                    const place = newCheckin.client_id || 'Loja não identificada';

                    if (window.Notification && Notification.permission === 'granted') {
                        const n = new Notification('Novo Check-in!', {
                            body: `${name} deu check-in em ${place}`,
                            icon: photo,
                            badge: 'https://cdn-icons-png.flaticon.com/512/10435/10435137.png'
                        });
                        n.onclick = () => { window.focus(); };
                    }
                }
            })
            .subscribe();
    },

    async loadCheckins(page = 0) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        this.state.checkinsPage = page;
        
        // Show loader if it's the first page or full refresh
        if (page === 0) {
            activityList.innerHTML = '<div class="p-10 text-center"><div class="loader m-auto"></div></div>';
        }

        try {
            const { data, count } = await api.getTodayCheckins(page, this.state.checkinsPerPage, this.state.searchQuery);
            this.state.totalCheckins = count;
            
            activityList.innerHTML = '';
            
            if (data && data.length > 0) {
                this.state.hasActivities = true;
                data.forEach(row => {
                    this.addCheckinToUI({
                        historyId: row.created_at,
                        activityId: row.activity_id,
                        clientId: row.client_id,
                        taskId: row.task_id
                    }, false);
                });
                this.updateCountUI();
                this.updatePaginationUI(count, page);
            } else {
                activityList.innerHTML = '<div class="p-10 text-center text-dim">Nenhuma atividade hoje.</div>';
                this.updatePaginationUI(0, 0);
            }
        } catch (err) {
            console.error('Erro ao carregar check-ins:', err);
            activityList.innerHTML = '<div class="p-10 text-center text-danger">Erro ao carregar feed.</div>';
        }
    },

    addCheckinToUI(checkinData, prepend = false) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

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
            ? `<img src="${agentPhoto}" class="avatar-mini" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=4F46E5&color=fff'">` 
            : `<div class="avatar-mini">${agentName[0]}</div>`;

        const dateStr = checkinData.historyId || new Date().toISOString();
        const dateObj = new Date(dateStr.replace(' ', 'T')); 
        const timeFormatted = isNaN(dateObj.getTime()) ? "--:--" : `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        const dateFormatted = isNaN(dateObj.getTime()) ? "--/--/----" : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}`;

        const item = document.createElement('div');
        item.className = 'checkin-row';
        item.innerHTML = `
            <div class="col-promotor">
                ${avatarHtml}
                <div class="name">${agentName}</div>
            </div>
            <div class="col-pdv text-sm">${checkinData.clientId || 'Visita Técnica'}</div>
            <div class="col-data text-xs">${dateFormatted}</div>
            <div class="col-hora text-xs font-bold">${timeFormatted}</div>
            <div class="col-foto">
                ${agentPhoto ? `<img src="${agentPhoto}" class="checkin-photo-thumb" onclick="window.open('${agentPhoto}', '_blank')">` : '<span class="text-xs text-dim">Sem Foto</span>'}
            </div>
            <div class="col-actions justify-end">
                <div class="action-icon-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
            </div>
        `;

        if (prepend) {
            activityList.insertBefore(item, activityList.firstChild);
            if (activityList.children.length > this.state.checkinsPerPage) {
                activityList.lastChild.remove();
            }
        } else {
            activityList.appendChild(item);
        }
    },

    updateCountUI() {
        const countEl = document.getElementById('checkins-count');
        if (countEl) countEl.textContent = `Total: ${this.state.totalCheckins} check-ins hoje`;
    },

    updatePaginationUI(total, currentPage) {
        const controls = document.getElementById('checkins-pagination');
        if (!controls) return;

        const totalPages = Math.ceil(total / this.state.checkinsPerPage);
        if (totalPages <= 1) {
            controls.innerHTML = '';
            return;
        }

        let html = `<span class="text-xs text-muted mr-2">Página</span>`;
        
        // Prev
        html += `<button class="page-num" ${currentPage === 0 ? 'disabled' : ''} data-page="${currentPage - 1}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"></path></svg>
        </button>`;

        // Pages
        const maxVisible = 5;
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible);
        if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

        for (let i = start; i < end; i++) {
            html += `<div class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i + 1}</div>`;
        }
        
        // Next
        html += `<button class="page-num" ${currentPage >= totalPages - 1 ? 'disabled' : ''} data-page="${currentPage + 1}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"></path></svg>
        </button>`;

        controls.innerHTML = html;

        controls.querySelectorAll('.page-num[data-page]:not([disabled])').forEach(btn => {
            btn.onclick = () => this.loadCheckins(parseInt(btn.dataset.page));
        });
    },

    handleSearch(query) {
        this.state.searchQuery = query;
        if (this.state.searchTimeout) clearTimeout(this.state.searchTimeout);
        this.state.searchTimeout = setTimeout(() => {
            this.loadCheckins(0);
        }, 500);
    }
};
