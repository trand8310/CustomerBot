<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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
    icon: string;
    tone: 'indigo' | 'emerald' | 'amber';
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
            icon: 'fa-users',
            tone: 'indigo',
            route: 'users',
        });
    if (counts.roles !== undefined)
        list.push({
            label: t('Roles'),
            value: counts.roles,
            icon: 'fa-masks-theater',
            tone: 'emerald',
            route: 'roles',
        });
    if (counts.tenants !== undefined)
        list.push({
            label: t('Tenants'),
            value: counts.tenants,
            icon: 'fa-building',
            tone: 'amber',
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
                    <p>
                        <span class="meta-chip">
                            <i class="fa-solid fa-building" aria-hidden="true"></i>
                            {{ t('CurrentTenant') }}: {{ state.session?.tenant?.tenancyName || t('Host') }}
                        </span>
                        <span v-if="state.session?.application?.version" class="meta-chip">
                            <i class="fa-solid fa-code-branch" aria-hidden="true"></i>
                            {{ t('Version') }} {{ state.session.application.version }}
                        </span>
                    </p>
                </div>
            </div>
            <div v-loading="loading" class="stat-grid">
                <div v-for="card in cards" :key="card.route" class="stat-card" :class="'tone-' + card.tone">
                    <div class="stat-head">
                        <span class="stat-label">{{ card.label }}</span>
                        <span class="stat-icon" aria-hidden="true">
                            <i class="fa-solid" :class="card.icon"></i>
                        </span>
                    </div>
                    <div class="stat-value">{{ card.value.toLocaleString() }}</div>
                    <router-link v-if="router.hasRoute(card.route)" :to="{ name: card.route }" class="stat-link">
                        {{ t('ViewAll') }}
                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
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
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--app-border);
    border-radius: var(--app-radius);
    background:
        radial-gradient(28rem 14rem at 100% 0%, rgba(99, 102, 241, 0.14), transparent 70%),
        radial-gradient(20rem 12rem at 85% 120%, rgba(14, 165, 233, 0.1), transparent 70%),
        var(--app-surface);
    box-shadow: var(--app-shadow-xs);
}
.welcome-avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #818cf8, #4f46e5);
    box-shadow: 0 6px 16px -4px rgba(79, 70, 229, 0.45);
}
.welcome-text h2 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
}
.welcome-text p {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
}
.meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border: 1px solid var(--app-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    color: var(--app-text-secondary);
}
.meta-chip i {
    color: #94a3b8;
}
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
    min-height: 120px;
    margin-bottom: 1.25rem;
}
.stat-card {
    --tone: var(--app-primary);
    --tone-soft: var(--app-primary-soft);
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    border: 1px solid var(--app-border);
    border-radius: var(--app-radius);
    background: var(--app-surface);
    box-shadow: var(--app-shadow-xs);
    transition:
        box-shadow var(--app-transition),
        transform var(--app-transition),
        border-color var(--app-transition);
}
.stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--app-border-strong);
    box-shadow: var(--app-shadow-sm);
}
.stat-card.tone-emerald {
    --tone: var(--app-success);
    --tone-soft: var(--app-success-soft);
}
.stat-card.tone-amber {
    --tone: var(--app-warning);
    --tone-soft: var(--app-warning-soft);
}
.stat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.stat-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--app-text-muted);
}
.stat-icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--tone-soft);
    color: var(--tone);
}
.stat-value {
    margin: 0.5rem 0 1rem;
    font-size: 2rem;
    font-weight: 650;
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--app-text);
}
.stat-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: auto;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--tone);
}
.stat-link i {
    font-size: 0.75rem;
    transition: transform var(--app-transition);
}
.stat-link:hover {
    color: var(--tone);
}
.stat-link:hover i {
    transform: translateX(3px);
}
.stat-empty {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--app-text-muted);
}
@media (max-width: 700px) {
    .welcome-card {
        padding: 1.125rem;
    }
}
</style>
