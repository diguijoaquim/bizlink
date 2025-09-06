from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF

def gerar_fatura():
    c = canvas.Canvas("fatura_heberlight.pdf", pagesize=A4)
    largura, altura = A4
    
    # Cores personalizadas baseadas na imagem
    cor_laranja = colors.Color(0.9, 0.4, 0.1)  # Laranja/vermelho da imagem
    cor_cinza_claro = colors.Color(0.95, 0.95, 0.95)

    # === LOGO ===
    try:
        c.drawImage("logo.png", 40, altura - 100, width=120, height=60, mask='auto')
    except:
        # Se não houver logo, desenhar um placeholder
        c.setFillColor(cor_laranja)
        c.rect(40, altura - 100, 120, 60, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(70, altura - 80, "HEBERlight")

    # === CABEÇALHO DIREITO (dados da empresa) com fundo colorido ===
    # Fundo laranja para os dados da empresa
    c.setFillColor(cor_laranja)
    c.rect(400, altura - 140, 200, 100, fill=1)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(410, altura - 50, "HEBERlight")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(410, altura - 65, "SOCIEDADE UNIPESSOAL, LDA")
    
    c.setFont("Helvetica", 9)
    c.drawString(410, altura - 80, "Bairro Mavalane, Rua da Beira")
    c.drawString(410, altura - 95, "Próximo ao Mercado Mavalane")
    c.drawString(410, altura - 110, "Cel: +250 049150203/922755477")
    c.drawString(410, altura - 125, "NUIT: 400885230")
    c.drawString(410, altura - 140, "Maputo-Mocambique")

    # === Nº da Fatura ===
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, altura - 150, "FACTURA Nº")
    c.setFillColor(cor_laranja)
    c.drawString(150, altura - 150, "002153")
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)
    c.drawString(40, altura - 165, "DATA:")
    c.setFillColor(cor_laranja)
    c.drawString(80, altura - 165, "18 DE. 08. DE 2025")

    # === QUADRO DO CLIENTE com fundo colorido ===
    c.setFillColor(cor_laranja)
    c.rect(40, altura - 250, 520, 30, fill=1)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, altura - 230, "INFORMAÇÃO SOBRE O CLIENTE")

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(50, altura - 260, "CLICNTC:")
    c.drawString(120, altura - 260, "Movitel S.A")
    c.drawString(50, altura - 275, "FNDEREÇO:")
    c.drawString(120, altura - 275, "Rua das desportistas N°691 - Maputo")
    c.drawString(50, altura - 290, "CONTACTO:")
    c.drawString(50, altura - 305, "NUIT:")
    c.drawString(120, altura - 305, "400269177")

    # === TABELA PRINCIPAL ===
    dados = [
        ["QUANT.", "DESIGNAÇÃO", "PREÇO UNITÁRIO", "TOTAL"],
        ["", "Diagnóstico (Inspeção visual dos equipamentos, testes: Isolamento de 02 transformadores, rigidez dielétrica e terras (S", "46.980.00", "46.980.00"],
        ["02", "Testes de isolamento, teste de óleo de transformador", "36.000.00", "72.000.00"],
    ]

    tabela = Table(dados, colWidths=[50, 270, 100, 100])
    tabela.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), cor_laranja),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, cor_cinza_claro]),
    ]))
    tabela.wrapOn(c, largura, altura)
    tabela.drawOn(c, 40, altura - 500)

    # === OBS IVA ===
    c.setFont("Helvetica", 8)
    c.drawString(40, altura - 520, "MOTIVO JUSTIFICATIVO DE NÃO APLICAÇÃO DO IVA:")
    c.drawString(40, altura - 535, "Exionso")

    # === TOTAIS ===
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(540, altura - 560, "SUB-TOTAL:")
    c.setFillColor(cor_laranja)
    c.drawRightString(580, altura - 560, "19.800.00")

    c.setFillColor(colors.black)
    c.drawRightString(540, altura - 580, "IVA 18%:")
    c.setFillColor(cor_laranja)
    c.drawRightString(580, altura - 580, "19.168.00")

    c.setFillColor(colors.black)
    c.drawRightString(540, altura - 600, "TOTAL:")
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(cor_laranja)
    c.drawRightString(580, altura - 600, "118.968.00")

    # === CARIMBO ===
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(40, 100, "Assinatura e Carimbo:")
    
    # Desenhar um carimbo circular simples
    c.setStrokeColor(colors.blue)
    c.setFillColor(colors.white)
    c.circle(150, 80, 25, fill=1, stroke=1)
    c.setFillColor(colors.blue)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(150, 85, "HEBERlight")
    c.setFont("Helvetica", 6)
    c.drawCentredString(150, 78, "Maputo - Moçambique")
    c.drawCentredString(150, 75, "+258 848150203")

    c.save()

if __name__ == "__main__":
    gerar_fatura()

