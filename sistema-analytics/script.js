document.addEventListener('DOMContentLoaded', () => {
    const excelFile = document.getElementById('excelFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mapFilter = document.getElementById('mapFilter');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const dashboardContent = document.getElementById('dashboardContent');

    let chartEvolution = null;
    let chartBrand = null;
    let map = null;
    let markers = []; 
    let globalStoreList = []; 

    if (uploadBtn && excelFile) {
        uploadBtn.addEventListener('click', () => {
            console.log('Botão de upload clicado');
            excelFile.click();
        });
    }

    // --- Drag and Drop Handlers ---
    window.handleDragOver = (e) => {
        e.preventDefault();
        welcomeScreen.classList.add('drag-over');
    };

    window.handleDragLeave = () => {
        welcomeScreen.classList.remove('drag-over');
    };

    window.handleDrop = (e) => {
        e.preventDefault();
        welcomeScreen.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    excelFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        const loader = document.getElementById('loadingOverlay');
        loader.style.display = 'flex';

        // Usamos setTimeout para permitir que o browser renderize o loader antes do parsing pesado
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(firstSheet);
                    processData(json);
                } catch (err) {
                    console.error('Erro ao ler planilha:', err);
                    alert('Erro ao processar arquivo. Verifique se é um Excel válido.');
                } finally {
                    loader.style.display = 'none';
                }
            };
            reader.readAsArrayBuffer(file);
        }, 100);
    }

    exportBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const element = document.querySelector('.analytics-container');
        
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(18);
        doc.text("Relatório de Cobertura - ObjetivaHub", 10, 10);
        doc.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
        doc.save(`Relatorio_ObjetivaHub_${new Date().toLocaleDateString()}.pdf`);
    });

    exportCsvBtn.addEventListener('click', () => {
        if (globalStoreList.length === 0) return;
        
        const headers = ["Loja", "Rede", "Planejado", "Realizado", "Cobertura %"];
        const csvContent = [
            headers.join(";"),
            ...globalStoreList.map(s => [
                s.name, 
                s.rede, 
                s.planned, 
                s.realized, 
                `${Math.round((s.realized/s.planned)*100)}%`
            ].join(";"))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Cobertura_Por_Loja_${new Date().toLocaleDateString()}.csv`);
        link.click();
    });

    fullscreenBtn.addEventListener('click', () => {
        const container = document.getElementById('mapContainer');
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Map filtering is now handled dynamically inside initMap()

    let globalStatsReference = null;

    function processData(data) {
        if (!data || data.length === 0) return;
        welcomeScreen.style.display = 'none';
        dashboardContent.style.display = 'block';
        exportBtn.style.display = 'block';
        exportCsvBtn.style.display = 'block';

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

        document.getElementById('globalEffectiveness').textContent = `${effectiveness}%`;
        document.getElementById('monitoredStores').textContent = stats.monitoredStores.size;
        document.getElementById('avgDuration').textContent = avgFormatted;
        document.getElementById('totalTasks').textContent = stats.totalTasks;

        initMap(data);
        renderCharts(stats);
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

    function initMap(data) {
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
                const isDone = String(row['Feito']).toLowerCase() === 'sim';
                const color = isDone ? '#10B981' : '#f43f5e';
                const marker = L.circleMarker([lat, lng], { radius: 6, fillColor: color, color: "#fff", weight: 1, fillOpacity: 0.8, isDone: isDone }).addTo(map);
                marker.bindPopup(`<b>${row['Local']}</b><br>Agente: ${row['Agente']}<br>Tarefa: ${row['Formulário']}<br>Status: ${isDone ? 'Concluído' : 'Pendente'}`);
                markers.push(marker);
            }
        });

        const mapFilter = document.getElementById('mapFilter');
        mapFilter.onchange = (e) => {
            const val = e.target.value;
            markers.forEach(m => {
                if (val === 'all') m.addTo(map);
                else if (val === 'done' && m.options.isDone) m.addTo(map);
                else if (val === 'pending' && !m.options.isDone) m.addTo(map);
                else map.removeLayer(m);
            });
        };
    }

    function renderCharts(stats) {
        const promoterCtx = document.getElementById('promoterChart').getContext('2d');
        const brandCtx = document.getElementById('brandChart').getContext('2d');
        if (chartEvolution) chartEvolution.destroy();
        if (chartBrand) chartBrand.destroy();

        const sortedPromoters = Object.values(stats.promoters)
            .sort((a, b) => (b.done / b.total) - (a.done / a.total));

        chartEvolution = new Chart(promoterCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedPromoters.map(p => p.name),
                datasets: [{
                    label: '% Efetividade',
                    data: sortedPromoters.map(p => Math.round((p.done / p.total) * 100)),
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: { 
                indexAxis: 'y', 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    datalabels: { color: '#fff', anchor: 'end', align: 'left', font: { weight: 'bold' }, formatter: (v) => v + '%' }
                },
                scales: { x: { max: 110, grid: { display: false } } }
            }
        });

        const sortedClients = Object.values(stats.clients).sort((a,b) => (b.done/b.total) - (a.done/a.total));
        chartBrand = new Chart(brandCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedClients.map(c => c.name),
                datasets: [{
                    label: '% Execução',
                    data: sortedClients.map(c => Math.round((c.done / c.total) * 100)),
                    backgroundColor: '#06b6d4',
                    borderRadius: 6
                }]
            },
            options: { 
                plugins: { 
                    legend: { display: false },
                    datalabels: { color: '#fff', anchor: 'end', align: 'top', font: { weight: 'bold' }, formatter: (v) => v + '%' }
                },
                scales: { y: { max: 110 } }
            }
        });
    }

    function renderRankings(stats) {
        const criticalList = document.getElementById('criticalStoresList');
        const bestPromoters = document.getElementById('bestPromotersList');
        criticalList.innerHTML = '';
        bestPromoters.innerHTML = '';

        // LOJAS SEM VISITA: done === 0
        const criticals = Object.values(stats.stores)
            .filter(s => s.done === 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        criticals.forEach(s => {
            criticalList.innerHTML += `
                <div class="rank-item">
                    <span>${s.name}</span>
                    <span class="score" style="color: #f43f5e;">ZERO EXECUÇÃO</span>
                </div>`;
        });

        if (criticals.length === 0) criticalList.innerHTML = '<div class="rank-item"><span>Todas as lojas foram visitadas</span></div>';

        Object.values(stats.promoters)
            .sort((a, b) => b.done - a.done)
            .forEach(p => {
                bestPromoters.innerHTML += `<div class="rank-item"><span>${p.name}</span><span class="score">${p.done} feitos</span></div>`;
            });
    }

    function renderInsights(eff, stats) {
        const decisionList = document.getElementById('decisionList');
        decisionList.innerHTML = '';
        const insights = [];
        if (eff < 70) insights.push({ icon: '⚠️', text: `A efetividade global está baixa (${eff}%). Verifique os agentes com maior volume de pendências.` });
        const topGargalo = Object.values(stats.clients).sort((a,b) => (a.done/a.total) - (b.done/b.total))[0];
        if (topGargalo) insights.push({ icon: '🏷️', text: `O cliente "${topGargalo.name}" possui a menor taxa de execução.` });
        const bestAgente = Object.values(stats.promoters).sort((a,b) => b.done - a.done)[0];
        if (bestAgente) insights.push({ icon: '🏆', text: `${bestAgente.name} é o agente mais produtivo com ${bestAgente.done} tarefas.` });
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
});
});
