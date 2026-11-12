# CustomerBot Vue

Vue 3 + TypeScript + Element Plus + AdminLTE 4.10.1 client. Pinia manages the session, Vue Router the routes, Axios HTTP, Zod validation, vue-i18n translations, VueUse utilities, dayjs dates, and ECharts the sample dashboard chart. for the existing ASP.NET Boilerplate backend.

```bash
npm install
cp .env.example .env
npm run dev
npm run typecheck
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
# In a third terminal (set BROWSER_PATH if Edge is installed elsewhere):
node tests/smoke.mjs
```

The stand-in does not implement SignalR or prove real authentication, permission enforcement, database behavior, or every validation rule. Its assumptions are documented in `postman/simulations/customerbot.context.yaml`.

## Source structure

- `src/views`: pages and their dialogs grouped by feature, with TypeScript and CSS inside each Vue single-file component. File names use lowercase kebab-case.
- `src/api`: HTTP client and backend service interfaces.
- `src/components`: reusable UI components.
- `src/layout`: application shell.
- `src/store`, `src/router`, `src/locales`, `src/composables` and `src/services`: shared state, navigation, translations, reusable logic, and services.

## Mock navigation

The app fetches `/mock/navigation.json` at startup. Edit `public/mock/navigation.json` to change menu order, labels, nesting, or business route paths. A page with `"menu": false` stays routable without appearing in the sidebar. The `page` key maps to a frontend component and its existing permission in `src/router/navigation.ts`. To connect a real endpoint, replace the request in `src/api/navigation.ts` with the backend call using the same response schema.
