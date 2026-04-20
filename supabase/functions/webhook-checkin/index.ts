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

    // Ignora se não vier o activityId (que é a string com nome e foto do uMov.me)
    if (!payload || !payload.activityId) {
      return new Response(JSON.stringify({ error: "Payload inválido. Missing activityId." }), {
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
    const { data, error } = await supabaseClient
      .from('checkins')
      .insert([
        {
          history_id: payload.historyId || new Date().toISOString(),
          task_id: payload.taskId || 'CHECK IN',
          activity_id: payload.activityId,
          client_id: payload.clientId || null
        }
      ])
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, message: "Check-in inserido com sucesso!", data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
