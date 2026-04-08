import { test, expect } from '@playwright/test';
import { profiles } from '../utils/profiles';

// Ensure role permissions are enforced server side
test.describe('RBAC smoke test', {}, () => {

    test('3 users on simultaneously', async({ browser }) => {
        const user1 = await browser.newContext();
        const user2 = await browser.newContext();
        const user3 = await browser.newContext();

        const page1 = await user1.newPage();
        const page2 = await user2.newPage();
        const page3 = await user3.newPage();

        // Role = User
        await page1.goto('/signin');
        await page1.fill('#email', profiles.user.email);
        await page1.fill('#password', profiles.user.password);
        await page1.click('button[type=submit]');
        await page1.waitForURL('/');

        // Role = Platform reviewer
        await page2.goto('/signin');
        await page2.fill('#email', profiles.platform_reviewer.email);
        await page2.fill('#password', profiles.platform_reviewer.password);
        await page2.click('button[type=submit]');
        await page2.waitForURL('/');

        // Role = Admin
        await page3.goto('/signin');
        await page3.fill('#email', profiles.admin.email);
        await page3.fill('#password', profiles.admin.password);
        await page3.click('button[type=submit]');
        await page3.waitForURL('/');

        await page1.waitForLoadState('networkidle');
        await page2.waitForLoadState('networkidle');
        await page3.waitForLoadState('networkidle');

        // admin only route
        await Promise.all([
            page1.goto('/admin'),
            page2.goto('/admin'),
            page3.goto('/admin'),
        ]);

        await page1.waitForLoadState('networkidle');
        await page2.waitForLoadState('networkidle');
        await page3.waitForLoadState('networkidle');

        await expect(page1).toHaveURL('/unauthorized');
        await expect(page2).toHaveURL('/unauthorized');
        await expect(page3).toHaveURL('/admin');
        
        // reviewer only route
        await Promise.all([
            page1.goto('/reviewer'),
            page2.goto('/reviewer'),
            page3.goto('/reviewer'),
        ]);

        await page1.waitForLoadState('networkidle');
        await page2.waitForLoadState('networkidle');
        await page3.waitForLoadState('networkidle');

        await expect(page1).toHaveURL('/unauthorized'); 
        await expect(page2).toHaveURL('/reviewer'); 
        await expect(page3).toHaveURL('/reviewer');   
        
        await user1.close();
        await user2.close();
        await user3.close();
    });


    test('logging out and changing user roles', async({ page }) => {
        // sign in as admin first
        await page.goto('/signin');
        await page.fill('#email', profiles.admin.email);
        await page.fill('#password', profiles.admin.password);
        await page.click('button[type=submit]');
        await page.waitForURL('/');

        await page.goto('/admin');
        await expect(page).toHaveURL('/admin');

        await page.goto('/logout');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /yes, sign out/i }).waitFor({ state: 'visible' });
        await expect(page.getByRole('button', { name: /yes, sign out/i })).toBeEnabled();
        await page.getByRole('button', {name: /yes, sign out/i}).click({timeout: 5000});
        await page.waitForURL('/signin');

        // sign in as user and attempt admin route
        await page.fill('#email', profiles.user.email);
        await page.fill('#password', profiles.user.password);
        await page.click('button[type=submit]');
        await page.waitForURL('/');

        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL('/unauthorized');
    });
});