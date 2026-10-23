import { test, expect } from "@playwright/test";

test("ракурсы одной комнаты отличаются между разделами и не перехватывают нажатия", async ({
  page,
}) => {
  const views: string[] = [];
  await page.goto("/#school");
  for (const [route, name] of [
    ["school", "Проекты школы"],
    ["portfolio", "Портфолио"],
    ["exhibition", "Выставка"],
  ]) {
    if (route !== "school")
      await page.getByRole("link", { name, exact: true }).click();
    await expect(page.locator(".room-backdrop")).toHaveClass(
      `room-backdrop room-${route}`,
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
      )
      .toBe(0);
    views.push(
      await page
        .locator(".room-backdrop")
        .evaluate((el) => getComputedStyle(el, "::before").transform),
    );
    expect(
      await page
        .locator(".room-backdrop")
        .evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe("none");
    await page.screenshot({ path: `qa/room-${route}.png`, fullPage: true });
  }
  expect(new Set(views).size).toBe(3);
});

test("переход с глубиной и быстрое переключение разделов без возврата на старый маршрут", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#school");
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (a) =>
                a instanceof CSSAnimation &&
                a.animationName === "universe-page-arrive" &&
                a.playState === "running",
            ).length,
      ),
    )
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("heading", { name: "Портфолио · Иван", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Мой мир", exact: true }).click();
  await expect(page.locator(".world-artwork")).toHaveClass(/artwork-ready/);
  await page.screenshot({
    path: "qa/enter-world-transition.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Проекты школы", exact: true }).click();
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page.getByRole("link", { name: "Выставка", exact: true }).click();
  await expect(page).toHaveURL(/#exhibition$/);
  await expect(
    page.getByRole("heading", { name: "Школьная выставка", exact: true }),
  ).toBeVisible();
  await expect(page.locator("nav a.active")).toHaveText("Выставка");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (a) =>
                a instanceof CSSAnimation &&
                a.animationName.startsWith("universe-page-") &&
                a.playState === "running",
            ).length,
      ),
    )
    .toBe(0);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Портфолио · Иван", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Школьная выставка", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced-motion и браузер без View Transitions сохраняют рабочую навигацию", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#school");
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Портфолио · Иван", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() =>
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.getByRole("link", { name: "Проекты школы", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Проекты школы", exact: true }),
  ).toBeVisible();
});
