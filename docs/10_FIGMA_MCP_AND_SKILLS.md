# Figma, MCP, агентские навыки и инструменты: вопросы для Codex

**Статус:** это исследовательская памятка с документацией. Ничего не устанавливать без согласия пользователя.

## Figma MCP

Официальные страницы:

- Figma MCP introduction: https://developers.figma.com/docs/figma-mcp-server/
- Remote server setup (рекомендуемый Figma вариант): https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Desktop/local server: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- Tools & prompts: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- Feature differences, permissions: https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/

В документации описано, что Codex app может подключить Figma plugin через Plugins; в CLI можно использовать `codex mcp add figma --url https://mcp.figma.com/mcp`. Но **не выполнять эту команду без пользовательского разрешения**, не утверждать, что сервер уже доступен. Возможность создавать/изменять дизайн зависит от прав, режима и инструментов.

MCP - транспорт к данным Figma, **не гарантия отличного дизайна**. Если макет слабый, передача его через MCP лишь поможет точно реализовать слабое решение. Сначала нужен хороший дизайнерский концепт и утверждённый источник истины.

## Что Codex должен спросить у пользователя

- Используется приложение Codex или CLI/IDE?
- Есть ли аккаунт и права Figma? Какой план? Возможна ли запись в Figma-файлы?
- Хочет ли пользователь сначала смотреть готовые Figma Community макеты, а потом корректировать их, либо генерировать собственный дизайн с нуля?
- Может ли он подключить MCP? Хочет ли это делать сейчас или после выбора макетов?
- Каким способом хочет утверждать результат: скриншот, ссылка Figma, интерактивный прототип?

## Реальные Figma-референсы: строго не выдумывать

Figma Community может содержать готовые UI kits и design files. Но **ссылки на конкретные материалы нельзя конструировать по названию**. Codex должен использовать доступные инструменты поиска, открыть и проверить выбранный файл, авторство, цену/лицензию, содержимое и доступность. Если он не может просмотреть Figma Community, нужен честный ответ и удобные поисковые ссылки/запросы.

Официальная справка Figma об UI kits: https://help.figma.com/hc/en-us/articles/24037724065943-Start-designing-with-UI-kits

Темы поиска: "editorial portfolio web design", "educational portfolio dashboard", "interactive data visualization UI", "premium SaaS landing", "school admin scheduling UI", "course marketplace UI", "project case study website", "spatial graph UI", "timeline storytelling design".

## Какие инструменты могут быть полезны (решение позднее)

1. Browser automation + screenshots для проверки реального рендера на 1440x900 / 1366x768.
2. Figma MCP для чтения фреймов, стилевых токенов, ассетов, и в доступных сценариях - создания макетов.
3. Visual QA workflow / дизайн-аудит: сравнение скриншота с утверждённым макетом и отчёт о расхождениях.
4. Canvas/3D компетенция: Three.js / React Three Fiber только после конкретного технического выбора.
5. Motion/animation skills: продуманная режиссура переходов, reduced-motion, стабильная производительность.
6. Content provenance/audit: проверка текстов и источников.
7. Accessibility audit для контраста, клавиатуры и читабельности.

Всё это не означает необходимость ставить 7 агентов. Codex должен спросить про текущие инструменты, показать минимальную конфигурацию и обосновать каждую рекомендацию. Нельзя уверенно заявлять, что конкретный plugin существует, если каталог не проверен.

## Кодекс и AGENTS.md

`AGENTS.md` может выступать устойчивыми инструкциями проекта. Он не заменяет обсуждение и отдельные промпты под конкретную задачу. Подробный контекст лучше держать в локальных документах, чтобы не перегружать каждый ход огромным повторяющимся текстом. Справка: https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex.

## Важная поправка к ожиданиям

Сгенерировать статичную картинку высокой сложности проще, чем построить соответствующую интерактивную страницу. Нужен план получения исходных ассетов, отдельные слои, motion choreography, бюджет производительности и интерактивные состояния. Если Figma-макет красиво изображает 3D, это ещё не означает, что его можно реализовать без готовых 3D-ассетов, времени и опыта. Codex должен сравнить варианты: WebGL, качественные иллюстрации + CSS motion, SVG/Canvas graph, гибрид.
