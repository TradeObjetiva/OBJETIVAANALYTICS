import os
import io
import json
import openpyxl
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
from campanha_engine import CampanhaProcessor

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

DEFAULT_CAMP_FILE = os.path.join(BASE_DIR, "CAMPANHA (1).xlsx")
DEFAULT_FOLHA_FILE = os.path.join(BASE_DIR, "folha_reconciliada_Setembro_2026.xlsx")
OUTPUT_FILE = os.path.join(BASE_DIR, "CAMPANHA_ATUALIZADA.xlsx")

# In-memory cached result of last execution
LATEST_DATA = None

@app.route('/')
def index():
    has_default_camp = os.path.exists(DEFAULT_CAMP_FILE)
    has_default_folha = os.path.exists(DEFAULT_FOLHA_FILE)
    camp_size = os.path.getsize(DEFAULT_CAMP_FILE) if has_default_camp else 0
    folha_size = os.path.getsize(DEFAULT_FOLHA_FILE) if has_default_folha else 0
    
    return render_template(
        'index.html',
        has_default_camp=has_default_camp,
        has_default_folha=has_default_folha,
        camp_filename=os.path.basename(DEFAULT_CAMP_FILE),
        folha_filename=os.path.basename(DEFAULT_FOLHA_FILE),
        camp_size=round(camp_size / 1024, 1),
        folha_size=round(folha_size / 1024, 1)
    )

