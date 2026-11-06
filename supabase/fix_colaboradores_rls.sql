-- ========================================================
-- GARANTE PERMISSÃO DE LEITURA NA TABELA TB_COLABORADORES
-- Permite que o subsistema de campanha consulte quem está ativo/inativo
-- ========================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tb_colaboradores' 
    AND policyname = 'Permitir leitura tb_colaboradores publico'
  ) THEN
    CREATE POLICY "Permitir leitura tb_colaboradores publico"
      ON tb_colaboradores FOR SELECT USING (true);
  END IF;
END $$;

