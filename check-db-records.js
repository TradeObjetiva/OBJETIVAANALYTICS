// check-db-records.js
const URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM';

async function check() {
    console.log("🔍 Verificando os últimos registros...");
    
    // Teste simples de fetch no checkins
    const resCheckins = await fetch(`${URL}/rest/v1/checkins?select=*&order=created_at.desc&limit=3`, {
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    const checkins = await resCheckins.json();

    console.log("\n--- TABELA 'checkins' (Últimos 3) ---");
    console.table(checkins.map(c => ({ id: c.id, agente: c.activity_id, data: c.created_at })));

    // Teste na assiduidade
    const resAssid = await fetch(`${URL}/rest/v1/tb_assiduidade?select=*&order=date.desc&limit=3`, {
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    const assid = await resAssid.json();

    console.log("\n--- TABELA 'tb_assiduidade' (Últimos 3) ---");
    console.table(assid.map(a => ({ nome: a.collaborator_name, data: a.date, hora: a.checkin_time })));
}

check();
