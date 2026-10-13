const { test, expect } = require('@playwright/test');
const path = require('path');
const gameFile = 'file://' + path.resolve('app/src/main/assets/index.html');

const missionByChapter = {
  1: 'Find the 3 relics and reach the cave',
  2: 'Recover the 3 seals and open the gate',
  3: 'Recover 5 fragments and reach the exit',
  4: 'Find 4 heart-shards and face the Heart'
};

async function startAdventure(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(gameFile);
  await expect(page.getByRole('button', { name: 'START THE ADVENTURE' })).toBeVisible();
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('#loading')).toBeHidden();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('body')).toBeVisible();
  await expect(game.locator('canvas').first()).toBeVisible();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  expect(errors, 'uncaught JavaScript errors during launch').toEqual([]);
  return game;
}

async function loadChapterForTest(page, chapterNumber) {
  // Chapter selection is intentionally not exposed in the player-facing UI.
  // Use the wrapper's internal loader only as a test harness to smoke-test every embedded chapter.
  await page.evaluate((index) => {
    if (typeof window.loadChapter !== 'function') throw new Error('Internal chapter loader unavailable');
    window.loadChapter(index);
  }, chapterNumber - 1);
  await expect(page.locator('#loading')).toBeHidden({ timeout: 15000 });
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('body')).toBeVisible();
  await expect(game.locator('canvas').first()).toBeVisible();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  return game;
}

test('start screen teaches tap-to-move and automatic pickups', async ({ page }) => {
  await page.goto(gameFile);
  await expect(page.locator('#intro')).toContainText('Quick tutorial');
  await page.getByRole('button', { name: 'START THE ADVENTURE' }).click();
  await expect(page.locator('#intro')).toBeHidden();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('#missionHud')).toBeVisible();
  await expect(game.locator('#missionText')).toHaveText(missionByChapter[1]);
});

test('launch is immersive and has no uncaught JavaScript errors', async ({ page }) => {
  const game = await startAdventure(page);
  await expect(page.locator('#immersiveMenu')).toBeHidden();
  await expect(game.locator('#bottom')).toHaveCSS('display', 'none');
  await expect(game.locator('#actions')).toHaveCSS('display', 'none');
});

test('Chapter 1 exposes only the compact HUD, minimap, joystick and two-option assistant', async ({ page }) => {
  const game = await startAdventure(page);
  await expect(game.locator('#missionHud')).toBeVisible();
  await expect(game.locator('#missionText')).toHaveText(missionByChapter[1]);
  await expect(game.locator('#miniMapWrap')).toBeVisible();
  await expect(game.locator('#miniMap')).toBeVisible();
  await expect(game.locator('#virtualJoystick')).toBeVisible();
  await expect(game.locator('.pad')).toHaveCSS('display', 'none');
  await game.locator('#assistantButton').click();
  await expect(game.locator('#assistantPanel')).toHaveClass(/open/);
  await expect(game.locator('#assistantPanel button')).toHaveCount(2);
  await expect(game.locator('#assistantMission')).toBeVisible();
  await expect(game.locator('#assistantControls')).toBeVisible();
  await game.locator('#assistantMission').click();
  await expect(game.locator('#assistantDialog')).toHaveClass(/open/);
  await expect(game.locator('#assistantDialog')).toContainText('Mission guide');
});

test('tapping a relic destination moves the player and auto-collects the relic', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const game = await startAdventure(page);
  await game.locator('canvas#game').click({ position: { x: 310, y: 180 } });
  await expect(game.locator('#hud')).toContainText('RELICS 1/3', { timeout: 10000 });
});

const objectiveByChapter = {
  1: { target: { x: 310, y: 180 }, hud: 'RELICS 1/3' },
  2: { target: { x: 290, y: 235 }, hud: 'SEALS 1/3' },
  3: { target: { x: 300, y: 210 }, hud: 'FRAGMENTS 1/5' },
  4: { target: { x: 320, y: 240 }, hud: 'SHARDS 1/4' }
};

async function enterChapter(page, chapterNumber) {
  await startAdventure(page);
  if (chapterNumber > 1) await loadChapterForTest(page, chapterNumber);
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  await expect(game.locator('#missionText')).toHaveText(missionByChapter[chapterNumber]);
  await expect(game.locator('#miniMapWrap')).toBeVisible();
  await expect(game.locator('#virtualJoystick')).toBeVisible();
  return game;
}

for (const chapter of [1, 2, 3, 4]) {
  test(`Chapter ${chapter} gameplay E2E: move to and automatically collect the first objective`, async ({ page }) => {
    test.setTimeout(35000);
    const game = await enterChapter(page, chapter);
    const objective = objectiveByChapter[chapter];
    const canvas = game.locator('canvas#c');
    await expect(canvas).toBeVisible();

    // Use the same tap-to-move input available to the player. Do not set
    // internal game state or invoke the collection handler directly.
    await canvas.click({ position: objective.target });
    await expect(game.locator('#hud')).toContainText(objective.hud, { timeout: 12000 });
    await expect(game.locator('#missionText')).toHaveText(missionByChapter[chapter]);
  });
}

test('Chapter 3 checkpoint activates once and does not repeatedly lock movement', async ({ page }) => {
  test.setTimeout(40000);
  const game = await enterChapter(page, 3);
  const canvas = game.locator('canvas#c');

  // Activate the first checkpoint through tap-to-move and automatic interaction.
  await canvas.click({ position: { x: 720, y: 520 } });
  await expect(game.locator('#cinema')).toHaveClass(/show/, { timeout: 10000 });
  await expect(game.locator('#ctitle')).toHaveText('SAFE GROUND');
  await expect(game.locator('#cinema')).not.toHaveClass(/show/, { timeout: 5000 });

  // Leave and return. A checkpoint that has already been activated must not
  // reopen the same dialogue or leave the game stuck in its story-pause state.
  await canvas.click({ position: { x: 500, y: 400 } });
  await page.waitForTimeout(1800);
  await canvas.click({ position: { x: 720, y: 520 } });
  await page.waitForTimeout(1800);
  await expect(game.locator('#cinema')).not.toHaveClass(/show/);
  await expect(game.locator('#virtualJoystick')).toBeVisible();
  await expect(game.locator('#hud')).toContainText('FRAGMENTS');
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
