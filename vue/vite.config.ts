import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

/** Long-lived vendor chunks, so a code change does not invalidate every cached library. */
const vendorChunks: Record<string, string[]> = {
    vue: ['/node_modules/vue/', '/node_modules/@vue/', '/node_modules/vue-router/', '/node_modules/pinia/'],
    'element-plus': ['/node_modules/element-plus/', '/node_modules/@element-plus/', '/node_modules/@floating-ui/'],
    echarts: ['/node_modules/echarts/', '/node_modules/zrender/'],
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const backend = (env.VITE_API_BASE_URL || 'http://crm-api2.adtogroup.com:20980').replace(/\/$/, '');
    return {
        plugins: [vue()],
        // vue-i18n build flags: Composition API only, no devtools in production builds.
        define: {
            __VUE_I18N_FULL_INSTALL__: true,
            __VUE_I18N_LEGACY_API__: false,
            __INTLIFY_PROD_DEVTOOLS__: false,
        },
        server: {
            port: 8081,
            // Dev only: the app calls /__backend/... on its own origin and Vite forwards it, so CORS never applies.
            proxy: {
                '/__backend': {
                    target: backend,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                    rewrite: (path) => path.replace(/^\/__backend/, ''),
                },
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        const path = id.replaceAll('\\', '/');
                        for (const [chunk, prefixes] of Object.entries(vendorChunks))
                            if (prefixes.some((prefix) => path.includes(prefix))) return chunk;
                        return undefined;
                    },
                },
            },
        },
    };
});
