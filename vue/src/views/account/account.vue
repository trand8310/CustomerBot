<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChatDotRound, OfficeBuilding } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { state, initialize, t } from '../../api';
import { saveToken } from '../../api/auth';
import { accountApi } from '../../api/account';
import { useValidation } from '../../composables/validation';
import { useLanguages } from '../../composables/language';
import { startNotifications } from '../../services/notifications';
import ChangeTenantDialog from './change-tenant-dialog.vue';

interface AccountForm {
    userNameOrEmailAddress: string;
    password: string;
    rememberMe: boolean;
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
}

const emptyForm = (): AccountForm => ({
    userNameOrEmailAddress: '',
    password: '',
    rememberMe: false,
    name: '',
    surname: '',
    userName: '',
    emailAddress: '',
});

const route = useRoute(),
    router = useRouter(),
    page = computed(() => String(route.name)),
    busy = ref(false),
    tenantDialog = ref(false),
    formRef = ref<FormInstance>(),
    form = ref<AccountForm>(emptyForm());

const { rules, requiredRule } = useValidation(form);
const { languages, currentLanguage, changeLanguage } = useLanguages();
// Login and register only require a password here; the strength rule applies when it is set by an admin.
const formRules = computed(() => ({ ...rules.value, password: [requiredRule] }));

watch(
    () => route.path,
    () => {
        form.value = emptyForm();
    }
);

// Arrived here because the previous session expired (see api/auth.ts).
onMounted(() => {
    if (route.query.expired === '1') ElMessage.warning({ message: t('SessionExpired'), duration: 5000 });
});

async function validate(): Promise<boolean> {
    return !!formRef.value && (await formRef.value.validate().catch(() => false));
}

async function signIn() {
    const r = await accountApi.authenticate({
        userNameOrEmailAddress: form.value.userNameOrEmailAddress,
        password: form.value.password,
        rememberClient: form.value.rememberMe,
    });
    saveToken(r, form.value.rememberMe);
    await initialize();
    void startNotifications();
    const redirect =
        typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app/')
            ? route.query.redirect
            : { name: 'app' };
    await router.push(redirect);
}

async function login() {
    if (busy.value || !(await validate())) return;
    busy.value = true;
    try {
        await signIn();
    } finally {
        busy.value = false;
    }
}

