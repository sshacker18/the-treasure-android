const { test, expect } = require('@playwright/test');
const path = require('path');
const gameFile = 'file://' + path.resolve('app/src/main/assets/index.html');

test.beforeEach(async ({ page }) => {
  await page.goto(gameFile);
});

test('shell loads without a JavaScript startup error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.getByRole('button', { name: 'START THE ADVENTURE' })).toBeVisible();
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
  expect(errors, 'uncaught JavaScript errors').toEqual([]);
});

test('Chapter 1 starts and exposes movement and interaction controls', async ({ page }) => {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('canvas#game')).toBeVisible();
  await expect(game.getByRole('button', { name: 'ENTER THE FOREST' })).toBeVisible();
  await game.getByRole('button', { name: 'ENTER THE FOREST' }).click();
  await expect(game.locator('#joystick')).toBeVisible();
  await expect(game.locator('#joyKnob')).toBeVisible();
  await expect(game.getByRole('button', { name: 'INTERACT' })).toBeVisible();
});

test('all four chapters can be selected and loaded', async ({ page }) => {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  for (const chapter of ['1', '2', '3', '4']) {
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('button', { name: new RegExp('CHAPTER ' + chapter, 'i') }).click();
    await expect(page.locator('#loading')).toBeHidden();
    await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
    await expect(page.locator('#chapterLabel')).toContainText('Chapter ' + chapter);
  }
});

test('pause menu can open, switch chapters, and resume', async ({ page }) => {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await page.getByRole('button', { name: /menu/i }).click();
  await expect(page.locator('#chapterDrawer')).toHaveClass(/open/);
  await page.getByRole('button', { name: 'CHAPTER 3' }).click();
  await expect(page.locator('#chapterLabel')).toContainText('Chapter 3');
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.locator('#chapterDrawer')).not.toHaveClass(/open/);
});

test('music toggle switches ON and OFF in the game shell', async ({ page }) => {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  const music = page.locator('#musicToggle');
  await expect(music).toBeVisible();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await music.click();
  await expect(music).toHaveText(/MUSIC OFF/i);
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  await music.click();
  await expect(music).toHaveText(/MUSIC ON/i);
  await expect(music).toHaveAttribute('aria-pressed', 'true');
});

test('mobile viewport has no horizontal shell overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.reload();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.clientHeight
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.height).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/artifacts/mobile-start-screen.png', fullPage: true });
});
