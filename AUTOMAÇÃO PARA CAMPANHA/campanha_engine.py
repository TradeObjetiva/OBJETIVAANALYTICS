import openpyxl
import os
import re
from datetime import datetime, timedelta

def parse_time_str(val):
    """Parses time strings like '08:00:00', '08:00', or datetime.time objects into seconds from midnight."""
    if val is None:
        return None
    if isinstance(val, (datetime,)):
        return val.hour * 3600 + val.minute * 60 + val.second
    # if it is already a time object from datetime.time
    if hasattr(val, 'hour') and hasattr(val, 'minute'):
        return val.hour * 3600 + val.minute * 60 + getattr(val, 'second', 0)
    
    s = str(val).strip()
    if not s or s.lower() in ['none', '-', '', 'nan']:
        return None
    
    # Handle negative times if any like -00:30:00
    is_neg = False
    if s.startswith('-'):
        is_neg = True
        s = s[1:].strip()
    
    parts = s.split(':')
    try:
        if len(parts) == 3:
            h, m, sec = int(parts[0]), int(parts[1]), int(float(parts[2]))
        elif len(parts) == 2:
            h, m, sec = int(parts[0]), int(parts[1]), 0
        else:
            return None
        total = h * 3600 + m * 60 + sec
        return -total if is_neg else total
    except (ValueError, TypeError):
        return None

def is_justified_absence(obs_str, dt_str):
    """
    Checks if an absence is justified.
    Returns (True, reason) if justified, (False, reason) if counted as an unjustified absence.
    """
    if dt_str == '07/09/2026':
        return True, "Feriado Nacional (07/09 - Independência)"
    
    if not obs_str:
        return False, "Falta sem registro / sem justificativa"
    
    obs_clean = str(obs_str).upper()
    
    # Justified reasons
    justified_keywords = [
        'ATESTADO', 'MEDICO', 'MÉDICO', 'DECLARAÇÃO', 'DECLARACAO',
        'EXAME', 'TRATAMENTO', 'CONSULTA', 'FÉRIAS', 'FERIAS',
        'FERIADO', 'PRESENTE EM LOJA', 'SEM APP', 'SEM CELULAR'
    ]
    
    for kw in justified_keywords:
        if kw in obs_clean:
            return True, f"Justificado: {kw}"
            
    return False, f"Falta injustificada: {obs_str.strip()}"

