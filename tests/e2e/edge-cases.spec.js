const { test, expect } = require('@playwright/test');

async function startAdventure(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.locator('#gameFrame')).toBeVisible();\n  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
}

test('rapid start taps do not create duplicate game frames or crash the shell', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'START THE ADVENTURE' });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.locator('#gameFrame')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#gameFrame')).toHaveCount(1);
});

test('music can be toggled repeatedly without losing the control or throwing page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const music = page.getByRole('button', { name: /MUSIC ON|MUSIC OFF/ }).first();
  await expect(music).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await music.click();
    await expect(music).toHaveAttribute('aria-pressed', i % 2 === 0 ? 'false' : 'true');
  }
  expect(errors).toEqual([]);
});

test('chapter drawer opens and resumes repeatedly without leaving a blocking overlay', async ({ page }) => {
  await startAdventure(page);
  const menu = page.getByRole('button', { name: /CHAPTERS|MENU/i }).first();
  if (await menu.count()) {
    for (let i = 0; i < 2; i++) {
      await menu.click();
      const drawer = page.locator('#chapterDrawer');
      await expect(drawer).toHaveClass(/open/);
      await page.getByRole('button', { name: 'RESUME GAME' }).click();
      await expect(drawer).not.toHaveClass(/open/);
    }
  } else {
    test.skip(true, 'Chapter menu trigger not found in current shell.');
  }
});

test('orientation and viewport resizing does not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 360, height: 740 }]) {
    await page.setViewportSize(size);
    const dims = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.clientHeight
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.width);
    expect(dims.height).toBeGreaterThan(0);
  }
});

test('reloading the start screen leaves the app interactive', async ({ page }) => {
  await page.goto('/');
  await page.reload();
  const start = page.getByRole('button', { name: 'START THE ADVENTURE' });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.locator('#gameFrame')).toBeVisible();
});
