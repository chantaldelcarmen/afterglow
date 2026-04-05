import { test, expect } from '@playwright/test';
import { profiles } from '../utils/profiles';

// Testing authentication flow (login/sign up -> dashboard -> profile -> settings -> logout)
test.describe('Testing auth flows', {}, () => {

    test('user is able to sign in and log out', async ({ page }) => {
        await page.goto('/signin');

        // Role = user
        await page.fill('#email', profiles.user.email);
        await page.fill('#password', profiles.user.password);

        await Promise.all([
            page.click('button[type=submit]'),
            // home page
            page.waitForURL('signin'),
        ]);

        // go to profile page and log out
        await page.locator('a[href="/profile"]').click();
        await expect(page).toHaveURL(/profile/);

        await expect(page.getByRole('heading', {name: /your profile/i})).toBeVisible();
        await expect(page.getByText('Experiences')).toBeVisible();
        await expect(page.getByText('Fragments')).toBeVisible();

        // log out process
        await Promise.all([
            page.getByRole('button', {name: /settings/i}).click(),
            // settings
            page.waitForURL('/settings'),
        ]);

        await Promise.all([
            page.getByRole('button', {name: /log out/i}).click(),
            // confirm logout 
            page.waitForURL('/logout/'),
        ]);

        await page.getByRole('button', {name: /yes, sign out/i}).click({timeout: 5000});
        await page.waitForURL('/signin'); 

        // confirm logout removes session
        await page.goto('/profile');
        await expect(page).toHaveURL('/signin');
    });


    test('user is able to go to sign up page', async({ page }) => {
        await page.goto('/signin');
        await page.click('button[type=button]');

        await expect(page).toHaveURL('/signup');
    });


    test('user enters the wrong password', async({ page }) => {
        await page.goto('/signin');

        await page.fill('#email', profiles.user.email);
        await page.fill('#password', 'wrong-password');

        await page.click('button[type=submit]'),

        await expect(page).toHaveURL('/signin');
        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });


    test('user enters the wrong email', async({ page }) => {
        await page.goto('/signin');

        await page.fill('#email', 'randomemail@gmail.com');
        await page.fill('#password', profiles.user.password);

        await page.click('button[type=submit]'),

        await expect(page).toHaveURL('/signin');
        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });


    test('attempting to skip sign in process', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/signin');

        await page.goto('/profile');
        await expect(page).toHaveURL('/signin');

        await page.goto('/insights');
        await expect(page).toHaveURL('/signin');

        await page.goto('/library');
        await expect(page).toHaveURL('/signin');
    });


    test('empty fields at sign in', async ({ page }) => {
        await page.goto('/signin');
        await page.click('button[type=submit]');

        await expect(page.locator('#email:invalid')).toHaveCount(1);

        await page.fill('#email', 'randomemail@gmail.com');
        await page.click('button[type=submit]');

        await expect(page.locator('#password:invalid')).toHaveCount(1);
    });


    test('logging out logs out across pages', async ({ browser }) => {
        const context = await browser.newContext();
        const page1 = await context.newPage();
        const page2 = await context.newPage();
        
        // first page logs in
        await page1.goto('/signin');

        // Role = user
        await page1.fill('#email', profiles.user.email);
        await page1.fill('#password', profiles.user.password);

        await Promise.all([
            page1.click('button[type=submit]'),
            // home page
            page1.waitForURL('/'),
        ]);

        // second page can access home page
        await page2.goto('/');

        // page 2 logs out
        await page2.goto('/logout');
        await page2.getByRole('button', {name: /yes, sign out/i}).click({timeout: 5000});
        await page2.waitForURL('/signin');

        // page 1 also gets logged out
        await page1.goto('/library');
        await expect(page1).toHaveURL('/signin');

    });


    test('user cannot use back button after log out', async({ page }) => {
        await page.goto('/signin');

        await page.fill('#email', profiles.user.email);
        await page.fill('#password', profiles.user.password);
        
        await Promise.all([
            page.click('button[type=submit]'),
            page.waitForURL('/'),
        ]);

        await page.goto('/logout');
        await page.getByRole('button', {name: /yes, sign out/i}).click({timeout: 5000});
        await page.waitForURL('/signin');

        // try to go back
        await page.goBack();
        await page.reload();

        await expect(page).toHaveURL('/signin');
    });
});
