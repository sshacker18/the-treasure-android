const { test, expect } = require('@playwright/test');
const path = require('path');
const gameFile = 'file://' + path.resolve('app/src/main/assets/index.html');

async function startAdventure(page) {
  await page.goto(gameFile);
  await expect(page.getByRole('button', { name: 'START THE ADVENTURE' })).toBeVisible();
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('#loading')).toBeHidden();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('body')).toBeVisible();
  await expect(game.locator('canvas').first()).toBeVisible();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  return game;
}

async function chooseChapter(page, chapterNumber) {
  await page.getByRole('button', { name: 'Open pause and chapter menu' }).click();
  await expect(page.locator('#chapterDrawer')).toHaveClass(/open/);
  await page.locator('#chapterDrawer').getByRole('button', { name: 'CHAPTER ' + chapterNumber, exact: true }).click();
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#chapterLabel')).toContainText('Chapter ' + chapterNumber);
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('body')).toBeVisible();
  await expect(game.locator('canvas').first()).toBeVisible();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  return game;
}

test('start screen teaches tap-to-move and Chapter 1 explains automatic relic pickup', async ({ page }) => {
  await page.goto(gameFile);
  await expect(page.locator('#intro')).toContainText('Quick tutorial');
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('#overlay .panel')).toContainText('How to play');
  await expect(game.locator('#overlay .panel')).toContainText('collect it automatically');
});

test('shell starts the adventure without uncaught JavaScript errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await startAdventure(page);
  expect(errors, 'uncaught JavaScript errors').toEqual([]);
  await expect(page.locator('#immersiveMenu')).toBeVisible();
});

test('Chapter 1 uses tap-to-move and hides legacy movement/action controls', async ({ page }) => {
  const game = await startAdventure(page);
  await expect(game.locator('canvas#game')).toBeVisible();
  await expect(game.locator('.pad')).toHaveCSS('display', 'none');
  await expect(game.locator('#interact')).toHaveCSS('display', 'none');
  await expect(game.locator('#up, #down, #left, #right')).toHaveCount(4);
});

test('tapping a relic destination moves the player and auto-collects the relic', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const game = await startAdventure(page);
  await game.locator('canvas#game').click({ position: { x: 310, y: 180 } });
  await expect(game.locator('#hud')).toContainText('RELICS 1/3', { timeout: 10000 });
});

for (const chapter of [1, 2, 3, 4]) {
  test(`Chapter ${chapter} smoke: loads, starts, and keeps manual controls hidden`, async ({ page }) => {
    const game = chapter === 1 ? await startAdventure(page) : await (async () => {
      await startAdventure(page);
      return chooseChapter(page, chapter);
    })();
    await expect(page.locator('#chapterLabel')).toContainText('Chapter ' + chapter);
    await expect(game.locator('canvas').first()).toBeVisible();
    await expect(game.locator('#overlay')).toHaveClass(/hidden/);
    if (chapter === 4) {
      await expect(game.locator('#overlay .panel')).toContainText('Final chapter tutorial');
      await expect(game.locator('#overlay .panel')).toContainText('shockwaves');
    }
    await expect(game.locator('.pad')).toHaveCSS('display', 'none');
    const action = game.locator('#interact, #act');
    await expect(action).toHaveCount(1);
    await expect(action).toHaveCSS('display', 'none');
    const canvas = game.locator('canvas').first();
    const bounds = await canvas.boundingBox();
    await canvas.click({ position: { x: Math.max(12, Math.min(bounds.width - 12, bounds.width * 0.65)), y: Math.max(12, Math.min(bounds.height - 12, bounds.height * 0.55)) } });
    await expect(canvas).toBeVisible();
  });
}

test('chapter menu switches chapters and resumes cleanly', async ({ page }) => {
  await startAdventure(page);
  await chooseChapter(page, 3);
  await page.getByRole('button', { name: 'Open pause and chapter menu' }).click();
  await expect(page.locator('#chapterDrawer')).toHaveClass(/open/);
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.locator('#chapterDrawer')).not.toHaveClass(/open/);
});

test('mobile viewport has no horizontal shell overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(gameFile);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.clientHeight
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.height).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/artifacts/mobile-start-screen.png', fullPage: true });
});
