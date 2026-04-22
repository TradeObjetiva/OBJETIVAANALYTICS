import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lida com requisições OPTIONS (para navegadores, se aplicável)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("Receiving webhook payload:", JSON.stringify(payload))

    // Tenta encontrar o activityId no topo ou dentro de um objeto 'data' (comum em webhooks do uMov.me)
    const data = payload.data || payload
    const activityId = data.activityId || data.activity_id || data.event_id
    const historyId = data.historyId || data.history_id || new Date().toISOString()
    const taskId = data.taskId || data.task_id || 'CHECK IN'
    const clientId = data.clientId || data.client_id || null

    if (!activityId) {
      console.error("Payload inválido. Missing activityId identification.", payload)
      return new Response(JSON.stringify({ error: "Payload inválido. Missing activityId identification." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Conecta no Supabase usando a Chave de Serviço (Service Role Key) para passar pelo RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insere os dados na tabela 'checkins'
    const { data: insertedData, error } = await supabaseClient
      .from('checkins')
      .insert([
        {
          history_id: historyId,
          task_id: taskId,
          activity_id: activityId,
          client_id: clientId
        }
      ])
      .select()

    if (error) {
      console.error("Error inserting checkin:", error)
      throw error
    }

    console.log("Successfully inserted checkin:", insertedData)

    return new Response(JSON.stringify({ success: true, message: "Check-in inserido com sucesso!", data: insertedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Webhook processing error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

