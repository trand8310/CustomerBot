<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { initialize, state } from './api';
import { initializeNavigation } from './router/navigation';
import { startNotifications } from './services/notifications';
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import fr from 'element-plus/es/locale/lang/fr';
import es from 'element-plus/es/locale/lang/es';
import ja from 'element-plus/es/locale/lang/ja';
import it from 'element-plus/es/locale/lang/it';
import nl from 'element-plus/es/locale/lang/nl';
import lt from 'element-plus/es/locale/lang/lt';
import tr from 'element-plus/es/locale/lang/tr';
import fa from 'element-plus/es/locale/lang/fa';
import ptBr from 'element-plus/es/locale/lang/pt-br';
const locales: Record<string, any> = { en, zh: zhCn, fr, es, ja, it, nl, lt, tr, fa, pt: ptBr };

const loading = ref(true),
    route = useRoute(),
    router = useRouter();

const elementLocale = computed(
    () => locales[(state.config?.localization?.currentLanguage?.name || 'en').split('-')[0].toLowerCase()] || en
);

async function boot() {
    loading.value = true;
    try {
        await initialize();
        await initializeNavigation();
        // The first match may be the fallback before the server-provided routes are registered.
        await router.replace({ path: route.path, query: route.query, hash: route.hash, force: true });
        if (state.session?.user) startNotifications();
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
        <div v-loading="loading" element-loading-text="正在连接服务器...">
            <div v-if="!loading && !state.config" class="login-wrap">
                <div class="panel card">
                    无法加载应用，请检查后端连接或菜单配置。
                    <el-button @click="boot">重试</el-button>
                </div>
            </div>
            <router-view v-else-if="!loading" />
        </div>
    </el-config-provider>
</template>
<style>
:root {
    --el-color-primary: #0d6efd;
    --el-color-primary-light-3: #5698fe;
    --el-color-primary-light-5: #86b7fe;
    --el-color-primary-light-7: #b6d4fe;
    --el-color-primary-light-8: #cfe2ff;
    --el-color-primary-light-9: #e7f1ff;
    --el-color-primary-dark-2: #0a58ca;
    --el-border-radius-base: 6px;
    --app-font-family: 'Segoe UI', system-ui, sans-serif;
    --bs-body-font-family: var(--app-font-family);
    --bs-body-font-size: 0.875rem;
    --el-font-family: var(--app-font-family);
    --el-font-size-base: 0.8125rem;
    --el-font-size-small: 0.75rem;
    --el-font-size-extra-small: 0.75rem;
}
:root:lang(zh) {
    --app-font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', system-ui, sans-serif;
}
:root:lang(zh-Hant),
:root:lang(zh-TW) {
    --app-font-family: 'Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC', system-ui, sans-serif;
}
:root:lang(zh-HK) {
    --app-font-family: 'PingFang HK', 'Microsoft JhengHei', 'Noto Sans CJK HK', system-ui, sans-serif;
}
:root:lang(ja) {
    --app-font-family: 'Yu Gothic UI', 'Meiryo', 'Hiragino Sans', 'Noto Sans CJK JP', system-ui, sans-serif;
}
:root:lang(ko) {
    --app-font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans CJK KR', system-ui, sans-serif;
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
.card-title,
.el-dialog__title,
.el-message-box__title {
    font-size: 1rem;
}
.heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}
.heading h1 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 500;
}
.panel {
    padding: 1rem;
}
.login-wrap {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1rem;
    background-color: var(--bs-tertiary-bg);
}
@media (max-width: 700px) {
    .el-dialog {
        width: min(94vw, 600px) !important;
    }
}
</style>
