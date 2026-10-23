import { test, expect } from "@playwright/test";

test("фотографическая композиция, без WebGL/наведения, спокойные слои и размеры", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".world-artwork")).toHaveClass(/artwork-ready/);
  expect(await page.locator("canvas").count()).toBe(0);
  await expect(
    page.getByText("Наведи на предметы — сцена оживёт.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Лента ↗", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".world-artwork")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const before = await page
    .locator(".artwork-glass")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(800, 550);
  await expect
    .poll(() =>
      page
        .locator(".artwork-glass")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(before);
  expect(
    await page
      .locator(".world-artwork")
      .evaluate((el) => getComputedStyle(el).pointerEvents),
  ).toBe("none");
  for (const [width, height] of [
    [1584, 993],
    [1440, 900],
    [1600, 1000],
    [1280, 800],
    [1650, 954],
    [2061, 1186],
    [2560, 1600],
    [2560, 1440],
    [1280, 720],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator(".world-artwork")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth + 1 &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBeTruthy();
    await expect(
      page.getByRole("button", { name: "Добавить работу", exact: true }),
    ).toBeInViewport();
    await expect(page.locator(".home-cards .work-card")).toHaveCount(3);
    for (const card of await page.locator(".home-cards .work-card").all())
      await expect(card).toBeInViewport({ ratio: 1 });
    await page.screenshot({
      path: `qa/home-${width}.png`,
      animations: "disabled",
      fullPage: true,
    });
    if (width === 2560)
      await page.screenshot({
        path: `qa/home-${width}x${height}.png`,
        animations: "disabled",
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "qa/home-390.png",
    animations: "disabled",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("link", { name: "Портфолио", exact: true }).click();
  await page.screenshot({ path: "qa/portfolio-1440.png", fullPage: true });
  await page
    .getByRole("button", { name: "Добавить работу", exact: true })
    .click();
  await page.screenshot({ path: "qa/add-1440.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("Universe в стиле Flow на оси навигации, свет движется сам и карточка освещается слева", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".world-artwork")).toHaveClass(/artwork-ready/);
  for (const width of [2560, 1440, 1280, 900, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const alignment = await page.locator(".brand").evaluate((el) => {
      const logo = el.querySelector(".school-logo")!.getBoundingClientRect();
      const word = el.querySelector("span")!.getBoundingClientRect();
      // Flow uses the same 0 40 382 180 crop and lifts the school's body centre.
      const scale = Math.min(logo.width / 382, logo.height / 180);
      const rowsCenter =
        logo.top + (logo.height - 180 * scale) / 2 + (163.5 - 40) * scale;
      return Math.abs(word.top + word.height / 2 - rowsCenter);
    });
    expect(alignment).toBeLessThan(4);
    const brand = await page.locator(".brand").evaluate((el) => {
      const logo = el.querySelector(".school-logo")!.getBoundingClientRect();
      const text = el.querySelector("span")!;
      const word = text.getBoundingClientRect();
      const nav = document.querySelector("nav a")!.getBoundingClientRect();
      return {
        ratio: parseFloat(getComputedStyle(text).fontSize) / logo.width,
        color: getComputedStyle(text).color,
        divider: getComputedStyle(text, "::before").backgroundColor,
        axis: Math.abs(word.top + word.height / 2 - nav.top - nav.height / 2),
      };
    });
    expect(brand.ratio).toBeCloseTo(34 / 140, 3);
    expect(brand.color).toBe("rgb(92, 164, 243)");
    expect(brand.divider).toBe("rgb(142, 188, 244)");
    if (width > 1050) expect(brand.axis).toBeLessThan(2);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".artwork-supports line")).toHaveCount(3);
  const supports = await page.evaluate(() => {
    const art = document.querySelector(".artwork-layers .artwork-outer-ring")!;
    const occlusion = document.querySelector(
      ".artwork-supports .artwork-outer-ring",
    )!;
    return [
      getComputedStyle(art).transform,
      getComputedStyle(occlusion).transform,
    ];
  });
  expect(supports[0]).toBe(supports[1]);
  await expect(page.locator(".artwork-disc")).toHaveCount(4);
  const disc = await page
    .locator(".artwork-disc-1")
    .evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() =>
      page
        .locator(".artwork-disc-1")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(disc);
  const before = await page
    .locator(".arch-sheen")
    .evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() =>
      page
        .locator(".arch-sheen")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(before);
  const card = page.locator(".home-cards .work-card").first();
  await card.hover();
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el, "::after").opacity))
    .toBe("1");
  expect(
    await card.evaluate((el) => getComputedStyle(el, "::after").boxShadow),
  ).toBe("none");
  await expect
    .poll(() =>
      card
        .locator(".cover-wrap")
        .evaluate((el) => getComputedStyle(el, "::after").opacity),
    )
    .toBe("0.85");
  await page.screenshot({ path: "qa/home-card-glow.png", fullPage: true });
});

test("подвесы неподвижны, кольца поворачиваются по вертикальной оси, нити скрыты за металлом", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1584, height: 993 });
  await page.goto("/");
  await expect(page.locator(".world-artwork")).toHaveClass(/artwork-ready/);
  await expect(page.locator(".artwork-layers")).toHaveCSS("opacity", "1");
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const positions: unknown[] = [];
  for (const phase of [0, 0.25, 0.5]) {
    await page.evaluate((phase) => {
      for (const a of document.getAnimations()) {
        if (!(a instanceof CSSAnimation)) continue;
        if (a.animationName === "outer-yaw") a.currentTime = phase * 22000;
        if (a.animationName === "inner-yaw") a.currentTime = phase * 18000;
      }
    }, phase);
    const geometry = await page.evaluate(() => {
      const ring = document.querySelector(
        ".artwork-layers .artwork-outer-ring",
      )!;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(ring).transform);
      const lines = Array.from(
        document.querySelectorAll<SVGLineElement>(".fixed-supports line"),
      ).map((line) => {
        const b = line.getBoundingClientRect();
        return {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          transform: getComputedStyle(line.parentElement!).transform,
        };
      });
      return {
        lines,
        clockwise: matrix.m12,
        otherPlanar: matrix.m21,
        yaw: matrix.m13,
      };
    });
    positions.push(geometry.lines);
    expect(Math.abs(geometry.clockwise)).toBeLessThan(0.00001);
    expect(Math.abs(geometry.otherPlanar)).toBeLessThan(0.00001);
    if (phase !== 0.25) expect(Math.abs(geometry.yaw)).toBeGreaterThan(0.01);

    // Real pixel check with a negative control: at the two metal faces the
    // supports must contribute no pixels; removing the mask reveals a wire.
    for (const clip of [
      { x: 753, y: 254, width: 5, height: 12 },
      { x: 793, y: 275, width: 5, height: 3 },
    ]) {
      const normal = await page.screenshot({ clip });
      await page
        .locator(".fixed-supports")
        .evaluate((el) => el.setAttribute("visibility", "hidden"));
      const hidden = await page.screenshot({ clip });
      expect(normal.equals(hidden)).toBeTruthy();
      await page.locator(".fixed-supports").evaluate((el) => {
        el.removeAttribute("visibility");
        el.removeAttribute("mask");
      });
      const unmasked = await page.screenshot({ clip });
      expect(normal.equals(unmasked)).toBeFalsy();
      await page
        .locator(".fixed-supports")
        .evaluate((el) =>
          el.setAttribute("mask", "url(#supports-behind-metal)"),
        );
    }
  }
  expect(positions[0]).toEqual(positions[1]);
  expect(positions[1]).toEqual(positions[2]);
  await page.screenshot({
    path: "qa/rings-fixed-supports.png",
    clip: { x: 630, y: 145, width: 250, height: 390 },
  });
});

test("reduced-motion показывает точную неподвижную иллюстрацию", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".world-artwork")).toHaveClass(/artwork-ready/);
  expect(
    await page
      .locator(".artwork-poster")
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe("1");
  expect(
    await page
      .locator(".artwork-layers")
      .evaluate((el) => getComputedStyle(el).display),
  ).toBe("none");
  await page.screenshot({ path: "qa/home-still-1440.png", fullPage: true });
  await expect(page.locator(".artwork-supports line")).toHaveCount(3);
  expect(
    await page
      .locator(".artwork-supports .artwork-outer-ring")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
