-- 1. Criar a tabela de Colaboradores (Base Fixa)
CREATE TABLE IF NOT EXISTS tb_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  cargo TEXT,
  projeto TEXT,
  foto_url TEXT,
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
    VALUES (v_nome_agente, v_hoje, 'P', TO_CHAR(NEW.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI:SS'), false)
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
