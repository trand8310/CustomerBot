/** Backend origin without a trailing slash. Set VITE_API_BASE_URL in .env. */
export const apiBaseUrl: string = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:44311').replace(/\/$/, '');

/** Optional subdomain tenancy template, for example https://{TENANCY_NAME}.example.com */
export const appBaseUrlTemplate: string = import.meta.env.VITE_APP_BASE_URL || '';
