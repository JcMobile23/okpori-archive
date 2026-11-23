import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
import pypdf

pdf_path = r'C:\Users\HP\Desktop\OKPORI\Goodwill_Message_Sir_Nkem_Udom_KSC.pdf'

def draw_borders(canvas_obj, doc):
    canvas_obj.saveState()
    w, h = A4
    
    # 1. Warm parchment background tint
    canvas_obj.setFillColor(colors.HexColor('#FDFBF7'))
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)
    
    # 2. Outer Ornate Gold Border
    canvas_obj.setStrokeColor(colors.HexColor('#C59B27'))
    canvas_obj.setLineWidth(2.5)
    canvas_obj.rect(20, 20, w - 40, h - 40)
    
    # 3. Inner Bronze Border
    canvas_obj.setStrokeColor(colors.HexColor('#8B6B1B'))
    canvas_obj.setLineWidth(0.75)
    canvas_obj.rect(25, 25, w - 50, h - 50)
    
    # 4. Corner Ornaments (Classic L-brackets)
    corner_len = 20
    canvas_obj.setLineWidth(1.8)
    canvas_obj.setStrokeColor(colors.HexColor('#8B6B1B'))
    
    # Top-Left
    canvas_obj.line(22, h - 22 - corner_len, 22, h - 22)
    canvas_obj.line(22, h - 22, 22 + corner_len, h - 22)
    # Top-Right
    canvas_obj.line(w - 22 - corner_len, h - 22, w - 22, h - 22)
    canvas_obj.line(w - 22, h - 22, w - 22, h - 22 - corner_len)
    # Bottom-Left
    canvas_obj.line(22, 22 + corner_len, 22, 22)
    canvas_obj.line(22, 22, 22 + corner_len, 22)
    # Bottom-Right
    canvas_obj.line(w - 22 - corner_len, 22, w - 22, 22)
    canvas_obj.line(w - 22, 22, w - 22, 22 + corner_len)
    
    # 5. Bottom Decorative Footer Line
    canvas_obj.setStrokeColor(colors.HexColor('#D4AF37'))
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(34, 36, w - 34, 36)
    
    canvas_obj.setFont('Helvetica-Bold', 6.5)
    canvas_obj.setFillColor(colors.HexColor('#776633'))
    canvas_obj.drawString(36, 26, "ST. MARY'S CHURCH, UGWUTA")
    canvas_obj.drawCentredString(w / 2, 26, "• THE OKPORI ROYAL ANCESTRAL ARCHIVE •")
    canvas_obj.drawRightString(w - 36, 26, "26TH DECEMBER, 2026")
    
    canvas_obj.restoreState()

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    leftMargin=34,
    rightMargin=34,
    topMargin=28,
    bottomMargin=42
)

styles = getSampleStyleSheet()

style_dynasty = ParagraphStyle(
    'DynastyTag',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.2,
    leading=9.5,
    textColor=colors.HexColor('#8B6B1B'),
    alignment=TA_CENTER,
    spaceAfter=2
)

style_main_title = ParagraphStyle(
    'MainTitle',
    parent=styles['Normal'],
    fontName='Times-Bold',
    fontSize=16,
    leading=19.5,
    textColor=colors.HexColor('#1A1A1A'),
    alignment=TA_CENTER,
    spaceAfter=2
)

style_sub_banner = ParagraphStyle(
    'SubBanner',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.5,
    leading=9.5,
    textColor=colors.HexColor('#665220'),
    alignment=TA_CENTER,
    spaceAfter=4
)

style_honoree_name = ParagraphStyle(
    'HonoreeName',
    parent=styles['Normal'],
    fontName='Times-Bold',
    fontSize=13,
    leading=15.5,
    textColor=colors.HexColor('#8B2500'),
    alignment=TA_CENTER
)

style_honoree_and = ParagraphStyle(
    'HonoreeAnd',
    parent=styles['Normal'],
    fontName='Times-Italic',
    fontSize=9,
    leading=11.5,
    textColor=colors.HexColor('#8B6B1B'),
    alignment=TA_CENTER
)

style_honoree_order = ParagraphStyle(
    'HonoreeOrder',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.2,
    leading=9.5,
    textColor=colors.HexColor('#2A2A2A'),
    alignment=TA_CENTER
)

style_scripture = ParagraphStyle(
    'ScriptureText',
    parent=styles['Normal'],
    fontName='Times-Italic',
    fontSize=8.8,
    leading=11.8,
    textColor=colors.HexColor('#2B2B2B'),
    alignment=TA_CENTER
)

