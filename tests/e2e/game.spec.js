const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#begin')).toBeVisible();
});

test('launches the game and starts Chapter 1 without a blank frame', async ({ page }) => {
  await page.locator('#begin').click();
  const game = page.frameLocator('#gameFrame');
  await expect(game.locator('#start')).toBeVisible();
  await game.locator('#start').click();
  await expect(game.locator('#overlay')).toHaveClass(/hidden/);
  await expect(game.locator('canvas')).toBeVisible();
  await expect(game.locator('#interact')).toBeVisible();
  await expect(game.locator('#right')).toBeVisible();
});

for (const chapter of [
  { index: 1, title: /FORGOTTEN RUINS/i, start: '#start' },
  { index: 2, title: /CHAPTER 3|SHADOW/i, start: '#start' },
  { index: 3, title: /HEART BELOW|CHAPTER 4/i, start: '#start' }
]) {
  test(`opens chapter ${chapter.index + 1} from the in-game menu`, async ({ page }) => {
    await page.locator('#begin').click();
    await page.locator('#openChapterMenu').click();
    await page.locator(`#chapterDrawer [data-chapter="${chapter.index}"]`).click();
    const game = page.frameLocator('#gameFrame');
    await expect(game.locator(chapter.start)).toBeVisible();
    await expect(game.locator('canvas')).toBeVisible();
    await game.locator(chapter.start).click();
    await expect(game.locator('#overlay')).toHaveClass(/hidden/);
    await expect(game.locator('canvas')).toBeVisible();
  });
}

test('previous and next chapter navigation remain available', async ({ page }) => {
  await expect(page.locator('#prev')).toBeVisible();
  await expect(page.locator('#next')).toBeVisible();
  await page.locator('#next').click();
  await expect(page.locator('#gameFrame')).toBeVisible();
  await page.locator('#prev').click();
  await expect(page.locator('#gameFrame')).toBeVisible();
});
