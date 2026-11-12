import { chromium } from 'playwright-core';
// BROWSER_PATH points at a specific Chromium-based browser; otherwise an installed channel is used
// (BROWSER_CHANNEL, defaulting to Edge on Windows and Chrome elsewhere).
const browser = await chromium.launch({
    ...(process.env.BROWSER_PATH
        ? { executablePath: process.env.BROWSER_PATH }
        : { channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chrome') }),
    headless: true,
    args: ['--no-sandbox'],
});
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8082/';
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
    await page.goto(baseUrl);
    await page.getByPlaceholder('User name or email').fill('admin');
    await page.getByPlaceholder('Password', { exact: true }).fill('password');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('**/app/home');
    await page.getByRole('menuitem', { name: 'Users', exact: true }).click();
    await page.getByRole('main').getByText('Admin User').first().waitFor();
    await page.getByRole('button', { name: 'Reset password' }).first().click();
    await page.getByLabel('Admin password').fill('admin-password');
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
    await page.getByText('Saved successfully').first().waitFor();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name', { exact: true }).fill('Test');
    await dialog.getByLabel('Surname').fill('Person');
    await dialog.getByLabel('User name', { exact: true }).fill('testuser');
    await dialog.getByLabel('Email address').fill('test@example.com');
    await dialog.getByLabel('Password', { exact: true }).fill('Password1');
    await dialog.getByLabel('Confirm password').fill('Password1');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Test Person').first().waitFor();
    const userRow = page.getByRole('row').filter({ hasText: 'testuser' }).last();
    await userRow.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('dialog').getByLabel('Name', { exact: true }).fill('Updated');
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
    const sortingRequest = page.waitForRequest(
        (r) => r.url().includes('/User/GetAll') && r.url().includes('Sorting=userName')
    );
    await page.getByRole('columnheader', { name: 'User name' }).click();
    await sortingRequest;

    await page.getByRole('menuitem', { name: 'Roles', exact: true }).click();
    await page.getByText('Admin', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    let d = page.getByRole('dialog');
    await d.getByLabel('Name', { exact: true }).fill('Tester');
    await d.getByLabel('Display name').fill('Test role');
    await d.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Test role', { exact: true }).first().waitFor();
    let roleRow = page.getByRole('row').filter({ hasText: 'Test role' }).last();
    await roleRow.getByRole('button', { name: 'Edit' }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('Display name').fill('Updated role');
    await d.getByRole('button', { name: 'Save' }).click();
    roleRow = page.getByRole('row').filter({ hasText: 'Updated role' }).last();
    await roleRow.getByRole('button', { name: 'Delete' }).click();
    await page.locator('.el-message-box__btns .el-button--primary').click();
    await page.getByText('Deleted successfully').first().waitFor();
    await page.getByRole('menuitem', { name: 'Tenants', exact: true }).click();
    await page.getByText('Default', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('Tenancy name').fill('Example');
    await d.getByLabel('Name', { exact: true }).fill('Example Tenant');
    await d.getByLabel('Admin email address').fill('admin@example.com');
    await d.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Example Tenant').first().waitFor();
    let tenantRow = page.getByRole('row').filter({ hasText: 'Example Tenant' }).last();
    await tenantRow.getByRole('button', { name: 'Edit' }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('Name', { exact: true }).fill('Updated Tenant');
    await d.getByRole('button', { name: 'Save' }).click();
    tenantRow = page.getByRole('row').filter({ hasText: 'Updated Tenant' }).last();
    await tenantRow.getByRole('button', { name: 'Delete' }).click();
    await page.locator('.el-message-box__btns .el-button--primary').click();
    await page.getByText('Deleted successfully').first().waitFor();
    await page.goto(baseUrl + 'app/update-password');
    await page.getByLabel('Current password').fill('password');
    await page.getByLabel('New password', { exact: true }).fill('Password2');
    await page.getByLabel('Confirm new password').fill('Password2');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL('**/app/home');
    const guest = await browser.newPage();
    await guest.goto(baseUrl + '?abp_tenancy_name=Default');
    await guest.getByRole('link', { name: 'Register' }).click();
    await guest.getByPlaceholder('Name', { exact: true }).fill('New');
    await guest.getByPlaceholder('Surname').fill('User');
    await guest.getByPlaceholder('User name', { exact: true }).fill('newuser');
    await guest.getByPlaceholder('Email address').fill('new@example.com');
    await guest.getByPlaceholder('Password', { exact: true }).fill('password');
    await guest.getByRole('button', { name: 'Register', exact: true }).click();
    await guest.waitForURL('**/account/login');
    await guest.close();
    if (errors.length) throw Error(errors.join('\n'));
    console.log(
        'PASS login, users create, reset password, role and tenant CRUD, change password, tenant resolution and registration'
    );
} finally {
    await browser.close();
}
