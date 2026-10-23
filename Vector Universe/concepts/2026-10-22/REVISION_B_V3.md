# B v3 — оригинальный логотип

22 октября 2026. Файл: [concept-b-atelier-v3-official-logo.png](concept-b-atelier-v3-official-logo.png).

Генератор исказил буквы в v2. По прямому запросу пользователя в v3 использован оригинальный assets/vektor-official.svg: исходные векторные контуры и цвет сохранены, удалены только внешние прозрачные поля при техническом рендере. Генератор использован для очистки прежнего знака и подписи; результат очистки взят только в небольшой области бренда. Официальный SVG и отдельная подпись Universe наложены точно через sharp. Остальная картинка взята из v2.

Для оптического выравнивания учтена асимметричная стрелка: вертикальный центр по альфа-массе знака помещён на y=72, подпись Universe выровнена с ним. Белая плашка и голубой контур сохранены. Параметры: assets/brand-placement.json. Воспроизводимый инструмент обработки статичного концепта: compose-official-brand.cjs; это не приложение.

Визуально просмотрен итоговый файл. Важно: проектные тексты и примеры на этом изображении остаются прежними поисковыми вариантами, которые пользователь не выбрал. Актуальный продуктовый смысл зафиксирован в ../../PRODUCT_DIRECTION_2026-10-22.md. v3 исправляет бренд, но ещё не является макетом согласованного функционала.

## Промпт очистки

Встроенный image_gen; вход — concept-b-atelier-v2.png.

Use case: precise-object-edit. Edit the supplied approved Vector Universe concept B only to prepare an empty branding area for exact placement of an ORIGINAL VECTOR LOGO. Preserve the entire image pixel composition, all architecture, controls, text, three work thumbnails, account Иван and navigation.
ONLY remove the fake hand-drawn school lettering and arrow INSIDE the top-left white rounded logo plaque. Leave the existing white plaque and its thin blue outline completely intact, now BLANK WHITE INSIDE. Also erase the blue word Universe immediately to its right, restoring the light grey background under that word naturally. Do not draw ANY replacement logo or product lettering. This blank area will receive the authentic SVG outside the generator. Do not touch anything else. Output same landscape dimensions and frame.
