// test-webhook-checkin.js
const URL = 'https://xgbvokegqxqxpgznpxiq.supabase.co/functions/v1/webhook-checkin';

const sampleData = {
    data: {
        activityId: "TESTE AGENTE;https://ui-avatars.com/api/?name=Teste",
        historyId: new Date().toISOString(),
        taskId: "TESTE MANUAL",
        clientId: "LOJA TESTE 01"
    }
};

console.log("🚀 Enviando teste manual para a Edge Function...");
console.log("URL:", URL);
console.log("PAYLOAD:", JSON.stringify(sampleData, null, 2));

fetch(URL, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM'
    },
    body: JSON.stringify(sampleData)
})
.then(async res => {
    const text = await res.text();
    console.log("\n--- RESULTADO ---");
    console.log("Status Code:", res.status);
    try {
        const data = JSON.parse(text);
        console.log("Mensagem:", data);
    } catch (e) {
        console.log("Resposta (não-JSON):", text);
    }
})
.catch(err => {
    console.error("\n❌ ERRO FATAL DE CONEXÃO:");
    console.error(err.message);
});
