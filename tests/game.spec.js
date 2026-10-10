const { test, expect } = require('@playwright/test');
const path = require('path');
const gameUrl = 'file://' + path.resolve(__dirname, '../app/src/main/assets/index.html');

test('launcher renders and Begin button opens Chapter 1', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(gameUrl);
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#begin')).toBeVisible();
  await page.locator('#begin').click();
  await expect(page.locator('#intro')).toBeHidden();
  const frame = page.frameLocator('#gameFrame');
  await expect(frame.locator('#start')).toBeVisible();
  expect(pageErrors, 'Launcher JavaScript errors').toEqual([]);
});

test('chapter drawer can launch Chapter 4', async ({ page }) => {
  await page.goto(gameUrl);
  await page.locator('#openChapterMenu').click();
  await page.locator('#chapterDrawer [data-chapter="3"]').click();
  await expect(page.locator('#intro')).toBeHidden();
  const frame = page.frameLocator('#gameFrame');
  await expect(frame.locator('#start')).toBeVisible();
  await expect(frame.locator('header #sub')).toContainText('CHAPTER 04');
});
