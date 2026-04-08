import { test, expect } from '@playwright/test';

// Testing frontend and backend endpoints are online
test.describe('Health smoke test', {}, () => {

    // frontend page is up
    test('frontend landing page health check', async({ page }) => {
        await page.goto('/');
        // landing page should have 'Afterglow' on the page
        await expect(page.getByText('Afterglow')).toBeVisible();
    });

    // backend server is up
    test('server side health check', async({ request }) => {
        // get 200 reponse from backend healthcheck api
        const response = (await request.get('http://localhost:3001/health', {maxRedirects: 0}));
        expect(response?.status()).toBe(200);
    });
});