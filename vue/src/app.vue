<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { initialize, state, t } from './api';
import { initializeNavigation } from './router/navigation';
import { startNotifications } from './services/notifications';
import { defaultElementLocale, loadElementLocale, type ElementLocale } from './locales/element';

const loading = ref(true),
    route = useRoute(),
    router = useRouter(),
    elementLocale = shallowRef<ElementLocale>(defaultElementLocale);

async function boot() {
    loading.value = true;
    try {
        await initialize();
        elementLocale.value = await loadElementLocale(state.config?.localization?.currentLanguage?.name || 'en');
        await initializeNavigation();
        // The first match may be the fallback before the server-provided routes are registered.
        await router.replace({ path: route.path, query: route.query, hash: route.hash, force: true });
        if (state.session?.user) void startNotifications();
    } catch {
        state.config = null;
    } finally {
        loading.value = false;
    }
}

onMounted(boot);
</script>
<template>
    <el-config-provider :locale="elementLocale">
        <div v-loading="loading" class="app-root" :element-loading-text="t('ConnectingToServer')">
            <div v-if="!loading && !state.config" class="login-wrap">
                <div class="panel card">
                    {{ t('AppLoadFailed') }}
                    <el-button @click="boot">{{ t('Retry') }}</el-button>
                </div>
            </div>
            <router-view v-else-if="!loading" />
        </div>
    </el-config-provider>
</template>
<style>
:root {
    --app-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
        sans-serif;
    --bs-body-font-family: var(--app-font-family);
    --bs-body-font-size: 14px;
    --bs-body-line-height: 1.5715;
    --el-font-family: var(--app-font-family);
    --el-font-size-base: 14px;
    --el-font-size-small: 12px;
    --el-font-size-extra-small: 12px;
}
:root:lang(zh) {
    --app-font-family: 'Segoe UI Variable Text', 'Segoe UI', -apple-system, 'PingFang SC', 'Microsoft YaHei',
        'Noto Sans CJK SC', system-ui, sans-serif;
}
:root:lang(zh-Hant),
:root:lang(zh-TW) {
    --app-font-family: 'Segoe UI Variable Text', 'Segoe UI', -apple-system, 'PingFang TC', 'Microsoft JhengHei',
        'Noto Sans CJK TC', system-ui, sans-serif;
}
:root:lang(zh-HK) {
    --app-font-family: 'Segoe UI Variable Text', 'Segoe UI', -apple-system, 'PingFang HK', 'Microsoft JhengHei',
        'Noto Sans CJK HK', system-ui, sans-serif;
}
:root:lang(ja) {
    --app-font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo',
        'Noto Sans CJK JP', system-ui, sans-serif;
}
:root:lang(ko) {
    --app-font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic',
        'Noto Sans CJK KR', system-ui, sans-serif;
}
:root:lang(fa),
:root:lang(ar) {
    --app-font-family: Tahoma, 'Noto Sans Arabic', 'Segoe UI', sans-serif;
}
body,
.el-message-box,
.el-dialog,
.el-popper {
    font-family: var(--app-font-family);
}
.app-root {
    min-height: 100vh;
}
.login-wrap {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: var(--app-bg);
}
@media (max-width: 700px) {
    .el-dialog {
        width: min(94vw, 600px) !important;
    }
}
</style>
