-- ========================================================
-- ADICIONA A COLUNA PONTOS_EFETIVIDADE NA TABELA DE CAMPANHA
-- ========================================================

ALTER TABLE IF EXISTS tb_campanha_colaboradores 
ADD COLUMN IF NOT EXISTS pontos_efetividade INTEGER DEFAULT 0;

COMMENT ON COLUMN tb_campanha_colaboradores.pontos_efetividade IS 
'Pontuação de efetividade apurada no período do mês fechado e somada ao final do mês';

