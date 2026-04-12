import { expect, test } from '@playwright/test';

test.describe('site navigation', () => {
  test('top navigation links use the deployed routes', async ({ page }) => {
    await page.goto('/');

    const projectsLink = page.locator('a[href="https://www.craigwatt.co.uk/projects"]').first();
    await expect(projectsLink).toHaveAttribute('href', 'https://www.craigwatt.co.uk/projects');
    await projectsLink.click();
    await expect(page).toHaveURL(/\/projects\/?$/);
    await expect(page.getByRole('heading', { name: "Projects and platforms I've built" })).toBeVisible();

    await page.goto('/');
    await expect(page.locator('a[href="https://www.craigwatt.co.uk/"]').first()).toHaveAttribute(
      'href',
      'https://www.craigwatt.co.uk/'
    );
  });
});

test.describe('writing', () => {
  test('blog filters and pagination work with static export links', async ({ page }) => {
    await page.goto('/blog');

    await page.getByRole('button', { name: 'All' }).click();
    const techLink = page.locator('a[href="https://www.craigwatt.co.uk/blog?category=Tech"]');
    await expect(techLink).toBeVisible();
    await techLink.click();
    await expect(page).toHaveURL(/category=Tech/);
    await expect(page.getByRole('heading', { name: 'Notes, write-ups, and the odd recipe' })).toBeVisible();
    await expect(page.locator('a[href="https://www.craigwatt.co.uk/blog/raspberry-pi-pxe-netboot-initramfs"]')).toBeVisible();

    await page.goto('/blog');
    const nextPageLink = page.locator('a[href="https://www.craigwatt.co.uk/blog?page=2"]');
    await expect(nextPageLink).toBeVisible();
    await nextPageLink.click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText('Page 2 of 2')).toBeVisible();

    await page.locator('a[href="https://www.craigwatt.co.uk/blog"]').filter({ hasText: '← Previous' }).click();
    await expect(page).toHaveURL(/\/blog\/?$/);
  });
});

test.describe('contact', () => {
  test('submits the contact form successfully when the API returns ok', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & {
        grecaptcha: {
          execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
      }).grecaptcha = {
        execute: async () => 'test-token',
      };
    });

    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/');
    await page.locator('#contact').getByLabel('Name').fill('Craig Watt');
    await page.locator('#contact').getByLabel('Email').fill('craig@example.com');
    await page.locator('#contact').getByLabel('Message').fill('Testing the contact form.');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Thank you!')).toBeVisible();
    await expect(page.getByText('I’ll be in touch soon.')).toBeVisible();
  });
});
