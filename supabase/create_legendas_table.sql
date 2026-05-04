-- Criar a tabela de Legendas
CREATE TABLE IF NOT EXISTS tb_legendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que a coluna 'ordem' existe caso a tabela já tenha sido criada anteriormente
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tb_legendas' AND column_name='ordem') THEN
        ALTER TABLE tb_legendas ADD COLUMN ordem INTEGER DEFAULT 0;
    END IF;
END $$;

-- Inserir legendas padrão
INSERT INTO tb_legendas (codigo, nome, cor, ordem) VALUES
('P', 'Presença', '#10b981', 1),
('ATT', 'Atestado', '#3b82f6', 2),
('FA', 'Abonada', '#8b5cf6', 3),
('FE', 'Feriado', '#64748b', 4),
('FG', 'Folga', '#f59e0b', 5),
('FR', 'Férias', '#06b6d4', 6),
('FT', 'Falta', '#ef4444', 7),
('ATH', 'Atestado de Horas', '#8b5cf6', 8),
('SAPP', 'Sem App', '#4b5563', 9)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem;

-- Configurar RLS (Row Level Security)
ALTER TABLE tb_legendas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos (anon e autenticados)
DROP POLICY IF EXISTS "Permitir leitura para todos" ON tb_legendas;
CREATE POLICY "Permitir leitura para todos" ON tb_legendas FOR SELECT USING (true);

-- Permitir tudo para todos (para facilitar o gerenciamento via UI)
DROP POLICY IF EXISTS "Permitir tudo para todos" ON tb_legendas;
CREATE POLICY "Permitir tudo para todos" ON tb_legendas FOR ALL USING (true) WITH CHECK (true);
