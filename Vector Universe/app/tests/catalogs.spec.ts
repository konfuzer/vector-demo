import { test, expect } from "@playwright/test";
import { assignments, exhibits } from "../src/catalog-data";

test("школьное задание → материалы → один личный черновик → готовая работа", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#school");
  await expect(page.locator(".assignment-card")).toHaveCount(4);
  await page
    .getByLabel("Результат проекта", { exact: true })
    .selectOption("Сайт");
  await expect(page.locator(".assignment-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Подробнее", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Сайт о любимой книге", exact: true }),
  ).toBeVisible();
  const resource = context.waitForEvent("page");
  await page
    .getByRole("link", { name: "Открыть: План страницы", exact: true })
    .click();
  const doc = await resource;
  await expect(
    doc.getByRole("heading", {
      name: "План страницы · Сайт о любимой книге",
      exact: true,
    }),
  ).toBeVisible();
  await doc.close();
  await page
    .getByRole("button", { name: "Начать проект", exact: true })
    .click();
  await expect(page.getByLabel("Название работы")).toHaveValue(
    "Сайт о любимой книге",
  );
  const id = new URL(page.url()).hash.split("/")[1];
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(
    page.getByText("Это пока черновик", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Проекты школы", exact: true }).click();
  await page
    .locator(".assignment-card")
    .filter({
      has: page.getByRole("heading", {
        name: "Сайт о любимой книге",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Подробнее", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Открыть свою работу", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp("#edit/" + id + "$"));
  await page
    .getByLabel("Ссылка на сайт или проект")
    .fill("https://example.com");
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp("#work/" + id + "$"));
  await page.reload();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Сайт о любимой книге", exact: true }),
  ).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("выставка отдельно от своих работ, фотографии и материалы доступны только для просмотра", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#exhibition");
  await expect(page.locator(".exhibit-card")).toHaveCount(5);
  await page.getByRole("button", { name: "Сайты", exact: true }).click();
  await expect(page.locator(".exhibit-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Все", exact: true }).click();
  await page.locator(".exhibit-card.featured").click();
  await expect(
    page.getByRole("heading", { name: "Как устроен мост", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Изображение 2", exact: true })
    .click();
  await expect(page.locator(".exhibit-large")).toHaveAttribute(
    "src",
    "/assets/catalog/bridge-detail-large.webp",
  );
  const resource = context.waitForEvent("page");
  await page
    .getByRole("link", { name: "Открыть: Описание модели", exact: true })
    .click();
  const doc = await resource;
  await expect(
    doc.getByRole("heading", {
      name: "Как устроен мост · описание модели",
      exact: true,
    }),
  ).toBeVisible();
  await doc.close();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await page
    .locator(".exhibit-card")
    .filter({
      has: page.getByRole("heading", {
        name: "Сайт о любимой книге",
        exact: true,
      }),
    })
    .click();
  await expect(
    page.frameLocator(".exhibit-site").getByRole("heading", { name: /Ветер/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page
    .getByRole("button", { name: "Добавить работу", exact: true })
    .click();
  await page.getByLabel("Название работы").fill("Личная работа вне выставки");
  await page
    .getByRole("button", { name: "Сохранить черновик", exact: true })
    .click();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(page.locator(".exhibit-card")).toHaveCount(5);
  await expect(
    page.getByText("Личная работа вне выставки", { exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("реальные скриншоты всех согласованных разделов и отсутствие переполнения", async ({
  page,
}) => {
  for (const [route, name] of [
    ["school", "school"],
    ["school/book-site", "brief"],
    ["exhibition", "exhibition"],
    ["exhibition/bridge", "exhibit-work"],
    ["show", "parent"],
  ]) {
    await page.setViewportSize({ width: 1584, height: 993 });
    await page.goto("/#" + route);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll("main img")).every(
        (img) => (img as HTMLImageElement).complete,
      ),
    );
    await page.screenshot({ path: `qa/${name}-1584.png`, fullPage: true });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page.screenshot({ path: `qa/${name}-390.png`, fullPage: true });
  }
});

test("все подготовленные материалы и иллюстрации доступны локально", async ({
  request,
}) => {
  const files = new Set([
    ...assignments.flatMap((a) => [
      a.image,
      ...(a.hero ? [a.hero] : []),
      ...a.materials.map((m) => m.url),
    ]),
    ...exhibits.flatMap((e) => [
      e.image,
      ...e.images,
      ...(e.link ? [e.link] : []),
      ...(e.materials?.map((m) => m.url) ?? []),
    ]),
  ]);
  for (const url of files) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect((await response.body()).length, url).toBeGreaterThan(100);
  }
});
