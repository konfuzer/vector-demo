import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  UserRound,
  Check,
  Image,
  Maximize,
  Globe,
  Atom,
  Camera,
  Landmark,
} from "lucide-react";
import {
  assignments,
  exhibits,
  type Assignment,
  type Exhibit,
} from "./catalog-data";
import type { Work } from "./data";
type Props = {
  route: string;
  works: Work[];
  go: (route: string) => void;
  onStart: (task: Assignment) => Promise<void>;
  renderPublished: (work: Work) => ReactNode;
};
const icons: Record<string, typeof BookOpen> = {
  Информатика: Globe,
  Физика: Atom,
  История: Landmark,
  Творчество: Camera,
};
function Subject({ subject }: { subject: string }) {
  const Icon = icons[subject] ?? BookOpen;
  return (
    <span className={`subject-badge subject-${subject}`}>
      <Icon size={19} />
      {subject}
    </span>
  );
}
function Resource({
  name,
  url,
  type = "HTML",
}: {
  name: string;
  url: string;
  type?: string;
}) {
  return (
    <div className="resource">
      <FileText size={27} />
      <a href={url} target="_blank" rel="noreferrer">
        <strong>{name}</strong>
        <small>{type} · учебный пример</small>
      </a>
      <a
        className="icon-button"
        href={url}
        download
        aria-label={`Скачать: ${name}`}
      >
        <Download size={19} />
      </a>
      <a
        className="icon-button"
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Открыть: ${name}`}
      >
        <ExternalLink size={18} />
      </a>
    </div>
  );
}
export default function Catalogs(props: Props) {
  return props.route.startsWith("school") ? (
    <School {...props} />
  ) : (
    <Exhibition
      route={props.route}
      go={props.go}
      works={props.works}
      renderPublished={props.renderPublished}
    />
  );
}
function School({ route, works, go, onStart }: Props) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("Все направления");
  const [format, setFormat] = useState("Любой результат");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = route.split("/")[1];
  const task = assignments.find((t) => t.id === id);
  const existing = works.find((w) => w.assignmentId === task?.id && task);
  if (id && !task)
    return (
      <main className="page">
        <button className="back" onClick={() => go("school")}>
          <ArrowLeft size={19} />
          Проекты школы
        </button>
        <div className="glass empty-state">
          <h1>Проект не найден</h1>
        </div>
      </main>
    );
  if (task)
    return (
      <main className="page brief-page">
        <button className="back" onClick={() => go("school")}>
          <ArrowLeft size={19} />
          Проекты школы
        </button>
        <div className="brief-grid">
          <article className="glass brief-main">
            <h1>{task.title}</h1>
            <p className="subtitle">
              {task.subject} · {task.format}
            </p>
            <img
              className="brief-hero"
              src={task.hero ?? task.image}
              alt="Иллюстрация задания"
            />
            <section>
              <h2>Задача</h2>
              <p>{task.task}</p>
            </section>
            <section>
              <h2>Что подготовить</h2>
              <ul className="preparation-list">
                {task.prepare.map((t) => (
                  <li key={t}>
                    <span>
                      <Check size={17} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Материалы</h2>
              <div className="resources-grid">
                {task.materials.map((m) => (
                  <Resource key={m.url} {...m} />
                ))}
              </div>
            </section>
          </article>
          <aside className="glass brief-result">
            <h2>Результат проекта</h2>
            <p>
              {task.id === "book-site"
                ? "Ссылка на небольшой сайт и короткое описание твоего вклада."
                : `${task.result.charAt(0).toUpperCase() + task.result.slice(1)} и короткое описание твоего вклада.`}
            </p>
            <div className="result-illustration">
              <div className="browser-dots">
                <i />
                <i />
                <i />
              </div>
              <div className="result-browser">
                <span />
                <span />
                <div />
                <span />
              </div>
            </div>
            <section>
              <h2>Как начать</h2>
              <p>
                В портфолио появится личный черновик. Материалы можно добавить
                позже.
              </p>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await onStart(task);
                  } catch {
                    setError("Не удалось создать черновик. Попробуй ещё раз.");
                    setBusy(false);
                  }
                }}
              >
                <FileText size={22} />
                {busy
                  ? "Открываем…"
                  : existing
                    ? "Открыть свою работу"
                    : "Начать проект"}
              </button>
              <small className="project-state">
                {existing ? (
                  <>
                    <Check size={17} />
                    Уже в твоём портфолио
                  </>
                ) : (
                  <>Проект ещё не начат</>
                )}
              </small>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
            </section>
            <small className="helper">Пример задания для демонстрации.</small>
          </aside>
        </div>
      </main>
    );
  const filtered = assignments.filter(
    (t) =>
      t.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (subject === "Все направления" || t.subject === subject) &&
      (format === "Любой результат" || t.format === format),
  );
  return (
    <main className="page catalog-page">
      <div className="page-heading">
        <div>
          <h1>Проекты школы</h1>
          <p>Выбери задачу и начни свою работу</p>
        </div>
      </div>
      <div className="catalog-tools glass">
        <label className="search">
          <Search size={21} />
          <input
            aria-label="Поиск проектов"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти проект"
          />
        </label>
        <select
          aria-label="Направление проекта"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {[
            "Все направления",
            "Информатика",
            "Физика",
            "История",
            "Творчество",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Результат проекта"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          {["Любой результат", "Сайт", "Видео", "Презентация", "Фото"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </div>
      <p className="catalog-label">Примеры заданий</p>
      <div className="assignment-grid">
        {filtered.map((t) => (
          <article className="assignment-card glass" key={t.id}>
            <img src={t.image} alt="" />
            <div>
              <Subject subject={t.subject} />
              <h2>{t.title}</h2>
              <p>{t.summary}</p>
              <div className="expected-result">
                <FileText size={25} />
                <span>
                  Результат:<strong>{t.result}</strong>
                </span>
              </div>
              <button
                className="button primary"
                onClick={() => go(`school/${t.id}`)}
              >
                Подробнее
                <ArrowRight size={20} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="glass empty-state">
          <h2>Проекты не найдены</h2>
          <p>Попробуй другое название или направление.</p>
        </div>
      )}
    </main>
  );
}
function Exhibition({
  route,
  go,
  works,
  renderPublished,
}: Pick<Props, "route" | "go" | "works" | "renderPublished">) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("Все направления");
  const [category, setCategory] = useState("Все");
  const selected = exhibits.find((e) => e.id === route.split("/")[1]);
  if (selected)
    return <ExhibitDetail key={selected.id} item={selected} go={go} />;
  const visible = exhibits.filter(
    (e) =>
      (e.title + " " + e.author)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (subject === "Все направления" || e.subject === subject) &&
      (category === "Все" || e.category === category),
  );
  const own = works.filter((w) => {
    const ownCategory = w.link
      ? "Сайты"
      : w.subject === "Творчество"
        ? "Творчество"
        : "Исследования";
    return (
      w.published &&
      w.status === "ready" &&
      !w.external &&
      (w.title + " " + w.people)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (subject === "Все направления" || w.subject === subject) &&
      (category === "Все" || ownCategory === category)
    );
  });
  return (
    <main className="page exhibition-page">
      <div className="page-heading">
        <div>
          <h1>Школьная выставка</h1>
          <p>Работы учеников и команд</p>
        </div>
      </div>
      <div className="catalog-tools glass exhibition-tools">
        <label className="search">
          <Search size={21} />
          <input
            aria-label="Поиск на выставке"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти работу"
          />
        </label>
        <select
          aria-label="Направление выставки"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {[
            "Все направления",
            "Физика",
            "Информатика",
            "История",
            "Творчество",
            ...works
              .filter((w) => w.published)
              .map((w) => w.subject)
              .filter(
                (s, i, all) =>
                  !["Физика", "Информатика", "История", "Творчество"].includes(
                    s,
                  ) && all.indexOf(s) === i,
              ),
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="exhibit-filters">
          {["Все", "Исследования", "Сайты", "Творчество"].map((c) => (
            <button
              key={c}
              className={c === category ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {own.length > 0 && (
        <section className="published-section">
          <h2>Твои работы на выставке</h2>
          <p className="local-note">
            В локальном демо публикации видны только в этом браузере. Работа
            остаётся в портфолио.
          </p>
          <div className="portfolio-grid">{own.map(renderPublished)}</div>
        </section>
      )}
      <p className="catalog-label">
        Демонстрационная подборка · свои готовые работы можно добавить кнопкой
        «На выставку»
      </p>
      <div className="exhibition-grid">
        {visible.map((item, i) => (
          <button
            className={`exhibit-card glass ${i === 0 && visible.length === 5 ? "featured" : ""}`}
            key={item.id}
            onClick={() => go(`exhibition/${item.id}`)}
          >
            <img src={item.image} alt="" />
            <div className="exhibit-copy">
              <h2>{item.title}</h2>
              <p className="exhibit-meta">
                {item.format} · {item.subject}
              </p>
              <p className="exhibit-summary">{item.summary}</p>
              <div className="exhibit-author">
                <span className="avatar">
                  <UserRound size={18} />
                </span>
                {item.author}
                <span className="card-arrow">
                  <ArrowRight size={19} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {!visible.length && !own.length && (
        <div className="glass empty-state">
          <h2>Работы не найдены</h2>
          <p>Попробуй другой запрос или направление.</p>
        </div>
      )}
    </main>
  );
}
function ExhibitDetail({ item, go }: { item: Exhibit; go: Props["go"] }) {
  const [index, setIndex] = useState(0);
  const [viewError, setViewError] = useState("");
  return (
    <main className="page detail-page exhibit-detail">
      <button className="back" onClick={() => go("exhibition")}>
        <ArrowLeft size={19} />
        Выставка
      </button>
      <div className="page-heading">
        <div>
          <h1>{item.title}</h1>
          <p>
            {item.format} · {item.subject}
          </p>
        </div>
      </div>
      <div className="detail-grid">
        <section className="glass material-panel">
          <div className="exhibit-view" id="exhibit-view">
            <div className="viewer-toolbar">
              <Image size={22} />
              <span className="filename">
                {item.id === "bridge" ? "Макет моста" : item.title} ·
                изображение
              </span>
              <span>
                {index + 1} / {item.images.length}
              </span>
              <a
                className="icon-button"
                href={item.images[index]}
                download
                aria-label="Скачать изображение выставки"
              >
                <Download size={19} />
              </a>
              <button
                className="icon-button"
                aria-label="Развернуть изображение"
                onClick={() => {
                  void document
                    .getElementById("exhibit-view")
                    ?.requestFullscreen()
                    .catch(() =>
                      setViewError(
                        "Полноэкранный режим недоступен. Изображение можно скачать.",
                      ),
                    );
                }}
              >
                <Maximize size={19} />
              </button>
            </div>
            {item.link ? (
              <iframe
                className="exhibit-site"
                src={item.link}
                title="Сайт работы на выставке"
                sandbox="allow-same-origin"
              />
            ) : (
              <img
                className="exhibit-large"
                src={item.images[index]}
                alt={item.title}
              />
            )}
            {item.images.length > 1 && (
              <div className="exhibit-thumbs">
                {item.images.map((image, i) => (
                  <button
                    key={image}
                    className={index === i ? "selected" : ""}
                    onClick={() => setIndex(i)}
                    aria-label={`Изображение ${i + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
            {viewError && (
              <p className="helper" role="status">
                {viewError}
              </p>
            )}
          </div>
        </section>
        <aside className="glass about-panel">
          <section>
            <h2>О работе</h2>
            <p>{item.summary}</p>
          </section>
          <section>
            <h2>Участники</h2>
            <p>{item.author}</p>
            <div className="exhibit-people">
              {item.people.map((p) => (
                <div className="person" key={p.name}>
                  <span className="avatar">{p.name[0]}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>Вклад участников</h2>
            {item.people.map((p) => (
              <p key={p.name}>
                {p.name} — {p.role.toLocaleLowerCase()}.
              </p>
            ))}
          </section>
          <section>
            <h2>Материалы</h2>
            {item.materials?.map((m) => (
              <Resource key={m.url} {...m} />
            ))}
            {item.link && (
              <a
                className="attachment"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                <Globe size={21} />
                <span>Открыть сайт</span>
                <ExternalLink size={18} />
              </a>
            )}
            <a className="attachment" href={item.images[index]} download>
              <Image size={21} />
              <span>Иллюстрация работы</span>
              <Download size={18} />
            </a>
            <p className="helper">
              Демонстрационный пример. Имена, работы и изображения подготовлены
              для показа; это не фактические данные школы.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
