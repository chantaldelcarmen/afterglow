import { test, expect } from '@playwright/test';
import { profiles } from '../utils/profiles';

// Testing authentication flow (login/sign up -> dashboard)
test.describe('Testing auth flows', {}, () => {

    test('user is able to sign in to user dashboard', async ({ page }) => {
        await page.goto('http://localhost:3000/signin');

        await page.fill('#email', profiles.user.email);
        await page.fill('#password', profiles.user.password);

        await Promise.all([
            await page.click('button[type=submit]'),
            
            // change to dashboard when available
            await expect(page).toHaveURL('http://localhost:3000')
        ]);

    });

    test('user is able to sign up', async({ page }) => {
        await page.goto('http://localhost:3000/signup');
    });

});
