from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

def criar_fatura():
    # Nome do arquivo PDF
    nome_arquivo = f"fatura_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    # Criar documento
    doc = SimpleDocTemplate(nome_arquivo, pagesize=A4,
                          rightMargin=2*cm, leftMargin=2*cm,
                          topMargin=2*cm, bottomMargin=2*cm)
    
    # Lista para armazenar elementos
    elementos = []
    
    # Obter estilos
    styles = getSampleStyleSheet()
    
    # Estilos customizados
    style_titulo = ParagraphStyle(
        'TituloEmpresa',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=6,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    style_empresa = ParagraphStyle(
        'InfoEmpresa',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        spaceAfter=3
    )
    
    style_fatura = ParagraphStyle(
        'InfoFatura',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_RIGHT,
        textColor=colors.darkred
    )
    
    style_cliente = ParagraphStyle(
        'InfoCliente',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_LEFT
    )
    
    style_justificativa = ParagraphStyle(
        'Justificativa',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_LEFT,
        leftIndent=10
    )
    
    # === CABEÇALHO PRINCIPAL COM 3 COLUNAS ===
    data_atual = datetime.now()
    
    # Primeira coluna - Logo e tipo de sociedade
    coluna1_content = []
    logo_path = "logo.png"  # ou "logo.jpg"
    if os.path.exists(logo_path):
        try:
            logo = Image(logo_path, width=3*cm, height=2*cm)
            coluna1_content.append(logo)
            coluna1_content.append(Spacer(1, 0.2*cm))
        except:
            pass
    
    coluna1_content.append(Paragraph("SOCIEDADE UNIPESSOAL, LDA", 
                                   ParagraphStyle('TipoSociedade', 
                                                parent=styles['Normal'],
                                                fontSize=9,
                                                alignment=TA_CENTER,
                                                textColor=colors.darkblue)))
    
    # Segunda coluna - Localização, contacto e NUIT
    coluna2_text = """
    <b>NOME DA SUA EMPRESA, LDA</b><br/>
    Av. Julius Nyerere, Nº 123<br/>
    Maputo - Moçambique<br/>
    Tel: +258 21 123 456<br/>
    Email: info@suaempresa.co.mz<br/>
    NUIT: 400123456
    """
    
    # Terceira coluna - Número da fatura e data
    coluna3_text = f"""
    <b><font color="darkred" size="14">FATURA</font></b><br/>
    <b>Nº:</b> FAT-{data_atual.strftime('%Y')}-001<br/>
    <b>Data:</b> {data_atual.strftime('%d/%m/%Y')}
    """
    
    # Criar tabela principal do cabeçalho
    header_data = [[
        coluna1_content,
        Paragraph(coluna2_text, ParagraphStyle('Coluna2', parent=styles['Normal'], 
                                             fontSize=10, alignment=TA_LEFT)),
        Paragraph(coluna3_text, ParagraphStyle('Coluna3', parent=styles['Normal'], 
                                             fontSize=10, alignment=TA_RIGHT))
    ]]
    
    tabela_header = Table(header_data, colWidths=[5.5*cm, 6.5*cm, 5*cm])
    tabela_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
    ]))
    
    elementos.append(tabela_header)
    elementos.append(Spacer(1, 0.8*cm))
    
    # === SEGUNDA ROW - DADOS DO CLIENTE ===
    cliente_text = """
    <b>Cliente:</b> CLIENTE EXEMPLO, LDA | 
    <b>NUIT:</b> 400987654 | 
    <b>Endereço:</b> Rua da Resistência, Nº 456, Maputo | 
    <b>Contacto:</b> +258 84 987 654
    """
    
    cliente_data = [[Paragraph(cliente_text, ParagraphStyle('Cliente', parent=styles['Normal'], 
                                                           fontSize=10, alignment=TA_LEFT))]]
    
    tabela_cliente = Table(cliente_data, colWidths=[17*cm])
    tabela_cliente.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elementos.append(tabela_cliente)
    elementos.append(Spacer(1, 0.8*cm))
    
    # === TABELA DE PRODUTOS/SERVIÇOS ===
    # Dados da tabela (substitua pelos dados reais)
    dados_tabela = [
        ["Quant.", "Designação", "Preço Unitário (MT)", "Total (MT)"],
        ["2", "Serviço de Consultoria IT", "5,000.00", "10,000.00"],
        ["1", "Licença de Software", "3,500.00", "3,500.00"],
        ["5", "Horas de Suporte Técnico", "800.00", "4,000.00"],
        ["", "", "", ""],
    ]
    
    tabela_produtos = Table(dados_tabela, colWidths=[2*cm, 8*cm, 3.5*cm, 3.5*cm])
    tabela_produtos.setStyle(TableStyle([
        # Cabeçalho - cor laranja
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF6600')),  # Laranja
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        
        # Conteúdo
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Quantidade centralizada
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # Designação à esquerda
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),  # Preços à direita
        
        # Bordas
        ('GRID', (0, 0), (-1, -2), 1, colors.HexColor('#FF6600')),  # Bordas laranja
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#FF6600')),
        
        # Valores
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    elementos.append(tabela_produtos)
    elementos.append(Spacer(1, 0.5*cm))
    
    # === TOTAIS E JUSTIFICATIVA IVA ===
    # Criar tabela com totais à direita e justificativa à esquerda
    subtotal = 17500.00
    iva_valor = 0.00
    total = subtotal + iva_valor
    
    # Justificativa IVA
    justificativa_text = """
    <b>MOTIVO DA NÃO APLICAÇÃO DO IVA:</b><br/>
    Nos termos do Artigo 9º do Código do IVA,<br/>
    a presente operação encontra-se isenta de IVA<br/>
    por se tratar de [especificar o motivo, ex.:<br/>
    prestação de serviços de consultoria ou<br/>
    regime simplificado de tributação].
    """
    
    dados_finais = [
        [
            Paragraph(justificativa_text, style_justificativa),
            Table([
                ["Sub-Total:", f"{subtotal:,.2f} MT"],
                ["IVA (17%):", f"{iva_valor:,.2f} MT"],
                ["TOTAL:", f"{total:,.2f} MT"]
            ], colWidths=[3*cm, 3*cm], style=[
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 12),
                ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ])
        ]
    ]
    
    tabela_final = Table(dados_finais, colWidths=[10*cm, 7*cm])
    tabela_final.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    
    elementos.append(tabela_final)
    elementos.append(Spacer(1, 1*cm))
    
    # === RODAPÉ ===
    elementos.append(Paragraph("Obrigado pela preferência!", 
                              ParagraphStyle('Rodape', parent=styles['Normal'], 
                                           fontSize=10, alignment=TA_CENTER,
                                           textColor=colors.grey)))
    
    # Construir PDF
    doc.build(elementos)
    print(f"Fatura criada com sucesso: {nome_arquivo}")
    return nome_arquivo

# Executar a função
if __name__ == "__main__":
    # Instalar dependências se necessário:
    # pip install reportlab
    
    nome_arquivo = criar_fatura()
    print(f"Arquivo PDF gerado: {nome_arquivo}")