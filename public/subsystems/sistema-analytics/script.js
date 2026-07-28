// --- Globals for File Handling (Available for inline HTML events) ---
window.handleDragOver = (e) => {
    e.preventDefault();
    document.getElementById('welcomeScreen')?.classList.add('drag-over');
};

window.handleDragLeave = () => {
    document.getElementById('welcomeScreen')?.classList.remove('drag-over');
};

window.handleDrop = (e) => {
    e.preventDefault();
    document.getElementById('welcomeScreen')?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) window.handleFile(file);
};

window.handleFile = (file) => {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.style.display = 'flex';

    setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet);
                console.log('Dados importados:', json.length, 'linhas');
                // Chamamos a função processData que está no escopo global ou local
                window.processDataInternal(json);
            } catch (err) {
                console.error('Erro ao ler planilha:', err);
                alert('Erro ao processar arquivo. Verifique se é um Excel válido.');
            } finally {
                if (loader) loader.style.display = 'none';
            }
        };
        reader.readAsArrayBuffer(file);
    }, 100);
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Sub-Tab Navigation inside Analytics ---
    const subtabBtns = document.querySelectorAll('.subtab-btn');
    const subviews = document.querySelectorAll('.analytics-subview');

    const switchAnalyticsSubtab = (targetSubtab) => {
        subtabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-subtab') === targetSubtab);
        });
        subviews.forEach(view => {
            view.classList.toggle('active', view.id === `subview-${targetSubtab}`);
        });
    };

    subtabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtab = btn.getAttribute('data-subtab');
            switchAnalyticsSubtab(subtab);
        });
    });

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SWITCH_SUBTAB') {
            switchAnalyticsSubtab(event.data.subtab);
        }
    });
    const excelFile = document.getElementById('excelFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mapFilter = document.getElementById('mapFilter');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const dashboardContent = document.getElementById('dashboardContent');

    const syncChannel = new BroadcastChannel('app_sync');

    let chartEvolution = null;
    let chartBrand = null;
    let map = null;
    let markers = []; 
    let globalStatsReference = null;

    const laivonSyncBtn = document.getElementById('laivonSyncBtn');
    const welcomeSyncBtn = document.getElementById('welcomeSyncBtn');
    const laivonKeyBtn = document.getElementById('laivonKeyBtn');

    if (laivonSyncBtn) laivonSyncBtn.addEventListener('click', syncLaivonData);
    if (welcomeSyncBtn) welcomeSyncBtn.addEventListener('click', syncLaivonData);
    if (laivonKeyBtn) laivonKeyBtn.addEventListener('click', () => {
        const modal = document.getElementById('laivonConfigModal');
        const input = document.getElementById('laivonApiKeyInput');
        if (input) input.value = getLaivonApiKey();
        if (modal) modal.style.display = 'flex';
    });

    if (uploadBtn && excelFile) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            excelFile.click();
        });
    }

    if (excelFile) {
        excelFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) window.handleFile(file);
        });
    }

    // Tornamos o processData acessível para o handleFile global
    window.processDataInternal = function(data) {
        if (!data || data.length === 0) return;
        welcomeScreen.style.display = 'none';
        dashboardContent.style.display = 'block';
        exportBtn.style.display = 'block';
        if(exportCsvBtn) exportCsvBtn.style.display = 'none';

        const isMatrix = data.length > 0 && ('Planejado' in data[0] || 'Percentual' in data[0]);

        if (isMatrix) {
            processMatrixData(data);
            return;
        }

        const stats = {
            totalTasks: data.length,
            doneTasks: 0,
            totalDuration: 0,
            monitoredStores: new Set(),
            promoters: {},
            clients: {},
            stores: {},
            networks: {}
        };

        const ignoredForms = [
            'RETORNO DO INTERVALO',
            'SAÍDA PARA O INTERVALO',
            'CHECK IN',
            'CHECK OUT',
            'JUSTIFICAR PENDÊNCIA',
            'INÍCIO DE DESLOCAMENTO',
            'FIM DE DESLOCAMENTO',
            'APOIO AO PROMOTOR'
        ];

        data.forEach(row => {
            const formName = String(row['Formulário'] || '').trim().toUpperCase();
            if (ignoredForms.includes(formName)) return; 

            const isDone = String(row['Feito']).toLowerCase() === 'sim';
            const agent = String(row['Agente'] || 'Indefinido').trim();
            const client = String(row['Cliente'] || 'Geral').trim();
            const local = String(row['Local'] || 'Sem Nome').trim();
            const network = String(row['Rede'] || 'Outros').trim();
            const duration = String(row['Duração'] || '0:00:00');
            const lat = parseFloat(row['Lat']);
            const lng = parseFloat(row['Lng']);

            if (isDone) stats.doneTasks++;
            stats.monitoredStores.add(local);

            const timeParts = duration.split(':');
            if (timeParts.length === 3) {
                const secs = (parseInt(timeParts[0]) * 3600) + (parseInt(timeParts[1]) * 60) + parseInt(timeParts[2]);
                stats.totalDuration += secs;
            }

            if (!stats.promoters[agent]) stats.promoters[agent] = { name: agent, total: 0, done: 0 };
            stats.promoters[agent].total++;
            if (isDone) stats.promoters[agent].done++;

            if (!stats.clients[client]) stats.clients[client] = { name: client, total: 0, done: 0 };
            stats.clients[client].total++;
            if (isDone) stats.clients[client].done++;

            if (!stats.stores[local]) {
                stats.stores[local] = { name: local, network, lat, lng, done: 0, total: 0 };
            }
            stats.stores[local].total++;
            if (isDone) stats.stores[local].done++;

            if (!stats.networks[network]) stats.networks[network] = { name: network, total: 0, done: 0 };
            stats.networks[network].total++;
            if (isDone) stats.networks[network].done++;
        });

        globalStatsReference = stats;

        const effectiveness = Math.round((stats.doneTasks / stats.totalTasks) * 100);
        const avgSecs = stats.doneTasks > 0 ? stats.totalDuration / stats.doneTasks : 0;
        const avgFormatted = `${Math.floor(avgSecs / 60)}m ${Math.floor(avgSecs % 60)}s`;

        // Update UI and Remove Skeletons
        const elementsToUpdate = {
            'globalEffectiveness': `${effectiveness}%`,
            'monitoredStores': stats.monitoredStores.size,
            'avgDuration': avgFormatted,
            'totalTasks': stats.totalTasks
        };

        for (const [id, value] of Object.entries(elementsToUpdate)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
                el.classList.remove('skeleton', 'skeleton-title');
                el.style.width = 'auto';
            }
        }

        // KPI Color Indicators
        const effEl = document.getElementById('globalEffectiveness');
        if (effEl) {
            effEl.classList.remove('kpi-green', 'kpi-yellow', 'kpi-red');
            if (effectiveness >= 70) effEl.classList.add('kpi-green');
            else if (effectiveness >= 40) effEl.classList.add('kpi-yellow');
            else effEl.classList.add('kpi-red');
        }

        initMap(data);
        renderCharts(stats);
        renderRankings(stats);
        renderInsights(effectiveness, stats);
        renderNetworkSummary(stats.networks);
    };

    function processMatrixData(data) {
        const stats = {
            totalTasks: 0,
            doneTasks: 0,
            monitoredStores: new Set(),
            clients: {},
            stores: {},
            networks: {},
            dates: {}
        };

        data.forEach(row => {
            const client = String(row['Cliente'] || row['Formulário'] || 'Geral').trim();
            const local = String(row['Local'] || 'Sem Nome').trim();
            const network = String(row['Rede'] || 'Outros').trim();
            const planejado = parseInt(row['Planejado']) || 0;
            const realizado = parseInt(row['Realizado']) || 0;
            const lat = parseFloat(row['Lat']);
            const lng = parseFloat(row['Lng']);

            if (planejado === 0 && realizado === 0) return;

            stats.totalTasks += planejado;
            stats.doneTasks += realizado;
            stats.monitoredStores.add(local);

            if (!stats.clients[client]) stats.clients[client] = { name: client, total: 0, done: 0 };
            stats.clients[client].total += planejado;
            stats.clients[client].done += realizado;

            if (!stats.stores[local]) {
                stats.stores[local] = { name: local, network, lat, lng, done: 0, total: 0 };
            }
            stats.stores[local].total += planejado;
            stats.stores[local].done += realizado;

            if (!stats.networks[network]) stats.networks[network] = { name: network, total: 0, done: 0 };
            stats.networks[network].total += planejado;
            stats.networks[network].done += realizado;

            Object.keys(row).forEach(key => {
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
                    if (!stats.dates[key]) stats.dates[key] = { name: key, totalPlanejado: 0, realizado: 0 };
                    const val = String(row[key] || '').toLowerCase();
                    if (val !== '' && val !== 'indefinido') {
                        stats.dates[key].totalPlanejado++;
                        if (val === 'realizado') {
                            stats.dates[key].realizado++;
                        }
                    }
                }
            });
        });

        globalStatsReference = stats;

        const effectiveness = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

        const elementsToUpdate = {
            'globalEffectiveness': `${effectiveness}%`,
            'monitoredStores': stats.monitoredStores.size,
            'avgDuration': 'N/A (Cálculo Indisponível)',
            'totalTasks': stats.totalTasks
        };

        for (const [id, value] of Object.entries(elementsToUpdate)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
                el.classList.remove('skeleton', 'skeleton-title');
                el.style.width = 'auto';
            }
        }

        const avgBoxLabel = document.querySelector('#avgDuration').parentElement.querySelector('.label');
        if(avgBoxLabel) avgBoxLabel.innerHTML = '🕒 Duração (Não Aplicável)';
        document.getElementById('totalTasks').parentElement.querySelector('.label').innerHTML = '📝 Metas Consolidadas';

        const effEl = document.getElementById('globalEffectiveness');
        if (effEl) {
            effEl.classList.remove('kpi-green', 'kpi-yellow', 'kpi-red');
            if (effectiveness >= 70) effEl.classList.add('kpi-green');
            else if (effectiveness >= 40) effEl.classList.add('kpi-yellow');
            else effEl.classList.add('kpi-red');
        }

        initMap(data, true); 
        renderMatrixCharts(stats);
        renderRankings(stats);
        renderInsights(effectiveness, stats);
        renderNetworkSummary(stats.networks);
    }

    // --- Helpers de Exportação ---
    window.exportToCsv = function(filename, rows) {
        const processRow = (row) => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';');
        const csvContent = "\uFEFF" + rows.map(processRow).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        link.click();
    };

    window.exportPromoterStats = () => {
        const rows = [['Promotor', 'Tarefas Totais', 'Concluídas', 'Efetividade %']];
        Object.values(globalStatsReference.promoters).forEach(p => {
            rows.push([p.name, p.total, p.done, Math.round((p.done/p.total)*100) + '%']);
        });
        exportToCsv('Efetividade_Promotores.csv', rows);
    };

    window.exportBrandStats = () => {
        const rows = [['Cliente/Marca', 'Tarefas Totais', 'Concluídas', 'Execução %']];
        Object.values(globalStatsReference.clients).forEach(c => {
            rows.push([c.name, c.total, c.done, Math.round((c.done/c.total)*100) + '%']);
        });
        exportToCsv('Execucao_Marcas.csv', rows);
    };

    window.exportCriticalStores = () => {
        const rows = [['Loja', 'Rede', 'Motivo']];
        const criticals = Object.values(globalStatsReference.stores).filter(s => s.done === 0);
        criticals.forEach(s => rows.push([s.name, s.network, 'Zero Execução']));
        exportToCsv('Lojas_Sem_Visita.csv', rows);
    };

    window.exportPromoterVolume = () => {
        const rows = [['Agente', 'Tarefas Realizadas']];
        Object.values(globalStatsReference.promoters).forEach(p => rows.push([p.name, p.done]));
        exportToCsv('Produtividade_Agentes.csv', rows);
    };

    window.exportNetworkSummary = () => {
        const rows = [['Rede', 'Tarefas Totais', 'Concluídas', 'Efetividade']];
        Object.values(globalStatsReference.networks).forEach(n => {
            rows.push([n.name, n.total, n.done, Math.round((n.done/n.total)*100) + '%']);
        });
        exportToCsv('Resumo_Por_Rede.csv', rows);
    };

    window.toggleExpand = (chartId) => {
        const container = document.getElementById(chartId).parentElement;
        container.classList.toggle('expanded-chart');
    };

    function initMap(data, isMatrix = false) {
        if (map) map.remove();
        const firstWithPos = data.find(d => !isNaN(parseFloat(d.Lat)));
        const center = firstWithPos ? [parseFloat(firstWithPos.Lat), parseFloat(firstWithPos.Lng)] : [-22.9068, -43.1729];
        
        map = L.map('map').setView(center, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markers = [];

        data.forEach(row => {
            const lat = parseFloat(row['Lat']);
            const lng = parseFloat(row['Lng']);
            if (!isNaN(lat) && !isNaN(lng)) {
                let isDone = false;
                let pct = 0;
                let popupText = '';
                
                if (isMatrix) {
                    const planejado = parseInt(row['Planejado']) || 0;
                    const realizado = parseInt(row['Realizado']) || 0;
                    isDone = planejado > 0 && realizado === planejado;
                    pct = planejado > 0 ? Math.round((realizado/planejado)*100) : 0;
                    popupText = `<b>${row['Local']}</b><br>Rede: ${row['Rede']}<br>Tarefa: ${row['Formulário'] || row['Cliente']}<br>Progresso: ${realizado}/${planejado} (${pct}%)`;
                } else {
                    isDone = String(row['Feito']).toLowerCase() === 'sim';
                    pct = isDone ? 100 : 0;
                    popupText = `<b>${row['Local']}</b><br>Agente: ${row['Agente']}<br>Tarefa: ${row['Formulário']}<br>Status: ${isDone ? 'Concluído' : 'Pendente'}`;
                }
                
                const color = isMatrix ? (pct >= 80 ? '#10B981' : (pct >= 40 ? '#f59e0b' : '#f43f5e')) : (isDone ? '#10B981' : '#f43f5e');
                
                const marker = L.circleMarker([lat, lng], { radius: 6, fillColor: color, color: "#fff", weight: 1, fillOpacity: 0.8, isDone: isDone }).addTo(map);
                marker.bindPopup(popupText);
                markers.push(marker);
            }
        });

        if(mapFilter) {
            // Restore saved filter
            const savedFilter = localStorage.getItem('analytics_mapFilter');
            if (savedFilter) {
                mapFilter.value = savedFilter;
                setTimeout(() => mapFilter.dispatchEvent(new Event('change')), 100);
            }

            mapFilter.onchange = (e) => {
                const val = e.target.value;
                localStorage.setItem('analytics_mapFilter', val);
                markers.forEach(m => {
                    if (val === 'all') m.addTo(map);
                    else if (val === 'done' && m.options.isDone) m.addTo(map);
                    else if (val === 'pending' && !m.options.isDone) m.addTo(map);
                    else map.removeLayer(m);
                });
            };
        }
    }

    function renderMatrixCharts(stats) {
        const timeCtx = document.getElementById('promoterChart').getContext('2d');
        const brandCtx = document.getElementById('brandChart').getContext('2d');
        if (chartEvolution) chartEvolution.destroy();
        if (chartBrand) chartBrand.destroy();

        const sortedDates = Object.keys(stats.dates).sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });

        const timelineData = sortedDates.map(d => {
            const day = stats.dates[d];
            return day.totalPlanejado > 0 ? Math.round((day.realizado / day.totalPlanejado) * 100) : 0;
        });

        const promoterContainer = document.getElementById('promoterChart').parentElement.previousElementSibling;
        if(promoterContainer) promoterContainer.querySelector('h3').textContent = 'Curva de Execução no Tempo (Dias)';
        document.getElementById('promoterChart').parentElement.style.height = '300px';

        chartEvolution = new Chart(timeCtx, {
            type: 'line',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedDates.map(d => d.slice(0, 5)), // Ex: 01/04
                datasets: [{
                    label: '% Efetividade Diária',
                    data: timelineData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { display: true, align: 'top', color: '#fff' } },
                scales: {
                    y: { max: 110, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        const sortedClients = Object.values(stats.clients).sort((a,b) => (b.done/b.total) - (a.done/a.total));
        const brandChartHeight = Math.max(300, sortedClients.length > 15 ? 400 : 300);
        document.getElementById('brandChart').parentElement.style.height = brandChartHeight + 'px';

        chartBrand = new Chart(brandCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedClients.map(c => c.name),
                datasets: [{
                    label: '% Execução',
                    data: sortedClients.map(c => c.total > 0 ? Math.round((c.done / c.total) * 100) : 0),
                    backgroundColor: sortedClients.map(c => {
                        const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
                        if (pct >= 70) return '#06b6d4';
                        if (pct >= 40) return '#f59e0b';
                        return '#f43f5e';
                    }),
                    borderRadius: 6
                }]
            },
            options: { 
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { color: '#fff', anchor: 'end', align: 'top', font: { weight: 'bold', size: 10 }, formatter: (v) => v + '%', display: (ctx) => ctx.dataIndex < 25 } },
                scales: { 
                    y: { max: 110, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    x: { ticks: { maxRotation: 55, minRotation: 45, font: { size: 9 }, color: '#94a3b8' }, grid: { display: false } }
                }
            }
        });
    }

    function renderCharts(stats) {
        const promoterCtx = document.getElementById('promoterChart').getContext('2d');
        const brandCtx = document.getElementById('brandChart').getContext('2d');
        if (chartEvolution) chartEvolution.destroy();
        if (chartBrand) chartBrand.destroy();

        const sortedPromoters = Object.values(stats.promoters)
            .sort((a, b) => (b.done / b.total) - (a.done / a.total));

        // Dynamic height based on number of promoters
        const promoterChartHeight = Math.max(300, sortedPromoters.length * 30);
        document.getElementById('promoterChart').parentElement.style.height = promoterChartHeight + 'px';

        chartEvolution = new Chart(promoterCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedPromoters.map(p => p.name),
                datasets: [{
                    label: '% Efetividade',
                    data: sortedPromoters.map(p => Math.round((p.done / p.total) * 100)),
                    backgroundColor: sortedPromoters.map(p => {
                        const pct = Math.round((p.done / p.total) * 100);
                        if (pct >= 70) return '#10b981';
                        if (pct >= 40) return '#f59e0b';
                        return '#f43f5e';
                    }),
                    borderRadius: 6
                }]
            },
            options: { 
                indexAxis: 'y', 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    datalabels: { color: '#fff', anchor: 'end', align: 'left', font: { weight: 'bold', size: 11 }, formatter: (v) => v + '%' }
                },
                scales: { 
                    x: { max: 110, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    y: { ticks: { color: '#e2e8f0', font: { size: 11 } }, grid: { display: false } }
                }
            }
        });

        const sortedClients = Object.values(stats.clients).sort((a,b) => (b.done/b.total) - (a.done/a.total));

        // Dynamic height for brand chart too
        const brandChartHeight = Math.max(300, sortedClients.length > 15 ? 400 : 300);
        document.getElementById('brandChart').parentElement.style.height = brandChartHeight + 'px';

        chartBrand = new Chart(brandCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedClients.map(c => c.name),
                datasets: [{
                    label: '% Execução',
                    data: sortedClients.map(c => Math.round((c.done / c.total) * 100)),
                    backgroundColor: sortedClients.map(c => {
                        const pct = Math.round((c.done / c.total) * 100);
                        if (pct >= 70) return '#06b6d4';
                        if (pct >= 40) return '#f59e0b';
                        return '#f43f5e';
                    }),
                    borderRadius: 6
                }]
            },
            options: { 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    datalabels: { 
                        color: '#fff', 
                        anchor: 'end', 
                        align: 'top', 
                        font: { weight: 'bold', size: 10 }, 
                        formatter: (v) => v + '%',
                        display: function(context) {
                            return context.dataIndex < 25; // Only show labels for first 25 bars
                        }
                    }
                },
                scales: { 
                    y: { max: 110, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    x: { 
                        ticks: { 
                            maxRotation: 55, 
                            minRotation: 45, 
                            font: { size: 9 }, 
                            color: '#94a3b8'
                        }, 
                        grid: { display: false } 
                    }
                }
            }
        });
    }

    function renderRankings(stats) {
        const criticalList = document.getElementById('criticalStoresList');
        const bestPromoters = document.getElementById('bestPromotersList');
        criticalList.innerHTML = '';
        bestPromoters.innerHTML = '';

        const criticals = Object.values(stats.stores)
            .filter(s => s.done === 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        criticals.forEach(s => {
            criticalList.innerHTML += `
                <div class="rank-item">
                    <span class="store-name">${s.name}</span>
                    <span class="badge badge-danger">ZERO EXECUÇÃO</span>
                </div>`;
        });

        if (criticals.length === 0) {
            criticalList.innerHTML = '<div class="rank-item"><span class="store-name" style="color: #34d399;">✅ Todas as lojas foram visitadas!</span></div>';
        }

        if (stats.promoters) {
            document.getElementById('bestPromotersList').parentElement.querySelector('h3').innerHTML = '👷 Produtividade dos Agentes';
            Object.values(stats.promoters)
                .sort((a, b) => b.done - a.done)
                .forEach((p, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                    bestPromoters.innerHTML += `
                        <div class="rank-item">
                            <span class="agent-name">${medal} ${p.name}</span>
                            <span class="score">${p.done} feitos</span>
                        </div>`;
                });
        } else {
            document.getElementById('bestPromotersList').parentElement.querySelector('h3').innerHTML = '🏆 Clientes Mais Executados';
            Object.values(stats.clients)
                .sort((a, b) => b.done - a.done)
                .slice(0, 10)
                .forEach((c, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                    bestPromoters.innerHTML += `
                        <div class="rank-item">
                            <span class="agent-name">${medal} ${c.name}</span>
                            <span class="score">${c.done}/${c.total} reqs</span>
                        </div>`;
                });
        }
    }

    function renderInsights(eff, stats) {
        const decisionList = document.getElementById('decisionList');
        decisionList.innerHTML = '';
        const insights = [];
        if (eff < 70) insights.push({ icon: '⚠️', text: `A efetividade global consolidada está baixa (${eff}%). Analise as redes e regiões no gráfico acima e no mapa para focar contigenciamento.` });
        
        const topGargalo = Object.values(stats.clients).sort((a,b) => (a.done/a.total) - (b.done/b.total))[0];
        if (topGargalo) insights.push({ icon: '🏷️', text: `A campanha/cliente "${topGargalo.name}" possui a menor taxa de execução, verifique.` });
        
        if (stats.promoters) {
            const bestAgente = Object.values(stats.promoters).sort((a,b) => b.done - a.done)[0];
            if (bestAgente) insights.push({ icon: '🏆', text: `${bestAgente.name} é o agente mais produtivo com ${bestAgente.done} tarefas.` });
        } else {
            const topNetwork = Object.values(stats.networks).sort((a,b) => (b.done/b.total) - (a.done/a.total))[0];
            if (topNetwork && eff < 100) insights.push({ icon: '🏅', text: `A rede "${topNetwork.name}" possui a melhor taxa de conclusão proporcional de suas tarefas.` });
        }
        insights.forEach(i => {
            const div = document.createElement('div');
            div.className = 'decision-item';
            div.innerHTML = `<span class="icon">${i.icon}</span><p>${i.text}</p>`;
            decisionList.appendChild(div);
        });
    }

    function renderNetworkSummary(networks) {
        const list = document.getElementById('networkSummary');
        list.innerHTML = '';
        Object.values(networks).sort((a,b) => b.total - a.total).forEach(n => {
            const perc = Math.round((n.done / n.total) * 100);
            list.innerHTML += `<div class="activity-item"><div class="activity-info"><strong>${n.name}</strong><br><small>${n.done}/${n.total} tarefas • ${perc}%</small></div></div>`;
        });
    }

    // Sync Theme via BroadcastChannel
    syncChannel.onmessage = (event) => {
        if (event.data.type === 'THEME_CHANGE') {
            document.documentElement.setAttribute('data-theme', event.data.theme);
        }
    };

    // --- LÓGICA DE FEED AO VIVO (Check-ins em Tempo Real) ---
    const liveFeedContainer = document.getElementById('liveCheckinFeed');
    let hasCheckins = false;

    // Função para renderizar um novo check-in na UI
        window.addLiveCheckin = function(checkinData) {
        if (!liveFeedContainer) return;
        
        if (!hasCheckins) {
            liveFeedContainer.innerHTML = '';
            hasCheckins = true;
        }

        let agentName = "Agente";
        let agentPhoto = "";
        let clientIdInfo = checkinData.clientId ? `<div style="font-size:11px; margin-top:2px; color:var(--text-main); font-weight:600;">🏪 Loja: ${checkinData.clientId}</div>` : '';
        
        if (checkinData.activityId && checkinData.activityId.includes(';')) {
            const parts = checkinData.activityId.split(';');
            agentName = parts[0]?.trim() || "Agente";
            const photoPart = parts.find(p => p.trim().toLowerCase().includes('http'));
            agentPhoto = photoPart ? photoPart.trim() : "";
        } else {
            agentName = checkinData.agentName || "Agente";
            agentPhoto = checkinData.photoUrl || "";
        }

        const dateStr = checkinData.historyId || new Date().toISOString();
        const dateObj = new Date(dateStr.replace(' ', 'T')); 
        const timeFormatted = isNaN(dateObj.getTime()) ? "Agora" : `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

        const avatarHtml = agentPhoto 
            ? `<img src="${agentPhoto}" style="width:48px; height:48px; border-radius:10px; object-fit:cover; border:2px solid #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=3b82f6&color=fff'">` 
            : `<div class="activity-marker" style="background:#3b82f6; width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; font-weight:bold;">${agentName[0]}</div>`;

        const card = document.createElement('div');
        card.className = 'live-checkin-card';
        card.style.gap = '16px';
        card.innerHTML = `
            ${avatarHtml}
            <div class="checkin-info">
                <strong>${agentName}</strong>
                ${clientIdInfo}
                <div class="checkin-time" style="font-size:11px; margin-top:6px;">📍 Registrado às ${timeFormatted}</div>
            </div>
        `;

        liveFeedContainer.insertBefore(card, liveFeedContainer.firstChild);

        if (liveFeedContainer.children.length > 15) {
            liveFeedContainer.removeChild(liveFeedContainer.lastChild);
        }
    };

    // Assinar Realtime do Supabase (Aguardando tabela "checkins")
    if (window.supabase) {
        const liveStatusText = document.querySelector('.live-status-text');
        
        // 1. Primeiro, buscar últimos 15 check-ins SOMENTE DE HOJE para preencher a tela inicial
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Início do dia de hoje
        const todayIso = today.toISOString();

        window.supabase
            .from('checkins')
            .select('*')
            .gte('created_at', todayIso)
            .order('created_at', { ascending: true }) // Pegamos em ordem cronológica para adicioná-los no DOM corretamente
            .limit(15)
            .then(({ data, error }) => {
                if (!error && data) {
                    // Limpa o loader da demonstração se vier dados
                    if (data.length > 0) {
                        liveFeedContainer.innerHTML = '';
                        hasCheckins = true;
                    }
                    data.forEach(row => {
                        window.addLiveCheckin({
                            historyId: row.created_at,
                            activityId: row.activity_id,
                            clientId: row.client_id
                        });
                    });
                }
            });
        
        // 2. Assinar para ouvir os novos check-ins que caírem DE AGORA EM DIANTE
        const checkinSubscription = window.supabase
            .channel('public:checkins')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, payload => {
                console.log('Novo check-in recebido via Supabase!', payload.new);
                window.addLiveCheckin({
                    historyId: payload.new.created_at, 
                    activityId: payload.new.activity_id,
                    clientId: payload.new.client_id
                });
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('🔌 Conectado ao Feed Ao Vivo de Check-ins (Supabase).');
                    if(liveStatusText) liveStatusText.textContent = 'CONECTADO E OUVINDO';
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    if(liveStatusText) {
                        liveStatusText.textContent = 'DESCONECTADO';
                        liveStatusText.style.color = '#ef4444';
                    }
                }
            });
    }

    // Fim da Lógica Real-Time de Check-ins

});

// =============================== INTEGRAÇÃO LAIVON API ===============================
const DEFAULT_LAIVON_KEY = 'pk_live_W4OMfCgBGyhp.ofbx_r2HlbcXsXH98jm8HW0wut3K_6Y-vSgmOzq2xj8';

function getLaivonApiKey() {
    const saved = localStorage.getItem('laivon_api_key');
    if (saved && saved.trim().length > 10) {
        return saved.trim();
    }
    return DEFAULT_LAIVON_KEY;
}

window.closeLaivonModal = function() {
    const modal = document.getElementById('laivonConfigModal');
    if (modal) modal.style.display = 'none';
};

window.saveLaivonApiKey = function() {
    const keyInput = document.getElementById('laivonApiKeyInput').value.trim();
    if (keyInput) {
        localStorage.setItem('laivon_api_key', keyInput);
        window.closeLaivonModal();
        syncLaivonData();
    }
};

window.resetLaivonApiKey = function() {
    localStorage.removeItem('laivon_api_key');
    const input = document.getElementById('laivonApiKeyInput');
    if (input) input.value = DEFAULT_LAIVON_KEY;
    window.closeLaivonModal();
    syncLaivonData();
};

async function fetchLaivonEndpoint(endpoint, headers) {
    const supabaseProxyBase = (window.SUPABASE_URL || 'https://xgbvokegqxqxpgznpxiq.supabase.co') + '/functions/v1/laivon-proxy';
    
    let lastError = null;

    try {
        const res = await fetch(`${supabaseProxyBase}${endpoint}`, { headers });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
            return json;
        }
        if (res.status === 401 || res.status === 403) {
            throw new Error(json?.error?.message || json?.message || `Chave de API inválida (${res.status})`);
        }
        lastError = new Error(json?.error?.message || json?.message || `Erro HTTP ${res.status}`);
    } catch (e) {
        if (e.message && (e.message.includes('Chave') || e.message.includes('API'))) throw e;
        lastError = e;
        console.warn(`[Laivon Sync] Proxy Supabase falhou para ${endpoint}:`, e);
    }

    try {
        const res = await fetch(`https://proxy.cors.sh/https://promoter-api.laivon.com/v1${endpoint}`, { headers });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
            return json;
        }
        if (res.status === 401 || res.status === 403) {
            throw new Error(json?.error?.message || json?.message || `Chave de API inválida (${res.status})`);
        }
    } catch (e) {
        if (e.message && (e.message.includes('Chave') || e.message.includes('API'))) throw e;
        console.warn(`[Laivon Sync] Proxy CORS falhou para ${endpoint}:`, e);
    }

    throw lastError || new Error('Falha ao conectar na API Laivon.');
}

