import { test, expect } from '@playwright/test';

/**
 * Example E2E Test
 *
 * This is a basic example to verify Playwright is configured correctly.
 * Replace with actual test cases for your application.
 */

test.describe('Marketing Admin - Basic Navigation', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that we're on the correct page
    expect(page.url()).toContain('localhost:3003');
  });

  test('should have the correct title', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Marketing/i);
  });

  // Add more tests as you build features
  test.skip('should navigate to campaigns page', async ({ page }) => {
    await page.goto('/');

    // Click on campaigns link
    await page.click('text=Campaigns');

    // Verify we're on the campaigns page
    await expect(page).toHaveURL(/\/campaigns/);
  });
});
