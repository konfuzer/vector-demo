# Мягкое движение и три подвеса · 23.10.2026

Использован встроенный ImageGen только для удаления нарисованных проводов. Сама анимация и три подвеса — SVG/CSS, без Three.js и без повторной 3D-переделки. Все изменения внутри Vector Universe; Flow только прочитан как источник стиля подписи.

## Файлы

- universe-wireless-v3.png — цельная сцена без встроенных проводов, 1586×992.
- universe-background-wireless-v3.png — анимационная подложка без встроенных проводов, 1586×992.
- ../../app/public/assets/artwork/universe-scene-v3.webp — выбранный экспорт 3200×2006, 1 278 190 байт.
- ../../app/public/assets/artwork/universe-background-v3.webp — выбранный экспорт 3200×2006, 1 245 546 байт.

Воспроизводимый технический экспорт: из app/ выполнить node prepare-artwork-v2.cjs v3. Это производный размер для показа, не нативная 2K-генерация. Версии v2 сохранены как история; приложение использует v3.

## Подвесы и движение

Artwork.tsx рисует ровно три неподвижных тонких подвеса. Слева и справа — подвесы внешнего кольца; средний идёт к внутреннему. Вшитые в фотографию четыре линии удалены. По последнему уточнению пользователя нити больше не следуют движению колец. Силуэты металла в маске повторяют только движение самих колец и перекрывают неподвижные нити: центральная проходит за большим кольцом, правая доходит до его края без наложения на лицевую поверхность. Верх скрыт за внутренним проёмом арки. При reduced-motion и на мобильном постере все три подвеса также неподвижны.

Лента: цикл 20 с, наклон до 0.55 градуса и изменение ширины до 2.5%. Кольца: малый поворот вокруг вертикальной оси (rotateY), ±5 градусов / 22 с и ±6 градусов / 18 с; поворот в плоскости экрана, как у стрелки часов, убран. Это CSS-проекция фотографического слоя, не новая 3D-модель. Общая левитация стекла 7 px и четыре небольших самостоятельных движения ±4 px с разной фазой. Значения в координатах иллюстрации 1584×993. Обратная сторона не создаётся. Пользователь прямо выбрал эту лёгкую имитацию без сложной переделки.

Солнечная подсветка карточек слева одобрена пользователем и сохранена. Синий обводящий контур убран. Фоновая комната при навигации использует прежний environment.webp, разный масштаб/смещение и плавный CSS-переход; новые виды комнаты не генерировались.

## Промпт удаления проводов

Use case: precise-object-edit. Strict retouch of this exact input picture: remove ONLY the thin suspension wires hanging vertically inside the top-middle of the blue arch (approximately x720 to x830, y160 to y540 in the 1586x992 frame). Inpaint those hairline wires seamlessly using adjacent background pixels. Keep every other pixel's appearance: same exact camera, scale, all blue arch contours and engraving, stone bases, chrome platforms, leaves, window mullions, white wall seams, floor reflections, lighting and colors. Do NOT remove architectural window mullions, do NOT redesign anything. NO replacement wires: three precise supports will be drawn separately in the app. Keep same full image framing and aspect ratio. No text or UI.

К цельной сцене добавлено: Preserve BOTH metal rings, spiral and every glass disc exactly; remove only the hairline supports.

К подложке добавлено: This is the empty animation plate: retain every pedestal and arch; no art objects should be added.

