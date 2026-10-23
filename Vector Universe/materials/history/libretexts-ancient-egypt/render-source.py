from pathlib import Path
import json
import pypdfium2 as pdfium
from pypdf import PdfReader

root = Path(__file__).resolve().parent
source = root / 'Art_History_Ancient_Egypt.pdf'
reader = PdfReader(source)
pdf = pdfium.PdfDocument(str(source))
pages = [1, 2, 7, 30]
for number in pages:
    page = pdf[number-1]
    page.render(scale=1.5).to_pil().save(root / f'page-{number:03d}.png')
    print(number, reader.pages[number-1].extract_text()[:400].replace('\n', ' '))
(root / 'source-metadata.json').write_text(json.dumps({
    'title': 'Art History Ancient Egypt', 'author': 'Michael Leonard',
    'publisher': 'Humanities LibreTexts / University of the Pacific',
    'language': 'English', 'pages': len(reader.pages),
    'source_page': 'https://human.libretexts.org/Courses/University_of_the_Pacific/Art_History_-_Prehistoric_through_Gothic/05:_Ancient_Egypt/5.01:_Ancient_Egypt_PowerPoint',
    'file_url': 'https://human.libretexts.org/@api/deki/files/140515/Art_History_Ancient_Egypt.pdf?revision=1',
    'page_license': 'CC BY 4.0', 'license_url': 'https://creativecommons.org/licenses/by/4.0/',
    'downloaded_on': '2026-10-23', 'original_file_modified': False,
    'note': 'Author and license attributed by the source page. Preserve embedded artwork credits. Not authored by Ivan or Vector School.'
}, ensure_ascii=False, indent=2), encoding='utf-8')
