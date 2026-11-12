import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/** Long-lived vendor chunks, so a code change does not invalidate every cached library. */
const vendorChunks: Record<string, string[]> = {
    vue: ['/node_modules/vue/', '/node_modules/@vue/', '/node_modules/vue-router/', '/node_modules/pinia/'],
    'element-plus': ['/node_modules/element-plus/', '/node_modules/@element-plus/', '/node_modules/@floating-ui/'],
    echarts: ['/node_modules/echarts/', '/node_modules/zrender/'],
};

export default defineConfig({
    plugins: [vue()],
    server: { port: 8081 },
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
});
