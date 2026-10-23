import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Maximize } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = worker;
function Page({
  pdf,
  page,
  small = false,
}: {
  pdf: pdfjs.PDFDocumentProxy;
  page: number;
  small?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    let task: pdfjs.RenderTask | undefined;
    (async () => {
      const p = await pdf.getPage(page);
      if (cancelled || !ref.current) return;
      const view = p.getViewport({ scale: 1 });
      const v = p.getViewport({ scale: (small ? 200 : 1400) / view.width });
      const canvas = ref.current;
      canvas.width = v.width;
      canvas.height = v.height;
      task = p.render({ canvas, viewport: v });
      await task.promise;
    })().catch((e) => {
      if (e.name !== "RenderingCancelledException") console.error(e);
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, page, small]);
  return <canvas ref={ref} aria-label={`Страница ${page}`} />;
}
export default function PdfViewer({
  url,
  name,
}: {
  url: string;
  name: string;
}) {
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loading = pdfjs.getDocument({ url });
    let live = true;
    loading.promise
      .then((p) => {
        if (live) {
          setPdf(p);
          setPage(1);
        }
      })
      .catch(() => {
        if (live)
          setError("Не удалось открыть PDF. Можно скачать исходный файл.");
      });
    return () => {
      live = false;
      void loading.destroy();
    };
  }, [url]);
  const start = pdf ? Math.max(1, Math.min(page - 1, pdf.numPages - 3)) : 1;
  return (
    <div className="pdf-viewer" ref={wrap}>
      <div className="viewer-toolbar">
        <span className="file-label">PDF</span>
        <span className="filename">{name}</span>
        <span>
          {page} / {pdf?.numPages ?? "…"}
        </span>
        <a
          className="icon-button"
          href={url}
          download={name}
          aria-label="Скачать PDF"
        >
          <Download size={20} />
        </a>
        <button
          className="icon-button"
          aria-label="Развернуть PDF"
          onClick={() => {
            void wrap.current
              ?.requestFullscreen()
              .catch(() =>
                setError("Полноэкранный режим недоступен в этом браузере."),
              );
          }}
        >
          <Maximize size={20} />
        </button>
      </div>
      <div className="pdf-page">
        {pdf ? (
          <Page pdf={pdf} page={page} />
        ) : (
          <p role="status">{error || "Открываем презентацию…"}</p>
        )}
      </div>
      {pdf && (
        <div className="pdf-pagination">
          <button
            className="round-button"
            disabled={page <= 1}
            aria-label="Предыдущая страница"
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
          </button>
          <div className="thumbnails">
            {Array.from(
              { length: Math.min(4, pdf.numPages) },
              (_, i) => start + i,
            ).map((n) => (
              <button
                key={n}
                className={n === page ? "selected" : ""}
                onClick={() => setPage(n)}
                aria-label={`Открыть страницу ${n}`}
              >
                <Page pdf={pdf} page={n} small />
                <span>{n}</span>
              </button>
            ))}
          </div>
          <button
            className="round-button"
            disabled={page >= pdf.numPages}
            aria-label="Следующая страница"
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      )}
      {error && pdf && <p role="alert">{error}</p>}
    </div>
  );
}
