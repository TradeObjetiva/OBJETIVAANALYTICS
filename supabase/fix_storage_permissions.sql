-- Script para liberar permissões de upload no bucket 'atestados'
-- Execute isso no SQL Editor do seu Supabase

-- 1. Permitir que qualquer pessoa veja os arquivos (Acesso Público)
CREATE POLICY "Acesso Público para Atestados"
ON storage.objects FOR SELECT
USING ( bucket_id = 'atestados' );

-- 2. Permitir que qualquer pessoa faça upload de novos atestados
CREATE POLICY "Permitir Upload de Atestados"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'atestados' );

-- 3. Permitir atualização e exclusão (Manutenção)
CREATE POLICY "Permitir Edição de Atestados"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'atestados' );

CREATE POLICY "Permitir Exclusão de Atestados"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'atestados' );
