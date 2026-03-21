import { test, expect } from '@playwright/test';
import { profiles } from '../utils/profiles';

// Testing authentication flow (login/sign up -> dashboard)
test.describe('Testing auth flows', {}, () => {

    test('user is able to sign in to user dashboard', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name=email]', profiles.user.email);
        await page.fill('input[name=password]', profiles.user.password);

        await Promise.all([
            await page.click('button[type=submit]'),
            await expect(page).toHaveURL('/dashboard')
        ]);

    });

    test('user is able to sign up', async({ page }) => {
        await page.goto('/signup');
    });

});
