from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
pdfmetrics.registerFont(TTFont('LocalArial', 'C:/Windows/Fonts/arial.ttf'))
for path, title, lines in [
    (root / 'public/demo-contract.pdf', 'Демонстрационное вложение', ['Образец файла в карточке ученика Vector Flow.', 'Не является договором, офертой или документом школы.', 'Все сведения и участники демонстрации вымышлены.']),
    (root / 'qa/чек-сентябрь-демо.pdf', 'Демонстрационный файл оплаты', ['Сценарий: обучение за сентябрь, 50 000 рублей.', 'Это учебный пример вложения, не кассовый чек.', 'Никакой реальной оплаты или выдачи чека не было.'])
]:
    path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(path), pagesize=(595, 842))
    c.setTitle(title + ' - Vector Flow DEMO')
    c.setFillColor(HexColor('#eef6ff')); c.rect(0, 0, 595, 842, fill=1, stroke=0)
    c.setFillColor(HexColor('#3c8fef')); c.roundRect(45, 730, 120, 44, 12, fill=1, stroke=0)
    c.setFont('Helvetica-Bold', 19); c.setFillColor(HexColor('#ffffff')); c.drawString(65, 744, 'DEMO')
    c.setFont('LocalArial', 22); c.setFillColor(HexColor('#15233f')); c.drawString(45, 670, title)
    c.setFont('LocalArial', 12)
    for i, line in enumerate(lines): c.drawString(45, 620 - i * 31, line)
    c.setFillColor(HexColor('#61789b')); c.setFont('LocalArial', 10)
    c.drawString(45, 70, 'Vector Flow - локальная демонстрация. Данные вымышлены.')
    c.save()
