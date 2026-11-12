import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword, isValidPassword } from '../../src/utils/password.ts';
import { readCookie, serializeCookie } from '../../src/utils/cookies.ts';
import { resolveTenancyName } from '../../src/utils/tenancy.ts';
import { errorMessage, isUnauthorized } from '../../src/utils/errors.ts';
import { formatMessage } from '../../src/utils/format.ts';
import { elementLocaleKey } from '../../src/utils/locale.ts';
import { collectPages } from '../../src/utils/navigation.ts';

test('generated passwords always satisfy the password policy', () => {
    for (let i = 0; i < 500; i++) {
        const password = generatePassword();
        assert.equal(password.length, 12);
        assert.ok(isValidPassword(password), password);
    }
    assert.equal(generatePassword(8).length, 8);
    assert.equal(generatePassword(32).length, 32);
    assert.throws(() => generatePassword(7), RangeError);
    assert.throws(() => generatePassword(33), RangeError);
});

test('password policy matches the ABP default rules', () => {
    assert.ok(isValidPassword('Password1'));
    assert.ok(!isValidPassword('password1'), 'needs an uppercase letter');
    assert.ok(!isValidPassword('PASSWORD1'), 'needs a lowercase letter');
    assert.ok(!isValidPassword('Password'), 'needs a digit');
    assert.ok(!isValidPassword('Pass1'), 'too short');
    assert.ok(!isValidPassword('P1' + 'a'.repeat(31)), 'too long');
    assert.ok(!isValidPassword(undefined));
});

test('readCookie decodes values and tolerates missing or malformed cookies', () => {
    const jar = 'a=1; Abp.AuthToken=abc%3D%3D; bad=%E0%A4%A';
    assert.equal(readCookie(jar, 'Abp.AuthToken'), 'abc==');
    assert.equal(readCookie(jar, 'a'), '1');
    assert.equal(readCookie(jar, 'missing'), '');
    assert.equal(readCookie(jar, 'bad'), '%E0%A4%A');
    assert.equal(readCookie('ab=2; b=3', 'b'), '3', 'does not match on a name suffix');
});

test('serializeCookie encodes the value and adds attributes', () => {
    assert.equal(serializeCookie('t', 'a b'), 't=a%20b; path=/; SameSite=Lax');
    assert.equal(
        serializeCookie('t', 'x', { maxAge: 0, secure: true }),
        't=x; path=/; SameSite=Lax; max-age=0; Secure'
    );
});

test('resolveTenancyName reads the query parameter or the subdomain template', () => {
    assert.equal(resolveTenancyName('http://localhost:8081/?abp_tenancy_name=Default', ''), 'Default');
    assert.equal(resolveTenancyName('http://localhost:8081/app/home', ''), null);
    const template = 'https://{TENANCY_NAME}.example.com';
    assert.equal(resolveTenancyName('https://acme.example.com/app/home', template), 'acme');
    assert.equal(resolveTenancyName('https://acme.other.com/app', template), null);
});

test('errorMessage prefers validation errors, then details, then the message', () => {
    const validation = { response: { data: { error: { validationErrors: [{ message: 'A' }, { message: 'B' }] } } } };
    assert.equal(errorMessage(validation, 'fallback'), 'A\nB');
    assert.equal(errorMessage({ abp: { error: { details: 'D', message: 'M' } } }, 'fallback'), 'D');
    assert.equal(errorMessage({ response: { data: { error: { message: 'M' } } } }, 'fallback'), 'M');
    assert.equal(errorMessage(new Error('boom'), 'fallback'), 'boom');
    assert.equal(errorMessage(undefined, 'fallback'), 'fallback');
});

test('isUnauthorized detects 401 responses and ABP unauthorized envelopes', () => {
    assert.ok(isUnauthorized({ response: { status: 401 } }));
    assert.ok(isUnauthorized({ abp: { unAuthorizedRequest: true } }));
    assert.ok(!isUnauthorized({ response: { status: 500 } }));
    assert.ok(!isUnauthorized(null));
});

test('formatMessage fills ABP placeholders and keeps unknown ones', () => {
    assert.equal(formatMessage('Delete {0}?', ['Bob']), 'Delete Bob?');
    assert.equal(formatMessage('{0}–{1}', [2, 32]), '2–32');
    assert.equal(formatMessage('{0} and {1}', ['a']), 'a and {1}');
    assert.equal(formatMessage('{0}{0}', ['x']), 'xx');
});

test('elementLocaleKey maps ABP language names to Element Plus locale files', () => {
    assert.equal(elementLocaleKey('en'), 'en');
    assert.equal(elementLocaleKey('zh-Hans'), 'zh-cn');
    assert.equal(elementLocaleKey('zh-Hant'), 'zh-tw');
    assert.equal(elementLocaleKey('zh-TW'), 'zh-tw');
    assert.equal(elementLocaleKey('zh-HK'), 'zh-hk');
    assert.equal(elementLocaleKey('pt-BR'), 'pt-br');
    assert.equal(elementLocaleKey('es-MX'), 'es');
    assert.equal(elementLocaleKey('de-DE'), 'de');
    assert.equal(elementLocaleKey('xx'), 'en');
});

test('collectPages flattens groups and skips external links', () => {
    const page = (name) => ({ type: 'page', page: name, path: name, title: name });
    const items = [
        page('home'),
        { type: 'external', url: 'https://example.com', title: 'Docs' },
        {
            type: 'group',
            id: 'admin',
            title: 'Admin',
            children: [page('users'), { type: 'group', id: 'x', title: 'X', children: [page('roles')] }],
        },
    ];
    assert.deepEqual(
        collectPages(items).map((p) => p.page),
        ['home', 'users', 'roles']
    );
});
