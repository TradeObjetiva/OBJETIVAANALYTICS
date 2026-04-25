import { api } from './api.js';
import { ui } from './ui.js';
import { dashboard } from './dashboard.js';

export const excel = {
    state: {
        parsedData: []
    },

    init() {
        this.worker = new Worker('/excel-worker.js');
        this.setupListeners();
    },

    setupListeners() {
        const excelInput = document.getElementById('excel-upload');
        const btnProcess = document.getElementById('btn-process-excel');

        this.worker.onmessage = (e) => {
            const { type, data, message } = e.data;
            if (type === 'SUCCESS') {
                this.state.parsedData = data;
                if (btnProcess) {
                    btnProcess.style.display = 'inline-block';
                    btnProcess.textContent = `Salvar ${this.state.parsedData.length} registros`;
                    btnProcess.disabled = false;
                }
            } else {
                Swal.fire('Erro!', message, 'error');
                if (btnProcess) btnProcess.disabled = false;
            }
        };

        if (excelInput) {
            excelInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) {
                    if (btnProcess) btnProcess.style.display = 'none';
                    return;
                }
                
                if (btnProcess) {
                    btnProcess.style.display = 'inline-block';
                    btnProcess.textContent = 'Lendo arquivo...';
                    btnProcess.disabled = true;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    this.worker.postMessage({ type: 'PARSE_EXCEL', data: new Uint8Array(event.target.result) });
                };
                reader.readAsArrayBuffer(file);
            });
        }

        if (btnProcess) {
            btnProcess.addEventListener('click', () => this.processUpload());
        }
    },

    async processUpload() {
        const btnProcess = document.getElementById('btn-process-excel');
        if (this.state.parsedData.length === 0) return;
        
        btnProcess.disabled = true;
        btnProcess.textContent = 'Enviando para o banco...';

        try {
            // 1. Limpa a base atual
            await api.clearPlanilha();
            
            // 2. Insere os novos dados em lotes
            const batchSize = 1000;
            for (let i = 0; i < this.state.parsedData.length; i += batchSize) {
                const batch = this.state.parsedData.slice(i, i + batchSize);
                await api.insertPlanilhaBatch(batch);
            }

            // 3. Atualização automática de colaboradores
            await this.syncStaffFromExcel();

            Swal.fire('Sucesso!', `Base atualizada com ${this.state.parsedData.length} registros.`, 'success');
            
            const excelInput = document.getElementById('excel-upload');
            if (excelInput) excelInput.value = '';
            btnProcess.style.display = 'none';
            
            dashboard.populateMetrics(); 

        } catch (err) {
            console.error(err);
            Swal.fire('Erro!', err.message, 'error');
        } finally {
            btnProcess.disabled = false;
        }
    },

    async syncStaffFromExcel() {
        const uniqueStaff = {};
        this.state.parsedData.forEach(row => {
            if (row.agente) {
                const name = row.agente.trim().toUpperCase();
                if (!uniqueStaff[name]) {
                    uniqueStaff[name] = { nome: name, projeto: row.projeto || 'PROMOTOR' };
                }
            }
        });
        
        const staffArray = Object.values(uniqueStaff);
        if (staffArray.length > 0) {
            await api.upsertStaff(staffArray);
        }
    }
};
