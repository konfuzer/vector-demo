import { test, expect } from "@playwright/test";
import path from "node:path";

test("режим показа сохраняет Египет и настоящее авторство", async ({
  page,
}) => {
  await page.goto("/#portfolio");
  await page
    .getByRole("button", { name: "Показать родителю", exact: true })
    .click();
  await expect(page.locator(".portfolio-grid .work-card")).toHaveCount(3);
  await page.getByRole("button", { name: /Древний Египет/ }).click();
  await expect(page.getByText("1 / 132", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await expect(
    page.getByText("Michael Leonard · Humanities LibreTexts", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({ path: "qa/parent-history.png", fullPage: true });
});

test("осознанная публикация, просмотр, сохранение и снятие без удаления работы", async ({
  page,
}) => {
  await page.goto("/#add");
  await page.getByLabel("Название работы").fill("Мой опыт · выставка");
  await page
    .getByLabel("Файлы работы")
    .setInputFiles(path.resolve("public/assets/page-001.png"));
  await page
    .getByRole("button", { name: "Сохранить работу", exact: true })
    .click();
  const workUrl = page.url();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(
    page.getByText("Мой опыт · выставка", { exact: true }),
  ).toHaveCount(0);
  await page.goto(workUrl);
  await page.getByRole("button", { name: "На выставку", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Снять с выставки", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Снять с выставки", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(page.locator(".published-section .work-card")).toHaveCount(1);
  await expect(page.locator(".published-section .work-card")).toBeInViewport({
    ratio: 1,
  });
  await page.screenshot({
    path: "qa/published-work-gallery.png",
    fullPage: true,
  });
  await page.getByLabel("Поиск на выставке").fill("Мой опыт");
  await expect(page.locator(".published-section .work-card")).toHaveCount(1);
  await expect(
    page.getByText("Работы не найдены", { exact: true }),
  ).toHaveCount(0);
  await page.locator(".published-section .work-card").click();
  await expect(page).toHaveURL(/#published\//);
  await expect(page.locator(".media-viewer > img")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Редактировать", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Моя работа", exact: true }).click();
  for (const width of [1440, 1100, 900, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await expect(
      page.getByRole("button", { name: "Снять с выставки", exact: true }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    path: "qa/published-work-detail.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Снять с выставки", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(page.locator(".published-section .work-card")).toHaveCount(0);
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Мой опыт · выставка", exact: true }),
  ).toBeVisible();
  await page.goto(workUrl);
  await page.getByRole("button", { name: "На выставку", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Снять с выставки", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Сохранить черновик", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(page.locator(".published-section .work-card")).toHaveCount(0);
});

test("ошибка публикации не создаёт ложного успеха, внешний материал не публикуется", async ({
  page,
}) => {
  await page.goto("/#work/history");
  await expect(
    page.getByRole("heading", { name: "Древний Египет", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toHaveCount(0);
  await page.goto("/#work/prism");
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Test quota", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "На выставку", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Не удалось изменить публикацию",
  );
  await expect(
    page.getByRole("button", { name: "На выставку", exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole("status")).toHaveCount(0);
});
