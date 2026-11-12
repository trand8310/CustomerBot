# CustomerBot Vue

Vue 3 + TypeScript client for the existing ASP.NET Boilerplate backend, using Element Plus components and icons (`@element-plus/icons-vue`), vue-i18n for translations, and AdminLTE 4 layout styles. Pinia manages the session, Vue Router the routes, Axios HTTP, Zod validation, VueUse utilities, dayjs dates, and ECharts the dashboard chart.

```bash
npm install
cp .env.example .env
npm run dev
npm run typecheck
npm test            # unit tests (Node 22.6 or later)
npm run build
```

Set `VITE_API_BASE_URL` to the backend origin. The backend must allow the Vue origin in CORS and the browser must trust its HTTPS certificate. The default development URL is http://localhost:8081.

## Verification against a local stand-in

The real backend and database are still required for integration verification. A limited, stateful Postman stand-in based on the Angular service proxies and server DTOs supports the browser smoke test:

```powershell
postman simulation run postman/simulations/customerbot.sim.yaml --port 5100
# In a second terminal:
$env:VITE_API_BASE_URL='http://localhost:5100/api'
npm run dev -- --port 8082
# In a third terminal:
npm run test:smoke
```

The smoke test uses an installed Edge on Windows and Chrome elsewhere. Set `BROWSER_CHANNEL` (for example `chrome` or `msedge`) to pick another installed browser, or `BROWSER_PATH` to point at a specific Chromium-based executable. The stand-in reports English as the current language, so the test selects elements by their English labels.

The stand-in does not implement SignalR or prove real authentication, permission enforcement, database behavior, or every validation rule. Its assumptions are documented in `postman/simulations/customerbot.context.yaml`.

## Source structure

- `src/views`: pages and their dialogs grouped by feature, with TypeScript and CSS inside each Vue single-file component. File names use lowercase kebab-case.
- `src/api`: HTTP client, backend service interfaces and DTO types (`types.ts`).
- `src/components`: reusable UI components.
- `src/layout`: application shell.
- `src/store`, `src/router`, `src/locales`, `src/composables` and `src/services`: shared state, navigation, translations, reusable logic, and services.
- `src/utils`: framework-free helpers (cookies, passwords, tenancy, error messages, formatting). These are covered by `tests/unit`.
- `src/plugins/element-plus.ts`: the Element Plus components the app registers. When a template starts using a new `<el-*>` component, add it and its style import there.
- `src/config.ts`: environment-derived settings such as the backend URL.

## Translations

Translations run on vue-i18n (Composition API, `src/locales/index.ts`). Use `$t(key)` or `useI18n().t(key)` in components, and the exported `t(key, ...args)` helper in plain TypeScript. The backend's `CustomerBot` localization source always wins; when it lacks a key, the built-in English or Chinese text in `src/locales/messages.ts` is used, and English is the final fallback. Placeholders keep ABP's `{0}` style (pass list arguments, e.g. `t('DefaultPasswordIs', pwd)`); a custom message compiler keeps backend texts literal, so `@` and `|` in them are not treated as vue-i18n syntax. To add a language, add a dictionary keyed by its two-letter code. Element Plus's own texts (pagination, empty tables) load on demand from `src/locales/element.ts`.

## Security notes

- Permission checks in the router, menu and pages only decide what the UI shows. The backend must authorize every API call.
- The app sets no cookies. The access token is kept in Web Storage (`localStorage` with "Remember me", otherwise the tab's `sessionStorage`) together with its expiry time, and is sent as a Bearer header; tenant and language are stored the same way and sent as the `Abp.TenantId` and `.AspNetCore.Culture` headers (`src/api/storage.ts`).
- The backend's JWT has a fixed lifetime (1 day, `tokenAuthConfig.Expiration`) and there is no refresh endpoint. The client never sends an expired token, warns 5 minutes before expiry, and on expiry or any 401 returns to the login page, then back to the same page after signing in (`src/api/auth.ts`). Logging out in one tab logs out the others.
- New roles start with no permissions.

## Mock navigation

The app fetches `/mock/navigation.json` at startup. Edit `public/mock/navigation.json` to change menu order, labels, nesting, or business route paths. A page with `"menu": false` stays routable without appearing in the sidebar. `icon` is an Element Plus icon component name (for example `User`, `OfficeBuilding`); names must be registered in `src/components/icons.ts`, and unknown names show no icon. The `page` key maps to a frontend component and its existing permission in `src/router/navigation.ts`. `titleKey` is translated when a translation exists; otherwise `title` is shown. To connect a real endpoint, replace the request in `src/api/navigation.ts` with the backend call using the same response schema.
