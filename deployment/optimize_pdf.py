from pathlib import Path
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium

root = Path(__file__).resolve().parent
source = root.parent / 'Vector Universe/app/public/assets/Art_History_Ancient_Egypt.pdf'
target = root / 'assets/universe/assets/Art_History_Ancient_Egypt.pdf'
reader = PdfReader(source)
writer = PdfWriter()
writer.clone_document_from_reader(reader)
count = 0
for page in writer.pages:
    for image in list(page.images):
        bitmap = image.image.convert('RGB')
        bitmap.thumbnail((1600, 1600))
        image.replace(bitmap, quality=76)
        count += 1
writer.add_metadata({'/Subject': 'Web-optimized copy: images resized/recompressed; Michael Leonard / Humanities LibreTexts; CC BY 4.0. Content and page order preserved.'})
writer.write(target)
result = PdfReader(target)
assert len(result.pages) == len(reader.pages) == 132
assert target.stat().st_size < 25 * 1024 * 1024
for i in range(132):
    assert result.pages[i].extract_text() == reader.pages[i].extract_text(), f'Text differs on page {i+1}'
pdf = pdfium.PdfDocument(str(target))
qa = root / 'qa'
qa.mkdir(exist_ok=True)
for page in [0, 1, 6, 29]:
    pdf[page].render(scale=1).to_pil().save(qa / f'pdf-page-{page+1}.png')
note = target.parent / 'history-source.md'
note.write_text((source.parent / 'history-source.md').read_text(encoding='utf-8') + '\n\nПубличная веб-копия: изображения уменьшены и повторно сжаты для размещения. Все 132 страницы и текст сохранены. Локальный оригинал не изменён.\n', encoding='utf-8')
print(f'PDF: {source.stat().st_size} -> {target.stat().st_size} bytes; {count} images optimized; 132 pages and all page text verified.')
