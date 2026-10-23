# B — уточнение после выбора пользователя

22 октября 2026. Пользователь выбрал B как более подходящее направление проекта из-за светлой композиции, при этом A лично нравится сильнее. Это выбор визуального направления, не разрешение на разработку и не утверждение продуктового сценария.

Обновлённый концепт: [concept-b-atelier-v2.png](concept-b-atelier-v2.png). Предыдущие A и B сохранены.

По прямому запросу пользователя: логотип школы увеличен и выделен голубым контуром на белой плашке; имя «Ученик А.» заменено на «Иван»; верхняя надпись «Демо · вымышленные проекты и работы» убрана. Это изменение концепта не делает показанные проекты реальными. Три работы и проект по-прежнему вымышлены. «Иван» — выбранное пользователем имя демонстрационного профиля, а не утверждение об авторстве работ.

Визуально проверены результат и сохранение композиции: арка, светлая сцена, проект слева, три работы справа, материалы, кнопки и две связи присутствуют. Логотип в PNG остаётся генеративным воспроизведением официального источника; точный SVG лежит в assets/vektor-official.svg.

Объяснение гипотезы: ученик выбирает интересный проект, изучает материалы для его выполнения, сохраняет проект в подборку и открывает свои связанные работы. Примеры: «Карта тихих мест» — наблюдение за шумом и местами для отдыха; «Макет двора» — предложение устройства пространства; «Свет для растений» — опыт с освещением. Пользователь запросил объяснение пользы; эти сюжеты им ещё не утверждены. Педагогический кабинет и сценарий подтверждения не возвращаются. Архитектура и приложение не создавались.

## Точный промпт правки

Инструмент: встроенный image_gen. Входы: исходный concept-b-atelier.png и assets/vektor-official-reference.png.

Use case: precise-object-edit / ui-mockup.
Edit the FIRST supplied image, the approved Vector Universe concept B, as a narrowly scoped revision. The SECOND image is the actual official school logo source, not an artistic style reference.
Preserve the entire approved composition, 16:10 landscape canvas, light museum-like architecture, huge pale-blue metal arch, glass, plants, paper map, project folio on the left, portfolio rail on the right, all materials, all three work previews, links and two blue relation curves. Keep every existing project and work text unchanged except these exact header edits:
1. Make the school's ACTUAL Cyrillic logo clearly more prominent at the upper left: increase its visible size about 30 percent, show it in a slightly larger white brand plaque with a fine school-blue #3C8FEF keyline and a very subtle pale-blue surround. Respect original logo geometry/aspect ratio, all letters, stacked wordmark and upward arrow integrated in the letter. Do not invent a V, symbol or new logo. Keep it beautifully crisp and dark on white. The school identity should lead the header; adjacent "Universe" becomes a restrained smaller blue product descriptor. Avoid crowding nav; if needed shift header nav slightly to the right only. Keep plaque within header height above the "Мой мир" title.
2. Replace account text "Ученик А." with EXACTLY "Иван" (Cyrillic И в а н). Keep the existing avatar icon and dropdown chevron.
3. Completely remove the small header dot and text "Демо · вымышленные проекты и работы". Restore the natural existing background in this region; add no replacement badge or text.
No other changes. Output one polished revised image, same view and near-identical scene, not an app or new page.
