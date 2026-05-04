import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

// Configurações MySQL (Considerar mover para secrets do GitHub Actions depois)
const mysqlConfig = {
    host: 'bdw.tradepro.com.br',
    port: 33307,
    user: 'objetivamarketing_select',
    password: 'lGBEYSELA4Gz2$',
    database: 'objetivamarketing'
};

// Configurações Supabase
const supabaseUrl = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    let mysqlConn;
    try {
        console.log('🚀 Iniciando sincronização MySQL -> Supabase (Automática)...');
        mysqlConn = await mysql.createConnection(mysqlConfig);

        // Busca APENAS a primeira foto de fachada do dia para cada promotor
        const query = `
            SELECT t1.nome_promotor, t1.data_foto, t1.razao_social_loja
            FROM view_resumo_foto t1
            INNER JOIN (
                SELECT nome_promotor, MIN(data_foto) as min_data
                FROM view_resumo_foto
                WHERE data_foto >= DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND CAST(tipo_foto AS CHAR) = 'FACHADA'
                GROUP BY nome_promotor, DATE(data_foto)
            ) t2 ON t1.nome_promotor = t2.nome_promotor AND t1.data_foto = t2.min_data
            WHERE CAST(t1.tipo_foto AS CHAR) = 'FACHADA'
            ORDER BY t1.data_foto ASC
        `;

        const [rows] = await mysqlConn.query(query);
        console.log(`📊 Encontrados ${rows.length} registros de check-in (1ª fachada do dia) para processar.`);

        let insertedCount = 0;
        let skippedCount = 0;

        for (const row of rows) {
            const historyId = row.data_foto.toISOString().replace('T', ' ').substring(0, 19);
            const activityId = row.nome_promotor.toUpperCase().trim();
            const clientId = row.razao_social_loja;

            const { data: existing } = await supabase
                .from('checkins')
                .select('id')
                .eq('history_id', historyId)
                .eq('activity_id', activityId)
                .limit(1);

            if (existing && existing.length > 0) {
                skippedCount++;
                continue;
            }

            const { error } = await supabase
                .from('checkins')
                .insert([{
                    history_id: historyId,
                    task_id: 'CHECK IN',
                    activity_id: activityId,
                    client_id: clientId,
                    origin: 'MYSQL',
                    created_at: row.data_foto.toISOString()
                }]);

            if (error) {
                console.error(`❌ Erro ao inserir ${activityId}:`, error.message);
            } else {
                insertedCount++;
                if (insertedCount % 50 === 0) console.log(`✅ ${insertedCount} registros processados...`);
            }
        }

        console.log('\n--- Resultado Final ---');
        console.log(`✅ Inseridos: ${insertedCount}`);
        console.log(`⏩ Ignorados (já existentes): ${skippedCount}`);
        console.log('-----------------------');

    } catch (err) {
        console.error('💥 Erro fatal na sincronização:', err);
    } finally {
        if (mysqlConn) await mysqlConn.end();
    }
}

sync();
