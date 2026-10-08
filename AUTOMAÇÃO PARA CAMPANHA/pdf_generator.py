import io
import os
import openpyxl
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from datetime import datetime

class NumberedCanvas(canvas.Canvas):
    """Adds page numbers and running header/footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(30, 25, 812, 25)
        
        # Footer text
        dt_str = datetime.now().strftime("%d/%m/%Y às %H:%M")
        self.drawString(30, 14, f"Agência Objetiva • Desafio Modo Potência • Gerado em {dt_str}")
        self.drawRightString(812, 14, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def gerar_pdf_campanha(excel_path):
    """
    Generates a landscape A4 executive PDF from the updated campaign spreadsheet.
    """
    if not os.path.exists(excel_path):
        return None

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb['Ativos']

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=25,
        bottomMargin=35
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )
    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.white,
        alignment=1 # Center
    )
    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=8.5,
        textColor=colors.HexColor('#1e293b')
    )
    td_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#0f172a')
    )
    td_center = ParagraphStyle(
        'TDCenter',
        parent=td_style,
        alignment=1
    )
    td_center_bold = ParagraphStyle(
        'TDCenterBold',
        parent=td_bold,
        alignment=1
    )

    story = []

    # Header
    header_html = """
    <b>DESAFIO MODO POTÊNCIA! • RELATÓRIO OFICIAL DE PONTUAÇÕES</b><br/>
    <font color="#ff6b00"><b>AGÊNCIA OBJETIVA</b></font> | Gestão de Performance de Trade Marketing
    """
    story.append(Paragraph(header_html, title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Consolidado Geral: Assiduidade (-50 pts/falta), Pontualidade (+1 pt/dia, máx 30 pts), Pontos Extras (Ilha, Meia Ilha, Ponta, Meia Ponta com Bônus Criativo)", subtitle_style))
    story.append(Spacer(1, 10))

    # Parse rows
    promoters_data = []
    for r in range(3, ws.max_row + 1):
        nome = ws.cell(r, 1).value
        if not nome:
            continue
        projeto = ws.cell(r, 2).value or '-'
        equipe = ws.cell(r, 3).value or '-'
        
        # Periods Totals (cols 11, 19, 27, 35, 43)
        t_p1 = ws.cell(r, 11).value or 0
        t_p2 = ws.cell(r, 19).value or 0
        t_p3 = ws.cell(r, 27).value or 0
        t_p4 = ws.cell(r, 35).value or 0
        t_p5 = ws.cell(r, 43).value or 0

        # Try to convert to float/int
        def clean_val(v):
            if isinstance(v, (int, float)):
                return v
            try:
                return float(str(v).replace(',', '.'))
            except:
                return 0

        vals = [clean_val(t_p1), clean_val(t_p2), clean_val(t_p3), clean_val(t_p4), clean_val(t_p5)]
        total_acum = sum(vals)

        promoters_data.append({
            'nome': str(nome).strip(),
            'projeto': str(projeto).strip(),
            'equipe': str(equipe).strip(),
            'p1': vals[0],
            'p2': vals[1],
            'p3': vals[2],
            'p4': vals[3],
            'p5': vals[4],
            'total': total_acum
        })

    # Sort by total score descending (ranking)
    promoters_data.sort(key=lambda x: x['total'], reverse=True)

    # Top summary cards in a mini-table
    total_proms = len(promoters_data)
    total_pts_dist = sum(p['total'] for p in promoters_data)
    top_performer = promoters_data[0]['nome'] if promoters_data else '-'
    top_pts = promoters_data[0]['total'] if promoters_data else 0

    cards_data = [
        [
            Paragraph(f"<b>COLABORADORES</b><br/><font size=12 color='#0f172a'><b>{total_proms}</b></font>", td_center),
            Paragraph(f"<b>PONTOS TOTAIS DISTRIBUÍDOS</b><br/><font size=12 color='#ff6b00'><b>{int(total_pts_dist)} pts</b></font>", td_center),
            Paragraph(f"<b>LÍDER DO RANKING</b><br/><font size=10 color='#10b981'><b>{top_performer} ({int(top_pts)} pts)</b></font>", td_center),
            Paragraph("<b>PERÍODOS</b><br/><font size=12 color='#4f46e5'><b>5 Semanas</b></font>", td_center)
        ]
    ]
    t_cards = Table(cards_data, colWidths=[195, 195, 230, 162])
    t_cards.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_cards)
    story.append(Spacer(1, 10))

    # Main Ranking Table
    table_headers = [
        Paragraph("<b>#</b>", th_style),
        Paragraph("<b>COLABORADOR / PROMOTOR</b>", th_style),
        Paragraph("<b>PROJETO</b>", th_style),
        Paragraph("<b>EQUIPE</b>", th_style),
        Paragraph("<b>P1 (27/08-03/09)</b>", th_style),
        Paragraph("<b>P2 (04/09-11/09)</b>", th_style),
        Paragraph("<b>P3 (12/09-19/09)</b>", th_style),
        Paragraph("<b>P4 (21/09-26/09)</b>", th_style),
        Paragraph("<b>P5 (28/09-30/09)</b>", th_style),
        Paragraph("<b>TOTAL ACUMULADO</b>", th_style),
    ]

    table_data = [table_headers]

    for rank, p in enumerate(promoters_data, 1):
        rank_badge = f"#{rank}"
        if rank == 1: rank_badge = "🥇 1º"
        elif rank == 2: rank_badge = "🥈 2º"
        elif rank == 3: rank_badge = "🥉 3º"

        def fmt_pt(pt):
            if pt == 0:
                return Paragraph("<font color='#94a3b8'>0</font>", td_center)
            elif pt < 0:
                return Paragraph(f"<font color='#dc2626'><b>{int(pt)}</b></font>", td_center)
            else:
                return Paragraph(f"<font color='#15803d'><b>+{int(pt)}</b></font>", td_center)

        total_style = td_center_bold
        total_color = '#0f172a'
        if p['total'] > 0:
            total_color = '#ea580c'
        elif p['total'] < 0:
            total_color = '#dc2626'

        table_data.append([
            Paragraph(rank_badge, td_center_bold),
            Paragraph(f"<b>{p['nome']}</b>", td_style),
            Paragraph(p['projeto'], td_style),
            Paragraph(p['equipe'], td_style),
            fmt_pt(p['p1']),
            fmt_pt(p['p2']),
            fmt_pt(p['p3']),
            fmt_pt(p['p4']),
            fmt_pt(p['p5']),
            Paragraph(f"<font color='{total_color}'><b>{int(p['total'])} pts</b></font>", total_style)
        ])

    col_widths = [32, 230, 90, 85, 63, 63, 63, 63, 63, 75]
    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)

    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]

    # Alternating row colors
    for r_idx in range(1, len(table_data)):
        if r_idx % 2 == 0:
            t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor('#f8fafc')))
        if r_idx <= 3:
            t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor('#fef3c7'))) # Top 3 highlight

    main_table.setStyle(TableStyle(t_style))
    story.append(main_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer


def gerar_pdf_curadoria_pontos_extras(records, stats):
    """
    Generates an audit PDF report of Pontos Extras approvals.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=25,
        bottomMargin=35
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )
    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )
    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1e293b')
    )
    td_center = ParagraphStyle(
        'TDCenter',
        parent=td_style,
        alignment=1
    )

    story = []

    header_html = """
    <b>CURADORIA DE PONTOS EXTRAS • DESAFIO MODO POTÊNCIA</b><br/>
    <font color="#ff6b00"><b>DOSSIÊ DE APROVAÇÃO DE CONQUISTAS NO PDV</b></font>
    """
    story.append(Paragraph(header_html, title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Mecânica: Ilha (50 pts), Meia Ilha (25 pts), Ponta (30 pts), Meia Ponta (15 pts) | Bônus Criativo: Pontuação em DOBRO!", subtitle_style))
    story.append(Spacer(1, 10))

    # Metrics Summary Bar
    tot_reg = stats.get('total_registros', len(records))
    tot_aprov = stats.get('total_aprovados', 0)
    tot_rejeit = stats.get('total_rejeitados', 0)
    tot_pts = stats.get('total_pontos', 0)
    tot_criativos = stats.get('total_criativos', 0)

    cards_data = [
        [
            Paragraph(f"<b>TOTAL REGISTROS</b><br/><font size=12 color='#0f172a'><b>{tot_reg}</b></font>", td_center),
            Paragraph(f"<b>APROVADOS</b><br/><font size=12 color='#10b981'><b>{tot_aprov}</b></font>", td_center),
            Paragraph(f"<b>REPROVADOS</b><br/><font size=12 color='#dc2626'><b>{tot_rejeit}</b></font>", td_center),
            Paragraph(f"<b>BÔNUS CRIATIVOS (2X)</b><br/><font size=12 color='#f59e0b'><b>{tot_criativos}</b></font>", td_center),
            Paragraph(f"<b>TOTAL PONTOS GERADOS</b><br/><font size=12 color='#ff6b00'><b>+{tot_pts} pts</b></font>", td_center),
        ]
    ]
    t_cards = Table(cards_data, colWidths=[156, 156, 156, 156, 158])
    t_cards.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_cards)
    story.append(Spacer(1, 10))

    # Table of Records
    headers = [
        Paragraph("<b>ID TAREFA</b>", th_style),
        Paragraph("<b>PROMOTOR</b>", th_style),
        Paragraph("<b>PDV / LOJA</b>", th_style),
        Paragraph("<b>DATA/HORA</b>", th_style),
        Paragraph("<b>CLASSIFICAÇÃO</b>", th_style),
        Paragraph("<b>CRIATIVO</b>", th_style),
        Paragraph("<b>PERÍODO</b>", th_style),
        Paragraph("<b>STATUS</b>", th_style),
        Paragraph("<b>PONTUAÇÃO</b>", th_style),
    ]

    table_data = [headers]
    for r in records:
        status_color = '#10b981' if r['status'] == 'APROVADO' else ('#dc2626' if r['status'] == 'REJEITADO' else '#d97706')
        pts_str = f"+{r['pontos']} pts" if r['pontos'] > 0 else '0 pts'
        criativo_str = "⭐ SIM (2x)" if r['criativo'] else "NÃO"

        table_data.append([
            Paragraph(str(r['task_id']), td_center),
            Paragraph(f"<b>{r['promotor_campanha']}</b>", td_style),
            Paragraph(r['pdv'], td_style),
            Paragraph(r['data_exec'], td_center),
            Paragraph(r['tipo'].replace('_', ' '), td_style),
            Paragraph(criativo_str, td_center),
            Paragraph(r['periodo'], td_center),
            Paragraph(f"<font color='{status_color}'><b>{r['status']}</b></font>", td_center),
            Paragraph(f"<b>{pts_str}</b>", td_center),
        ])

    col_widths = [55, 175, 175, 75, 80, 62, 70, 45, 45]
    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)

    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]
    for r_idx in range(1, len(table_data)):
        if r_idx % 2 == 0:
            t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor('#f8fafc')))

    main_table.setStyle(TableStyle(t_style))
    story.append(main_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer
