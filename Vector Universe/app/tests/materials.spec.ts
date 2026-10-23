import { test, expect } from "@playwright/test";
import path from "node:path";
test("сохранённые PDF и несколько материалов, ссылка, показ после фильтра черновиков", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#add");
  await page
    .getByLabel("Название работы")
    .fill("Исследование · несколько материалов");
  await page
    .getByLabel("Файлы работы")
    .setInputFiles([
      path.resolve("public/assets/Art_History_Ancient_Egypt.pdf"),
      path.resolve("public/assets/page-001.png"),
    ]);
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page.getByText("1 / 132", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await page.reload();
  await expect(page.getByText("1 / 132", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await page
    .locator(".material-tabs")
    .getByRole("button", { name: "page-001.png", exact: true })
    .click();
  await expect(page.locator(".media-viewer > img")).toBeVisible();
  await page
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await page
    .getByLabel("Ссылка на сайт или проект")
    .fill("javascript:alert(1)");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Вставь полную ссылку");
  await page
    .getByLabel("Ссылка на сайт или проект")
    .fill("https://vektor.school/");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Открыть сайт", exact: true }),
  ).toHaveAttribute("href", "https://vektor.school/");
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page.getByRole("button", { name: "Черновики", exact: true }).click();
  await page
    .getByRole("button", { name: "Показать родителю", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Исследование · несколько материалов",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Добавить работу", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("настоящий видеофайл: воспроизведение и повторное открытие из браузера", async ({
  page,
}) => {
  await page.goto("/#add");
  const bytes = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 180;
    const ctx = c.getContext("2d")!;
    const stream = c.captureStream(12);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: Blob[] = [];
    const result = new Promise<number[]>((resolve) => {
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () =>
        resolve(
          Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())),
        );
    });
    rec.start();
    let frame = 0;
    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        ctx.fillStyle = frame % 2 ? "#3c8fef" : "#d4ed85";
        ctx.fillRect(0, 0, 320, 180);
        ctx.fillStyle = "white";
        ctx.fillRect(frame * 8, 40, 40, 90);
        frame++;
        if (frame === 12) {
          clearInterval(timer);
          rec.stop();
          stream.getTracks().forEach((t) => t.stop());
          resolve();
        }
      }, 85);
    });
    return result;
  });
  await page.getByLabel("Название работы").fill("Видео · тестовый материал");
  await page.getByLabel("Файлы работы").setInputFiles({
    name: "test-video.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(bytes),
  });
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page.locator("video")).toBeVisible();
  await page.locator("video").evaluate((v: HTMLVideoElement) => v.play());
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator("video")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("video")!.readyState >= 1,
  );
  expect(
    await page.locator("video").evaluate((v: HTMLVideoElement) => v.videoWidth),
  ).toBe(320);
});
test("ошибка хранилища сохраняет форму и не сообщает об успехе", async ({
  page,
}) => {
  await page.goto("/#add");
  await page.getByLabel("Название работы").fill("Несохранённый черновик");
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Test quota", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Сохранить черновик", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Не удалось сохранить");
  await expect(page.getByLabel("Название работы")).toHaveValue(
    "Несохранённый черновик",
  );
  await expect(page.getByRole("status")).toHaveCount(0);
});
