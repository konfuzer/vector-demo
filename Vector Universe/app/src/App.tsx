import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Eye,
  Pencil,
  X,
  Download,
  ExternalLink,
  FileText,
  Upload,
  UserRound,
  ChevronDown,
  RotateCcw,
  Check,
  GalleryHorizontalEnd,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import Artwork from "./Artwork";
import Catalogs from "./Catalogs";
import type { Assignment } from "./catalog-data";
import {
  allWorks,
  saveWork,
  resetWorks,
  seeds,
  sourceUrl,
  type Work,
  type Material,
} from "./data";
const PdfViewer = lazy(() => import("./PdfViewer"));
function useBlobUrl(blob?: Blob, fallback = "") {
  const [url, setUrl] = useState(fallback);
  useEffect(() => {
    if (!blob) {
      setUrl(fallback);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob, fallback]);
  return url;
}
function Cover({ work }: { work: Work }) {
  const image =
    work.cover ?? work.materials.find((m) => m.type.startsWith("image/"))?.blob;
  const url = useBlobUrl(image, work.coverUrl);
  return url ? (
    <img src={url} alt="" className="cover" />
  ) : (
    <div className="cover empty-cover">
      {work.materials.some((m) => m.type.startsWith("video/")) ? (
        <Play />
      ) : (
        <FileText />
      )}
      <span>{work.subject}</span>
    </div>
  );
}
function kind(work: Work) {
  return (
    work.format ??
    (work.external
      ? "Учебный материал"
      : work.link
        ? "Сайт"
        : work.materials[0]?.type.startsWith("video/")
          ? "Видео"
          : work.materials[0]?.type.startsWith("image/")
            ? "Фото"
            : work.materials[0]?.type === "application/pdf"
              ? "Презентация"
              : "Проект")
  );
}
function Card({
  work,
  onOpen,
  compact = false,
}: {
  work: Work;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <button
      className={`work-card ${compact ? "compact" : ""} ${work.external ? "resource-card" : ""}`}
      onClick={onOpen}
    >
      <div className="cover-wrap">
        <Cover work={work} />
        {!compact && (
          <span className={`status ${work.status}`}>
            {work.external
              ? "Материал"
              : work.status === "draft"
                ? "Черновик"
                : "Готово"}
          </span>
        )}
      </div>
      <div className="card-info">
        <div>
          <h3>{work.title}</h3>
          <p>
            {kind(work)} · {work.subject}
          </p>
        </div>
        <span className="card-arrow">
          <ArrowRight size={19} />
        </span>
      </div>
    </button>
  );
}
function MaterialView({ material }: { material: Material }) {
  const url = useBlobUrl(material.blob, material.url);
  if (!url) return <p>Подготавливаем материал…</p>;
  if (material.type === "application/pdf")
    return (
      <Suspense
        fallback={<div className="loading">Открываем просмотрщик…</div>}
      >
        <PdfViewer url={url} name={material.name} />
      </Suspense>
    );
  if (material.type.startsWith("image/"))
    return (
      <div className="media-viewer">
        <div className="viewer-toolbar">
          <ImageIcon size={19} />
          <span className="filename">{material.name}</span>
          <a
            href={url}
            download={material.name}
            className="icon-button"
            aria-label="Скачать изображение"
          >
            <Download size={20} />
          </a>
        </div>
        <img src={url} alt={material.name} />
      </div>
    );
  if (material.type.startsWith("video/"))
    return (
      <div className="media-viewer">
        <video src={url} controls preload="metadata" />
        <div className="viewer-toolbar">
          <span>{material.name}</span>
          <a
            href={url}
            download={material.name}
            className="icon-button"
            aria-label="Скачать видео"
          >
            <Download size={20} />
          </a>
        </div>
      </div>
    );
  return (
    <div className="download-view">
      <FileText size={54} />
      <h2>{material.name}</h2>
      <p>Скачай файл, чтобы открыть его в подходящей программе.</p>
      <a className="button primary" href={url} download={material.name}>
        <Download size={19} />
        Скачать файл
      </a>
    </div>
  );
}
function DownloadMaterial({ material }: { material: Material }) {
  const url = useBlobUrl(material.blob, material.url);
  return (
    <a className="attachment" href={url} download={material.name}>
      <FileText size={23} />
      <span>{material.name}</span>
      <Download size={18} />
    </a>
  );
}
const blank: Work = {
  id: "",
  title: "",
  subject: "История",
  about: "",
  contribution: "",
  people: "Иван",
  status: "draft",
  materials: [],
  updated: 0,
};
function Editor({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Work;
  onCancel: () => void;
  onSave: (work: Work) => Promise<void>;
}) {
  const [work, setWork] = useState<Work>(initial ?? blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLInputElement>(null);
  useEffect(() => title.current?.focus(), []);
  const update = (key: keyof Work, value: unknown) =>
    setWork((w) => ({ ...w, [key]: value }));
  function attach(files: FileList | File[] | null) {
    if (!files) return;
    const items = Array.from(files);
    if (items.some((f) => f.size > 200 * 1024 * 1024)) {
      setError("Один файл может занимать до 200 МБ. Выбери файл поменьше.");
      return;
    }
    setError("");
    setWork((w) => ({
      ...w,
      materials: [
        ...w.materials,
        ...items.map((f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          type: f.type || "application/octet-stream",
          blob: f,
        })),
      ],
    }));
  }
  async function submit(status: Work["status"]) {
    setError("");
    if (!work.title.trim()) {
      setError("Добавь название работы.");
      title.current?.focus();
      return;
    }
    if (status === "ready" && !work.materials.length && !work.link?.trim()) {
      setError("Добавь файл или ссылку, чтобы сохранить готовую работу.");
      return;
    }
    let link = work.link?.trim();
    if (link) {
      try {
        if (
          !(link.startsWith("https://") || link.startsWith("http://")) &&
          link !== "/example-site.html"
        )
          throw Error();
        const u = new URL(link, location.origin);
        if (!["https:", "http:"].includes(u.protocol)) throw Error();
        link = u.href;
      } catch {
        setError(
          "Вставь полную ссылку, которая начинается с https:// или http://.",
        );
        return;
      }
    }
    setBusy(true);
    try {
      await onSave({
        ...work,
        id: work.id || crypto.randomUUID(),
        title: work.title.trim(),
        link,
        status,
        updated: Date.now(),
      });
    } catch {
      setError(
        "Не удалось сохранить работу. Возможно, в хранилище браузера недостаточно места. Твои данные остались в форме.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="page editor-page">
      <button className="back" onClick={onCancel}>
        <ArrowLeft size={19} />В портфолио
      </button>
      <div className="page-heading">
        <div>
          <h1>{initial ? "Редактировать работу" : "Добавить работу"}</h1>
          <p>Расскажи, что получилось, и прикрепи материалы.</p>
        </div>
      </div>
      <div className="editor-grid">
        <section className="glass form-panel">
          <div className="two-fields">
            <label>
              Название работы
              <input
                ref={title}
                value={work.title}
                maxLength={140}
                placeholder="Например, опыт с призмой"
                onChange={(e) => update("title", e.target.value)}
              />
            </label>
            <label>
              Предмет
              <select
                aria-label="Предмет"
                value={work.subject}
                onChange={(e) => update("subject", e.target.value)}
              >
                {[
                  "История",
                  "Физика",
                  "Информатика",
                  "Литература",
                  "Биология",
                  "Математика",
                  "Творчество",
                  "Другое",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            О работе
            <textarea
              value={work.about}
              maxLength={4000}
              placeholder="Что ты сделал и что хотел показать?"
              onChange={(e) => update("about", e.target.value)}
            />
          </label>
          <label>
            Мой вклад
            <textarea
              value={work.contribution}
              maxLength={2000}
              placeholder="Какая часть работы была твоей?"
              onChange={(e) => update("contribution", e.target.value)}
            />
          </label>
          <label>
            Участники
            <input
              value={work.people}
              maxLength={500}
              onChange={(e) => update("people", e.target.value)}
            />
            <small>
              Имена и роли. Для индивидуальной работы достаточно твоего имени.
            </small>
          </label>
        </section>
        <section className="glass form-panel">
          <h2>Материалы</h2>
          <button
            type="button"
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              attach(e.dataTransfer.files);
            }}
          >
            <Upload size={32} />
            <strong>Перетащи файлы сюда</strong>
            <span>или выбери на компьютере</span>
            <small>PDF, фото, видео и документы · до 200 МБ на файл</small>
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="visually-hidden"
            aria-label="Файлы работы"
            onChange={(e) => {
              attach(e.target.files);
              e.target.value = "";
            }}
          />
          {work.materials.map((m) => (
            <div className="attachment" key={m.id}>
              <FileText size={20} />
              <span>{m.name}</span>
              <button
                className="icon-button"
                aria-label={`Убрать ${m.name}`}
                onClick={() =>
                  update(
                    "materials",
                    work.materials.filter((item) => item.id !== m.id),
                  )
                }
              >
                <X size={17} />
              </button>
            </div>
          ))}
          <label>
            Ссылка на сайт или проект
            <input
              type="url"
              value={work.link ?? ""}
              placeholder="https://"
              onChange={(e) => update("link", e.target.value)}
            />
          </label>
          <h2 className="spaced">Обложка</h2>
          <button
            className="cover-picker"
            onClick={() => coverRef.current?.click()}
          >
            <Cover work={work} />
            <span>
              <ImageIcon size={18} />
              Выбрать изображение
            </span>
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            aria-label="Обложка работы"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size <= 20 * 1024 * 1024) update("cover", f);
              else if (f) setError("Обложка может занимать до 20 МБ.");
            }}
          />
          <p className="helper">
            Обложка видна только в карточке работы. Сцена с аркой не меняется.
          </p>
        </section>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="editor-footer">
        <span>
          <Check size={17} />
          Сохраняется в этом браузере
        </span>
        <button className="button secondary" onClick={onCancel} disabled={busy}>
          Отмена
        </button>
        <button
          className="button secondary"
          onClick={() => void submit("draft")}
          disabled={busy}
        >
          Сохранить черновик
        </button>
        <button
          className="button primary"
          onClick={() => void submit("ready")}
          disabled={busy}
        >
          {busy ? "Сохраняем…" : "Сохранить работу"}
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

export default function App() {
  const [works, setWorks] = useState<Work[]>(seeds);
  const [route, setRoute] = useState(location.hash.slice(1) || "world");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [subject, setSubject] = useState("Все предметы");
  const [menu, setMenu] = useState(false);
  const [reset, setReset] = useState(false);
  const [notice, setNotice] = useState("");
  const [materialIndex, setMaterialIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publicationError, setPublicationError] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigationTransition = useRef<ViewTransition | null>(null);
  const refresh = async () => setWorks(await allWorks());
  useEffect(() => {
    refresh()
      .catch(() =>
        setError(
          "Хранилище браузера недоступно. Попробуй открыть приложение в обычном окне.",
        ),
      )
      .finally(() => setLoading(false));
    const fn = () => {
      navigationTransition.current?.skipTransition();
      const update = () => {
        // Read the latest hash inside the callback: rapid navigation must not
        // restore a stale route while an earlier snapshot is being prepared.
        flushSync(() => {
          setRoute(location.hash.slice(1) || "world");
          setMenu(false);
          setMaterialIndex(0);
          setPublicationError("");
        });
        window.scrollTo(0, 0);
      };
      if (
        !document.startViewTransition ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        update();
        return;
      }
      try {
        const transition = document.startViewTransition(update);
        navigationTransition.current = transition;
        void transition.finished
          .catch(() => {})
          .finally(() => {
            if (navigationTransition.current === transition)
              navigationTransition.current = null;
          });
      } catch {
        update();
      }
    };
    addEventListener("hashchange", fn);
    return () => {
      removeEventListener("hashchange", fn);
      navigationTransition.current?.skipTransition();
    };
  }, []);
  useEffect(() => {
    if (reset) dialog.current?.showModal();
    else {
      const wasOpen = dialog.current?.open;
      dialog.current?.close();
      if (wasOpen) menuButton.current?.focus();
    }
  }, [reset]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (route === "show") {
      setSearch("");
      setFilter("all");
      setSubject("Все предметы");
    }
    const labels: Record<string, string> = {
      world: "Мой мир",
      portfolio: "Портфолио",
      school: "Проекты школы",
      exhibition: "Выставка",
      add: "Добавить работу",
      show: "Режим показа",
      work: "Работа",
      edit: "Редактировать работу",
    };
    document.title = `Vector Universe · ${labels[route.split("/")[0]] ?? "Мой мир"}`;
  }, [route]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".profile-wrap")) setMenu(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [menu]);
  const go = (r: string) => {
    location.hash = r;
  };
  const parent = route.startsWith("show");
  const exhibitionView = route.startsWith("published/");
  const readOnly = parent || exhibitionView;
  const parts = route.split("/");
  const selected = works.find(
    (w) =>
      w.id === parts[1] &&
      (!exhibitionView || (w.published && w.status === "ready" && !w.external)),
  );
  const currentTab =
    route === "world"
      ? "world"
      : route.startsWith("school")
        ? "school"
        : route.startsWith("exhibition") || exhibitionView
          ? "exhibition"
          : "portfolio";
  const selectedMaterial = selected?.materials[materialIndex];
  const visible = works
    .filter((w) => !parent || w.status === "ready")
    .filter(
      (w) =>
        w.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
        (filter === "all" || filter === w.status) &&
        (subject === "Все предметы" || w.subject === subject),
    );
  async function save(w: Work) {
    await saveWork({
      ...w,
      published: w.status === "ready" && !w.external ? w.published : false,
    });
    await refresh();
    go(`work/${w.id}`);
    setNotice(w.status === "draft" ? "Черновик сохранён" : "Работа сохранена");
  }
  async function togglePublication(work: Work) {
    if (publishing || work.external || work.status !== "ready") return;
    setPublishing(true);
    setPublicationError("");
    try {
      await saveWork({ ...work, published: !work.published });
      await refresh();
      setNotice(
        work.published
          ? "Работа снята с выставки. Она осталась в портфолио."
          : "Работа добавлена на выставку в этом браузере.",
      );
    } catch {
      setPublicationError("Не удалось изменить публикацию. Попробуй ещё раз.");
    } finally {
      setPublishing(false);
    }
  }
  async function startProject(task: Assignment) {
    const existing = works.find((w) => w.assignmentId === task.id);
    if (existing) {
      go(`${existing.status === "draft" ? "edit" : "work"}/${existing.id}`);
      return;
    }
    const draft: Work = {
      id: crypto.randomUUID(),
      title: task.title,
      subject: task.subject,
      about: "",
      contribution: "",
      people: "Иван",
      status: "draft",
      materials: [],
      assignmentId: task.id,
      updated: Date.now(),
    };
    await saveWork(draft);
    await refresh();
    go(`edit/${draft.id}`);
    setNotice("Личный черновик создан");
  }
  return (
    <>
      <div className={`room-backdrop room-${currentTab}`} aria-hidden="true" />
      {route === "world" && <Artwork />}
      <header className="header">
        <a
          href={parent ? "#show" : "#world"}
          className="brand"
          aria-label={
            parent ? "Vector Universe — Портфолио" : "Vector Universe — Мой мир"
          }
        >
          <svg
            className="school-logo"
            viewBox="0 40 382 180"
            role="img"
            aria-label="Вектор школа"
          >
            <image href="/assets/logo.svg" width="382" height="284" />
          </svg>
          <span>Universe</span>
        </a>
        {parent ? (
          <div className="parent-indicator">
            <Eye size={20} />
            Режим показа
          </div>
        ) : (
          <nav aria-label="Основная навигация">
            {[
              ["world", "Мой мир"],
              ["school", "Проекты школы"],
              ["portfolio", "Портфолио"],
              ["exhibition", "Выставка"],
            ].map(([id, label]) => (
              <a
                key={id}
                className={currentTab === id ? "active" : ""}
                href={`#${id}`}
                aria-current={currentTab === id ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
        {parent ? (
          <button
            className="button secondary return-button"
            onClick={() => go(selected ? `work/${selected.id}` : "portfolio")}
          >
            <ArrowLeft size={17} />
            Вернуться
          </button>
        ) : (
          <div className="profile-wrap">
            <button
              className="profile"
              ref={menuButton}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <span className="avatar">
                <UserRound size={24} />
              </span>
              Иван
              <ChevronDown size={18} />
            </button>
            {menu && (
              <div
                className="profile-menu"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setMenu(false);
                    menuButton.current?.focus();
                  }
                }}
              >
                <span>Локальный кабинет · Иван</span>
                <button
                  onClick={() => {
                    go("show");
                    setMenu(false);
                  }}
                >
                  <Eye size={17} />
                  Показать родителю
                </button>
                <button
                  onClick={() => {
                    setReset(true);
                    setMenu(false);
                  }}
                >
                  <RotateCcw size={17} />
                  Сбросить демо
                </button>
                <small>Работы и файлы хранятся только в этом браузере.</small>
              </div>
            )}
          </div>
        )}
      </header>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="loading">Открываем твой мир…</div>
      ) : route === "world" ? (
        <main className="world">
          <div className="world-title">
            <h1>Мой мир</h1>
            <p>
              Работы и проекты, которыми
              <br />
              хочется поделиться.
            </p>
          </div>
          <aside className="my-works glass">
            <div className="aside-title">
              <h2>Мои работы</h2>
              <button
                className="icon-button"
                aria-label="Все работы"
                onClick={() => go("portfolio")}
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="home-cards">
              {works
                .filter((w) => w.status === "ready")
                .slice(0, 3)
                .map((w) => (
                  <Card
                    key={w.id}
                    work={w}
                    compact
                    onOpen={() => go(`work/${w.id}`)}
                  />
                ))}
            </div>
            <button
              className="button primary add-main"
              onClick={() => go("add")}
            >
              <Plus size={25} />
              Добавить работу
            </button>
          </aside>
        </main>
      ) : route === "add" || route.startsWith("edit/") ? (
        <Editor
          key={route}
          initial={selected}
          onCancel={() => go(selected ? `work/${selected.id}` : "portfolio")}
          onSave={save}
        />
      ) : route.startsWith("work/") ||
        exhibitionView ||
        (parent && selected) ? (
        <main className="page detail-page">
          <button
            className="back"
            onClick={() =>
              go(parent ? "show" : exhibitionView ? "exhibition" : "portfolio")
            }
          >
            <ArrowLeft size={19} />
            {parent ? "В портфолио" : exhibitionView ? "Выставка" : "Портфолио"}
          </button>
          {selected ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>{selected.title}</h1>
                  <p>
                    {selected.subject} · {kind(selected)}
                    {selected.status === "draft" ? " · Черновик" : ""}
                  </p>
                </div>
                {!readOnly && (
                  <div className="actions">
                    {!selected.external && (
                      <button
                        className="button primary"
                        onClick={() => go(`edit/${selected.id}`)}
                      >
                        <Pencil size={18} />
                        Редактировать
                      </button>
                    )}
                    {!selected.external && selected.status === "ready" && (
                      <button
                        className="button secondary"
                        disabled={publishing}
                        onClick={() => void togglePublication(selected)}
                      >
                        <GalleryHorizontalEnd size={20} />
                        {publishing
                          ? "Сохраняем…"
                          : selected.published
                            ? "Снять с выставки"
                            : "На выставку"}
                      </button>
                    )}
                    <button
                      className="button lime"
                      onClick={() => go(`show/${selected.id}`)}
                    >
                      <Eye size={21} />
                      Показать родителю
                    </button>
                  </div>
                )}
                {exhibitionView && (
                  <button
                    className="button secondary"
                    onClick={() => go(`work/${selected.id}`)}
                  >
                    Моя работа <ArrowRight size={18} />
                  </button>
                )}
              </div>
              {!readOnly &&
                !selected.external &&
                selected.status === "ready" && (
                  <p className="publication-note">
                    {selected.published
                      ? "На выставке · "
                      : "Публикация по твоему выбору · "}
                    В локальном демо выставка доступна только в этом браузере.
                  </p>
                )}
              {publicationError && (
                <p role="alert" className="form-error">
                  {publicationError}
                </p>
              )}
              <div className="detail-grid">
                <section className="glass material-panel">
                  {selectedMaterial ? (
                    <MaterialView
                      key={selectedMaterial.id}
                      material={selectedMaterial}
                    />
                  ) : selected.link ? (
                    <div className="site-view">
                      <Cover work={selected} />
                      <a
                        className="button primary"
                        href={selected.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть сайт
                        <ExternalLink size={19} />
                      </a>
                    </div>
                  ) : (
                    <div className="download-view">
                      <FileText size={54} />
                      <h2>Это пока черновик</h2>
                      <p>Добавь материалы, когда будешь готов.</p>
                      {!readOnly && (
                        <button
                          className="button primary"
                          onClick={() => go(`edit/${selected.id}`)}
                        >
                          Продолжить работу
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  )}
                  {selected.materials.length > 1 && (
                    <div className="material-tabs">
                      {selected.materials.map((m, i) => (
                        <button
                          key={m.id}
                          className={i === materialIndex ? "selected" : ""}
                          onClick={() => setMaterialIndex(i)}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
                <aside className="glass about-panel">
                  <section>
                    <h2>{selected.external ? "О материале" : "О работе"}</h2>
                    <p>{selected.about || "Описание пока не добавлено."}</p>
                  </section>
                  {selected.external ? (
                    <section>
                      <h2>Источник</h2>
                      <p>{selected.people}</p>
                      <a href={sourceUrl} target="_blank" rel="noreferrer">
                        Humanities LibreTexts <ExternalLink size={15} />
                      </a>
                      <p className="helper">
                        Лицензия страницы: CC BY 4.0. Исходный PDF сохранён без
                        изменений.
                      </p>
                    </section>
                  ) : (
                    <>
                      <section>
                        <h2>{exhibitionView ? "Вклад автора" : "Мой вклад"}</h2>
                        <p>
                          {selected.contribution || "Вклад пока не описан."}
                        </p>
                      </section>
                      <section>
                        <h2>Участники</h2>
                        <div className="person">
                          <span className="avatar">
                            <UserRound size={23} />
                          </span>
                          <div>
                            {selected.people || "Иван"}
                            <small>
                              {selected.people === "Иван"
                                ? "Индивидуальная работа"
                                : "Участники проекта"}
                            </small>
                          </div>
                        </div>
                        {selected.demo && (
                          <p className="helper">Демонстрационный пример.</p>
                        )}
                      </section>
                    </>
                  )}
                  <section>
                    <h2>Материалы</h2>
                    {selected.materials.map((m) => (
                      <DownloadMaterial key={m.id} material={m} />
                    ))}
                    {selected.link && (
                      <a
                        className="attachment"
                        href={selected.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={21} />
                        <span>Открыть сайт</span>
                        <ArrowRight size={18} />
                      </a>
                    )}
                    {!selected.materials.length && !selected.link && (
                      <p className="helper">Материалы ещё не добавлены.</p>
                    )}
                  </section>
                </aside>
              </div>
            </>
          ) : (
            <div className="glass empty-state">
              <h2>Работа не найдена</h2>
              <button
                className="button primary"
                onClick={() => go("portfolio")}
              >
                В портфолио
              </button>
            </div>
          )}
        </main>
      ) : route === "portfolio" || parent ? (
        <main className="page portfolio-page">
          <div className="page-heading">
            <div>
              <h1>Портфолио · Иван</h1>
              <p>
                {parent
                  ? "Работы, которыми хочется поделиться."
                  : "Твои идеи, открытия и готовые работы — в одном месте."}
              </p>
            </div>
            {!parent && (
              <div className="actions">
                <button className="button primary" onClick={() => go("add")}>
                  <Plus size={20} />
                  Добавить работу
                </button>
                <button className="button lime" onClick={() => go("show")}>
                  <Eye size={20} />
                  Показать родителю
                </button>
              </div>
            )}
          </div>
          <div className="portfolio-tools glass">
            <div className="filter-tabs">
              {[
                ["all", "Все работы"],
                ["ready", "Готовые"],
                ...(!parent ? [["draft", "Черновики"]] : []),
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={filter === id ? "selected" : ""}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="search">
              <Search size={19} />
              <input
                aria-label="Поиск работ"
                placeholder="Найти работу"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              aria-label="Фильтр по предмету"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {[
                "Все предметы",
                "История",
                "Физика",
                "Информатика",
                "Литература",
                "Биология",
                "Математика",
                "Творчество",
                "Другое",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="portfolio-grid">
            {visible.map((w) => (
              <Card
                key={w.id}
                work={w}
                onOpen={() => go(`${parent ? "show" : "work"}/${w.id}`)}
              />
            ))}
          </div>
          {!visible.length && (
            <div className="glass empty-state">
              <h2>Здесь пока нет работ</h2>
              <p>
                {search
                  ? "Попробуй другое название или предмет."
                  : parent
                    ? "Готовые работы появятся здесь после сохранения."
                    : "Добавь первую работу или начни с черновика."}
              </p>
              {!parent && !search && (
                <button className="button primary" onClick={() => go("add")}>
                  <Plus size={19} />
                  Добавить работу
                </button>
              )}
            </div>
          )}
          <p className="local-note">
            {parent
              ? "Режим просмотра · без редактирования"
              : "Работы доступны в этом браузере на этом компьютере."}
          </p>
        </main>
      ) : (
        <Catalogs
          route={route}
          works={works}
          go={go}
          onStart={startProject}
          renderPublished={(w) => (
            <Card key={w.id} work={w} onOpen={() => go(`published/${w.id}`)} />
          )}
        />
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      <dialog
        ref={dialog}
        className="reset-dialog"
        onCancel={() => {
          setReset(false);
          setTimeout(() => menuButton.current?.focus(), 0);
        }}
      >
        <button
          className="icon-button close-dialog"
          aria-label="Закрыть"
          onClick={() => {
            setReset(false);
            menuButton.current?.focus();
          }}
        >
          <X />
        </button>
        <RotateCcw size={32} />
        <h2>Вернуть начальное демо?</h2>
        <p>
          Добавленные работы и файлы будут удалены из этого браузера. Останется
          только начальный набор Universe.
        </p>
        <div className="actions">
          <button
            className="button secondary"
            autoFocus
            onClick={() => {
              setReset(false);
              menuButton.current?.focus();
            }}
          >
            Отмена
          </button>
          <button
            className="button primary"
            onClick={async () => {
              try {
                await resetWorks();
                await refresh();
                setReset(false);
                setSearch("");
                setFilter("all");
                setSubject("Все предметы");
                go("world");
                setNotice("Начальный набор восстановлен");
                menuButton.current?.focus();
              } catch {
                setError("Не удалось сбросить данные. Попробуй ещё раз.");
              }
            }}
          >
            Сбросить демо
          </button>
        </div>
      </dialog>
    </>
  );
}
