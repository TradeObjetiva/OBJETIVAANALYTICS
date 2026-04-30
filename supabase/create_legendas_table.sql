-- Criar a tabela de Legendas
CREATE TABLE IF NOT EXISTS tb_legendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir legendas padrão
INSERT INTO tb_legendas (codigo, nome, cor) VALUES
('P', 'Presença', '#10b981'),
('FT', 'Falta', '#ef4444'),
('ATT', 'Atestado', '#3b82f6'),
('ATH', 'Atestado de Horas', '#8b5cf6'),
('FR', 'Férias', '#06b6d4'),
('FG', 'Folga', '#f59e0b'),
('FA', 'Abonada', '#8b5cf6'),
('FE', 'Feriado', '#64748b'),
('SAPP', 'Sem App', '#4b5563')
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    cor = EXCLUDED.cor;

-- Configurar RLS (Row Level Security)
ALTER TABLE tb_legendas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos (anon e autenticados)
DROP POLICY IF EXISTS "Permitir leitura para todos" ON tb_legendas;
CREATE POLICY "Permitir leitura para todos" ON tb_legendas FOR SELECT USING (true);

-- Permitir tudo para todos (para facilitar o gerenciamento via UI)
DROP POLICY IF EXISTS "Permitir tudo para todos" ON tb_legendas;
CREATE POLICY "Permitir tudo para todos" ON tb_legendas FOR ALL USING (true) WITH CHECK (true);
