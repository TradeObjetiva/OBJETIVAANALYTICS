import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LAIVON_BASE = "https://promoter-api.laivon.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Endpoint da Laivon (ex: /laivon-proxy/tasks?limit=500)
    const path = url.pathname.replace(/^\/laivon-proxy/, "") || "/tasks";
    const queryString = url.search;
    const laivonUrl = `${LAIVON_BASE}${path}${queryString}`;

    // Pega chave de API do header ou da query
    const apiKey =
      req.headers.get("x-api-key") ||
      url.searchParams.get("api_key") ||
      "";

    const response = await fetch(laivonUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