style_scripture_ref = ParagraphStyle(
    'ScriptureRef',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=6.8,
    leading=8.5,
    textColor=colors.HexColor('#8B6B1B'),
    alignment=TA_CENTER,
    spaceBefore=2
)

style_body = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontName='Times-Roman',
    fontSize=9.2,
    leading=13.0,
    textColor=colors.HexColor('#1F1F1F'),
    alignment=TA_JUSTIFY,
    spaceAfter=3.5
)

style_bullet = ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontName='Times-Roman',
    fontSize=8.7,
    leading=12.0,
    textColor=colors.HexColor('#1F1F1F'),
    alignment=TA_LEFT,
    leftIndent=14,
    firstLineIndent=-9,
    spaceAfter=2.5
)

style_congrats = ParagraphStyle(
    'CongratsLine',
    parent=styles['Normal'],
    fontName='Times-Bold',
    fontSize=10,
    leading=13.5,
    textColor=colors.HexColor('#8B2500'),
    alignment=TA_CENTER,
    spaceBefore=2.5,
    spaceAfter=4
)

style_sig_label = ParagraphStyle(
    'SigLabel',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7,
    leading=8.5,
    textColor=colors.HexColor('#8B6B1B'),
    alignment=TA_RIGHT
)

style_sig_name = ParagraphStyle(
    'SigName',
    parent=styles['Normal'],
    fontName='Times-Bold',
    fontSize=10,
    leading=12.5,
    textColor=colors.HexColor('#1A1A1A'),
    alignment=TA_RIGHT
)

style_sig_sub = ParagraphStyle(
    'SigSub',
    parent=styles['Normal'],
    fontName='Times-Italic',
    fontSize=7.8,
    leading=10,
    textColor=colors.HexColor('#4A4A4A'),
    alignment=TA_RIGHT
)

style_sig_dynasty = ParagraphStyle(
    'SigDynasty',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=6.5,
    leading=8,
    textColor=colors.HexColor('#8B6B1B'),
    alignment=TA_RIGHT
)

style_elder_caption = ParagraphStyle(
    'ElderCaption',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=6.5,
    leading=8.5,
    textColor=colors.HexColor('#665220'),
    alignment=TA_CENTER
)

story = []

# 1. Crest
crest_file = r'C:\Users\HP\Desktop\OKPORI\public\crest.png'
if os.path.exists(crest_file):
    img = Image(crest_file, width=40, height=40)
    img.hAlign = 'CENTER'
    story.append(img)
    story.append(Spacer(1, 2))

story.append(Paragraph('THE OKPORI ROYAL ANCESTRAL DYNASTY', style_dynasty))
story.append(Paragraph('A ROYAL GOODWILL MESSAGE &amp; FELICITATIONS', style_main_title))
story.append(Paragraph('TO OUR ILLUSTRIOUS SON, LEARNED ADVOCATE &amp; OUR AMIABLE WIFE', style_sub_banner))

# 2. Honoree Box
box_data = [
    [Paragraph('BARR. NKEM UDOM', style_honoree_name)],
    [Paragraph('&amp; Our Amiable Wife', style_honoree_and)],
    [Paragraph('MRS. ISABELLA UDOM', style_honoree_name)],
    [Paragraph('ON YOUR INVESTITURE AS KNIGHT &amp; LADY OF THE ORDER OF ST. CHRISTOPHER (KSC / LSC)', style_honoree_order)]
]
honoree_table = Table(box_data, colWidths=[doc.width])
honoree_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7F2E6')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#C59B27')),
    ('TOPPADDING', (0,0), (-1,-1), 2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ('LEFTPADDING', (0,0), (-1,-1), 5),
    ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
]))
story.append(honoree_table)
story.append(Spacer(1, 3.5))

# 3. Scripture Box
scripture_data = [
    [Paragraph('&ldquo;He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.&rdquo;', style_scripture)],
    [Paragraph('&mdash; MICAH 6:8 &mdash;', style_scripture_ref)]
]
scripture_table = Table(scripture_data, colWidths=[doc.width * 0.94])
scripture_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F4EFE2')),
    ('LINEBEFORE', (0,0), (0,-1), 2, colors.HexColor('#C59B27')),
    ('LINEAFTER', (-1,0), (-1,-1), 2, colors.HexColor('#C59B27')),
    ('TOPPADDING', (0,0), (-1,-1), 2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
]))
scripture_table.hAlign = 'CENTER'
story.append(scripture_table)
story.append(Spacer(1, 4))

