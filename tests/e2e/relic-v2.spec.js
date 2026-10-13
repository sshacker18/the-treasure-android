const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const gameUrl = pathToFileURL(path.resolve(__dirname, '../../app/src/main/assets/relic-v2.html')).href;

test.describe('RELIC V2 linear campaign', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(gameUrl);
    await expect(page.locator('#stageCanvas')).toBeVisible();
    await expect(page.locator('#stageTitle')).toContainText('STAGE 1');
  });

  test('defines exactly 16 stages across four chapters with strictly increasing difficulty', async ({ page }) => {
    const result = await page.evaluate(() => ({
      count: window.RelicV2.getStages().length,
      chapters: [...new Set(window.RelicV2.getStages().map(stage => stage.chapter))],
      ids: window.RelicV2.getStages().map(stage => stage.id),
      difficulty: window.RelicV2.getStages().map(stage => stage.difficulty),
      chapterCounts: [1, 2, 3, 4].map(chapter => window.RelicV2.getStages().filter(stage => stage.chapter === chapter).length)
    }));
    expect(result.count).toBe(16);
    expect(result.chapters).toEqual([1, 2, 3, 4]);
    expect(result.ids).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    expect(result.chapterCounts).toEqual([4, 4, 4, 4]);
    expect(result.difficulty.every((value, index, all) => index === 0 || value > all[index - 1])).toBeTruthy();
  });

  test('next and previous navigation updates stage metadata and clamps at boundaries', async ({ page }) => {
    await page.getByRole('button', { name: 'Next stage', exact: true }).click();
    await expect(page.locator('#stageTitle')).toContainText('STAGE 2');
    await expect(page.locator('#stageProgress')).toHaveText('Stage 2 of 16');
    await page.getByRole('button', { name: 'Previous stage' }).click();
    await expect(page.locator('#stageTitle')).toContainText('STAGE 1');
    await expect(page.getByRole('button', { name: 'Previous stage' })).toBeDisabled();
    for (let i = 0; i < 15; i++) await page.getByRole('button', { name: 'Next stage', exact: true }).click();
    await expect(page.locator('#stageTitle')).toContainText('STAGE 16');
    await expect(page.getByRole('button', { name: 'Next stage', exact: true })).toBeDisabled();
  });

  test('stage selector loads the selected stage and objective', async ({ page }) => {
    await page.getByLabel('Select stage').selectOption('8');
    await expect(page.locator('#stageTitle')).toContainText('STAGE 8');
    await expect(page.locator('#stageMeta')).toContainText('The Sunken Temple');
    await expect(page.locator('#stageObjective')).toContainText('guardian');
  });

  test('character selection updates active state and accessible character description', async ({ page }) => {
    const sameer = page.getByRole('button', { name: /Sameer/ });
    await sameer.click();
    await expect(sameer).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#characterBio')).toContainText('jungle guide');
    const mina = page.getByRole('button', { name: /Mina/ });
    await mina.click();
    await expect(mina).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#characterBio')).toContainText('city-born');
  });

  test('canvas renders and touch controls are available in responsive layout', async ({ page }) => {
    const canvas = page.locator('#stageCanvas');
    await expect(canvas).toBeVisible();
    const dimensions = await canvas.evaluate(el => ({ width: el.width, height: el.height, cssWidth: el.clientWidth, cssHeight: el.clientHeight }));
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    expect(dimensions.cssWidth).toBeGreaterThan(0);
    expect(dimensions.cssHeight).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'Move left' })).toBeAttached();
    await expect(page.getByRole('button', { name: 'Move right' })).toBeAttached();
  });
});

test.describe('RELIC V2 virtual controller', () => {
  test('action buttons expose the intended action feedback', async ({ page }) => {
    await page.goto(gameUrl);
    await page.getByRole('button', { name: 'Triangle: attack' }).dispatchEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
    await expect(page.locator('#controlFeedback')).toContainText('ATTACK');
    await page.getByRole('button', { name: 'Square: interact' }).dispatchEvent('pointerdown', { pointerId: 2, clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
    await expect(page.locator('#controlFeedback')).toContainText('INTERACT');
    await page.getByRole('button', { name: 'Circle: dodge' }).dispatchEvent('pointerdown', { pointerId: 3, clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
    await expect(page.locator('#controlFeedback')).toContainText('DODGE');
    await page.getByRole('button', { name: 'Cross: jump' }).dispatchEvent('pointerdown', { pointerId: 4, clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
    await expect(page.locator('#controlFeedback')).toContainText('JUMP');
  });

  test('virtual stick accepts pointer interaction and resets after release', async ({ page }) => {
    await page.goto(gameUrl);
    const stick = page.getByRole('application', { name: 'Movement joystick' });
    await stick.dispatchEvent('pointerdown', { pointerId: 1, clientX: 60, clientY: 60, pointerType: 'touch', isPrimary: true });
    await stick.dispatchEvent('pointermove', { pointerId: 1, clientX: 100, clientY: 60, pointerType: 'touch', isPrimary: true });
    const heldRight = await page.evaluate(() => window.relicV2Game.state.held.has('right'));
    expect(heldRight).toBeTruthy();
    await stick.dispatchEvent('pointerup', { pointerId: 1, clientX: 100, clientY: 60, pointerType: 'touch', isPrimary: true });
    const released = await page.evaluate(() => !window.relicV2Game.state.held.has('right'));
    expect(released).toBeTruthy();
  });
});
