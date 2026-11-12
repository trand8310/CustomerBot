<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { state, permitted, logout, t, tOr } from '../api';
import { useLanguages } from '../composables/language';
import NavigationMenuItem from '../components/navigation-menu/navigation-menu-item.vue';
import { useNavigationStore } from '../store/navigation';

const route = useRoute(),
    router = useRouter(),
    sidebarOpen = ref(true);

const navigation = useNavigationStore();
const { languages, currentLanguage, changeLanguage } = useLanguages();
const topbarPages = computed(() =>
    navigation.pages.filter((page) => {
        if (!page.topbar || page.menu === false) return false;
        const permission = router.resolve({ name: page.page }).meta.permission;
        return !permission || permitted(permission);
    })
);

const { width } = useWindowSize();

watch(
    width,
    (value) => {
        sidebarOpen.value = value > 700;
    },
    { immediate: true }
);

watch(
    () => route.path,
    () => {
        if (width.value <= 700) sidebarOpen.value = false;
    }
);
</script>
<template>
    <div v-if="state.session?.user" class="app-wrapper customerbot-layout" :class="{ collapsed: !sidebarOpen }">
        <button
            v-if="sidebarOpen"
            class="sidebar-backdrop"
            aria-label="Close sidebar"
            @click="sidebarOpen = false"></button>
        <aside class="app-sidebar">
            <div class="sidebar-brand">
                <router-link class="brand-link" :to="{ name: router.hasRoute('home') ? 'home' : 'app' }">
                    <span class="brand-mark"><i class="fa-solid fa-cube" aria-hidden="true"></i></span>
                    <span class="brand-text">CustomerBot</span>
                </router-link>
            </div>
            <div class="sidebar-wrapper">
                <el-menu router :default-active="route.path">
                    <NavigationMenuItem
                        v-for="item in navigation.items || []"
                        :key="item.type === 'group' ? item.id : item.type === 'page' ? item.page : item.url"
                        :item="item" />
                </el-menu>
            </div>
        </aside>
        <header class="app-header navbar topbar">
            <button
                type="button"
                class="icon-button menu-toggle"
                aria-label="Toggle sidebar"
                @click="sidebarOpen = !sidebarOpen">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
            <router-link v-for="page in topbarPages" :key="page.page" class="topbar-link" :to="{ name: page.page }">
                {{ tOr(page.titleKey, page.title) }}
            </router-link>
            <span class="topbar-spacer"></span>
            <el-select
                v-if="languages.length"
                :model-value="currentLanguage"
                @change="changeLanguage"
                class="topbar-language"
                style="width: 140px">
                <el-option v-for="l in languages" :key="l.name" :label="l.displayName" :value="l.name" />
            </el-select>
            <span v-if="state.session.tenant" class="tenant-chip">
                <i class="fa-solid fa-building" aria-hidden="true"></i>
                {{ state.session.tenant.tenancyName }}
            </span>
            <el-dropdown>
                <span class="profile-trigger">
                    <span class="profile-avatar">
                        {{ (state.session.user.name || state.session.user.userName || 'U').slice(0, 1).toUpperCase() }}
                    </span>
                    <span class="profile-text">
                        <strong>{{ state.session.user.userName }}</strong>
                    </span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-if="router.hasRoute('update-password')"
                            @click="router.push({ name: 'update-password' })">
                            {{ t('UpdatePassword') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="logout">{{ t('Logout') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </header>
        <main class="app-main">
            <div class="app-content"><router-view /></div>
        </main>
        <footer class="app-footer">
            <span>© {{ new Date().getFullYear() }} CustomerBot</span>
            <span class="footer-version">
                {{ t('Version') }} {{ state.session.application?.version }}
                <template v-if="state.session.application?.releaseDate">
                    [{{ dayjs(state.session.application.releaseDate).format('YYYYMMDD') }}]
                </template>
            </span>
        </footer>
    </div>
</template>
<style>
.customerbot-layout {
    --lte-sidebar-width: 248px;
    --lte-app-header-height: 3.5rem;
    background-color: var(--app-bg);
}
.customerbot-layout.collapsed {
    grid-template-columns: 0 minmax(0, 1fr);
}
.customerbot-layout.collapsed .app-sidebar {
    display: none;
}
.customerbot-layout .app-main > .app-content {
    padding: 1.75rem 2rem;
    max-width: 1440px;
}

/* ---------- Sidebar ---------- */
.customerbot-layout .app-sidebar {
    background: var(--app-surface);
    border-right: 1px solid var(--app-border);
    box-shadow: none;
}
.customerbot-layout .sidebar-brand {
    height: var(--lte-app-header-height);
    display: flex;
    align-items: center;
    padding: 0 1.25rem;
    border-bottom: 0;
}
.sidebar-brand .brand-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0;
    border: 0;
    color: var(--app-text);
    font-size: 1rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    text-decoration: none;
}
.brand-mark {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: #fff;
    font-size: 0.875rem;
    background: linear-gradient(135deg, #6366f1, #4338ca);
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
}
.sidebar-wrapper {
    padding: 0.5rem 0.75rem 1rem;
}
.app-sidebar .el-menu {
    --el-menu-bg-color: transparent;
    --el-menu-text-color: var(--app-text-secondary);
    --el-menu-hover-text-color: var(--app-text);
    --el-menu-hover-bg-color: #f1f5f9;
    --el-menu-active-color: var(--app-primary);
    --el-menu-item-height: 38px;
    --el-menu-sub-item-height: 36px;
    --el-menu-base-level-padding: 12px;
    --el-menu-level-padding: 16px;
    --el-menu-item-font-size: 0.8125rem;
    border: 0;
}
.app-sidebar .el-menu-item,
.app-sidebar .el-sub-menu__title {
    border-radius: var(--app-radius-sm);
    margin-bottom: 2px;
    font-weight: 500;
    transition:
        background-color var(--app-transition),
        color var(--app-transition);
}
.app-sidebar .el-menu-item.is-active {
    background: var(--app-primary-soft);
    color: var(--app-primary);
    font-weight: 600;
}
.app-sidebar .el-menu-item.is-active .menu-icon {
    color: var(--app-primary);
}
.app-sidebar a {
    color: inherit;
}
.menu-icon {
    width: 1.25rem;
    margin-right: 0.625rem;
    text-align: center;
    font-size: 0.875rem;
    color: #94a3b8;
    transition: color var(--app-transition);
}
.app-sidebar .el-menu-item:hover .menu-icon,
.app-sidebar .el-sub-menu__title:hover .menu-icon {
    color: var(--app-text-secondary);
}

/* ---------- Header ---------- */
.customerbot-layout .app-header.topbar {
    position: sticky;
    top: 0;
    z-index: 1030;
    min-height: var(--lte-app-header-height);
    justify-content: flex-start;
    padding: 0 1.5rem;
    gap: 0.75rem;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: saturate(180%) blur(12px);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--app-border);
    box-shadow: none;
}
.icon-button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: var(--app-radius-sm);
    background: transparent;
    color: var(--app-text-muted);
    cursor: pointer;
    transition:
        background-color var(--app-transition),
        color var(--app-transition);
}
.icon-button:hover {
    background: #f1f5f9;
    color: var(--app-text);
}
.icon-button:focus-visible {
    outline: none;
    box-shadow: var(--app-ring);
}
.topbar-link {
    padding: 6px 10px;
    border-radius: var(--app-radius-sm);
    color: var(--app-text-secondary);
    font-weight: 500;
}
.topbar-link:hover {
    background: #f1f5f9;
    color: var(--app-text);
}
.topbar-link.router-link-active {
    color: var(--app-primary);
}
.topbar-spacer {
    flex: 1;
}
.tenant-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 1px solid var(--app-border);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--app-text-secondary);
    background: var(--app-surface);
}
.tenant-chip i {
    color: #94a3b8;
}
.profile-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 4px 8px 4px 4px;
    border-radius: 999px;
    cursor: pointer;
    color: var(--app-text);
    outline: none;
    transition: background-color var(--app-transition);
}
.profile-trigger:hover {
    background: #f1f5f9;
}
.profile-trigger .fa-chevron-down {
    font-size: 0.625rem;
    color: #94a3b8;
}
.profile-text strong {
    font-weight: 600;
    font-size: 0.8125rem;
}
.profile-avatar {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #818cf8, #4f46e5);
}

/* ---------- Footer ---------- */
.customerbot-layout .app-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 2rem;
    border-top: 1px solid var(--app-border);
    background: transparent;
    color: var(--app-text-muted);
    font-size: 0.75rem;
}

.sidebar-backdrop {
    display: none;
}
@media (max-width: 700px) {
    .customerbot-layout {
        grid-template-columns: 0 minmax(0, 1fr);
    }
    .customerbot-layout .app-sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 1037;
        overflow-y: auto;
        box-shadow: var(--app-shadow-lg);
    }
    .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 1036;
        border: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(2px);
    }
    .customerbot-layout .app-header.topbar {
        padding: 0 1rem;
    }
    .customerbot-layout .app-main > .app-content {
        padding: 1.25rem 1rem;
    }
    .topbar-link,
    .tenant-chip,
    .profile-text {
        display: none;
    }
    .topbar-language {
        width: 110px !important;
    }
    .customerbot-layout .app-footer {
        flex-direction: column;
        padding: 1rem;
    }
}
</style>