class CampanhaProcessor:
    def __init__(self, camp_file, folha_file, tolerance_minutes=10, bonus_points=30, colaboradores_base=None):
        self.camp_file = camp_file
        self.folha_file = folha_file
        self.tolerance_minutes = tolerance_minutes
        self.tolerance_seconds = tolerance_minutes * 60
        self.bonus_points = bonus_points
        self.colaboradores_base = colaboradores_base
        
        # Period definitions from CAMPANHA (1).xlsx
        self.periods = [
            {'id': 1, 'name': '27/08 A 03/09', 'start': '2026-08-27', 'end': '2026-09-03', 'col_assid': 4, 'col_efet': 5, 'col_pont': 6, 'col_tot': 11},
            {'id': 2, 'name': '04/09 A 11/09', 'start': '2026-09-04', 'end': '2026-09-11', 'col_assid': 12, 'col_efet': 13, 'col_pont': 14, 'col_tot': 19},
            {'id': 3, 'name': '12/09 A 19/09', 'start': '2026-09-12', 'end': '2026-09-19', 'col_assid': 20, 'col_efet': 21, 'col_pont': 22, 'col_tot': 27},
            {'id': 4, 'name': '21/09 A 26/09', 'start': '2026-09-21', 'end': '2026-09-26', 'col_assid': 28, 'col_efet': 29, 'col_pont': 30, 'col_tot': 35},
            {'id': 5, 'name': '28/09 A 30/09', 'start': '2026-09-28', 'end': '2026-09-30', 'col_assid': 36, 'col_efet': 37, 'col_pont': 38, 'col_tot': 43},
        ]
        
    def find_sheet(self, folha_wb, nome_promotor):
        """Finds matching sheet in folha workbook by exact or truncated name."""
        nome_clean = nome_promotor.strip().upper()
        # 1. Exact match
        for s in folha_wb.sheetnames:
            if s.strip().upper() == nome_clean:
                return s
        # 2. Excel 31 character truncation or prefix match
        for s in folha_wb.sheetnames:
            s_clean = s.strip().upper()
            if nome_clean.startswith(s_clean) or s_clean.startswith(nome_clean[:25]):
                return s
        return None

    def analyze_promotor(self, ws_folha, nome_promotor):
        """
        Analyzes the attendance and punctuality for a promoter across all periods.
        """
        # Extract contract information from header (rows 1 to 8)
        contrato_val = None
        for r in range(1, 9):
            for c in range(1, ws_folha.max_column + 1):
                v = ws_folha.cell(r, c).value
                if v and 'contrato' in str(v).lower() and str(v).strip().endswith(':'):
                    nv = ws_folha.cell(r, c + 1).value
                    if nv:
                        contrato_val = str(nv).strip()
        if not contrato_val:
            c7 = ws_folha.cell(7, 10).value
            if c7:
                contrato_val = str(c7).strip()
                
        jornada_header = str(ws_folha.cell(1, 8).value or '') + ' ' + str(ws_folha.cell(2, 8).value or '')
        is_sem_contrato = False
        if not contrato_val or 'sem contrato' in contrato_val.lower() or 'sem jornada' in jornada_header.lower():
            is_sem_contrato = True
            if not contrato_val:
                contrato_val = "Usuário sem contrato"

        # Parse all daily records from sheet
        daily_records = []
        for r in range(11, 45):
            dt_cell = ws_folha.cell(r, 1).value
            if not dt_cell:
                continue
            
            # Format dd/mm/yyyy to yyyy-mm-dd
            p = str(dt_cell).strip().split('/')
            if len(p) != 3:
                continue
            dt_iso = f"{p[2]}-{p[1]}-{p[0]}"
            dt_br = f"{p[0]}/{p[1]}/{p[2]}"
            
            dia_sem = ws_folha.cell(r, 2).value
            exec_in = ws_folha.cell(r, 3).value
            exec_int_out = ws_folha.cell(r, 4).value
            exec_int_ret = ws_folha.cell(r, 5).value
            exec_out = ws_folha.cell(r, 6).value
            exec_int_time = ws_folha.cell(r, 7).value
            
            plan_in = ws_folha.cell(r, 9).value
            plan_out = ws_folha.cell(r, 10).value
            plan_int_time = ws_folha.cell(r, 11).value
            
            diff_time = ws_folha.cell(r, 13).value
            obs = ws_folha.cell(r, 14).value
            
            daily_records.append({
                'row': r,
                'date_br': dt_br,
                'date_iso': dt_iso,
                'dia_sem': str(dia_sem) if dia_sem else '',
                'exec_in': exec_in,
                'exec_int_out': exec_int_out,
                'exec_int_ret': exec_int_ret,
                'exec_out': exec_out,
                'exec_int_time': exec_int_time,
                'plan_in': plan_in,
                'plan_out': plan_out,
                'plan_int_time': plan_int_time,
                'diff_time': diff_time,
                'obs': str(obs) if obs is not None else ''
            })
            
        # Group by periods and calculate stats
        period_results = []
        consecutive_punctual_periods = 0
        
        for p_idx, p in enumerate(self.periods):
            p_days = [d for d in daily_records if p['start'] <= d['date_iso'] <= p['end']]
            
            faltas = 0
            dias_planejados = 0
            dias_trabalhados = 0
            dias_pontuais = 0
            dias_com_atraso = 0
            detalhes_dias = []
            
            for d in p_days:
                plan_in_sec = parse_time_str(d['plan_in'])
                exec_in_sec = parse_time_str(d['exec_in'])
                plan_int_sec = parse_time_str(d['plan_int_time'])
                exec_int_sec = parse_time_str(d['exec_int_time'])
                
                day_status = 'FOLGA'
                pontual_hoje = False
                motivo_falta = ''
                atraso_min = 0
                estouro_int_min = 0
                
                # Check if it was a planned work day
                if plan_in_sec is not None and plan_in_sec > 0:
                    dias_planejados += 1
                    
                    if exec_in_sec is None:
                        # No clock-in: check justification
                        is_just, justificativa = is_justified_absence(d['obs'], d['date_br'])
                        if is_just:
                            day_status = 'AUSENCIA_JUSTIFICADA'
                            motivo_falta = justificativa
                        else:
                            day_status = 'FALTA'
                            faltas += 1
                            motivo_falta = justificativa
                    else:
                        # Worked
                        dias_trabalhados += 1
                        day_status = 'TRABALHADO'
                        
                        # Check start punctuality
                        # delay = exec - plan
                        delay_start_sec = exec_in_sec - plan_in_sec
                        atraso_min = max(0, round(delay_start_sec / 60, 1))
                        is_in_pontual = (delay_start_sec <= self.tolerance_seconds)
                        
                        # Check interval punctuality
                        is_int_pontual = True
                        if plan_int_sec is not None and plan_int_sec > 0:
                            # 1 hour lunch planned
                            if exec_int_sec is not None:
                                excess_int_sec = exec_int_sec - plan_int_sec
                                if excess_int_sec > self.tolerance_seconds:
                                    is_int_pontual = False
                                    estouro_int_min = round(excess_int_sec / 60, 1)
                            else:
                                # Did not register lunch interval
                                # Tolerance / leniency: if employee worked without logging lunch
                                # We can consider interval ok or check if total worked difference is compliant
                                is_int_pontual = True
                                
                        if is_in_pontual and is_int_pontual:
                            pontual_hoje = True
                            dias_pontuais += 1
                        else:
                            dias_com_atraso += 1
                            
                detalhes_dias.append({
                    'date_br': d['date_br'],
                    'dia_sem': d['dia_sem'],
                    'status': day_status,
                    'exec_in': d['exec_in'],
                    'plan_in': d['plan_in'],
                    'exec_int': d['exec_int_time'],
                    'plan_int': d['plan_int_time'],
                    'pontual': pontual_hoje,
                    'atraso_min': atraso_min,
                    'estouro_int_min': estouro_int_min,
                    'obs': d['obs'],
                    'motivo_falta': motivo_falta
                })
                
            # Score calculation
            # Assiduidade: -50 per absence
            pontos_assiduidade = -50 * faltas if faltas > 0 else 0
            
            # Base punctuality: 1 point per punctual day
            pontos_pontualidade_base = dias_pontuais
            
            # Is this period 100% punctual? (Worked days > 0 and 0 delays)
            is_period_perfect = (dias_trabalhados > 0 and dias_com_atraso == 0 and faltas == 0)
            
            if is_period_perfect:
                consecutive_punctual_periods += 1
            else:
                consecutive_punctual_periods = 0
                
            # Check 4 consecutive punctual periods bonus:
            # Ao ter 4 períodos de pontualidade 100%, totaliza 30 pontos nas 4 semanas
            # Exemplo: se nas 4 semanas ele somou 24 pontos (6+6+6+6), recebe complemento para fechar em 30 pontos
            ganhou_bonus = False
            bonus_complemento = 0
            if consecutive_punctual_periods == 4:
                ganhou_bonus = True
                soma_3_anteriores = sum(period_results[i]['pontos_pontualidade_total'] for i in range(p_idx - 3, p_idx))
                target_total_4 = 30
                # O bônus no 4º período é o que falta para a soma das 4 semanas atingir 30 pontos
                bonus_complemento = max(0, target_total_4 - (soma_3_anteriores + pontos_pontualidade_base))
                
            pontos_pontualidade_total = pontos_pontualidade_base + bonus_complemento
            
            period_results.append({
                'period_id': p['id'],
                'period_name': p['name'],
                'faltas': faltas,
                'pontos_assiduidade': pontos_assiduidade,
                'dias_planejados': dias_planejados,
                'dias_trabalhados': dias_trabalhados,
                'dias_pontuais': dias_pontuais,
                'dias_com_atraso': dias_com_atraso,
                'is_period_perfect': is_period_perfect,
                'consecutive_count': consecutive_punctual_periods,
                'ganhou_bonus': ganhou_bonus,
                'bonus_complemento': bonus_complemento,
                'pontos_pontualidade_base': pontos_pontualidade_base,
                'pontos_pontualidade_total': pontos_pontualidade_total,
                'detalhes_dias': detalhes_dias
            })
            
        return {
            'nome': nome_promotor,
            'contrato': contrato_val,
            'sem_contrato': is_sem_contrato,
            'periodos': period_results
        }

    def process_all(self):
        """Processes the whole workbook and returns full data for report/export."""
        wb_folha = openpyxl.load_workbook(self.folha_file, data_only=True)
        
        # Lista de promotores: prioridade absoluta para a base de colaboradores do Objetiva Analytics
        lista_promotores = []
        if self.colaboradores_base and len(self.colaboradores_base) > 0:
            for idx, c in enumerate(self.colaboradores_base):
                nome = c.get('nome')
                if not nome:
                    continue
                lista_promotores.append({
                    'row': idx + 3,
                    'nome': str(nome).strip(),
                    'projeto': str(c.get('projeto') or 'GERAL').strip(),
                    'equipe': str(c.get('equipe') or c.get('cargo') or 'PROMOTOR').strip()
                })
        else:
            wb_camp = openpyxl.load_workbook(self.camp_file, data_only=True)
            ws_camp = wb_camp['Ativos']
            for r in range(3, ws_camp.max_row + 1):
                nome = ws_camp.cell(r, 1).value
                if not nome:
                    continue
                lista_promotores.append({
                    'row': r,
                    'nome': str(nome).strip(),
                    'projeto': str(ws_camp.cell(r, 2).value or '').strip(),
                    'equipe': str(ws_camp.cell(r, 3).value or '').strip()
                })
        
        results = []
        for item in lista_promotores:
            r = item['row']
            nome = item['nome']
            projeto = item['projeto']
            equipe = item['equipe']
            
            sheet_name = self.find_sheet(wb_folha, str(nome))
            if not sheet_name:
                results.append({
                    'row': r,
                    'nome': nome,
                    'projeto': projeto,
                    'equipe': equipe,
                    'status': 'SEM_FOLHA',
                    'sheet_name': None,
                    'periodos': []
                })
                continue
                
            ws_folha = wb_folha[sheet_name]
            analysis = self.analyze_promotor(ws_folha, str(nome))
            
            results.append({
                'row': r,
                'nome': nome,
                'projeto': projeto,
                'equipe': equipe,
                'status': 'OK',
                'contrato': analysis['contrato'],
                'sem_contrato': analysis['sem_contrato'],
                'sheet_name': sheet_name,
                'periodos': analysis['periodos']
            })
            
        return results

    def generate_updated_excel(self, output_path):
        """
        Opens CAMPANHA workbook (preserving all existing formulas, formatting and scores for Ilhas/Pontas),
        updates ASSIDUIDADE and PONTUALIDADE columns with newly computed scores,
        and saves to output_path.
        """
        # Load preserving formulas
        wb = openpyxl.load_workbook(self.camp_file, data_only=False)
        ws = wb['Ativos']
        
        # Load folha for analysis
        wb_folha = openpyxl.load_workbook(self.folha_file, data_only=True)
        
        audit_log = []
        
        for r in range(3, ws.max_row + 1):
            nome_val = ws.cell(r, 1).value
            if not nome_val:
                continue
            nome = str(nome_val).strip()
            
            sheet_name = self.find_sheet(wb_folha, nome)
            if not sheet_name:
                audit_log.append(f"[AVISO] Linha {r}: Folha não encontrada para {nome}")
                continue
                
            analysis = self.analyze_promotor(wb_folha[sheet_name], nome)
            
            for p_res in analysis['periodos']:
                p_cfg = self.periods[p_res['period_id'] - 1]
                
                # Update ASSIDUIDADE
                # If faltas > 0 -> -50 * faltas. If 0 -> None or keep existing if manually justified
                assid_val = p_res['pontos_assiduidade']
                cell_assid = ws.cell(r, p_cfg['col_assid'])
                if assid_val != 0:
                    cell_assid.value = assid_val
                elif cell_assid.value is None or cell_assid.value == 0:
                    cell_assid.value = None
                    
                # Update PONTUALIDADE
                pont_val = p_res['pontos_pontualidade_total']
                cell_pont = ws.cell(r, p_cfg['col_pont'])
                if pont_val > 0:
                    cell_pont.value = pont_val
                elif cell_pont.value is None or cell_pont.value == 0:
                    cell_pont.value = None
                    
                # Ensure TOTAL column formula for this period
                c_start = p_cfg['col_assid']
                c_end = c_start + 6
                c_tot = p_cfg['col_tot']
                from openpyxl.utils import get_column_letter
                l_start = get_column_letter(c_start)
                l_end = get_column_letter(c_end)
                ws.cell(r, c_tot).value = f"=SUM({l_start}{r}:{l_end}{r})"
                
        wb.save(output_path)
        return output_path
