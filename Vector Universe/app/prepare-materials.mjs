import fs from "node:fs/promises";
import path from "node:path";
import { assignments } from "./src/catalog-data.ts";
const out = path.resolve("public/materials");
await fs.mkdir(out, { recursive: true });
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const style = `*{box-sizing:border-box}body{font:17px/1.6 Arial,sans-serif;color:#243c64;margin:0;background:#edf5ff;padding:40px 6vw}main{max-width:940px;margin:auto;background:white;border:1px solid #fff;border-radius:26px;padding:50px;box-shadow:0 12px 60px #527fa512}.brand{color:#3c8fef;font-size:22px;margin-bottom:35px}h1{font-size:40px;letter-spacing:-.04em;line-height:1.15;color:#152a4b}h2{font-size:24px;letter-spacing:-.02em;margin-top:30px}p,li{color:#5a7195}li{margin:9px 0}.note{font-size:13px;color:#7d8fa7;border-top:1px solid #e0eaf7;padding-top:20px;margin-top:35px}.tag{display:inline-block;padding:7px 14px;border-radius:25px;background:#d4ed85;font-size:13px}a{color:#086afa}pre{background:#f2f6fc;padding:20px;overflow:auto;border-radius:14px}button{font:inherit;border:0;border-radius:13px;padding:11px 20px;background:#3c8fef;color:white;cursor:pointer}@media(max-width:600px){body{padding:15px}main{padding:25px}h1{font-size:30px}}@media print{body{background:white;padding:0}main{box-shadow:none;padding:20px;border:0}button{display:none}}`;
const shell = (title, body) =>
  `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · Vector Universe</title><style>${style}</style></head><body><main><div class="brand">Vector Universe <span class="tag">Материал проекта</span></div><h1>${esc(title)}</h1>${body}<p class="note">Подготовлено для локальной демонстрации Vector Universe. Это пример учебного материала, не утверждённое задание школы.</p><button onclick="window.print()">Распечатать или сохранить как PDF</button></main></body></html>`;
for (const t of assignments) {
  const body = `<h2>Задача</h2><p>${esc(t.task)}</p><h2>Что подготовить</h2><ol>${t.prepare.map((x) => `<li>${esc(x)}</li>`).join("")}</ol><h2>План работы</h2><ol><li>Сформулируй главную мысль или вопрос.</li><li>Набросай структуру: начало, основные части, вывод.</li><li>Подготовь собственные материалы и укажи использованные источники.</li><li>Проверь, что материал открывается, подпиши его и добавь в портфолио.</li></ol><h2>Готовый результат</h2><p>${esc(t.result)}. В описании работы расскажи, что получилось, какой вклад ты внёс и кто помогал.</p><h2>Перед сохранением</h2><p>Название понятно без объяснений. Материал читается или воспроизводится. Ссылки открываются. Участники и источники указаны.</p>`;
  await fs.writeFile(
    path.join(out, t.id + "-plan.html"),
    shell(t.materials[0].name + " · " + t.title, body),
  );
}
const example = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ветер в соснах · пример сайта</title><style>${style}body{background:#faf7ee}nav{display:flex;gap:25px;flex-wrap:wrap}nav a{font-size:14px;color:#3c5268}h1{font-family:Georgia,serif;font-size:65px;max-width:600px}section{padding:20px 0;border-bottom:1px solid #e6e5dd}.hero{background:linear-gradient(130deg,#d4ed85,#e0eff2);padding:40px;border-radius:20px;margin-top:35px}.hero p{font-size:20px}article{display:grid;grid-template-columns:1fr 1fr;gap:25px}@media(max-width:600px){h1{font-size:45px}.hero{padding:20px}article{display:block}}</style></head><body><main><nav><a href="#about">О книге</a><a href="#world">Мир</a><a href="#impressions">Впечатления</a></nav><div class="hero"><h1>Ветер<br>в соснах</h1><p>Небольшая история о путешествии, дружбе и внимании к миру.</p></div><section id="about"><h2>Почему я выбрал эту книгу</h2><p>Пример: расскажи своими словами, что тебя впечатлило. Чем история запомнилась? Какую мысль хочется обсудить?</p></section><article><section id="world"><h2>Мир истории</h2><p>Опиши место действия и важные детали. Добавь собственную иллюстрацию или материал с указанным источником.</p></section><section id="impressions"><h2>Мои впечатления</h2><p>Что изменилось после чтения? Кому и почему ты порекомендуешь эту книгу?</p></section></article><p class="note">Демонстрационный шаблон. «Ветер в соснах» здесь — вымышленный пример; это не цитаты из реальной книги и не работа ученика школы.</p></main></body></html>`;
await fs.writeFile(path.join(out, "book-site-example.html"), example);
await fs.writeFile(path.resolve("public/example-book.html"), example);
await fs.writeFile(
  path.join(out, "bridge-example.html"),
  shell(
    "Как устроен мост · описание модели",
    `<h2>Идея</h2><p>Сравнить, как форма опор и соединений влияет на устойчивость бумажной конструкции.</p><h2>Конструкция</h2><p>В иллюстрации показаны две опоры и соединяющий их пролёт с повторяющимися треугольными элементами.</p><h2>Как оформить исследование</h2><ol><li>Нарисовать схему модели и обозначить части.</li><li>Записать, что сравнивается, а что остаётся неизменным.</li><li>Зафиксировать наблюдения фотографиями.</li><li>Описать выводы и ограничения.</li></ol><h2>Участники</h2><p>София — конструкция и сборка. Михаил — испытания и фотографии.</p><p>Имена и проект демонстрационные. Иллюстрации сгенерированы; результатов фактического испытания школы здесь нет.</p>`,
  ),
);
console.log("7 local readable materials created.");
