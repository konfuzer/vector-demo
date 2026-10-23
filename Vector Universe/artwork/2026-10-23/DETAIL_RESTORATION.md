# Восстановление детализации сцены · 23.10.2026

Использован встроенный ImageGen, не CLI/API. Цель — повысить чёткость исходной принятой композиции без изменения камеры, предметов и цветового решения. Официальный логотип генератору не поручался; он остаётся настоящим SVG в интерфейсе.

## Выбранные файлы

- universe-restored-v2.png — восстановленная сцена, **1586×992**; выбран первый результат детализации.
- universe-background-v2.png — соответствующая подложка без предметов, **1586×992**.
- ../../app/public/assets/artwork/universe-scene-v2.webp — экспорт **3200×2006**, quality 98, 1 378 110 байт.
- ../../app/public/assets/artwork/universe-background-v2.webp — экспорт **3200×2006**, quality 98, 1 322 812 байт.

Пути к public выше приведены относительно папки artwork/2026-10-23: фактически файл находится в Vector Universe/app/public/assets/artwork/. Воспроизводимый экспорт: app/prepare-artwork-v2.cjs (техническое масштабирование Lanczos и кодирование WebP, без дополнительной генерации). Исходные версии сохранены. Встроенный генератор дважды вернул 1586×992 при запросе большего разрешения. Поэтому 3200×2006 — размер производного файла, **не нативный 2K/4K и не доказательство новой детализации**. Улучшение фактур происходит в восстановленном исходнике, а не за счёт изменения числа пикселей при экспорте.

SVG-слои сохраняют координаты композиции 1584×993. Движение света ограничено масками металла/стекла. Нет мышиного управления сценой. При reduced-motion используется цельный постер.

## Промпт выбранного восстановления

Use case: precise-object-edit. Asset: high-resolution photographic website hero, 16:10. Input image is the exact approved edit target. Produce a faithful high resolution restoration of this SAME picture at 3200 x 2000 pixels, for a 2K screen. Restore fine crisp detail on the brushed polished blue metal arch, folded chrome ribbon, silver hanging rings, transparent glass lime discs, pale stone, plants and floor reflections. Keep the exact camera angle, framing, geometry, positions and proportions of EVERY object, the lighting direction, palette, exposure, the depth of field, original background and negative spaces. Do not redesign the scene. Preserve photographic luxury architectural visualization quality; crisp metal and glass with realistic reflections, no cartoon shading, no new props, no text, no UI or logo, no decorative particles. This is detail restoration at a higher native resolution, not a new composition. Output full image, no cropping.

## Повторная попытка получить нативный большой файл (не выбран)

Restore and upscale this exact reference photo into a very high resolution 4K wallpaper. Output resolution must be 3840 by 2400 pixels (or maximum supported resolution with exactly the same aspect ratio). This is the same composition, no redesign. Intended for a fullscreen 2560x1600 display, so native high detail is essential. Retain every object in the same position and size: etched blue chrome arch, intricate blue silver spiral on left, two nested hanging rings center, four lime and clear glass discs at right, plants, white stone bases, all reflections and sunlight. Restore fine photographic texture and crisp edges, keep realistic depth and reflective materials. No UI, text, watermark, new objects, cropping or cartoon look. Please output the highest native resolution possible.

Результат снова 1586×992. Не выдаётся за 4K и не используется в приложении.

## Промпт подложки v2

Use case: precise-object-edit. Edit target is this exact restored atrium photograph. Remove ONLY these four decorative objects: the tall blue chrome twisting ribbon on the left pedestal, both silver suspended concentric rings at center, and the four lime/clear glass discs on the right. Inpaint only the areas they occupy with the continuation of the existing background, keep the hanging thin wires if necessary. Preserve EVERY other pixel's appearance, all exact camera geometry, the large blue metallic arch, all stone pedestals, metallic platforms, floor reflections, etched texture, background plants, windows, sunlight and contrast. Do not remove arch or pedestals. Do not simplify materials. This is a matching empty photographic animation plate for the exact image, not a new scene. No text/UI. Same full framing and aspect ratio, highest available resolution.

