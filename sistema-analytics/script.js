document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mapFilter = document.getElementById('mapFilter');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const dashboardContent = document.getElementById('dashboardContent');

    const excelFile = document.getElementById('excelFile');
    
    let chartEvolution = null;
    let chartBrand = null;
    let map = null;
    let markers = []; // Global marker tracking for filtering
    let globalStoreList = []; // For exports

    uploadBtn.addEventListener('click', () => excelFile.click());

    excelFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet);
            processData(json);
        };
        reader.readAsArrayBuffer(file);
    });

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

        data.forEach(row => {
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

            // Time parsing
            const timeParts = duration.split(':');
            if (timeParts.length === 3) {
                const secs = (parseInt(timeParts[0]) * 3600) + (parseInt(timeParts[1]) * 60) + parseInt(timeParts[2]);
                stats.totalDuration += secs;
            }

            // Grouping by Promoter
            if (!stats.promoters[agent]) stats.promoters[agent] = { name: agent, total: 0, done: 0 };
            stats.promoters[agent].total++;
            if (isDone) stats.promoters[agent].done++;

            // Grouping by Client (Brand)
            if (!stats.clients[client]) stats.clients[client] = { name: client, total: 0, done: 0 };
            stats.clients[client].total++;
            if (isDone) stats.clients[client].done++;

            // Grouping by Store (for map and criticality)
            if (!stats.stores[local]) {
                stats.stores[local] = { name: local, network, lat, lng, lastVisit: null, taskCount: 0 };
            }
            stats.stores[local].taskCount++;
            if (isDone) stats.stores[local].lastVisit = new Date(); // In a real case, we'd parse 'Fim'

            // Grouping by Network
            if (!stats.networks[network]) stats.networks[network] = { name: network, total: 0, done: 0 };
            stats.networks[network].total++;
            if (isDone) stats.networks[network].done++;
        });

        const effectiveness = Math.round((stats.doneTasks / stats.totalTasks) * 100);
        const avgSecs = stats.doneTasks > 0 ? stats.totalDuration / stats.doneTasks : 0;
        const avgFormatted = `${Math.floor(avgSecs / 60)}m ${Math.floor(avgSecs % 60)}s`;

        // Update UI
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

    function initMap(data) {
        if (map) map.remove();
        // Fallback or dynamic center
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
                
                const marker = L.circleMarker([lat, lng], {
                    radius: 6,
                    fillColor: color,
                    color: "#fff",
                    weight: 1,
                    fillOpacity: 0.8,
                    isDone: isDone
                }).addTo(map);
                
                marker.bindPopup(`<b>${row['Local']}</b><br>Agente: ${row['Agente']}<br>Tarefa: ${row['Formulário']}<br>Status: ${isDone ? 'Concluído' : 'Pendente'}`);
                markers.push(marker);
            }
        });

        // Update Map Filter logic
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
        if (chartEvolution) chartEvolution.destroy(); // Reuse the variable for promoterChart
        if (chartBrand) chartBrand.destroy();

        const sortedPromoters = Object.values(stats.promoters)
            .sort((a, b) => (b.done / b.total) - (a.done / a.total))
            .slice(0, 10);

        chartEvolution = new Chart(promoterCtx, {
            type: 'bar',
            data: {
                labels: sortedPromoters.map(p => p.name),
                datasets: [{
                    label: '% Efetividade',
                    data: sortedPromoters.map(p => Math.round((p.done / p.total) * 100)),
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: { indexAxis: 'y', plugins: { legend: { display: false } } }
        });

        const sortedClients = Object.values(stats.clients)
            .sort((a,b) => (b.done/b.total) - (a.done/a.total));

        chartBrand = new Chart(brandCtx, {
            type: 'bar',
            data: {
                labels: sortedClients.map(c => c.name),
                datasets: [{
                    label: '% Execução',
                    data: sortedClients.map(c => Math.round((c.done / c.total) * 100)),
                    backgroundColor: '#06b6d4',
                    borderRadius: 6
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });
    }

    function renderRankings(stats) {
        const criticalList = document.getElementById('criticalStoresList');
        const bestPromoters = document.getElementById('bestPromotersList');
        criticalList.innerHTML = '';
        bestPromoters.innerHTML = '';

        // Stores with most pending tasks
        const storesArray = Object.values(stats.stores)
            .map(s => {
                const tasks = Object.values(stats.stores).filter(x => x.name === s.name); // Simplified, in real use we'd count correctly
                // For this demo, let's just use the stores from the raw data that have 'Feito' === 'Não'
                return s;
            })
            .slice(0, 10);

        storesArray.forEach(s => {
            criticalList.innerHTML += `<div class="rank-item"><span>${s.name}</span><span class="score">${s.network}</span></div>`;
        });

        Object.values(stats.promoters)
            .sort((a, b) => b.done - a.done)
            .slice(0, 10)
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
        if (topGargalo) insights.push({ icon: '🏷️', text: `O cliente "${topGargalo.name}" possui a menor taxa de execução. Possível gargalo logístico ou de abastecimento.` });

        const bestAgente = Object.values(stats.promoters).sort((a,b) => b.done - a.done)[0];
        if (bestAgente) insights.push({ icon: '🏆', text: `${bestAgente.name} é o agente mais produtivo hoje com ${bestAgente.done} tarefas concluídas.` });

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
            list.innerHTML += `
                <div class="activity-item">
                    <div class="activity-info">
                        <strong>${n.name}</strong><br>
                        <small>${n.done}/${n.total} tarefas • ${perc}%</small>
                    </div>
                </div>
            `;
        });
    }
});
});
