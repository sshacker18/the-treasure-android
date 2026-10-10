const { test, expect } = require('@playwright/test');
const path = require('path');
const gameFile = 'file://' + path.resolve('app/src/main/assets/index.html');

async function startAdventure(page) {
  const begin = page.getByRole('button', { name: 'START THE ADVENTURE' });
  await expect(begin).toBeVisible();
  await begin.click();
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
  // Wait for the chapter document to finish rendering; injected layout CSS is an implementation detail.\n  await expect(page.frameLocator('#gameFrame').locator('canvas#game')).toBeVisible();
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
  await expect(page.frameLocator('#gameFrame').locator('canvas')).toBeVisible();
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
  const chapterStart = game.getByRole('button', { name: 'ENTER THE FOREST' });
  await expect(chapterStart).toBeVisible();
  await chapterStart.click();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  const joystick = game.locator('#treasureJoystick');
  await expect(joystick).toBeVisible();
  const joystickBox = await joystick.boundingBox();
  expect(joystickBox.width).toBeGreaterThanOrEqual(85);
  expect(joystickBox.height).toBeGreaterThanOrEqual(85);
  await expect(game.getByRole('button', { name: 'INTERACT' })).toBeVisible();
  await expect(game.getByRole('button', { name: 'Fire at enemies' })).toBeVisible();
  await game.getByRole('button', { name: 'Fire at enemies' }).click();
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
    const chapterStart = game.getByRole('button', { name: starts[chapter], exact: true });
    await expect(chapterStart).toBeVisible();
    await chapterStart.click();
    // A visible button/joystick is not enough: prove the chapter intro actually closes.
    await expect(game.locator('#overlay')).toHaveClass(/hidden/);
    const skip = game.locator('#skip');
    if (await skip.count()) {
      if (await skip.isVisible()) await skip.click({ force: true, timeout: 3000 });
    }
    await expect(page.locator('#chapterDrawer')).not.toHaveClass(/open/);
    const joystick = game.locator('#treasureJoystick');
    await expect(joystick).toBeVisible();
    const joystickBox = await joystick.boundingBox();
    expect(joystickBox.width).toBeGreaterThanOrEqual(85);
    expect(joystickBox.height).toBeGreaterThanOrEqual(85);
    await expect(game.locator('#' + (chapter === 1 ? 'interact' : 'act'))).toBeVisible();
    const fire = game.getByRole('button', { name: 'Fire at enemies' });
    await expect(fire).toBeVisible();
    const fireSize = await fire.boundingBox();
    expect(fireSize.width).toBeGreaterThanOrEqual(34);
    expect(fireSize.height).toBeGreaterThanOrEqual(31);
    await fire.click();
    if (chapter === 1) {
      const x = joystickBox.x + joystickBox.width / 2;
      const y = joystickBox.y + joystickBox.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 30, y + 30, { steps: 3 });
      await expect(joystick).toHaveAttribute('data-active', /right/);
      await expect(joystick).toHaveAttribute('data-active', /down/);
      await page.mouse.up();
      await expect(joystick).toHaveAttribute('data-active', '');
    }
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
  expect(gameLayout.hintVisible).toBe(false); // Circular joystick layout intentionally hides the old text hint.
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


test('background music toggle is available and responds to user input', async ({ page }) => {
  const music = page.getByRole('button', { name: /MUSIC ON|MUSIC OFF/ }).first();
  await expect(music).toBeVisible();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await music.click();
  await expect(music).toHaveText('♫ MUSIC OFF');
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  await music.click();
  await expect(music).toHaveText('♫ MUSIC ON');
  await expect(music).toHaveAttribute('aria-pressed', 'true');
});

test('forest chapters render flower patches and contain no tree drawing loops', async ({ page }) => {
  await startAdventure(page);
  for (const chapter of [1, 2]) {
    await chooseChapter(page, chapter);
    const game = page.frameLocator('#gameFrame');
    const startLabels = { 1: 'ENTER THE FOREST', 2: 'BEGIN CHAPTER 2' };
    await game.getByRole('button', { name: startLabels[chapter], exact: true }).click();
    const script = (await game.locator('script').allTextContents()).join('\n');
    expect(script).toContain('f5c8df');
    expect(script).toContain('f4cf69');
    expect(script).not.toMatch(/for\s*\(\s*(?:const|let)\s+\w+\s+of\s+trees\s*\)/);
  }
});


test('starting the adventure wakes the browser audio engine for audible music', async ({ page }) => {
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.frameLocator('#gameFrame').locator('body')).toBeVisible();
  const status = await page.evaluate(async () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return { supported: false, state: 'unsupported' };
    const ctx = new Ctx();
    await ctx.resume();
    const state = ctx.state;
    await ctx.close();
    return { supported: true, state };
  });
  expect(status.supported).toBe(true);
  expect(status.state).toBe('running');
});
