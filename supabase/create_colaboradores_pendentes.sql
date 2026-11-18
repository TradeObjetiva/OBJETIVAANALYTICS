-- ==============================================================================
-- MIGRAÇÃO: Suporte a CPF e Fila de Aprovação de Colaboradores (Webhook uMov.me)
-- ==============================================================================

-- 1. Adicionar coluna CPF na tabela oficial de colaboradores
ALTER TABLE tb_colaboradores ADD COLUMN IF NOT EXISTS cpf text;

-- 2. Criar tabela de fila de aprovação vinda do Webhook
CREATE TABLE IF NOT EXISTS tb_colaboradores_pendentes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    login text,
    cpf text,
    status text DEFAULT 'pendente', -- 'pendente', 'aprovado', 'recusado'
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Configurar permissões e RLS
ALTER TABLE tb_colaboradores_pendentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total tb_colaboradores_pendentes" ON tb_colaboradores_pendentes;
CREATE POLICY "Acesso total tb_colaboradores_pendentes"
ON tb_colaboradores_pendentes FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Adicionar à publicação de Realtime (se ainda não estiver presente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tb_colaboradores_pendentes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE tb_colaboradores_pendentes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignora se publicação não existir
END $$;