@app.route('/api/process', methods=['POST'])
def api_process():
    global LATEST_DATA
    try:
        # Check if custom files were uploaded or if we should use existing ones
        camp_path = DEFAULT_CAMP_FILE
        folha_path = DEFAULT_FOLHA_FILE
        
        if 'camp_file' in request.files and request.files['camp_file'].filename:
            f = request.files['camp_file']
            camp_path = os.path.join(BASE_DIR, f"temp_{f.filename}")
            f.save(camp_path)
            
        if 'folha_file' in request.files and request.files['folha_file'].filename:
            f = request.files['folha_file']
            folha_path = os.path.join(BASE_DIR, f"temp_{f.filename}")
            f.save(folha_path)

        if 'pe_file' in request.files and request.files['pe_file'].filename:
            f_pe = request.files['pe_file']
            pe_path = os.path.join(BASE_DIR, f"temp_{f_pe.filename}")
            f_pe.save(pe_path)
            
        tolerance = int(request.form.get('tolerance', 10))
        bonus = int(request.form.get('bonus', 30))
        
        # Colaboradores da base cadastrada no Objetiva Analytics
        colabs_raw = request.form.get('colaboradores')
        colaboradores_list = None
        if colabs_raw:
            try:
                colaboradores_list = json.loads(colabs_raw)
            except Exception:
                colaboradores_list = None
                
        # Faltas reconhecidas diretamente pela tabela de assiduidade
        faltas_raw = request.form.get('faltas_assiduidade')
        faltas_map = None
        if faltas_raw:
            try:
                faltas_map = json.loads(faltas_raw)
            except Exception:
                faltas_map = None
                
        # Dados de campanha já salvos no Supabase (incremental)
        campanha_salva_raw = request.form.get('campanha_salva')
        campanha_salva_map = None
        if campanha_salva_raw:
            try:
                campanha_salva_map = json.loads(campanha_salva_raw)
            except Exception:
                campanha_salva_map = None
        
        processor = CampanhaProcessor(
            camp_path, 
            folha_path, 
            tolerance_minutes=tolerance, 
            bonus_points=bonus,
            colaboradores_base=colaboradores_list
        )
        promotores = processor.process_all(
            faltas_assiduidade_map=faltas_map,
            campanha_salva_map=campanha_salva_map
        )
        
        # Calculate summary metrics
        total_promotores = len(promotores)
        total_faltas = sum(sum(p['faltas'] for p in prom['periodos']) for prom in promotores if prom['status'] in ['OK', 'COM_FALTAS_ASSIDUIDADE'])
        total_pontos_pontualidade = sum(sum(p['pontos_pontualidade_total'] for p in prom['periodos']) for prom in promotores if prom['status'] in ['OK', 'COM_FALTAS_ASSIDUIDADE'])
        promotores_com_bonus = sum(1 for prom in promotores if any(p['ganhou_bonus'] for p in prom['periodos']))
        total_sem_contrato = sum(1 for prom in promotores if prom.get('sem_contrato'))
        
        # Generate the updated excel file if camp_file exists
        if os.path.exists(camp_path):
            processor.generate_updated_excel(OUTPUT_FILE)
        
        LATEST_DATA = {
            'metrics': {
                'total_promotores': total_promotores,
                'total_faltas': total_faltas,
                'total_pontos_pontualidade': total_pontos_pontualidade,
                'promotores_com_bonus': promotores_com_bonus,
                'total_sem_contrato': total_sem_contrato,
                'output_filename': os.path.basename(OUTPUT_FILE),
                'periods': [p['name'] for p in processor.periods]
            },
            'promotores': promotores
        }
        
        return jsonify({
            'success': True,
            'data': LATEST_DATA
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/download')
def api_download():
    if not os.path.exists(OUTPUT_FILE):
        return "Arquivo ainda não gerado. Clique em Processar primeiro.", 404
    return send_file(OUTPUT_FILE, as_attachment=True, download_name="CAMPANHA_ATUALIZADA.xlsx")

@app.route('/api/audit-export')
def api_audit_export():
    global LATEST_DATA
    if not LATEST_DATA:
        return "Nenhum dado processado.", 400
        
    # Generate an Excel with detailed day-by-day audit sheet
    wb = openpyxl.Workbook()
    ws_summary = wb.active
    ws_summary.title = "Resumo por Periodo"
    
    # Headers
    ws_summary.append(["Nome", "Projeto", "Equipe", "Contrato", "Periodo", "Faltas", "Pts Assiduidade", "Dias Trabalhados", "Dias Pontuais", "Dias com Atraso", "Bonus 4 Semanas", "Pts Pontualidade Total"])
    
    ws_details = wb.create_sheet(title="Auditoria Diaria")
    ws_details.append(["Nome", "Contrato", "Data", "Dia", "Periodo", "Entrada Exec", "Entrada Plan", "Atraso (min)", "Intervalo Exec", "Intervalo Plan", "Estouro Int (min)", "Status Dia", "Pontual Hoje", "Observacoes / Motivo"])
    
    for prom in LATEST_DATA['promotores']:
        if prom['status'] != 'OK':
            continue
        nome = prom['nome']
        proj = prom['projeto']
        eq = prom['equipe']
        contrato = prom.get('contrato', '-')
        for p in prom['periodos']:
            ws_summary.append([
                nome, proj, eq, contrato, p['period_name'],
                p['faltas'], p['pontos_assiduidade'],
                p['dias_trabalhados'], p['dias_pontuais'],
                p['dias_com_atraso'], "SIM" if p['ganhou_bonus'] else "NAO",
                p['pontos_pontualidade_total']
            ])
            for d in p['detalhes_dias']:
                ws_details.append([
                    nome, contrato, d['date_br'], d['dia_sem'], p['period_name'],
                    str(d['exec_in'] or '-'), str(d['plan_in'] or '-'), d['atraso_min'],
                    str(d['exec_int'] or '-'), str(d['plan_int'] or '-'), d['estouro_int_min'],
                    d['status'], "SIM" if d['pontual'] else "NAO",
                    f"{d['obs']} {d['motivo_falta']}".strip()
                ])
                
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return send_file(
        output,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name="AUDITORIA_DETALHADA_CAMPANHA.xlsx"
    )

from ponto_extra_engine import PontoExtraEngine

pe_engine = PontoExtraEngine(base_dir=BASE_DIR)

@app.route('/api/pontos-extras', methods=['GET'])
def api_pontos_extras():
    try:
        records, periods = pe_engine.load_ponto_extra_records()
        stats = pe_engine.get_summary_stats()
        return jsonify({
            'success': True,
            'records': records,
            'periods': [p['name'] for p in periods],
            'stats': stats
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pontos-extras/salvar', methods=['POST'])
def api_pontos_extras_salvar():
    try:
        data = request.json or {}
        task_id = data.get('task_id')
        if not task_id:
            return jsonify({'success': False, 'error': 'ID da tarefa obrigatório'}), 400
        
        saved = pe_engine.update_approval(task_id, data)
        stats = pe_engine.get_summary_stats()
        return jsonify({
            'success': True,
            'saved': saved,
            'stats': stats
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pontos-extras/salvar-lote', methods=['POST'])
def api_pontos_extras_salvar_lote():
    try:
        data = request.json or {}
        updates = data.get('updates', [])
        pe_engine.update_batch(updates)
        stats = pe_engine.get_summary_stats()
        return jsonify({
            'success': True,
            'count': len(updates),
            'stats': stats
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pontos-extras/alimentar-planilha', methods=['POST'])
def api_pontos_extras_alimentar_planilha():
    try:
        # If CAMPANHA_ATUALIZADA.xlsx doesn't exist yet, copy from DEFAULT_CAMP_FILE
        if not os.path.exists(OUTPUT_FILE):
            import shutil
            shutil.copy2(DEFAULT_CAMP_FILE, OUTPUT_FILE)
            
        summary = pe_engine.sync_to_campaign_excel(OUTPUT_FILE)
        return jsonify({
            'success': True,
            'message': 'Planilha de Campanha alimentada com sucesso!',
            'items_updated': len(summary),
            'summary': summary
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pontos-extras/exportar-excel', methods=['GET'])
def api_pontos_extras_exportar_excel():
    try:
        output = pe_engine.export_excel_audit()
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="CURADORIA_PONTOS_EXTRAS.xlsx"
        )
    except Exception as e:
        return str(e), 500

@app.route('/api/pontos-extras/upload-csv', methods=['POST'])
def api_pontos_extras_upload_csv():
    try:
        if 'file' not in request.files or not request.files['file'].filename:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        f = request.files['file']
        save_path = os.path.join(BASE_DIR, "RELATÓRIO_PONTO_EXTRA_UPLOADED.csv")
        f.save(save_path)
        pe_engine.pe_csv_file = save_path
        records, periods = pe_engine.load_ponto_extra_records()
        stats = pe_engine.get_summary_stats()
        return jsonify({
            'success': True,
            'records_count': len(records),
            'stats': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

from pdf_generator import gerar_pdf_campanha, gerar_pdf_curadoria_pontos_extras

@app.route('/api/download-pdf-campanha')
def api_download_pdf_campanha():
    try:
        target_file = OUTPUT_FILE if os.path.exists(OUTPUT_FILE) else DEFAULT_CAMP_FILE
        pdf_buffer = gerar_pdf_campanha(target_file)
        if not pdf_buffer:
            return "Arquivo de campanha não localizado para gerar PDF.", 404
        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="RELATORIO_CAMPANHA_MODO_POTENCIA.pdf"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return str(e), 500

@app.route('/api/pontos-extras/exportar-pdf')
def api_pontos_extras_exportar_pdf():
    try:
        records, periods = pe_engine.load_ponto_extra_records()
        stats = pe_engine.get_summary_stats()
        pdf_buffer = gerar_pdf_curadoria_pontos_extras(records, stats)
        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="CURADORIA_PONTOS_EXTRAS_MODO_POTENCIA.pdf"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return str(e), 500

if __name__ == '__main__':
    print("="*60)
    print("SISTEMA DE AUTOMAÇÃO DE PONTUAÇÃO DE CAMPANHA INICIADO")
    print("Acesse no navegador: http://127.0.0.1:5000")
    print("="*60)
    app.run(host='127.0.0.1', port=5000, debug=False)
