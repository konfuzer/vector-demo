# Ассеты работающего Vector Club · 23.10.2026

Обложки созданы встроенным инструментом OpenAI image_gen для этого локального демо. Это отдельные предметные изображения без интерфейса; заголовки, цены, фильтры, кнопки и формы в приложении — настоящие HTML-элементы. Папка PNG содержит исходные изображения, WebP — оптимизированные копии для браузера. Преобразование: `tools/prepare-media.cjs`, ширина не более 1600 px, WebP quality 92.

## Источники

- `public/brand/vektor.png` — точный PNG из официального SVG школы, без генеративной перерисовки. Исходник и источник — `assets/brand/SOURCE.md`. Официальный URL: https://static.tildacdn.com/tild3362-3463-4737-b664-656537343263/___1.svg .
- `public/fonts/Manrope.ttf` — Manrope Variable из репозитория Google Fonts: https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf . Лицензия SIL Open Font License сохранена рядом в `OFL-Manrope.txt`. Это локальная геометрическая гарнитура для приближения к макетам, не заявление об официальном шрифте школы FuturaPT.
- `public/media/assistant-reference.png` — первый робот, приложенный пользователем в этом чате. Копия исходника хранится в `references/assistant/01-friendly-robot.png`. Происхождение и право на публичное распространение не установлены; используется только в порученной локальной демонстрации.

## Промпты обложек

При генерации первых трёх обложек использовался согласованный собственный макет Club как визуальный ориентир. Не использовались скриншоты интерфейса как фон приложения. Остальные обложки продолжают тот же предметный стиль.

### robotics.png / .webp

```text
Use case: product-mockup. Extract/recreate ONLY the photorealistic robotic gripper product render from the supplied own Vector Club design, not its UI. Create a square high-resolution premium material study, same elaborate blue transparent resin fingers, silver brushed precision aluminium joints, black cabling, glossy blue cylindrical pedestal, exactly this mechanical robot arm identity and blue studio lighting. Diagonal close-up composition: gripper reaches from upper-left toward centre, arm base enters from lower-right. Beautiful deep navy #0c1b36 background and diffuse blue reflections, intricate engineered details, caustics, macro-quality materials. The object should occupy upper85% so bottom15% remains a clean dark gradient for later HTML text. Match the reference's authored high-end look, no toy robot face, no cartoon, no sci-fi landscape. No text, lettering, labels, icons, UI, buttons, frames, logo, watermark or children. One standalone square cover illustration, no contact sheet.
```

### design.png / .webp

```text
Use case: product-mockup. Create ONLY the standalone landscape cover art from the upper-right design/animation card in supplied own Vector Club reference, with no interface. 16:9 landscape. Large finely folded cobalt blue paper sculptural form, a translucent blue physical film ribbon with precise perforated edges curling gracefully across it, one upright frosted-blue acrylic panel and a few matte pale-blue plinths. Objects are placed on the RIGHT 58% of image; LEFT 42% is clean very pale blue #E4EFFF gently graduated empty space for real HTML text later. Beautiful tangible folds and paper fibres, realistic soft shadows, cool studio daylight, premium photography/3D material rendering identical to reference. No arbitrary glowing balls, no stock photos. No text, letters, words, branding, watermark, buttons, UI or border. Crisp authored calm blue-white composition, not a vector icon.
```

### science.png / .webp

```text
Use case: product-mockup. Recreate ONLY the standalone lower-right scientific workshop cover artwork from the supplied own Vector Club reference. A large transparent optical triangular prism with accurate rainbow caustics on a deep blue glossy table, an exquisitely detailed brushed-aluminium microscope objective entering diagonally from upper-right, two small clear glass optical cubes at far right. Physical studio render, extremely high material fidelity, rich dark blue #0b2446 ambience, polished surfaces, beautiful cool reflections. Landscape16:9 image. Objects placed RIGHT 60%, clean DARK BLUE LEFT40% for separate HTML text. Do not put microscope or prism behind future left text. Match the supplied design material quality; no cartoon, flat vectors, stock photograph of people, no toy. No lettering, labels, text, logos, buttons, frames, UI, watermark. One standalone landscape cover.
```

### theatre.png / .webp

```text
Use case: product-mockup. One standalone landscape16:9 premium theatre-workshop cover in the same cool-blue material world as supplied Vector Club artwork. Two beautifully crafted theatrical masks, one frosted satin blue ceramic, one matte white ceramic with a subtle silver rim, resting against pale blue architectural plinths. A folded pale blue fabric ribbon drapes naturally between them. Clear blue glass edge behind, soft daylight, tactile ceramic pores, contact shadows and subtle reflections. Subjects occupy the right60%; left40% is quiet pale sky blue #E4EFFF for HTML title later. School palette blue/white only, restrained lime accent optional tiny. Photorealistic authored studio render, no flat icon, toy, cartoon, person or face photograph. No writing, logos, letters, UI, buttons, border or watermark.
```

### chess.png / .webp

```text
Use case: product-mockup. One standalone landscape16:9 chess workshop cover, precisely crafted studio photography/3D in Vector Club cool material palette. A tall luxurious blue optical glass chess knight, small matte white king and polished silver pawn arranged on a bevelled blue glass chessboard, depth and weight, translucent refractions, realistic contact shadows, elegant diagonal geometry. Objects clustered RIGHT60%, LEFT40% clean deep midnight-blue for future real text. Rich blue studio light with subtle pale blue rim highlights, no neon. Match the reference's premium photoreal material quality, not flat, not cartoon. No labels, writing, digits, logo, UI, frame or watermark.
```

### english.png / .webp

```text
Use case: product-mockup. One standalone landscape16:9 English-through-stories activity cover in Vector Club's pale blue/white premium studio visual language. An open beautifully bound blue linen storybook with PURE BLANK unprinted white pages, a delicate folded cobalt-blue paper speech bubble sculpture and a small frosted transparent blue bookmark, placed on pale-blue geometric plinths. Paper edge detail, tactile woven linen and soft daylight shadows, airy material realism. Cluster objects on RIGHT60%, leave LEFT40% pale blue #E4EFFF for future real interface title. No text or pseudo-text anywhere, no letters, no school logo, UI, watermark, people, cartoon or stock-photo collage. Same authored material richness as input.
```

### photo.png / .webp

```text
Use case: product-mockup. One standalone landscape16:9 photography/light workshop cover in the Vector Club style. A beautiful unbranded precision camera assembled of brushed silver aluminium and cobalt-blue transparent acrylic, one large optical glass lens and two clear blue light-shaping panels with small spectral caustics. On a deep midnight blue glossy studio platform, objects RIGHT60%, dark quiet LEFT40% for later HTML content. Sophisticated physical material rendering, layered optical depth, soft photographic studio reflections, contact shadows, not cartoon, not a flat icon. No visible brand, numbers, letters, printed controls, text, UI, frames or watermark. Same photoreal finesse and cool blue world as reference.
```



## Академии · обновление 23.10.2026

Четыре отдельные предметные обложки академий добавлены без замены трёх верхних изображений. Происхождение, пути и полные промпты встроенного image_gen: [ACADEMY_COVER_PROMPTS.md](ACADEMY_COVER_PROMPTS.md). Иллюстрации не являются фотографиями реальных занятий школы. Содержание академий взято с официальных страниц, условия групп демонстрационные; подробности в `qa/catalogue-review-04/REPORT.md`.
