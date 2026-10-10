const { test, expect } = require('@playwright/test');
const path = require('path');
const gameFile = 'file://' + path.resolve('app/src/main/assets/index.html');

async function startAdventure(page) {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
  await expect(page.frameLocator('#gameFrame').locator('head #treasure-immersive-layout')).toHaveCount(1);
}

async function openChapterMenu(page) {
  await page.getByRole('button', { name: 'Open pause and chapter menu' }).click();
  await expect(page.locator('#chapterDrawer')).toHaveClass(/open/);
}

async function chooseChapter(page, chapterNumber) {
  await openChapterMenu(page);
  await page.locator('#chapterDrawer').getByRole('button', { name: 'CHAPTER ' + chapterNumber, exact: true }).click();
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#chapterLabel')).toContainText('Chapter ' + chapterNumber);
  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
  await expect(page.frameLocator('#gameFrame').locator('head #treasure-immersive-layout')).toHaveCount(1);
}

test.beforeEach(async ({ page }) => {
  await page.goto(gameFile);
});

test('shell loads without a JavaScript startup error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.getByRole('button', { name: 'START THE ADVENTURE' })).toBeVisible();
  await startAdventure(page);
  expect(errors, 'uncaught JavaScript errors').toEqual([]);
});

test('Chapter 1 starts and exposes movement and interaction controls', async ({ page }) => {
  await startAdventure(page);
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('canvas#game')).toBeVisible();
  await expect(game.getByRole('button', { name: 'ENTER THE FOREST' })).toBeVisible();
  await game.getByRole('button', { name: 'ENTER THE FOREST' }).click();
  for (const control of ['Move up', 'Move left', 'Move down', 'Move right']) {
    await expect(game.getByRole('button', { name: control })).toBeVisible();
  }
  await expect(game.getByRole('button', { name: 'INTERACT' })).toBeVisible();
});

for (const chapter of [1, 2, 3, 4]) {
  test(`Chapter ${chapter} loads, starts, and exposes playable touch controls`, async ({ page }) => {
    await startAdventure(page);
    await chooseChapter(page, chapter);
    const starts = {
      1: 'ENTER THE FOREST',
      2: 'BEGIN CHAPTER 2',
      3: 'DESCEND INTO THE ARCHIVE',
      4: 'ENTER THE HEART CHAMBER'
    };
    const game = page.frameLocator('#gameFrame');
    await expect(game.locator('canvas')).toBeVisible();
    await game.getByRole('button', { name: starts[chapter], exact: true }).click();
    const skip = game.locator('#skip');
    if (await skip.count()) {
      if (await skip.isVisible()) await skip.click({ force: true, timeout: 3000 });
    }
    for (const control of ['up', 'left', 'down', 'right']) {
      await expect(game.locator('#' + control)).toBeVisible();
    }
    await expect(game.locator('#' + (chapter === 1 ? 'interact' : 'act'))).toBeVisible();
  });
}
test('immersive gameplay keeps shell bars hidden and overlays compact controls on the canvas', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await startAdventure(page);
  const shell = await page.evaluate(() => ({
    header: getComputedStyle(document.querySelector('#shellHeader')).display,
    footer: getComputedStyle(document.querySelector('#shellFooter')).display,
    frame: document.querySelector('#frameWrap').getBoundingClientRect().toJSON()
  }));
  expect(shell.header).toBe('none');
  expect(shell.footer).toBe('none');
  expect(shell.frame.width).toBe(844);
  expect(shell.frame.height).toBe(390);

  const gameLayout = await page.frameLocator('#gameFrame').locator('#bottom').evaluate(el => ({
    position: getComputedStyle(el).position,
    bottom: getComputedStyle(el).bottom,
    hintVisible: getComputedStyle(el.querySelector('#hint')).display !== 'none',
    canvasHeight: el.ownerDocument.querySelector('canvas').getBoundingClientRect().height,
    viewportHeight: el.ownerDocument.documentElement.clientHeight
  }));
  expect(gameLayout.position).toBe('absolute');
  expect(gameLayout.hintVisible).toBe(true);
  expect(gameLayout.canvasHeight).toBe(gameLayout.viewportHeight);

  // Regression guard for the former 7-second timer that restored header/footer chrome.
  await page.waitForTimeout(7300);
  await expect(page.locator('#shellHeader')).toBeHidden();
  await expect(page.locator('#shellFooter')).toBeHidden();
});

test('chapter menu can switch chapters and resume', async ({ page }) => {
  await startAdventure(page);
  await chooseChapter(page, 3);
  await openChapterMenu(page);
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.locator('#chapterDrawer')).not.toHaveClass(/open/);
});

test('mobile viewport has no horizontal shell overflow and captures a screenshot', async ({ page }) => {
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
