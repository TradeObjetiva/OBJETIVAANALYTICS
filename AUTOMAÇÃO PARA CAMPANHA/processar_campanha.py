import os
import sys
from campanha_engine import CampanhaProcessor

def main():
    print("=" * 65)
    print("  AUTOMAÇÃO DE PONTUAÇÃO DE CAMPANHA - TRADE MARKETING")
    print("=" * 65)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    camp_file = os.path.join(base_dir, "CAMPANHA (1).xlsx")
    folha_file = os.path.join(base_dir, "folha_reconciliada_Setembro_2026.xlsx")
    output_file = os.path.join(base_dir, "CAMPANHA_ATUALIZADA.xlsx")
    
    if not os.path.exists(camp_file):
        print(f"[ERRO] Arquivo de campanha não encontrado: {camp_file}")
        return 1
    if not os.path.exists(folha_file):
        print(f"[ERRO] Arquivo de folha conciliada não encontrado: {folha_file}")
        return 1
        
    print(f"[+] Lendo Campanha: {os.path.basename(camp_file)}")
    print(f"[+] Lendo Folha:    {os.path.basename(folha_file)}")
    print(f"[+] Regras: -50 pts/falta | +1 pt/dia pontual (tolerância 10m) | +30 pts bônus 4 semanas")
    print("-" * 65)
    
    processor = CampanhaProcessor(camp_file, folha_file, tolerance_minutes=10, bonus_points=30)
    print("[*] Processando promotores e espelhos diários...")
    results = processor.process_all()
    
    total_promotores = len(results)
    total_faltas = sum(sum(p['faltas'] for p in prom['periodos']) for prom in results if prom['status'] == 'OK')
    total_pontos_pont = sum(sum(p['pontos_pontualidade_total'] for p in prom['periodos']) for prom in results if prom['status'] == 'OK')
    com_bonus = sum(1 for prom in results if any(p['ganhou_bonus'] for p in prom['periodos']))
    
    print("-" * 65)
    print(f"[OK] Concluido com sucesso!")
    print(f"  * Promotores processados:      {total_promotores}")
    print(f"  * Total de faltas no periodo:  {total_faltas} (desconto total: {total_faltas * -50} pts)")
    print(f"  * Pontos de pontualidade:      +{total_pontos_pont} pts distribuidos")
    print(f"  * Promotores com super bonus:  {com_bonus} colaboradores")
    print("-" * 65)
    
    print(f"[*] Gerando arquivo Excel atualizado com formulas preservadas...")
    processor.generate_updated_excel(output_file)
    print(f"[OK] Arquivo salvo em: {output_file}")
    print("=" * 65)
    return 0

if __name__ == '__main__':
    sys.exit(main())
