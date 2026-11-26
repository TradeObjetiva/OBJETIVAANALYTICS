-- Migration: Índice de performance e RPC de estatísticas de check-ins
-- Seguro para aplicar de forma incremental (IF NOT EXISTS / CREATE OR REPLACE)

CREATE INDEX IF NOT EXISTS idx_checkins_created_at
  ON public.checkins (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkins_dedup
  ON public.checkins (activity_id, history_id, task_id);

CREATE OR REPLACE FUNCTION public.get_checkins_period_stats(p_start_date TIMESTAMPTZ)
RETURNS TABLE (
  total_events BIGINT,
  unique_promoters BIGINT,
  unique_stores BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::BIGINT AS total_events,
    COUNT(DISTINCT SPLIT_PART(COALESCE(activity_id, ''), ';', 1))::BIGINT AS unique_promoters,
    COUNT(DISTINCT SPLIT_PART(COALESCE(client_id, ''), ';', 1))::BIGINT AS unique_stores
  FROM public.checkins
  WHERE created_at >= p_start_date;
$$;
