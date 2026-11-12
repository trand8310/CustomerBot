<script setup lang="ts">
import { computed, onMounted, reactive, ref, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Key, OfficeBuilding, User } from '@element-plus/icons-vue';
import { permitted, state, t } from '../../api';
import { userApi } from '../../api/users';
import { roleApi } from '../../api/roles';
import { tenantApi } from '../../api/tenants';
import DashboardChart from '../../components/dashboard-chart/dashboard-chart.vue';

interface Counts {
    activeUsers?: number;
    inactiveUsers?: number;
    roles?: number;
    tenants?: number;
}

interface StatCard {
    label: string;
    value: number;
    icon: Component;
    route: string;
}

const router = useRouter();
const loading = ref(true);
const counts = reactive<Counts>({});

const user = computed(() => state.session?.user);
const displayName = computed(() => {
    const u = user.value;
    if (!u) return '';
    return [u.name, u.surname].filter(Boolean).join(' ') || u.userName;
});

/** Only the totalCount is needed, so each request asks for a single row. */
async function total(load: () => Promise<{ totalCount: number }>): Promise<number | undefined> {
    try {
        return (await load()).totalCount;
    } catch {
        return undefined;
    }
}

onMounted(async () => {
    const one = { MaxResultCount: 1 };
    const tasks: Promise<void>[] = [];
    if (permitted('Pages.Users')) {
        tasks.push(total(() => userApi.getAll({ ...one, IsActive: true })).then((v) => void (counts.activeUsers = v)));
        tasks.push(
            total(() => userApi.getAll({ ...one, IsActive: false })).then((v) => void (counts.inactiveUsers = v))
        );
    }
    if (permitted('Pages.Roles')) tasks.push(total(() => roleApi.getAll(one)).then((v) => void (counts.roles = v)));
    if (permitted('Pages.Tenants'))
        tasks.push(total(() => tenantApi.getAll(one)).then((v) => void (counts.tenants = v)));
    await Promise.all(tasks);
    loading.value = false;
});

const cards = computed<StatCard[]>(() => {
    const list: StatCard[] = [];
    if (counts.activeUsers !== undefined || counts.inactiveUsers !== undefined)
        list.push({
            label: t('Users'),
            value: (counts.activeUsers ?? 0) + (counts.inactiveUsers ?? 0),
            icon: User,
            route: 'users',
        });
    if (counts.roles !== undefined)
        list.push({
            label: t('Roles'),
            value: counts.roles,
            icon: Key,
            route: 'roles',
        });
    if (counts.tenants !== undefined)
        list.push({
            label: t('Tenants'),
            value: counts.tenants,
            icon: OfficeBuilding,
            route: 'tenants',
        });
    return list;
});

const chart = computed(() => {
    const entries: [string, number | undefined][] = [
        [t('ActiveUsers'), counts.activeUsers],
        [t('InactiveUsers'), counts.inactiveUsers],
        [t('Roles'), counts.roles],
        [t('Tenants'), counts.tenants],
    ];
    const shown = entries.filter((entry): entry is [string, number] => entry[1] !== undefined);
    return { categories: shown.map(([label]) => label), values: shown.map(([, value]) => value) };
});
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('HomePage') }}</h1>
        </div>
        <section class="dashboard">
            <div class="welcome-card">
                <div class="welcome-avatar" aria-hidden="true">
                    {{ (displayName || 'U').slice(0, 1).toUpperCase() }}
                </div>
                <div class="welcome-text">
                    <h2>{{ t('WelcomeUser', displayName) }}</h2>
                    <div class="welcome-meta">
                        <span>{{ t('CurrentTenant') }}：{{ state.session?.tenant?.tenancyName || t('Host') }}</span>
                        <template v-if="state.session?.application?.version">
                            <span class="meta-divider"></span>
                            <span>{{ t('Version') }}：{{ state.session.application.version }}</span>
                        </template>
                    </div>
                </div>
            </div>
            <div v-loading="loading" class="stat-grid">
                <div v-for="card in cards" :key="card.route" class="stat-card">
                    <div class="stat-head">
                        <span class="stat-label">{{ card.label }}</span>
                        <span class="stat-icon" aria-hidden="true">
                            <el-icon><component :is="card.icon" /></el-icon>
                        </span>
                    </div>
                    <div class="stat-value">{{ card.value.toLocaleString() }}</div>
                    <router-link v-if="router.hasRoute(card.route)" :to="{ name: card.route }" class="stat-link">
                        {{ t('ViewAll') }}
                        <el-icon><ArrowRight /></el-icon>
                    </router-link>
                </div>
                <p v-if="!loading && !cards.length" class="stat-empty">{{ t('NoStatisticsAvailable') }}</p>
            </div>
            <DashboardChart
                v-if="!loading && chart.values.length"
                :title="t('Overview')"
                :aria-label="t('Overview')"
                :categories="chart.categories"
                :values="chart.values" />
        </section>
    </div>
</template>
<style>
.welcome-card {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding: 24px;
    border-radius: var(--app-radius);
    background: var(--app-surface);
    box-shadow: var(--app-shadow-card);
}
.welcome-avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 22px;
    color: #fff;
    background: var(--app-primary);
}
.welcome-text h2 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: var(--app-text);
}
.welcome-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    font-size: 14px;
    color: var(--app-text-muted);
}
.meta-divider {
    width: 1px;
    height: 14px;
    background: var(--app-border-strong);
}
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    min-height: 110px;
    margin-bottom: 16px;
}
.stat-card {
    display: flex;
    flex-direction: column;
    padding: 20px 24px 0;
    border-radius: var(--app-radius);
    background: var(--app-surface);
    box-shadow: var(--app-shadow-card);
}
.stat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.stat-label {
    font-size: 14px;
    color: var(--app-text-muted);
}
.stat-icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--app-primary-soft);
    color: var(--app-primary);
    font-size: 14px;
}
.stat-value {
    margin: 4px 0 16px;
    font-size: 30px;
    font-weight: 400;
    line-height: 38px;
    font-variant-numeric: tabular-nums;
    color: var(--app-text);
}
.stat-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: auto -24px 0;
    padding: 10px 24px;
    border-top: 1px solid var(--app-border);
    font-size: 14px;
    color: var(--app-text-secondary);
}
.stat-link:hover {
    color: var(--app-primary);
}
.stat-link .el-icon {
    font-size: 12px;
}
.stat-empty {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--app-text-muted);
}
@media (max-width: 700px) {
    .welcome-card {
        padding: 16px;
    }
    .welcome-avatar {
        width: 44px;
        height: 44px;
        font-size: 18px;
    }
}
</style>
