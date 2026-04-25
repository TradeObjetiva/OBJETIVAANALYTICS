-- 1. Criar a tabela de Colaboradores (Base Fixa) com Escala de Trabalho
CREATE TABLE IF NOT EXISTS tb_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  cargo TEXT,
  projeto TEXT,
  foto_url TEXT,
  -- Escala de Trabalho (true = trabalha, false = folga)
  seg BOOLEAN DEFAULT TRUE,
  ter BOOLEAN DEFAULT TRUE,
  qua BOOLEAN DEFAULT TRUE,
  qui BOOLEAN DEFAULT TRUE,
  sex BOOLEAN DEFAULT TRUE,
  sab BOOLEAN DEFAULT TRUE,
  dom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Alimentar a tabela de colaboradores com quem já existe na planilha atual
INSERT INTO tb_colaboradores (nome, projeto)
SELECT DISTINCT agente, projeto 
FROM tb_planilha 
WHERE agente IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- 3. Função para Marcar Assiduidade Automática via Trigger
CREATE OR REPLACE FUNCTION fn_marcar_assiduidade_automatica()
RETURNS TRIGGER AS $$
DECLARE
    v_nome_agente TEXT;
    v_hoje DATE := CURRENT_DATE;
BEGIN
    -- Filtro Crítico: Apenas 'CHECK IN' conta como presença automática
    IF NEW.task_id IS DISTINCT FROM 'CHECK IN' THEN
        RETURN NEW;
    END IF;

    -- Extrair o nome do activity_id (formato: "NOME;FOTO")
    IF NEW.activity_id LIKE '%;%' THEN
        v_nome_agente := SPLIT_PART(NEW.activity_id, ';', 1);
    ELSE
        v_nome_agente := NEW.activity_id;
    END IF;

    v_nome_agente := TRIM(UPPER(v_nome_agente));

    -- Ignora se for o cabeçalho "AGENTE" ou vazio
    IF v_nome_agente IS NULL OR v_nome_agente = '' OR v_nome_agente = 'AGENTE' THEN
        RETURN NEW;
    END IF;

    -- Tenta inserir na tb_assiduidade. Se já existir (P, FT, etc), mantém o que está lá,
    -- mas se não houver registro, insere como 'P' (Presença).
    INSERT INTO tb_assiduidade (collaborator_name, date, status, checkin_time, is_manual)
    VALUES (
        v_nome_agente, 
        v_hoje, 
        'P', 
        (NEW.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::TIME, 
        false
    )
    ON CONFLICT (collaborator_name, date) 
    DO UPDATE SET 
        checkin_time = EXCLUDED.checkin_time
    WHERE tb_assiduidade.status IS NULL OR tb_assiduidade.is_manual = false;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar o Trigger na tabela de checkins
DROP TRIGGER IF EXISTS tr_auto_assiduidade ON checkins;
CREATE TRIGGER tr_auto_assiduidade
AFTER INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION fn_marcar_assiduidade_automatica();

-- 5. Garantir que a tabela de assiduidade tenha o índice único necessário para o UPSERT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tb_assiduidade_unique_collab_date'
    ) THEN
        ALTER TABLE tb_assiduidade ADD CONSTRAINT tb_assiduidade_unique_collab_date UNIQUE (collaborator_name, date);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 6. Configurar RLS (Row Level Security) para tb_colaboradores
ALTER TABLE tb_colaboradores ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON tb_colaboradores;
CREATE POLICY "Permitir leitura para autenticados" 
ON tb_colaboradores FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserção/atualização para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON tb_colaboradores;
CREATE POLICY "Permitir tudo para autenticados" 
ON tb_colaboradores FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permitir leitura para anon (papel usado pelo sistema frontend)
DROP POLICY IF EXISTS "Permitir leitura para anon" ON tb_colaboradores;
CREATE POLICY "Permitir leitura para anon" 
ON tb_colaboradores FOR SELECT 
TO anon 
USING (true);

-- Permitir operações completas para anon (gerenciar equipe via frontend)
DROP POLICY IF EXISTS "Permitir tudo para anon" ON tb_colaboradores;
CREATE POLICY "Permitir tudo para anon" 
ON tb_colaboradores FOR ALL 
TO anon 
USING (true)
WITH CHECK (true);

-- 7. Adicionar suporte a colaboradores inativos (Soft Delete)
ALTER TABLE tb_colaboradores ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE tb_colaboradores ADD COLUMN IF NOT EXISTS data_desativacao DATE;

-- 8. Função RPC para carregar métricas do Dashboard (Performance)
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS json AS $$
DECLARE
    v_clientes int;
    v_redes int;
    v_lojas int;
    v_municipios int;
    v_horas numeric;
BEGIN
    SELECT 
        COUNT(DISTINCT TRIM(REPLACE(UPPER(form), 'PESQUISA', ''))) as clientes,
        COUNT(DISTINCT TRIM(UPPER(rede))) as redes,
        COUNT(DISTINCT TRIM(UPPER(local))) as lojas,
        COUNT(DISTINCT TRIM(UPPER(municipio))) as municipios,
        SUM(
            COALESCE(NULLIF(REPLACE(seg, ',', '.'), '')::numeric, 0) +
            COALESCE(NULLIF(REPLACE(ter, ',', '.'), '')::numeric, 0) +
            COALESCE(NULLIF(REPLACE(qua, ',', '.'), '')::numeric, 0) +
            COALESCE(NULLIF(REPLACE(qui, ',', '.'), '')::numeric, 0) +
            COALESCE(NULLIF(REPLACE(sex, ',', '.'), '')::numeric, 0) +
            COALESCE(NULLIF(REPLACE(sab, ',', '.'), '')::numeric, 0)
        ) as horas
    INTO v_clientes, v_redes, v_lojas, v_municipios, v_horas
    FROM tb_planilha;

    RETURN json_build_object(
        'clientes', v_clientes,
        'redes', v_redes,
        'lojas', v_lojas,
        'municipios', v_municipios,
        'horas', v_horas
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
