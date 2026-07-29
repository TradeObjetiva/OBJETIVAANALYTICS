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

    if (!activityId && !clientId) {
      console.error("Payload inválido. Missing identification.", payload)
      return new Response(JSON.stringify({ error: "Payload inválido. Missing identification." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // @ts-ignore: Deno is available in Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore: Deno is available in Edge Functions
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Extrai o nome do colaborador e verifica se é retorno
    const clientParts = String(clientId || '').split(';')
    const collabName = clientParts[0] ? clientParts[0].trim().toUpperCase() : ''
    const combinedDesc = `${clientId} ${taskId} ${activityId}`.toUpperCase()

    const isEnd = combinedDesc.includes('RETORNO') || combinedDesc.includes('VOLTA') || combinedDesc.includes('FIM') || combinedDesc.includes('CHEGADA')

    const activityParts = String(activityId || '').split(';')
    let timeVal = ''
    if (activityParts[0] && activityParts[0].includes(':')) {
      timeVal = activityParts[0].trim()
    } else if (historyId && historyId.includes(' ')) {
      timeVal = historyId.split(' ')[1].substring(0, 5)
    }

    if (timeVal && timeVal.length === 5) {
      timeVal = timeVal + ':00'
    }

    let dateVal = ''
    if (historyId) {
      dateVal = String(historyId).split(' ')[0]
    }
    if (!dateVal) {
      dateVal = new Date().toISOString().split('T')[0]
    }

    // Busca se já existe um registro para o mesmo colaborador na mesma data
    const { data: existingRecords } = await supabaseClient
      .from('tb_jornada_almoco')
      .select('*')
      .eq('collaborator_name', collabName)
      .eq('date', dateVal)
      .limit(1)

    let insertedData = null

    if (existingRecords && existingRecords.length > 0) {
      const rec = existingRecords[0]
      if (isEnd) {
        let dur = rec.duration_minutes || 0
        if (rec.start_time && timeVal) {
          const t1 = String(rec.start_time).split(':')
          const t2 = String(timeVal).split(':')
          const m1 = parseInt(t1[0]) * 60 + parseInt(t1[1])
          const m2 = parseInt(t2[0]) * 60 + parseInt(t2[1])
          dur = Math.max(0, m2 - m1)
        }
        const { data: updated, error: updateErr } = await supabaseClient
          .from('tb_jornada_almoco')
          .update({
            end_time: timeVal,
            status: 'CONCLUIDO',
            duration_minutes: dur
          })
          .eq('id', rec.id)
          .select()

        if (updateErr) throw updateErr
        insertedData = updated
      } else {
        const { data: updated, error: updateErr } = await supabaseClient
          .from('tb_jornada_almoco')
          .update({
            start_time: timeVal,
            status: 'EM_INTERVALO'
          })
          .eq('id', rec.id)
          .select()

        if (updateErr) throw updateErr
        insertedData = updated
      }
    } else {
      // Cria o registro na tb_jornada_almoco
      const { data: inserted, error: insertError } = await supabaseClient
        .from('tb_jornada_almoco')
        .insert([
          {
            collaborator_name: collabName,
            date: dateVal,
            start_time: isEnd ? null : timeVal,
            end_time: isEnd ? timeVal : null,
            status: isEnd ? 'CONCLUIDO' : 'EM_INTERVALO',
            duration_minutes: 0
          }
        ])
        .select()

      if (insertError) {
        console.error("Error inserting into tb_jornada_almoco:", insertError)
        throw new Error(insertError.message || "Erro desconhecido ao inserir em tb_jornada_almoco")
      }
      insertedData = inserted
    }

    console.log("Successfully processed tb_jornada_almoco:", insertedData)

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
