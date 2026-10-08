-- ========================================================
-- TABELAS PARA AUTOMAÇÃO E CURADORIA DA CAMPANHA OBJETIVA
-- ========================================================

-- 1. TABELA PRINCIPAL DE RESULTADOS DA CAMPANHA (ASSIDUIDADE, PONTUALIDADE & TOTAL)
CREATE TABLE IF NOT EXISTS tb_campanha_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  projeto TEXT,
  equipe TEXT,
  cargo TEXT,
  contrato TEXT,
  mes_referencia TEXT NOT NULL DEFAULT 'Setembro/2026',
  total_faltas INTEGER DEFAULT 0,
  pontos_assiduidade INTEGER DEFAULT 0,
  pontos_pontualidade INTEGER DEFAULT 0,
  bonus_4_semanas BOOLEAN DEFAULT FALSE,
  pontos_extras INTEGER DEFAULT 0,
  pontos_total_geral INTEGER DEFAULT 0,
  status_folha TEXT DEFAULT 'OK',
  periodos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_campanha_colaborador_mes UNIQUE (nome, mes_referencia)
);

-- Habilitar RLS e criar políticas de acesso
ALTER TABLE tb_campanha_colaboradores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tb_campanha_colaboradores' AND policyname = 'Permissao leitura tb_campanha_colaboradores'
  ) THEN
    CREATE POLICY "Permissao leitura tb_campanha_colaboradores"
      ON tb_campanha_colaboradores FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tb_campanha_colaboradores' AND policyname = 'Permissao escrita tb_campanha_colaboradores'
  ) THEN
    CREATE POLICY "Permissao escrita tb_campanha_colaboradores"
      ON tb_campanha_colaboradores FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;


-- 2. TABELA DE CURADORIA DE PONTOS EXTRAS (MODO POTÊNCIA)
CREATE TABLE IF NOT EXISTS tb_campanha_pontos_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT UNIQUE NOT NULL,
  promotor TEXT NOT NULL,
  pdv TEXT,
  data_registro TEXT,
  tipo_conquista TEXT,
  criativo BOOLEAN DEFAULT FALSE,
  pontos INTEGER DEFAULT 0,
  status_curadoria TEXT DEFAULT 'PENDENTE',
  motivo_rejeicao TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  periodo_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tb_campanha_pontos_extras ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tb_campanha_pontos_extras' AND policyname = 'Permissao leitura tb_campanha_pontos_extras'
  ) THEN
    CREATE POLICY "Permissao leitura tb_campanha_pontos_extras"
      ON tb_campanha_pontos_extras FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tb_campanha_pontos_extras' AND policyname = 'Permissao escrita tb_campanha_pontos_extras'
  ) THEN
    CREATE POLICY "Permissao escrita tb_campanha_pontos_extras"
      ON tb_campanha_pontos_extras FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_campanha_colab_nome ON tb_campanha_colaboradores(nome);
CREATE INDEX IF NOT EXISTS idx_campanha_colab_mes ON tb_campanha_colaboradores(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_campanha_pe_promotor ON tb_campanha_pontos_extras(promotor);
CREATE INDEX IF NOT EXISTS idx_campanha_pe_status ON tb_campanha_pontos_extras(status_curadoria);
