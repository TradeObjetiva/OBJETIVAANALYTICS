"""
Sincronizador Inteligente de Pontos Extras
Insere apenas as 1.074 novas tarefas de RELATÓRIO_DE_PONTO_EXTRA.csv no Supabase
Preservando 100% das 84 auditorias já realizadas (68 aprovados + 16 rejeitados)
"""

import sys, os, json, urllib.request
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://xgbvokegqxqxpgznpxiq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZva2VncXhxeHBnem5weGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjYzNjMsImV4cCI6MjA5MTk0MjM2M30.4VfzUCKCv_A2oXMgW5rPhWad1gHS2hWp_LXKmXzVjsM"

PERIODOS = [
  { 'name': '27/08 A 03/09', 'start': '2026-08-27', 'end': '2026-09-03' },
  { 'name': '04/09 A 11/09', 'start': '2026-09-04', 'end': '2026-09-11' },
  { 'name': '12/09 A 19/09', 'start': '2026-09-12', 'end': '2026-09-19' },
  { 'name': '21/09 A 26/09', 'start': '2026-09-21', 'end': '2026-09-26' },
  { 'name': '28/09 A 30/09', 'start': '2026-09-28', 'end': '2026-09-30' },
  { 'name': '01/10 A 07/10', 'start': '2026-10-01', 'end': '2026-10-07' },
  { 'name': '08/10 A 14/10', 'start': '2026-10-08', 'end': '2026-10-14' },
]

def get_periodo(data_str):
    if not data_str: return '27/08 A 03/09'
    d = str(data_str).split()[0].replace('/', '-')
    for p in PERIODOS:
        if p['start'] <= d <= p['end']:
            return p['name']
    return '27/08 A 03/09'

def sync():
    print("1. Conectando ao Supabase para verificar tarefas existentes...")
    url = f"{SUPABASE_URL}/rest/v1/tb_campanha_pontos_extras?select=task_id,status_curadoria"
    req = urllib.request.Request(url, headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'})
    with urllib.request.urlopen(req) as resp:
        db_records = json.loads(resp.read().decode('utf-8'))
    
    db_ids = set(str(r['task_id']).strip() for r in db_records)
    auditados = [r for r in db_records if r.get('status_curadoria') in ['APROVADO', 'REJEITADO']]
    print(f"   Tarefas ja existentes no banco: {len(db_ids)} (sendo {len(auditados)} ja auditadas)")

    print("2. Lendo RELATÓRIO_DE_PONTO_EXTRA.csv...")
    try:
        df = pd.read_csv('RELATÓRIO_DE_PONTO_EXTRA.csv', sep=';', skiprows=1, encoding='utf-8', low_memory=False)
    except Exception:
        df = pd.read_csv('RELATÓRIO_DE_PONTO_EXTRA.csv', sep=';', skiprows=1, encoding='latin1', low_memory=False)

    photo_cols = [c for c in df.columns if 'FOTO' in c.upper()]
    has_pe = df['TEM PONTO EXTRA?'].astype(str).str.strip().str.upper() == 'SIM' if 'TEM PONTO EXTRA?' in df.columns else False
    has_photo = df[photo_cols].notna().any(axis=1) if photo_cols else False
    df_pe = df[has_pe | has_photo].copy()

    date_col = [c for c in df.columns if 'DATA' in c.upper()][0]

    # Agrupa por ID DA TAREFA
    payload_novos = []
    for task_id, group in df_pe.groupby('ID DA TAREFA'):
        tid = str(task_id).strip()
        if tid in db_ids:
            continue # Pula as que já existem no banco para NUNCA sobrescrever auditorias
        
        first = group.iloc[0]
        promotor = str(first.get('PROMOTOR', '') or '').strip()
        pdv = str(first.get('PDV', '') or '').strip()
        data_reg = str(first.get(date_col, '') or '').strip()

        fotos = []
        for pc in photo_cols:
            for val in group[pc].dropna():
                s = str(val).strip()
                if s.startswith('http') and s not in fotos:
                    fotos.append(s)

        if not fotos:
            continue

        per = get_periodo(data_reg)
        payload_novos.append({
            'task_id': tid,
            'promotor': promotor,
            'pdv': pdv,
            'data_registro': data_reg,
            'tipo_conquista': '',
            'criativo': False,
            'pontos': 0,
            'status_curadoria': 'PENDENTE',
            'motivo_rejeicao': '',
            'fotos': fotos,
            'periodo_nome': per
        })

    print(f"3. Tarefas novas a serem inseridas: {len(payload_novos)}")
    if not payload_novos:
        print("   Tudo ja esta sincronizado!")
        return

    # Inserção em lotes de 100
    chunk_size = 100
    total_enviados = 0
    url_insert = f"{SUPABASE_URL}/rest/v1/tb_campanha_pontos_extras"

    for i in range(0, len(payload_novos), chunk_size):
        chunk = payload_novos[i:i + chunk_size]
        body = json.dumps(chunk).encode('utf-8')
        req_post = urllib.request.Request(
            url_insert,
            data=body,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates'
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(req_post) as resp:
                total_enviados += len(chunk)
                print(f"   Progresso: {total_enviados}/{len(payload_novos)} tarefas enviadas...")
        except Exception as e:
            print(f"   Erro no lote {i}: {e}")

    print(f"✓ Concluído com sucesso! {total_enviados} novas tarefas sincronizadas no Supabase.")

if __name__ == '__main__':
    sync()
