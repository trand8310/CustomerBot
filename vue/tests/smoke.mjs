import { chromium } from 'playwright-core';
const browser = await chromium.launch({
    executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
    args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:8082/');
    await page.getByPlaceholder('用户名或邮箱').fill('admin');
    await page.getByPlaceholder('密码', { exact: true }).fill('password');
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await page.waitForURL('**/app/home');
    await page.getByRole('menuitem', { name: '用户', exact: true }).click();
    await page.getByRole('main').getByText('Admin User').first().waitFor();
    await page.getByRole('button', { name: '重置密码' }).first().click();
    await page.getByLabel('管理员密码').fill('admin-password');
    await page.getByRole('dialog').getByRole('button', { name: '保存' }).click();
    await page.getByText('保存成功').first().waitFor();
    await page.getByRole('button', { name: '新建', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('名字').fill('Test');
    await dialog.getByLabel('姓氏').fill('Person');
    await dialog.getByLabel('用户名').fill('testuser');
    await dialog.getByLabel('邮箱').fill('test@example.com');
    await dialog.getByLabel('密码', { exact: true }).fill('Password1');
    await dialog.getByLabel('确认密码').fill('Password1');
    await dialog.getByRole('button', { name: '保存' }).click();
    await page.getByText('Test Person').first().waitFor();
    const userRow = page.getByRole('row').filter({ hasText: 'testuser' }).last();
    await userRow.getByRole('button', { name: '编辑' }).click();
    await page.getByRole('dialog').getByLabel('名字').fill('Updated');
    await page.getByRole('dialog').getByRole('button', { name: '保存' }).click();
    const sortingRequest = page.waitForRequest(
        (r) => r.url().includes('/User/GetAll') && r.url().includes('Sorting=userName')
    );
    await page.getByRole('columnheader', { name: '用户名' }).click();
    await sortingRequest;

    await page.getByRole('menuitem', { name: '角色', exact: true }).click();
    await page.getByText('Admin', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: '新建', exact: true }).click();
    let d = page.getByRole('dialog');
    await d.getByLabel('名称', { exact: true }).fill('Tester');
    await d.getByLabel('显示名称').fill('Test role');
    await d.getByRole('button', { name: '保存' }).click();
    await page.getByText('Test role', { exact: true }).first().waitFor();
    let roleRow = page.getByRole('row').filter({ hasText: 'Test role' }).last();
    await roleRow.getByRole('button', { name: '编辑' }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('显示名称').fill('Updated role');
    await d.getByRole('button', { name: '保存' }).click();
    roleRow = page.getByRole('row').filter({ hasText: 'Updated role' }).last();
    await roleRow.getByRole('button', { name: '删除' }).click();
    await page.locator('.el-message-box__btns .el-button--primary').click();
    await page.getByText('删除成功').first().waitFor();
    await page.getByRole('menuitem', { name: '租户', exact: true }).click();
    await page.getByText('Default', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: '新建', exact: true }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('租户名称').fill('Example');
    await d.getByLabel('名称', { exact: true }).fill('Example Tenant');
    await d.getByLabel('管理员邮箱').fill('admin@example.com');
    await d.getByRole('button', { name: '保存' }).click();
    await page.getByText('Example Tenant').first().waitFor();
    let tenantRow = page.getByRole('row').filter({ hasText: 'Example Tenant' }).last();
    await tenantRow.getByRole('button', { name: '编辑' }).click();
    d = page.getByRole('dialog');
    await d.getByLabel('名称', { exact: true }).fill('Updated Tenant');
    await d.getByRole('button', { name: '保存' }).click();
    tenantRow = page.getByRole('row').filter({ hasText: 'Updated Tenant' }).last();
    await tenantRow.getByRole('button', { name: '删除' }).click();
    await page.locator('.el-message-box__btns .el-button--primary').click();
    await page.getByText('删除成功').first().waitFor();
    await page.goto((process.env.TEST_BASE_URL || 'http://localhost:8082/') + 'app/update-password');
    await page.getByLabel('当前密码').fill('password');
    await page.getByLabel('新密码', { exact: true }).fill('Password2');
    await page.getByLabel('确认新密码').fill('Password2');
    await page.getByRole('button', { name: '保存' }).click();
    await page.waitForURL('**/app/home');
    const guest = await browser.newPage();
    await guest.goto((process.env.TEST_BASE_URL || 'http://localhost:8082/') + '?abp_tenancy_name=Default');
    await guest.getByRole('link', { name: '注册' }).click();
    await guest.getByPlaceholder('名字').fill('New');
    await guest.getByPlaceholder('姓氏').fill('User');
    await guest.getByPlaceholder('用户名', { exact: true }).fill('newuser');
    await guest.getByPlaceholder('邮箱').fill('new@example.com');
    await guest.getByPlaceholder('密码', { exact: true }).fill('password');
    await guest.getByRole('button', { name: '注册', exact: true }).click();
    await guest.waitForURL('**/account/login');
    await guest.close();
    if (errors.length) throw Error(errors.join('\n'));
    console.log(
        'PASS login, users create, reset password, role and tenant CRUD, change password, tenant resolution and registration'
    );
} finally {
    await browser.close();
}
