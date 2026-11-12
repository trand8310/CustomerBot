import { createRouter, createWebHistory } from 'vue-router';
import { state, permitted } from '../api';

const notFound = () => import('../views/errors/not-found.vue');
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: (to) => ({ name: 'app', query: to.query, hash: to.hash }) },
        { path: '/account/login', name: 'login', component: () => import('../views/account/account.vue') },
        { path: '/account/register', name: 'register', component: () => import('../views/account/account.vue') },
        {
            path: '/app',
            name: 'app',
            component: () => import('../layout/layout.vue'),
            children: [{ path: ':pathMatch(.*)*', name: 'app-not-found', component: notFound }],
        },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: notFound },
    ],
});

// These checks only decide what the UI shows. The backend authorizes every API call independently.
router.beforeEach((to) => {
    if (!state.config) return true;
    if (to.matched.some((record) => record.name === 'app') && !state.session?.user)
        return { name: 'login', query: { redirect: to.fullPath } };
    if (to.name === 'app' && router.hasRoute('home')) return { name: 'home', query: to.query, hash: to.hash };
    if (to.meta.permission && !permitted(to.meta.permission)) return { name: 'home' };
    if ((to.name === 'login' || to.name === 'register') && state.session?.user) return { name: 'app' };
    return true;
});
export default router;