async function register() {
    if (busy.value || !(await validate())) return;
    busy.value = true;
    try {
        const { name, surname, userName, emailAddress, password } = form.value;
        const r = await accountApi.register({ name, surname, userName, emailAddress, password });
        if (r.canLogin) {
            form.value.userNameOrEmailAddress = userName;
            await signIn();
        } else {
            ElMessage.success(t('SuccessfullyRegistered'));
            await router.push('/account/login');
        }
    } finally {
        busy.value = false;
    }
}
</script>
<template>
    <div>
        <div class="auth-page">
            <main class="auth-main">
                <div class="login-box">
                    <div class="login-title">
                        <span class="login-mark"><el-icon><ChatDotRound /></el-icon></span>
                        <span>CustomerBot</span>
                    </div>
                    <div class="login-card">
                        <div class="account-heading">
                            <h3>{{ page === 'login' ? t('LogIn') : t('Register') }}</h3>
                            <p>{{ page === 'login' ? t('LoginWelcome') : t('RegisterWelcome') }}</p>
                        </div>
                        <div v-if="state.config?.multiTenancy?.isEnabled" class="tenant-line">
                            <span>
                                <el-icon><OfficeBuilding /></el-icon>
                                {{ t('CurrentTenant') }}:
                                <strong>{{ state.session?.tenant?.tenancyName || t('NotSelected') }}</strong>
                            </span>
                            <el-button link type="primary" @click="tenantDialog = true">
                                {{ t('Change') }}
                            </el-button>
                        </div>
                        <el-form
                            ref="formRef"
                            :model="form"
                            :rules="formRules"
                            @submit.prevent="page === 'login' ? login() : register()">
                            <template v-if="page === 'register'">
                                <el-form-item prop="name">
                                    <el-input v-model="form.name" size="large" :placeholder="t('Name')" />
                                </el-form-item>
                                <el-form-item prop="surname">
                                    <el-input v-model="form.surname" size="large" :placeholder="t('Surname')" />
                                </el-form-item>
                                <el-form-item prop="userName">
                                    <el-input v-model="form.userName" size="large" :placeholder="t('UserName')" />
                                </el-form-item>
                                <el-form-item prop="emailAddress">
                                    <el-input
                                        v-model="form.emailAddress"
                                        size="large"
                                        :placeholder="t('EmailAddress')" />
                                </el-form-item>
                            </template>
                            <el-form-item v-else prop="userNameOrEmailAddress">
                                <el-input
                                    v-model="form.userNameOrEmailAddress"
                                    size="large"
                                    :placeholder="t('UserNameOrEmail')" />
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input
                                    v-model="form.password"
                                    type="password"
                                    size="large"
                                    show-password
                                    :placeholder="t('Password')" />
                            </el-form-item>
                            <el-checkbox v-if="page === 'login'" v-model="form.rememberMe">
                                {{ t('RememberMe') }}
                            </el-checkbox>
                            <el-button
                                class="login-button"
                                type="primary"
                                size="large"
                                native-type="submit"
                                :loading="busy">
                                {{ page === 'login' ? t('LogIn') : t('Register') }}
                            </el-button>
                        </el-form>
                        <div v-if="page !== 'login' || state.session?.tenant" class="login-links">
                            <router-link :to="page === 'login' ? '/account/register' : '/account/login'">
                                {{ page === 'login' ? t('Register') : t('Back') }}
                            </router-link>
                        </div>
                    </div>
                    <div v-if="languages.length" class="login-language">
                        <el-select
                            :model-value="currentLanguage"
                            size="small"
                            style="width: 140px"
                            @change="changeLanguage">
                            <el-option v-for="l in languages" :key="l.name" :label="l.displayName" :value="l.name" />
                        </el-select>
                    </div>
                </div>
            </main>
            <footer class="auth-footer">
                © {{ new Date().getFullYear() }} CustomerBot
                <template v-if="state.session?.application?.version">
                    · {{ t('Version') }} {{ state.session.application.version }}
                </template>
            </footer>
        </div>
        <ChangeTenantDialog v-model="tenantDialog" />
    </div>
</template>
<style>
.auth-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--app-bg);
    background-image:
        radial-gradient(circle at 15% 10%, rgba(22, 119, 255, 0.08), transparent 40%),
        radial-gradient(circle at 85% 90%, rgba(22, 119, 255, 0.06), transparent 40%);
}
.auth-main {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 12vh 16px 32px;
}
.login-box {
    width: min(100%, 400px);
}
.login-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 32px;
    font-size: 30px;
    font-weight: 600;
    line-height: 44px;
    color: var(--app-text);
}
.login-mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    color: #fff;
    font-size: 20px;
    background: var(--app-primary);
}
.login-card {
    padding: 32px 36px 28px;
    border-radius: var(--app-radius);
    background: var(--app-surface);
    box-shadow: var(--app-shadow-card);
}
.account-heading {
    margin-bottom: 24px;
    text-align: center;
}
.account-heading h3 {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: var(--app-text);
}
.account-heading p {
    margin: 0;
    font-size: 14px;
    color: var(--app-text-muted);
}
.tenant-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 24px;
    padding: 8px 12px;
    border: 1px solid var(--app-primary-border);
    border-radius: var(--app-radius);
    background: var(--app-primary-soft);
    font-size: 14px;
    color: var(--app-text);
}
.tenant-line .el-icon {
    margin-right: 6px;
    vertical-align: -2px;
    color: var(--app-primary);
}
.tenant-line strong {
    font-weight: 600;
}
.login-card .el-form-item {
    margin-bottom: 24px;
}
.login-button {
    width: 100%;
    margin-top: 24px;
}
.login-links {
    margin-top: 16px;
    text-align: right;
    font-size: 14px;
}
.login-language {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    color: var(--app-text-muted);
    font-size: 14px;
}
.auth-footer {
    padding: 24px 16px;
    text-align: center;
    font-size: 14px;
    color: var(--app-text-muted);
}
@media (max-width: 480px) {
    .auth-main {
        padding-top: 48px;
    }
    .login-title {
        font-size: 24px;
    }
    .login-card {
        padding: 24px 20px;
    }
}
</style>
