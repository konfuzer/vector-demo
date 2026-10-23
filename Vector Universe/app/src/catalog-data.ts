export type Assignment = {
  id: string;
  title: string;
  subject: string;
  result: string;
  format: string;
  summary: string;
  task: string;
  prepare: string[];
  image: string;
  hero?: string;
  materials: { name: string; url: string; type: string }[];
};
export const assignments: Assignment[] = [
  {
    id: "book-site",
    title: "Сайт о любимой книге",
    subject: "Информатика",
    result: "небольшой сайт",
    format: "Сайт",
    summary: "Собери страницу о книге, которую хочется посоветовать.",
    task: "Сделай страницу о книге, которую хочешь порекомендовать. Расскажи, чем она интересна, и продумай собственное оформление.",
    prepare: [
      "Название и автор книги",
      "Почему ты её рекомендуешь",
      "Собственное оформление страницы",
    ],
    image: "/assets/catalog/book.webp",
    hero: "/assets/catalog/book-hero.webp",
    materials: [
      {
        name: "План страницы",
        url: "/materials/book-site-plan.html",
        type: "HTML",
      },
      {
        name: "Пример структуры сайта",
        url: "/materials/book-site-example.html",
        type: "HTML",
      },
    ],
  },
  {
    id: "physics",
    title: "Объясни физическое явление",
    subject: "Физика",
    result: "короткое видео",
    format: "Видео",
    summary: "Покажи опыт и объясни, что происходит.",
    task: "Выбери понятное физическое явление, проведи безопасное наблюдение и сними короткое объяснение. Расскажи, что ты ожидал и что увидел.",
    prepare: [
      "Вопрос и предположение",
      "Безопасный план наблюдения",
      "Короткое объяснение результата",
    ],
    image: "/assets/catalog/physics.webp",
    hero: "/assets/prism-illustration.webp",
    materials: [
      {
        name: "План наблюдения",
        url: "/materials/physics-plan.html",
        type: "HTML",
      },
    ],
  },
  {
    id: "object-history",
    title: "История одного предмета",
    subject: "История",
    result: "презентация",
    format: "Презентация",
    summary: "Исследуй происхождение привычной вещи.",
    task: "Выбери повседневный предмет и выясни, как он появился и менялся. Покажи ход исследования и укажи источники.",
    prepare: [
      "Предмет и вопрос исследования",
      "Проверенные источники",
      "Несколько слайдов с выводами",
    ],
    image: "/assets/catalog/compass.webp",
    hero: "/assets/catalog/compass-detail.webp",
    materials: [
      {
        name: "План исследования",
        url: "/materials/object-history-plan.html",
        type: "HTML",
      },
    ],
  },
  {
    id: "photo-day",
    title: "Один день в кадре",
    subject: "Творчество",
    result: "фотосерия",
    format: "Фото",
    summary: "Расскажи историю средствами фотографии.",
    task: "Собери небольшую фотосерию об одном дне или событии. Продумай начало, развитие и финал, выбери только важные кадры и добавь подписи.",
    prepare: [
      "Тема и последовательность",
      "Собственные фотографии",
      "Короткие подписи к кадрам",
    ],
    image: "/assets/catalog/camera.webp",
    hero: "/assets/catalog/reflections-detail.webp",
    materials: [
      {
        name: "План фотосерии",
        url: "/materials/photo-day-plan.html",
        type: "HTML",
      },
    ],
  },
];
export type Exhibit = {
  id: string;
  title: string;
  subject: string;
  category: string;
  format: string;
  summary: string;
  author: string;
  people: { name: string; role: string }[];
  image: string;
  images: string[];
  link?: string;
  materials?: { name: string; url: string }[];
};
export const exhibits: Exhibit[] = [
  {
    id: "bridge",
    title: "Как устроен мост",
    subject: "Физика",
    category: "Исследования",
    format: "Исследование",
    summary:
      "Исследовали, как форма опор влияет на устойчивость бумажного моста. В работе — конструкция, сравнение вариантов и описание наблюдений.",
    author: "Команда «Опора»",
    people: [
      { name: "София", role: "Конструкция и сборка" },
      { name: "Михаил", role: "Испытания и фотографии" },
    ],
    image: "/assets/bridge-preview.png",
    images: [
      "/assets/bridge-preview.png",
      "/assets/catalog/bridge-detail-large.webp",
      "/assets/catalog/bridge-front-large.webp",
    ],
    materials: [
      { name: "Описание модели", url: "/materials/bridge-example.html" },
    ],
  },
  {
    id: "book",
    title: "Сайт о любимой книге",
    subject: "Информатика",
    category: "Сайты",
    format: "Сайт",
    summary:
      "Страница о книге: герои, мир, впечатления и собственное оформление.",
    author: "Мария",
    people: [{ name: "Мария", role: "Структура и оформление страницы" }],
    image: "/assets/catalog/book-site.webp",
    images: ["/assets/catalog/book-site.webp"],
    link: "/example-book.html",
  },
  {
    id: "reflections",
    title: "Город в отражениях",
    subject: "Творчество",
    category: "Творчество",
    format: "Фотосерия",
    summary:
      "Как город раскрывается в отражениях: в воде, стекле и неожиданных ракурсах.",
    author: "Артём",
    people: [{ name: "Артём", role: "Тема фотосерии и выбор кадров" }],
    image: "/assets/catalog/reflections.webp",
    images: ["/assets/catalog/reflections-detail.webp"],
  },
  {
    id: "light",
    title: "Свет и цвет",
    subject: "Физика",
    category: "Исследования",
    format: "Иллюстрация",
    summary: "Объяснение того, как белый свет разлагается на спектр.",
    author: "Команда «Спектр»",
    people: [
      { name: "Анна", role: "Объяснение явления" },
      { name: "Лев", role: "Оформление материала" },
    ],
    image: "/assets/prism-illustration.webp",
    images: ["/assets/prism-illustration.webp"],
  },
  {
    id: "compass",
    title: "История обычной вещи",
    subject: "История",
    category: "Исследования",
    format: "Исследование",
    summary:
      "От простого указателя направления до привычного инструмента путешественника: история компаса.",
    author: "София",
    people: [{ name: "София", role: "Поиск источников и оформление" }],
    image: "/assets/catalog/compass.webp",
    images: ["/assets/catalog/compass-detail.webp"],
  },
];
