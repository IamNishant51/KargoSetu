import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page and display key elements', async ({ page }) => {
// Navigate to the home page
    await page.goto('/');

// 1. Check the title
    await expect(page).toHaveTitle(/KargoSetu/);

// 2. Verify the main heading (Hero Section)
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Smarter Decisions.');
    await expect(mainHeading).toContainText('Stronger ');
    await expect(mainHeading).toContainText('Voyages.');

// 3. Verify a key CTA button
    const getStartedBtn = page.locator('a', { hasText: 'Get Started Free' }).first();
    await expect(getStartedBtn).toBeVisible();

// 4. Verify navigation presence
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
  });
});
