export type Material = {
  id: string;
  name: string;
  type: string;
  blob?: Blob;
  url?: string;
};
export type Work = {
  id: string;
  title: string;
  subject: string;
  about: string;
  contribution: string;
  people: string;
  status: "ready" | "draft";
  materials: Material[];
  cover?: Blob;
  coverUrl?: string;
  link?: string;
  external?: boolean;
  demo?: boolean;
  format?: string;
  assignmentId?: string;
  published?: boolean;
  updated: number;
};
export const seeds: Work[] = [
  {
    id: "history",
    title: "Древний Египет",
    subject: "История",
    about:
      "Art History Ancient Egypt — учебная презентация об искусстве Древнего Египта. 132 страницы на английском языке.",
    contribution:
      "Внешний учебный материал, сохранённый для изучения. Авторство не принадлежит ученику.",
    people: "Michael Leonard · Humanities LibreTexts",
    status: "ready",
    external: true,
    coverUrl: "/assets/page-001.png",
    materials: [
      {
        id: "history-pdf",
        name: "Art_History_Ancient_Egypt.pdf",
        type: "application/pdf",
        url: "/assets/Art_History_Ancient_Egypt.pdf",
      },
    ],
    updated: 3,
  },
  {
    id: "prism",
    title: "Свет и призма",
    subject: "Физика",
    about:
      "Почему белый свет превращается в радугу? Иллюстрация к объяснению преломления и разложения света на спектр. Демонстрационный пример оформления работы; изображение сгенерировано, это не запись реального опыта.",
    contribution: "Описал явление и подготовил объяснение к иллюстрации.",
    people: "Иван",
    status: "ready",
    demo: true,
    format: "Иллюстрация",
    coverUrl: "/assets/prism-illustration.webp",
    materials: [
      {
        id: "prism-image",
        name: "Свет и призма.webp",
        type: "image/webp",
        url: "/assets/prism-illustration.webp",
      },
    ],
    updated: 2,
  },
  {
    id: "site",
    title: "Мой первый сайт",
    subject: "Информатика",
    about:
      "Небольшая страница о моих интересах. Пример оформления работы для демонстрации Universe.",
    contribution: "Продумал структуру и оформил страницу.",
    people: "Иван",
    status: "ready",
    demo: true,
    coverUrl: "/assets/website-preview.png",
    link: "/example-site.html",
    materials: [],
    updated: 1,
  },
];
let dbPromise: Promise<IDBDatabase> | undefined;
function db() {
  return (dbPromise ??= new Promise((resolve, reject) => {
    const r = indexedDB.open("vector-universe", 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("works", { keyPath: "id" });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}
export async function allWorks() {
  const d = await db();
  const saved = await new Promise<Work[]>((resolve, reject) => {
    const r = d.transaction("works").objectStore("works").getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  const byId = new Map(seeds.map((w) => [w.id, w]));
  saved.forEach((w) => byId.set(w.id, w));
  return [...byId.values()].sort((a, b) => b.updated - a.updated);
}
export async function saveWork(work: Work) {
  const d = await db();
  await new Promise<void>((resolve, reject) => {
    const t = d.transaction("works", "readwrite");
    t.objectStore("works").put(work);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
export async function resetWorks() {
  const d = await db();
  await new Promise<void>((resolve, reject) => {
    const t = d.transaction("works", "readwrite");
    t.objectStore("works").clear();
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}
export const sourceUrl =
  "https://human.libretexts.org/Courses/University_of_the_Pacific/Art_History_-_Prehistoric_through_Gothic/05:_Ancient_Egypt/5.01:_Ancient_Egypt_PowerPoint";
