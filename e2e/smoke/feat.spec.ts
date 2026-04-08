import { test, expect, Page } from '@playwright/test';
import { profiles } from '../utils/profiles';

type ProfileTypes = 'user' | 'platform_reviewer' | 'admin';

// signin helper function
async function signin(page: Page, role: ProfileTypes) {
  const login = profiles[role];

  await page.goto('/signin');

  await page.fill('#email', login.email);
  await page.fill('#password', login.password);
  
  await Promise.all([
    page.click('button[type=submit]'),
    page.waitForURL('/'),
  ]);
}

test.describe('Experience feature testing', {}, () => {

    test.afterEach(async () => {
    });

    test('user successfully relives most recent experience', async ({ page }) => {
        await signin(page, 'user');
        await Promise.all([
            page.waitForURL('**/experience/**'),
            page.getByRole('button', { name: /relive now/i }).click(),
        ]);

        // most recent experience page from home page
        await expect(page.getByRole('heading', { name: /about this moment/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Fragments/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Reflections/i })).toBeVisible();

        // begin reliving
        await Promise.all([
            page.waitForURL('**/relive/**'),
            page.getByRole('button', { name: /relive experience/i }).click(),
        ]);

        await expect(page.getByText('Context')).toBeVisible();
        await expect(page.getByText('Peak')).toBeVisible();
        await expect(page.getByText('Afterglow')).toBeVisible();

        // finish reliving without saving reflection
        await expect(page.getByRole('button', { name: /maybe later/i })).toBeVisible();
        await page.getByRole('button', { name: /maybe later/i }).click();

        await expect(page.getByRole('button', { name: /relive experience/i })).toBeVisible();

    });

    test('user successfully views insights page with data', async({ page }) => {
        await signin(page, 'user');
        await page.getByRole('link', { name: 'Insights' }).click();

        await expect(page).toHaveURL('/insights');

        const cards = page.locator('h3'); 
        await expect(cards.first()).toBeVisible();
        
        await expect(page.getByText('Most Active Month')).toBeVisible();
        await expect(page.getByText('Most Frequent Emotion')).toBeVisible();
        await expect(page.getByText('Most Visited Place')).toBeVisible();
        await expect(page.getByText('Most Active Time of Day')).toBeVisible();
    });

    test('user successfully views library', async({ page }) => {
        await signin(page, 'user');
        await page.getByRole('link', { name: 'Library' }).click();

        await expect(page.getByText('Your Library')).toBeVisible();
        // search for non existent experience
        await page.getByRole('textbox', {name: /search experiences.../i}).click();
        await page.getByRole('textbox', {name: /search experiences.../i}).fill('Golden Beach');
        await page.getByRole('button', {name: /apply/i}).click();
        await expect(page.getByText('No matches found.')).toBeVisible();

        // clear search
        await page.getByRole('textbox', {name: /search experiences.../i}).click();
        await page.getByRole('button', {name: /clear/i}).nth(0).click();
        await page.getByRole('button', {name: /apply/i}).click();

        // click on an experience
        const cards = page.locator('h3'); 
        await expect(cards.nth(2)).toBeVisible();
        await cards.nth(2).click();
        // 3rd experience from the library
        await expect(page.getByRole('heading', { name: /about this moment/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Fragments/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Reflections/i })).toBeVisible();

        await page.goBack();
        await expect(page).toHaveURL('/library');
    });

    test('user successfully create an experience', async({ page }) => {
        await signin(page, 'user');
        await page.getByRole('link', { name: 'Create' }).click();
        await expect(page.getByRole('heading', { name: 'Create Experience' })).toBeVisible();

        // fill in title
        await page.getByRole('textbox', {name: /Title */i}).click();
        await page.getByRole('textbox', {name: /Title */i}).fill('Test experience');

        // fill in date
        await page.getByRole('textbox', {name: /Date */i}).click();
        await page.getByRole('textbox', {name: /Date */i}).fill('2026-01-01');
    });
});