# 4. Body Paragraphs
p1 = ('With hearts overflowing with divine joy, thanksgiving, and royal pride, I, <b>Elder Edwin O. Igwuru</b>, '
      'together with the entire <b>Okpori Family, both home and abroad</b>, heartily rejoice and felicitate with '
      'our beloved brother, <b>Barr. Nkem Udom</b>, and our amiable wife, <b>Mrs. Isabella Udom</b>, on this '
      'auspicious and glorious elevation.')
story.append(Paragraph(p1, style_body))

p2 = ('We express our deepest gratitude to God Almighty and warmly thank our revered Lord Bishop, '
      '<b>The Rt. Rev. Chijioke B. N. Oti, Ph.D</b>, for finding this exemplary couple worthy to be invested as '
      '<b>Knight and Lady of the Order of St. Christopher</b> on this blessed day, the <b>26th of December, 2026</b>, '
      'at <b>St. Mary&rsquo;s Church, Ugwuta</b>.')
story.append(Paragraph(p2, style_body))

p3 = ('As a learned legal practitioner and minister in the temple of justice, you have continually championed fairness, '
      'truth, and the defense of the defenseless. Beside you stands our gracious wife, Isabella, a pillar of virtue, strength, '
      'and unwavering devotion. Together, your tireless dedication, humility, and sacrificial labor in the household of faith '
      'and the community have brought profound honor to the <b>Udom</b> household and the ancestral heritage of <b>Okpori</b>.')
story.append(Paragraph(p3, style_body))

# 5. Bullets
b1 = '&bull;&nbsp; <b>Divine Elevation:</b> We join hands across the Okpori dynasty to pray that the Almighty God will continually lift you up and prosper you in all your endeavors.'
b2 = '&bull;&nbsp; <b>Heavenly Wisdom &amp; Fortitude:</b> May the Lord endow you with wisdom, grace, and courage to defend the faith and serve humanity selflessly.'
b3 = '&bull;&nbsp; <b>Enduring Peace &amp; Fruitfulness:</b> May peace, good health, divine protection, and abundant fruitfulness abide in your home all the days of your lives.'

story.append(Paragraph(b1, style_bullet))
story.append(Paragraph(b2, style_bullet))
story.append(Paragraph(b3, style_bullet))

story.append(Paragraph('Hearty Congratulations, Sir (Barr.) Nkem Udom, KSC &amp; Lady Isabella Udom, LSC!', style_congrats))
story.append(Spacer(1, 3))

# 6. Bottom Sign-Off Section (Elder Portrait on Left, Cursive Signature Block on Right)
elder_img_path = r'C:\Users\HP\Desktop\OKPORI\elder_framed.png'
sig_img_path = r'C:\Users\HP\Desktop\OKPORI\elder_signature.png'

# Left Column (Elder Photo & Caption)
elder_img = Image(elder_img_path, width=68, height=85)
elder_img.hAlign = 'CENTER'
elder_caption = Paragraph('<b>ELDER EDWIN O. IGWURU</b><br/><font color="#776633">Patriarch &amp; Diokpa, Okpori Dynasty</font>', style_elder_caption)
left_cell = [elder_img, Spacer(1, 2), elder_caption]

# Right Column (Cursive Signature Block)
sig_img = Image(sig_img_path, width=140, height=39)
sig_img.hAlign = 'RIGHT'

right_cell = [
    Paragraph('SIGNED FOR THE DYNASTY:', style_sig_label),
    sig_img,
    HRFlowable(width='65%', thickness=0.8, color=colors.HexColor('#1A1A1A'), spaceBefore=0, spaceAfter=2, hAlign='RIGHT'),
    Paragraph('<b>Elder Edwin O. Igwuru</b>', style_sig_name),
    Paragraph('For and on behalf of the entire Okpori Family', style_sig_sub),
    Paragraph('HOME &amp; ABROAD', style_sig_dynasty)
]

col_w1 = 140
col_w2 = doc.width - col_w1
sign_table = Table([[left_cell, right_cell]], colWidths=[col_w1, col_w2])
sign_table.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
    ('ALIGN', (0,0), (0,0), 'CENTER'),
    ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ('TOPPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
]))
story.append(sign_table)

doc.build(story, onFirstPage=draw_borders)

reader = pypdf.PdfReader(pdf_path)
print('SUCCESS! Total pages:', len(reader.pages))
