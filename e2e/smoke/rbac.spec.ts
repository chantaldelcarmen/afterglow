import { test, expect } from '@playwright/test';

// Ensure role permissions are enforced server side
test.describe('RBAC smoke test', {}, () => {

    // only user can access own experiences
    test('abc', async({ request }) => {

    });

    // reviewers/admins can access
    test('a', async({ request }) => {

    });

    // only admins can access
    test('ab', async() => {

    });
});