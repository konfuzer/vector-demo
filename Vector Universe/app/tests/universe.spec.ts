import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
const image = path.resolve("public/assets/page-001.png");
test("файл → оформление → сохранение → перезагрузка → редактирование → показ", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить работу", exact: true })
    .click();
  await page.getByLabel("Название работы").fill("Опыт с солнечным светом");
  await page.getByLabel("Предмет", { exact: true }).selectOption("Физика");
  await page
    .getByLabel("О работе", { exact: true })
    .fill("Наблюдение за прохождением света через стекло.");
  await page
    .getByLabel("Мой вклад", { exact: true })
    .fill("Сделал фотографии и описал наблюдения.");
  await page.getByLabel("Файлы работы").setInputFiles(image);
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Опыт с солнечным светом", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".media-viewer > img")).toBeVisible();
  const id = new URL(page.url()).hash;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Опыт с солнечным светом", exact: true }),
  ).toBeVisible();
  const imageState = await page
    .locator(".media-viewer > img")
    .evaluate((img: HTMLImageElement) => ({
      loaded: img.complete && img.naturalWidth > 0,
      url: img.src,
    }));
  expect(imageState.loaded).toBeTruthy();
  expect(imageState.url).toMatch(/^blob:/);
  const dl = page.waitForEvent("download");
  await page.getByRole("link", { name: "Скачать изображение" }).click();
  const downloaded = await dl;
  expect(await fs.readFile((await downloaded.path())!)).toEqual(
    await fs.readFile(image),
  );
  await page
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await page.getByLabel("Название работы").fill("Солнечный свет: результат");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(id + "$"));
  await page
    .getByRole("button", { name: "Показать родителю", exact: true })
    .click();
  await expect(page.getByText("Режим показа", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Добавить работу", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Вернуться", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Портфолио · Иван", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Солнечный свет: результат",
      exact: true,
    }),
  ).toHaveCount(1);
  await page.getByRole("link", { name: "Мой мир", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Солнечный свет: результат",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page
      .locator(".scene-wrap")
      .getByText("Солнечный свет: результат")
      .count(),
  ).toBe(0);
  expect(errors).toEqual([]);
});
test("черновик, проверка формы, фильтры и сброс только Universe", async ({
  page,
}) => {
  await page.goto("/#add");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Добавь название работы.");
  await page.getByLabel("Название работы").fill("Черновик наблюдений");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Добавь файл");
  await page
    .getByRole("button", { name: "Сохранить черновик", exact: true })
    .click();
  await expect(
    page.getByText("Это пока черновик", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page.getByRole("button", { name: "Черновики", exact: true }).click();
  await expect(page.locator(".work-card")).toHaveCount(1);
  await page.getByLabel("Поиск работ").fill("не существует");
  await expect(
    page.getByText("Здесь пока нет работ", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("another-product-sentinel", "keep"),
  );
  await page.getByRole("button", { name: "Иван", exact: true }).click();
  await page
    .getByRole("button", { name: "Сбросить демо", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Иван", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Иван", exact: true }).click();
  await page
    .getByRole("button", { name: "Сбросить демо", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Сбросить демо", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Мой мир", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect(page.locator(".work-card")).toHaveCount(3);
  expect(
    await page.evaluate(() => localStorage.getItem("another-product-sentinel")),
  ).toBe("keep");
});
test("настоящий PDF, авторство, перелистывание, исходный файл", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#work/history");
  await expect(page.getByText("1 / 132", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await expect(page.locator(".pdf-page canvas")).toBeVisible();
  expect(
    await page
      .locator(".pdf-page canvas")
      .evaluate((c: HTMLCanvasElement) => c.width),
  ).toBeGreaterThan(500);
  await page
    .getByRole("button", { name: "Следующая страница", exact: true })
    .click();
  await expect(page.getByText("2 / 132", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Открыть страницу 4", exact: true })
    .click();
  await expect(page.getByText("4 / 132", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Michael Leonard · Humanities LibreTexts", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toHaveCount(0);
  expect(
    await page
      .getByRole("link", { name: "Скачать PDF", exact: true })
      .getAttribute("href"),
  ).toBe("/assets/Art_History_Ancient_Egypt.pdf");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "qa/history-1440.png", fullPage: true });
});
