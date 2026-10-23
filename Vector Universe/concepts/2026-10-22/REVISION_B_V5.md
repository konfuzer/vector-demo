# B v5 — единая арка и логотип без рамки

22 октября 2026. Актуальный визуал: [concept-b-atelier-v5-fixed-arch.png](concept-b-atelier-v5-fixed-arch.png).

Прямые решения пользователя: убрать кастомизацию арки, сохранить качественную интерактивность; полностью убрать белую обводку/плашку логотипа, оставить знак школы. Ответы на следующий блок вопросов: просмотр школьной выставки, соавторы совместных работ, режим показа родителю без отдельного входа. Обратную связь и оценивание пропустить.

В концепте сохранены сцена и три учебных примера. Убрано «Оформить мир»; осталась одна глобальная кнопка «Добавить работу». Слева «Редактировать» относится к содержанию работы, а не к сцене.

Официальный assets/vektor-official.svg вставлен напрямую через sharp после очистки фонового участка встроенным image_gen: обрезаны только внешние прозрачные поля, видимая ширина 216 px, координаты x=54,y=10. В левом верхнем углу нет белой плашки, голубой рамки, свечения или подписи Universe рядом со знаком. Сам логотип содержит оригинальные надписи школы и векторные контуры; он не перерисован генератором.

Интерактивность предложена как выбор экспоната → плавный фокус → материалы работы. В статичном изображении это обозначено выбранной карточкой и линиями связей; реальная анимация не реализована и технология не выбрана.

Итоговый файл открыт визуально: логотип присутствует, плашки нет, кнопки кастомизации нет, все три работы и материалы сохранены. Это визуальный концепт, не приложение. Все проекты и материалы остаются вымышленными примерами.

Актуальные решения о ролях и функциях — в ../../PRODUCT_DIRECTION_2026-10-22.md. Статусы и отзывы по работам в макет не добавлялись. Школьная выставка, соавторы и родительский режим требуют следующих макетов; текущая картинка показывает только личную выставку.

## Промпт изменения

Use case: precise-object-edit / ui-mockup.
Edit the supplied Vector Universe concept image with ONLY these changes. Keep the approved light architectural studio, blue aluminium arch, all three exhibits, left selected history presentation panel, right work cards, all text, selection curves, header navigation and account Иван.
1. Completely remove the entire top-left white rounded branding panel, blue outline, pale-blue outer glow, existing school lettering and word Universe. Restore a natural uninterrupted light grey/white architectural background across x=25..460,y=5..142 of the 1586x992 image. Leave this region EMPTY OF TEXT and badges: the actual official school SVG will be placed there exactly in a separate deterministic composition after this generation. No new logo, no Universe word, no white rectangle or border.
2. Remove the bottom "Оформить мир" control and its icon. Recompose the bottom floating toolbar as ONE centred white pill containing ONLY the blue plus icon and "Добавить работу". No customisation, colour picker, decor tool, drag handles or edit-scene controls anywhere. The existing "Редактировать" button in the left WORK panel stays: it edits the work contents, NOT the environment.
3. The arch remains a fixed authored interactive exhibition, selection curves and work objects stay exactly as before. Do not add chat, grades, comments, teachers or parental interfaces, as those decisions are pending.
No other changes, same frame and landscape dimensions.
