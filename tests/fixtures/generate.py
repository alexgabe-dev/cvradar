"""Fiktív tesztadatok. Újragenerálás: pip install reportlab pypdf pillow.
A PDF magyar karaktereihez add meg a CVRADAR_TEST_FONT TTF útvonalat.
"""
import os
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter

root = Path(__file__).parent
font = os.environ.get('CVRADAR_TEST_FONT', '/System/Library/Fonts/Supplemental/Arial.ttf')
pdfmetrics.registerFont(TTFont('Fixture', font))
lines = ['Fiktív Teszt Elek', 'Árvíztűrő tükörfúrógép', 'Budapest - teszt@example.com', 'Kitalált munkahely, heti riportok.']
c = canvas.Canvas(str(root/'text.pdf'))
c.setFont('Fixture', 12)
for index, line in enumerate(lines): c.drawString(50, 780-index*24, line)
c.showPage(); c.save()
c = canvas.Canvas(str(root/'blank.pdf')); c.showPage(); c.save()
image = Image.new('RGB',(800,180),'white'); ImageDraw.Draw(image).text((20,50),'FICTIONAL SCANNED CV',fill='black')
c = canvas.Canvas(str(root/'image.pdf')); c.drawInlineImage(image,50,600,500,112); c.showPage(); c.save()
writer = PdfWriter(); writer.append(PdfReader(root/'text.pdf')); writer.encrypt('fictional-test-password')
with open(root/'protected.pdf','wb') as output: writer.write(output)
content_types = '''<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'''
rels = '''<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'''
def docx(name, paragraphs, extra=None):
    document = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join('<w:p><w:r><w:t>'+line+'</w:t></w:r></w:p>' for line in paragraphs)+'</w:body></w:document>'
    with ZipFile(root/name,'w', ZIP_DEFLATED) as archive:
        for path, text in {'[Content_Types].xml':content_types,'_rels/.rels':rels,'word/document.xml':document}.items(): archive.writestr(path,text)
        if extra: archive.writestr('word/media/padding.bin',extra)
docx('text.docx',lines)
docx('blank.docx',[])
docx('oversized-content.docx',lines,b'0'*(11*1024*1024))
docx('long-text.docx',['a'*200_001])
# XML-like instructions must remain literal text in the browser.
docx('literal.docx',['&lt;script&gt;window.__documentExecuted = true&lt;/script&gt;'])

with ZipFile(root/'not-word.docx','w',ZIP_DEFLATED) as archive:
    archive.writestr('fake.txt','This is a fictional ZIP, not a Word file.')
