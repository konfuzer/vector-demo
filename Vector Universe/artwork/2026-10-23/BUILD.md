# Фотореалистичная композиция Universe

**Последняя версия v3:** убраны вшитые провода, поверх изображения построены три аккуратных подвеса. Покачивание, раздельная левитация дисков, ассеты и точный промпт — [MOTION_REFINEMENT.md](MOTION_REFINEMENT.md). Приложение использует v3; v2 ниже — история восстановления детализации.

**Текущие ассеты v2:** восстановлены фактуры металла, стекла и камня; добавлены световые проходы и мягкие блики в интерфейсе. Файлы, реальные размеры и точные промпты встроенного ImageGen — [DETAIL_RESTORATION.md](DETAIL_RESTORATION.md). Публичные scene-v2/background-v2 используются вместо исходных WebP ниже. Исходники сохранены; экспорт 3200×2006 не заявляется нативной 2K/4K-генерацией.

23.10.2026. Встроенный imagegen готовит bitmap-ассеты; HTML/SVG-слои и CSS-анимация показываются в приложении. WebGL/Three.js удалены по обратной связи пользователя.

Исходный эталон: приложенный пользователем codex-clipboard-a843a14a-bf9d-442a-bb2a-477c607c3a44.png, соответствующий ранее принятой главной.

- universe-approved-clean.png — одобренная композиция после удаления встроенного UI; в приложении public/assets/artwork/universe-scene.webp.
- universe-background.png — та же архитектура, арка и основания без декоративных предметов; в приложении public/assets/artwork/universe-background.webp.
- unused-transparent-objects.png — НЕ используется: пробная вырезка изменила масштаб и координаты предметов.
- prism-illustration.png — иллюстрация призмы без нарисованной кнопки Play; public/assets/prism-illustration.webp. В продукте обозначена демонстрационным изображением, не видео или фактическим опытом ученика.

Artwork.tsx показывает исходные пиксели через SVG-клип-маски. Архитектура, арка, основания и отражения неподвижны. Медленные ограниченные трансформации предметов длятся 14–32 с. Это движение художественных слоёв, а не пространственная ротация 3D-моделей. Нет наведения, обработки указателя, кнопок предметов или скролл-анимации. Компонент не получает данные портфолио.

Полный статичный постер — первый кадр, резерв при ошибке загрузки и вариант для prefers-reduced-motion.

## Промпты

### Удаление интерфейса

Use case: precise-object-edit. Edit target: attached approved Vector Universe screenshot. Create a clean photographic background plate from THIS EXACT image. Remove ALL interface elements only: all text at upper left, all navigation text at top, avatar/name top right, whole right-side white panel and all cards/buttons/content, and any logo/text. Inpaint the removed UI regions with a seamless continuation of the same luminous white/blue windowed atrium, plants and glossy floor. Preserve the entire existing sculpture composition EXACTLY as in the source: huge textured pale blue metallic arch at same coordinates, intricate blue/chrome twisting ribbon left on a pale speckled terrazzo plinth, two nested hanging silver/gold rings at center, clear and lime glass disks on right, all layered metallic platforms, every reflection, shadow, plant, floor and architectural mullion. Do NOT simplify, redesign, replace, recamera or recolor ANY sculpture. This is strict interface-removal/inpainting, not a new rendering. Keep all original shape contours, photographic depth, rich realistic reflections, fine brushed metal and etched blue texture. Keep same wide 1584x993 framing/aspect ratio and camera. No text, UI, panels, icons, letters, logos, watermark anywhere. Source photograph quality must remain fully photorealistic, not cartoon, not flat, not low-poly.

### Подложка для слоёв

Use case: precise-object-edit. Edit the attached EXACT photographic atrium sculpture image as a clean animation background plate. Remove ONLY these four floating art objects, inpainting the tiny regions they occupied with the same scene behind them: (1) the blue/chrome twisted ribbon sculpture on LEFT, including its long curled metallic ribbon but KEEP its small circular metal foot and ALL pale terrazzo plinth below; (2) the LARGE hanging oval silver/gold ring at CENTER, keeping thin hanging wires above; (3) the SMALL nested center ring, remove it too; (4) the stack of four clear/lime glass disks at RIGHT, keeping ALL pale terrazzo pedestals beneath them. Preserve ALL OTHER PIXELS AND GEOMETRY as closely as possible: big blue arch, plants, windows, floor, foreground vegetation, every base and tier, exact lighting and shadows. Do not move, reshape, relight or resize anything. The intended removed objects will be composited back from the original at exact same coordinates. Do not add replacement objects. No text or UI. Exact same camera and wide 1584x993 frame. This is highly constrained object-removal/inpainting, not a redesign.

### Невыбранная прозрачная вырезка

Use case: background-extraction. Edit attached exact approved artwork. Produce a TRANSPARENT RGBA animation overlay on exactly the same full 1584x993 canvas. Keep ONLY these existing sculptures at their EXACT original coordinates, scale, contours, appearance: the complete shiny blue/chrome twisted ribbon on the left (from its top to its lowest blue/silver curl, EXCLUDING the circular metal foot and terrazzo plinth); the big silver/gold hanging oval ring in the center; the smaller nested silver/gold ring; and the four clear/lime glass disks at the right. Remove EVERY other pixel to transparent: no arch, no floor, no plants, no wires, no pedestals, no window, no background. Ring holes and all gaps between disks must be transparent. Preserve real glass edges, highlights, chrome reflections, fine surface quality. No white or grey halo, no checkerboard painted into image. IMPORTANT: DO NOT rearrange the objects or enlarge to fill canvas. Retain the original canvas and original object positions for exact recomposition over the original background plate. This is a faithful cutout, not redesign. Actual transparent background.

### Призма без кнопки

Use case: precise-object-edit. Remove ONLY the circular Play button overlay from the center of this glass-prism illustration. Seamlessly reconstruct the underlying transparent glass, reflected light and spectrum. Preserve the composition, prism shape, lighting, texture and realistic photographic style. No UI, text, icons, rounded card border, or button anywhere. Keep a wide landscape crop. This will be an educational illustration, not labelled as a real recorded experiment.


## Дополнение: материалы каталогов

Крупные иллюстрации выставки и их точные промпты: [CATALOG_PROMPTS.md](CATALOG_PROMPTS.md). Выбранные WebP находятся в app/public/assets/catalog/, архивные PNG — рядом с этим файлом. Исходная сцена: universe-approved-clean.png и universe-background.png; используемые приложением варианты — app/public/assets/artwork/universe-scene.webp и universe-background.webp.
