# CustomerBot Vue

Vue 3 + TypeScript client for the existing ASP.NET Boilerplate backend, using Element Plus components and AdminLTE 4 styles. Pinia manages the session, Vue Router the routes, Axios HTTP, Zod validation, VueUse utilities, dayjs dates, and ECharts the dashboard chart.

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

Text is looked up with `t(key, ...args)`. The backend's `CustomerBot` localization source always wins; when it lacks a key, the built-in English or Chinese text in `src/locales/messages.ts` is used, and English is the final fallback. Placeholders use ABP's `{0}` style. To add a language, add a dictionary keyed by its two-letter code. Element Plus's own texts (pagination, empty tables) load on demand from `src/locales/element.ts`.

## Security notes

- Permission checks in the router, menu and pages only decide what the UI shows. The backend must authorize every API call.
- The access token is stored in a cookie that JavaScript can read, because the app sends it as a Bearer header. On HTTPS pages the cookie gets the `Secure` attribute. Making it HttpOnly requires a backend change: issue the token as an HttpOnly cookie and read it from the cookie on the server, then stop sending the Authorization header from the client.
- New roles start with no permissions.

## Mock navigation

The app fetches `/mock/navigation.json` at startup. Edit `public/mock/navigation.json` to change menu order, labels, nesting, or business route paths. A page with `"menu": false` stays routable without appearing in the sidebar. The `page` key maps to a frontend component and its existing permission in `src/router/navigation.ts`. `titleKey` is translated when a translation exists; otherwise `title` is shown. To connect a real endpoint, replace the request in `src/api/navigation.ts` with the backend call using the same response schema.