async function syncLaivonData() {
    const apiKey = getLaivonApiKey();
    const loader = document.getElementById('loadingOverlay');
    const loadingMsg = document.getElementById('loadingMsg');
    
    if (loader) loader.style.display = 'flex';
    if (loadingMsg) loadingMsg.textContent = 'Conectando à API Laivon (Promoter)...';

    try {
        if (loadingMsg) loadingMsg.textContent = 'Buscando tarefas, lojas, agentes e clientes da Laivon...';

        const headers = { 'X-API-Key': apiKey };

        const [tasksRes, agentsRes, localsRes, clientsRes, photosRes, rupturesRes, pricesRes] = await Promise.allSettled([
            fetchLaivonEndpoint('/tasks?limit=500', headers),
            fetchLaivonEndpoint('/agents?limit=500', headers),
            fetchLaivonEndpoint('/locals?limit=500', headers),
            fetchLaivonEndpoint('/clients?limit=500', headers),
            fetchLaivonEndpoint('/photos?limit=100', headers),
            fetchLaivonEndpoint('/ruptures?limit=100', headers),
            fetchLaivonEndpoint('/prices?limit=100', headers)
        ]);

        const tasksData = tasksRes.status === 'fulfilled' && tasksRes.value?.data ? tasksRes.value.data : [];
        const agentsData = agentsRes.status === 'fulfilled' && agentsRes.value?.data ? agentsRes.value.data : [];
        const localsData = localsRes.status === 'fulfilled' && localsRes.value?.data ? localsRes.value.data : [];
        const clientsData = clientsRes.status === 'fulfilled' && clientsRes.value?.data ? clientsRes.value.data : [];
        const photosData = photosRes.status === 'fulfilled' && photosRes.value?.data ? photosRes.value.data : [];
        const rupturesData = rupturesRes.status === 'fulfilled' && rupturesRes.value?.data ? rupturesRes.value.data : [];
        const pricesData = pricesRes.status === 'fulfilled' && pricesRes.value?.data ? pricesRes.value.data : [];

        if (tasksData.length === 0 && localsData.length === 0) {
            let errorMsg = 'Nenhum dado retornado pela API Laivon.';
            if (tasksRes.status === 'rejected') {
                errorMsg += '\nDetalhe: ' + (tasksRes.reason?.message || 'Falha de comunicação');
                if (tasksRes.reason?.message?.includes('401') || tasksRes.reason?.message?.includes('Chave')) {
                    localStorage.removeItem('laivon_api_key');
                    errorMsg += '\n\n(Sua chave customizada foi resetada para a padrão oficial. Tente clicar em Sincronizar novamente)';
                }
            } else {
                errorMsg += '\nVerifique sua chave de API.';
            }
            alert(errorMsg);
            return;
        }

        // Mapeamentos
        const agentMap = new Map();
        agentsData.forEach(a => agentMap.set(a.id, a.name));

        const localMap = new Map();
        localsData.forEach(l => localMap.set(l.id, l));

        const clientMap = new Map();
        clientsData.forEach(c => clientMap.set(c.id, c.name));

        // Converter tarefas para o formato padrão do Analytics
        const convertedRows = tasksData.map(task => {
            const localObj = localMap.get(task.id_local) || {};
            const agentName = task.agent_name || agentMap.get(task.id_agent) || 'Agente #' + (task.id_agent || '');
            const storeName = localObj.name || ('Loja #' + task.id_local);
            const networkName = localObj.neighborhood ? `${localObj.city || ''} (${localObj.neighborhood})` : (localObj.city || 'Outros');
            const clientName = clientMap.get(task.id_client) || 'Trade Objetiva';

            // Duração
            let durationStr = '00:30:00';
            if (task.real_initial_dt && task.real_final_dt) {
                const diffMs = new Date(task.real_final_dt) - new Date(task.real_initial_dt);
                if (diffMs > 0) {
                    const totalSecs = Math.floor(diffMs / 1000);
                    const hrs = Math.floor(totalSecs / 3600);
                    const mins = Math.floor((totalSecs % 3600) / 60);
                    const secs = totalSecs % 60;
                    durationStr = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            } else if (task.schedule_initial_dt && task.schedule_final_dt) {
                const diffMs = new Date(task.schedule_final_dt) - new Date(task.schedule_initial_dt);
                if (diffMs > 0) {
                    const totalSecs = Math.floor(diffMs / 1000);
                    const hrs = Math.floor(totalSecs / 3600);
                    const mins = Math.floor((totalSecs % 3600) / 60);
                    const secs = totalSecs % 60;
                    durationStr = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            }

            const isDone = Boolean(task.real_final_dt || task.real_initial_dt || task.situation_id === 50 || task.situation_id === 2);

            return {
                'Agente': agentName,
                'Local': storeName,
                'Feito': isDone ? 'Sim' : 'Não',
                'Cliente': clientName,
                'Rede': networkName,
                'Formulário': task.type || 'Visita Operacional',
                'Duração': durationStr,
                'Lat': localObj.lat ? parseFloat(localObj.lat) : null,
                'Lng': localObj.lng ? parseFloat(localObj.lng) : null
            };
        });

        // Processar dados no dashboard principal
        window.processDataInternal(convertedRows);

        // Renderizar Fotos e Rupturas
        renderLaivonPhotos(photosData, localMap);
        renderLaivonRuptures(rupturesData, pricesData, localMap);

    } catch (err) {
        console.error('Erro ao sincronizar dados da Laivon:', err);
        alert('Erro na comunicação com a API Laivon: ' + err.message);
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function renderLaivonPhotos(photos, localMap) {
    const extraPanels = document.getElementById('laivonExtraPanels');
    const grid = document.getElementById('laivonPhotosGrid');
    const badge = document.getElementById('photoCountBadge');
    if (!grid) return;

    if (extraPanels) extraPanels.style.display = 'grid';
    if (badge) badge.textContent = `${photos.length} fotos`;

    if (photos.length === 0) {
        grid.innerHTML = `<p style="color: #94a3b8; font-size: 13px; text-align: center; grid-column: 1 / -1; padding: 30px;">Nenhuma foto registrada na API Laivon.</p>`;
        return;
    }

    grid.innerHTML = photos.map(p => {
        const local = localMap.get(p.local_id) || {};
        const storeName = local.name || `Loja #${p.local_id}`;
        const dateStr = p.date ? new Date(p.date).toLocaleDateString('pt-BR') : '';

        return `
            <div class="laivon-photo-card" onclick="window.open('${p.photo}', '_blank')" title="Clique para expandir a imagem">
                <img src="${p.photo}" alt="${p.description || 'Foto'}" loading="lazy" onerror="this.src='https://placehold.co/200x120?text=Sem+Foto'">
                <div class="laivon-photo-details">
                    <strong title="${p.description || 'Evidência'}">${p.description || 'Evidência Fotográfica'}</strong>
                    <span>📍 ${storeName}</span>
                    <span style="font-size: 9px; color: #64748b; margin-top: 2px;">📅 ${dateStr}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderLaivonRuptures(ruptures, prices, localMap) {
    const list = document.getElementById('laivonRupturesList');
    const badge = document.getElementById('ruptureCountBadge');
    if (!list) return;

    const totalCount = ruptures.length + prices.length;
    if (badge) badge.textContent = `${totalCount} registros`;

    let html = '';

    if (ruptures.length > 0) {
        html += '<h4 style="font-size: 12px; color: #ef4444; margin: 0 0 8px 0; text-transform: uppercase;">⚠️ Faltas / Rupturas de Estoque</h4>';
        html += ruptures.slice(0, 15).map(r => {
            const local = localMap.get(r.local_id) || {};
            const storeName = local.name || `Loja #${r.local_id}`;
            return `
                <div class="laivon-rupture-card">
                    <div>
                        <strong style="font-size: 12px; color: #f8fafc;">Produto ID: #${r.product_id}</strong>
                        <span style="display: block; font-size: 10px; color: #94a3b8;">📍 ${storeName}</span>
                    </div>
                    <span class="badge badge-danger" style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">RUPTURA</span>
                </div>
            `;
        }).join('');
    }

    if (prices.length > 0) {
        html += '<h4 style="font-size: 12px; color: #10b981; margin: 12px 0 8px 0; text-transform: uppercase;">🏷️ Pesquisa de Preços em Loja</h4>';
        html += prices.slice(0, 15).map(p => {
            const local = localMap.get(p.local_id) || {};
            const storeName = local.name || `Loja #${p.local_id}`;
            return `
                <div class="laivon-rupture-card" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.15);">
                    <div>
                        <strong style="font-size: 12px; color: #f8fafc;">Produto ID: #${p.product_id}</strong>
                        <span style="display: block; font-size: 10px; color: #94a3b8;">📍 ${storeName}</span>
                    </div>
                    <span style="color: #10b981; font-weight: 700; font-size: 13px;">R$ ${parseFloat(p.price || 0).toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    if (!html) {
        html = `<p style="color: #94a3b8; font-size: 13px; text-align: center; padding: 30px;">Nenhuma ruptura ou preço registrado.</p>`;
    }

    list.innerHTML = html;
}

