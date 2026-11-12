/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_APP_BASE_URL?: string;
}

/** Per-component Element Plus styles ship without type declarations. */
declare module 'element-plus/es/components/*/style/css';
