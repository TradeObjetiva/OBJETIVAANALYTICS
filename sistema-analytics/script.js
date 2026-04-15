document.addEventListener('DOMContentLoaded', () => {
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

    mapFilter.addEventListener('change', (e) => {
        const value = e.target.value;
        markers.forEach(m => {
            const perc = m.options.perc;
            const isCritical = m.options.critical;
            
            if (value === 'all') m.addTo(map);
            else if (value === 'critical' && isCritical) m.addTo(map);
            else if (value === 'ok' && perc >= 100) m.addTo(map);
            else if (value === 'partial' && perc < 100 && perc > 0) m.addTo(map);
            else map.removeLayer(m);
        });
    });

    function processData(data) {
        if (!data || data.length === 0) return;
        welcomeScreen.style.display = 'none';
        dashboardContent.style.display = 'block';
        exportBtn.style.display = 'block';
        exportCsvBtn.style.display = 'block';

        const dateColumns = Object.keys(data[0]).filter(k => k.match(/\d{2}\/\d{2}\/\d{4}/));
        const stores = {};
        const brands = {};
        const dailyStats = {};

        data.forEach(row => {
            const local = String(row['LOCAL'] || row['Local'] || "Sem Nome").trim();
            const brand = String(row['CLIENTE'] || row['Cliente'] || "Outros").trim();
            const rede = String(row['REDE'] || row['Rede'] || "Outros").trim();
            const lat = parseFloat(row['Lat'] || row['LAT']);
            const lng = parseFloat(row['Lng'] || row['LNG']);

            if (!stores[local]) {
                stores[local] = { name: local, rede: rede, planned: 0, realized: 0, history: {}, lat, lng };
            }
            if (!brands[brand]) brands[brand] = { name: brand, planned: 0, realized: 0 };

            stores[local].planned += parseFloat(row['Planejado'] || 0);
            stores[local].realized += parseFloat(row['Realizado'] || 0);
            brands[brand].planned += parseFloat(row['Planejado'] || 0);
            brands[brand].realized += parseFloat(row['Realizado'] || 0);

            dateColumns.forEach(date => {
                const status = String(row[date]).toLowerCase();
                if (!dailyStats[date]) dailyStats[date] = { planned: 0, realized: 0 };
                dailyStats[date].planned++;
                if (status.includes('realizado') && !status.includes('não')) {
                    dailyStats[date].realized++;
                    stores[local].history[date] = true;
                }
            });
        });

        // Helper para converter "DD/MM/YYYY" em Date
        const parseSheetDate = (dateStr) => {
            const parts = dateStr.split('/');
            // Assume DD/MM/YYYY ou DD/MM/YY
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            return new Date(year, month, day);
        };

        const storeList = Object.values(stores);
        globalStoreList = storeList; 

        const brandList = Object.values(brands);
        const totalPlanned = storeList.reduce((a, b) => a + b.planned, 0);
        const totalRealized = storeList.reduce((a, b) => a + b.realized, 0);

        document.getElementById('monitoredStores').textContent = storeList.length;
        document.getElementById('totalVisits').textContent = totalRealized;

        // PONTOS CRÍTICOS: Hiato > 7 dias CORRIDOS
        const lastDateStr = dateColumns[dateColumns.length - 1];
        const lastDateObj = parseSheetDate(lastDateStr);

        const criticalStores = storeList.filter(s => {
            const servicedDates = dateColumns
                .filter(d => s.history[d])
                .map(d => parseSheetDate(d));

            if (servicedDates.length === 0) {
                // Nunca foi atendida: verifica range da planilha
                const firstDateObj = parseSheetDate(dateColumns[0]);
                const diff = Math.floor((lastDateObj - firstDateObj) / (1000 * 60 * 60 * 24));
                return diff >= 7;
            }

            const lastService = new Date(Math.max(...servicedDates));
            const diff = Math.floor((lastDateObj - lastService) / (1000 * 60 * 60 * 24));
            return diff >= 7;
        });

        document.getElementById('criticalPoints').textContent = criticalStores.length;

        initMap(storeList, criticalStores);
        renderCharts(dailyStats, brandList);
        renderRankings(storeList);
        renderInsights(100, criticalStores.length, brandList);
    }

    function initMap(storeList, criticalStores) {
        if (map) map.remove();
        map = L.map('map').setView([-22.9068, -43.1729], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markers = [];

        storeList.forEach(s => {
            if (s.lat && s.lng) {
                const perc = Math.round((s.realized/s.planned)*100);
                const isCritical = criticalStores.some(c => c.name === s.name);
                const color = isCritical ? '#ef4444' : (perc >= 100 ? '#10B981' : '#F59E0B');
                
                const marker = L.circleMarker([s.lat, s.lng], {
                    radius: 7,
                    fillColor: color,
                    color: "#fff",
                    weight: 1.5,
                    fillOpacity: 0.9,
                    perc: perc,
                    critical: isCritical
                }).addTo(map);
                
                marker.bindPopup(`<b>${s.name}</b><br>Execução: ${perc}%<br>${isCritical ? '⚠️ CRÍTICO (>7 dias)' : ''}`);
                markers.push(marker);
            }
        });
    }

    function renderCharts(daily, brandList) {
        const evolCtx = document.getElementById('evolutionChart').getContext('2d');
        const brandCtx = document.getElementById('brandChart').getContext('2d');
        if (chartEvolution) chartEvolution.destroy();
        if (chartBrand) chartBrand.destroy();

        const labels = Object.keys(daily).sort();
        const dataEvol = labels.map(l => Math.round((daily[l].realized / daily[l].planned) * 100));

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4F46E5';

        chartEvolution = new Chart(evolCtx, {
            type: 'line',
            data: { labels, datasets: [{ label: '% Efetividade', data: dataEvol, borderColor: primaryColor, tension: 0.3, fill: true, backgroundColor: 'rgba(79, 70, 229, 0.1)' }] },
            options: { plugins: { legend: { display: false } } }
        });

        // Ordenando marcas do MAIOR para o MENOR
        const sortedBrands = brandList
            .map(b => ({ name: b.name, perc: Math.round((b.realized/b.planned)*100) }))
            .sort((a, b) => b.perc - a.perc);

        chartBrand = new Chart(brandCtx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: sortedBrands.map(b => b.name),
                datasets: [{ 
                    label: '% Cobertura', 
                    data: sortedBrands.map(b => b.perc), 
                    backgroundColor: '#10B981',
                    borderRadius: 4
                }]
            },
            options: { 
                indexAxis: 'y', 
                plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: true },
                    datalabels: {
                        color: '#fff',
                        anchor: 'end',
                        align: 'left',
                        offset: 4,
                        font: { weight: 'bold', size: 10 },
                        formatter: (value) => value + '%'
                    }
                },
                scales: {
                    x: { max: 110, grid: { display: false }, ticks: { display: false } },
                    y: { ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    function renderRankings(storeList) {
        const bestList = document.getElementById('bestList');
        const worstList = document.getElementById('worstList');
        bestList.innerHTML = ''; worstList.innerHTML = '';

        const sorted = [...storeList].sort((a,b) => (b.realized/b.planned) - (a.realized/a.planned));
        
        // TOP 10
        sorted.slice(0, 10).forEach(s => {
            bestList.innerHTML += `<div class="rank-item"><span>${s.name}</span><span class="score">${Math.round((s.realized/s.planned)*100)}%</span></div>`;
        });
        [...sorted].reverse().slice(0, 10).forEach(s => {
            worstList.innerHTML += `<div class="rank-item"><span>${s.name}</span><span class="score">${Math.round((s.realized/s.planned)*100)}%</span></div>`;
        });
    }

    function renderInsights(adherence, criticals, brandList) {
        const decisionList = document.getElementById('decisionList');
        decisionList.innerHTML = '';
        const insights = [
            { icon: '🗺️', text: `O mapa de calor geográfico mostra ${criticals} zonas de sombra que precisam de atenção imediata.` },
            { icon: '🏷️', text: `A marca "${brandList.sort((a,b) => (a.realized/a.planned)-(b.realized/b.planned))[0].name}" está com a menor cobertura média da rede.` }
        ];
        if (adherence < 100) insights.push({ icon: '📈', text: 'Tendência: Há uma variação de cobertura entre as marcas que sugere falta de tempo em loja.' });

        insights.forEach(i => {
            const div = document.createElement('div');
            div.className = 'decision-item';
            div.innerHTML = `<span class="icon">${i.icon}</span><p>${i.text}</p>`;
            decisionList.appendChild(div);
        });
    }
});
