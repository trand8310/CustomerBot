const http = require('http');
const wrap = (result) => ({ result, success: true, error: null, unAuthorizedRequest: false, __abp: true });
const seed = {
    User: [
        {
            id: 1,
            userName: 'admin',
            name: 'Admin',
            surname: 'User',
            fullName: 'Admin User',
            emailAddress: 'admin@example.com',
            isActive: true,
            roleNames: ['ADMIN'],
        },
    ],
    Role: [{ id: 1, name: 'Admin', normalizedName: 'ADMIN', displayName: 'Admin', description: '' }],
    Tenant: [{ id: 1, tenancyName: 'Default', name: 'Default', isActive: true }],
};
http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const body = req.body || {};
    const send = (code, result) => {
        res.writeHead(code, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': '*',
        });
        res.end(JSON.stringify(result));
    };
    if (req.method === 'OPTIONS') return send(200, {});
    const ok = (x) => send(200, wrap(x));
    if (url.pathname === '/AbpUserConfiguration/GetAll')
        return ok({
            auth: { grantedPermissions: { 'Pages.Users': true, 'Pages.Roles': true, 'Pages.Tenants': true } },
            multiTenancy: { isEnabled: true },
            localization: {
                sources: { CustomerBot: {} },
                languages: [{ name: 'en', displayName: 'English' }],
                currentLanguage: { name: 'en' },
            },
        });
    if (url.pathname === '/api/TokenAuth/Authenticate')
        return ok({ accessToken: 'test-token', encryptedAccessToken: 'encrypted', expireInSeconds: 3600 });
    if (url.pathname === '/api/services/app/Session/GetCurrentLoginInformations')
        return ok({
            application: { version: 'test' },
            user: req.headers.authorization ? { id: 1, userName: 'admin', name: 'Admin', surname: 'User' } : null,
            tenant: req.headers['abp.tenantid'] ? { id: 1, tenancyName: 'Default', name: 'Default' } : null,
        });
    if (url.pathname === '/api/services/app/Account/IsTenantAvailable')
        return ok(body.tenancyName === 'Default' ? { state: 1, tenantId: 1 } : { state: 3 });
    if (url.pathname === '/api/services/app/Account/Register') return ok({ canLogin: false });
    const match = url.pathname.match(/^\/api\/services\/app\/(User|Role|Tenant)\/(\w+)$/);
    if (!match) return send(501, { error: 'Not implemented' });
    const [, entity, action] = match,
        key = 'customerbot.' + entity;
    let items = (await pm.state.get(key)) || seed[entity];
    if (action === 'GetAll') {
        let results = items.filter(
            (x) =>
                !url.searchParams.get('Keyword') ||
                JSON.stringify(x).toLowerCase().includes(url.searchParams.get('Keyword').toLowerCase())
        );
        if (url.searchParams.has('IsActive'))
            results = results.filter((x) => x.isActive === (url.searchParams.get('IsActive') === 'true'));
        return ok({
            items: results.slice(
                Number(url.searchParams.get('SkipCount') || 0),
                Number(url.searchParams.get('SkipCount') || 0) + Number(url.searchParams.get('MaxResultCount') || 10)
            ),
            totalCount: results.length,
        });
    }
    if (action === 'GetRoles') return ok({ items: seed.Role });
    if (action === 'GetAllPermissions') return ok({ items: [{ name: 'Pages.Users', displayName: 'Users' }] });
    if (action === 'GetRoleForEdit')
        return ok({
            role: items.find((x) => x.id === Number(url.searchParams.get('Id'))),
            permissions: [{ name: 'Pages.Users', displayName: 'Users' }],
            grantedPermissionNames: ['Pages.Users'],
        });
    if (action === 'Get') return ok(items.find((x) => x.id === Number(url.searchParams.get('Id'))));
    if (action === 'Create') {
        const item = { ...body, id: Date.now() };
        if (entity === 'User') item.fullName = `${item.name} ${item.surname}`;
        items.push(item);
        await pm.state.set(key, items);
        return ok(item);
    }
    if (action === 'Update') {
        items = items.map((x) => (x.id === body.id ? { ...x, ...body } : x));
        await pm.state.set(key, items);
        return ok(body);
    }
    if (action === 'Delete') {
        items = items.filter((x) => x.id !== Number(url.searchParams.get('Id')));
        await pm.state.set(key, items);
        return ok(null);
    }
    if (action === 'ResetPassword')
        return body.adminPassword && body.newPassword && body.userId
            ? ok(true)
            : send(400, { success: false, error: { message: 'Missing reset fields' } });
    if (action === 'ChangePassword' || action === 'ChangeLanguage') return ok(true);
    return send(501, { error: 'Not implemented' });
}).listen(process.env.PORT || 4500);
