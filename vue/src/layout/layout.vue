<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { state, permitted, logout, t } from '../api';
import { changeLanguage } from '../composables/language';
import NavigationMenuItem from '../components/navigation-menu/navigation-menu-item.vue';
import { useNavigationStore } from '../store/navigation';

const route = useRoute(),
    router = useRouter(),
    sidebarOpen = ref(true);

const navigation = useNavigationStore();
const topbarPages = computed(() =>
    navigation.pages.filter((page) => {
        if (!page.topbar || page.menu === false) return false;
        const permission = router.resolve({ name: page.page }).meta.permission;
        return !permission || permitted(String(permission));
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
        <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div class="sidebar-brand">
                <router-link class="brand-link" :to="{ name: router.hasRoute('home') ? 'home' : 'app' }">
                    <i class="fa-solid fa-cube me-2" aria-hidden="true"></i>
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
            <el-button class="menu-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle sidebar">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </el-button>
            <router-link v-for="page in topbarPages" :key="page.page" :to="{ name: page.page }">
                {{ page.titleKey ? t(page.titleKey, page.title) : page.title }}
            </router-link>
            <span class="topbar-spacer"></span>
            <el-select
                v-if="state.config?.localization?.languages?.length"
                :model-value="state.config.localization.currentLanguage?.name"
                @change="changeLanguage"
                style="width: 150px">
                <el-option
                    v-for="l in state.config.localization.languages.filter((x) => !x.isDisabled)"
                    :key="l.name"
                    :label="l.displayName"
                    :value="l.name" />
            </el-select>
            <span v-if="state.session.tenant">{{ state.session.tenant.tenancyName }}</span>
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
                            {{ t('UpdatePassword', '修改密码') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="logout">{{ t('Logout', '退出登录') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </header>
        <main class="app-main">
            <div class="app-content"><router-view /></div>
        </main>
        <footer class="app-footer">
            <strong>Copyright © {{ new Date().getFullYear() }} CustomerBot.</strong>
            <span class="footer-version">
                {{ t('Version', '版本') }} {{ state.session.application?.version }}
                <template v-if="state.session.application?.releaseDate">
                    [{{ dayjs(state.session.application.releaseDate).format('YYYYDDMM') }}]
                </template>
            </span>
        </footer>
    </div>
</template>
<style>
.customerbot-layout {
    --lte-sidebar-width: 250px;
    background-color: var(--bs-tertiary-bg);
}
.customerbot-layout.collapsed {
    grid-template-columns: 0 minmax(0, 1fr);
}
.customerbot-layout.collapsed .app-sidebar {
    display: none;
}
.customerbot-layout .app-main > .app-content {
    padding: 1rem;
}
.sidebar-wrapper {
    padding: 0.5rem;
}
.sidebar-brand .brand-link {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bs-emphasis-color);
    text-decoration: none;
}
.app-sidebar .el-menu {
    --el-menu-bg-color: transparent;
    --el-menu-text-color: #c2c7d0;
    --el-menu-hover-bg-color: #ffffff1a;
    --el-menu-active-color: #fff;
    --el-menu-item-height: 42px;
    --el-menu-sub-item-height: 40px;
    border: 0;
}
.app-sidebar .el-menu-item,
.app-sidebar .el-sub-menu__title {
    border-radius: var(--bs-border-radius);
    margin-bottom: 2px;
}
.app-sidebar .el-menu-item.is-active {
    background: #0d6efd;
}
.app-sidebar a {
    color: inherit;
}
.menu-icon {
    width: 1.5rem;
    margin-right: 0.5rem;
    text-align: center;
}
.topbar {
    justify-content: flex-start;
    padding: 0.5rem 1rem;
    gap: 0.875rem;
    background-color: var(--bs-body-bg);
}
.topbar > a,
.topbar .menu-toggle {
    color: var(--bs-secondary-color);
}
.topbar .menu-toggle {
    border: 0;
}
.topbar-spacer {
    flex: 1;
}
.profile-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}
.profile-avatar {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #dee2e6;
    color: #343a40;
}
.footer-version {
    float: right;
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
        overflow-y: auto;
    }
    .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 1036;
        border: 0;
        background: #0008;
    }
    .topbar > a,
    .profile-text {
        display: none;
    }
}
</style>
