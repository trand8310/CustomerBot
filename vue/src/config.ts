/** Backend origin used by production builds and as the dev proxy target. Set VITE_API_BASE_URL in .env. */
export const backendOrigin: string = (import.meta.env.VITE_API_BASE_URL || 'http://crm-api2.adtogroup.com:20980').replace(
    /\/$/,
    ''
);

/**
 * Base URL for API calls. In `npm run dev` requests go through the Vite proxy at /__backend (see vite.config.ts),
 * so the backend's CORS list does not need the dev origin. Production builds call the backend directly.
 */
export const apiBaseUrl: string = import.meta.env.DEV ? '/__backend' : backendOrigin;

/** Optional subdomain tenancy template, for example https://{TENANCY_NAME}.example.com */
export const appBaseUrlTemplate: string = import.meta.env.VITE_APP_BASE_URL || '';
