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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.json()
    console.log("[webhook-colaborador] Recebido:", JSON.stringify(rawBody))

    // uMov.me pode enviar os dados dentro de 'data', 'agent', ou na raiz
    const data = rawBody.data || rawBody.agent || rawBody.item || rawBody

    // Extrair Nome (tentar várias chaves possíveis do uMov.me)
    const rawNome = data['Nome do Agente'] || data.nome || data.Nome || data.name || data.Name || data.agentName || ''
    const nome = String(rawNome).trim().toUpperCase()

    // Extrair Login (que é o CPF do agente no uMov.me)
    const rawLogin = data['Login'] || data.login || data.cpf || data.CPF || data.agentLogin || ''
    const login = String(rawLogin).trim()

    if (!nome) {
      console.warn("[webhook-colaborador] Nome não encontrado no payload:", rawBody)
      return new Response(JSON.stringify({ 
        error: "Campo 'Nome' é obrigatório no cadastro.", 
        received: rawBody 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Limpar o CPF para formato numérico
    const cleanCpfDigits = login.replace(/\D/g, '')
    const cpf = cleanCpfDigits.length === 11 ? cleanCpfDigits : login

    // Inicializar cliente Supabase com Service Role Key para ignorar RLS
    // @ts-ignore: Deno env
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore: Deno env
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Inserir na tabela de pendentes
    const { data: inserted, error: insertError } = await supabaseClient
      .from('tb_colaboradores_pendentes')
      .insert([
        {
          nome: nome,
          login: login,
          cpf: cpf,
          status: 'pendente',
          payload: rawBody
        }
      ])
      .select()

    if (insertError) {
      console.error("[webhook-colaborador] Erro ao inserir:", insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log("[webhook-colaborador] Colaborador pendente cadastrado:", inserted)

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Colaborador inserido na fila de aprovação com sucesso!",
      data: inserted 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error("[webhook-colaborador] Exceção:", err)
    return new Response(JSON.stringify({ error: err.message || "Erro interno ao processar webhook" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
