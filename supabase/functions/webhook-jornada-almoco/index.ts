/// <reference lib="deno.ns" />
// @ts-ignore: Deno remote imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno remote imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Lida com requisições OPTIONS (para navegadores)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("Receiving webhook-jornada-almoco payload:", JSON.stringify(payload))

    const data = payload.data || payload
    const activityId = data.activityId || data.activity_id || data.event_id
    const historyId = data.historyId || data.history_id || new Date().toISOString()
    const taskId = data.taskId || data.task_id || 'Jornada de Trabalho'
    const clientId = data.clientId || data.client_id || null

    if (!activityId) {
      console.error("Payload inválido. Missing activityId identification.", payload)
      return new Response(JSON.stringify({ error: "Payload inválido. Missing activityId identification." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // @ts-ignore: Deno is available in Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore: Deno is available in Edge Functions
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Extrai o nome do colaborador e tipo de evento do clientId (ex: "LUCAS MAIKON RIBEIRO DA COSTA;SAÍDA PARA O INTERVALO")
    const clientParts = String(clientId || '').split(';')
    const collabName = clientParts[0] ? clientParts[0].trim().toUpperCase() : ''
    const eventType = clientParts[1] ? clientParts[1].trim().toUpperCase() : String(taskId).toUpperCase()
    
    const activityParts = String(activityId || '').split(';')
    let timeVal = activityParts[0] && activityParts[0].includes(':') ? activityParts[0].trim() : ''
    
    let dateVal = ''
    if (historyId) {
      dateVal = String(historyId).split(' ')[0]
    }
    if (!dateVal) {
      dateVal = new Date().toISOString().split('T')[0]
    }

    // Insere EXCLUSIVAMENTE na tabela 'tb_jornada_almoco'
    const { data: insertedData, error: insertError } = await supabaseClient
      .from('tb_jornada_almoco')
      .insert([
        {
          collaborator_name: collabName,
          event_type: eventType,
          date: dateVal,
          time: timeVal,
          history_id: historyId,
          task_id: taskId,
          client_id: clientId,
          activity_id: activityId
        }
      ])
      .select()

    if (insertError) {
      console.error("Error inserting into tb_jornada_almoco:", insertError)
      throw new Error(insertError.message || "Erro desconhecido ao inserir em tb_jornada_almoco")
    }

    console.log("Successfully inserted into tb_jornada_almoco:", insertedData)

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Jornada de almoço registrada com sucesso em tb_jornada_almoco!", 
      data: insertedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Webhook jornada-almoco error:", message)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
