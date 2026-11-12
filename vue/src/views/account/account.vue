<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { state, initialize, setCookie, t, authTokenCookie, encryptedTokenCookie } from '../../api';
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

async function validate(): Promise<boolean> {
    return !!formRef.value && (await formRef.value.validate().catch(() => false));
}

async function signIn() {
    const r = await accountApi.authenticate({
        userNameOrEmailAddress: form.value.userNameOrEmailAddress,
        password: form.value.password,
        rememberClient: form.value.rememberMe,
    });
    const age = form.value.rememberMe ? r.expireInSeconds : undefined;
    setCookie(authTokenCookie, r.accessToken, age);
    setCookie(encryptedTokenCookie, r.encryptedAccessToken, age);
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
        <div class="login-wrap">
            <div class="login-box">
                <div class="login-title">
                    <span class="login-mark"><i class="fa-solid fa-cube" aria-hidden="true"></i></span>
                    <span>CustomerBot</span>
                </div>
                <div class="login-card">
                    <div class="account-heading">
                        <h3>{{ page === 'login' ? t('LogIn') : t('Register') }}</h3>
                        <p>{{ page === 'login' ? t('LoginWelcome') : t('RegisterWelcome') }}</p>
                    </div>
                    <div v-if="state.config?.multiTenancy?.isEnabled" class="tenant-line">
                        <span>
                            <i class="fa-solid fa-building" aria-hidden="true"></i>
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
                                <el-input v-model="form.emailAddress" size="large" :placeholder="t('EmailAddress')" />
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
                    <i class="fa-solid fa-globe" aria-hidden="true"></i>
                    <el-select
                        :model-value="currentLanguage"
                        size="small"
                        style="width: 140px"
                        @change="changeLanguage">
                        <el-option v-for="l in languages" :key="l.name" :label="l.displayName" :value="l.name" />
                    </el-select>
                </div>
            </div>
        </div>
        <ChangeTenantDialog v-model="tenantDialog" />
    </div>
</template>
<style>
.login-box {
    width: min(100%, 400px);
}
.login-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--app-text);
}
.login-mark {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    color: #fff;
    font-size: 1.25rem;
    background: linear-gradient(135deg, #6366f1, #4338ca);
    box-shadow: 0 10px 24px -6px rgba(79, 70, 229, 0.5);
}
.login-card {
    padding: 2rem;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: var(--app-radius-lg);
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: var(--app-shadow-lg);
}
.account-heading {
    margin-bottom: 1.5rem;
    text-align: center;
}
.account-heading h3 {
    margin: 0 0 0.375rem;
    font-size: 1.375rem;
    font-weight: 600;
    letter-spacing: -0.015em;
}
.account-heading p {
    margin: 0;
    color: var(--app-text-muted);
}
.tenant-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    padding: 0.625rem 0.875rem;
    border-radius: var(--app-radius-sm);
    background: var(--app-surface-muted);
    border: 1px solid var(--app-border);
    font-size: 0.8125rem;
    color: var(--app-text-secondary);
}
.tenant-line i {
    margin-right: 4px;
    color: #94a3b8;
}
.tenant-line strong {
    color: var(--app-text);
    font-weight: 600;
}
.login-card .el-form-item {
    margin-bottom: 1.125rem;
}
.login-button {
    width: 100%;
    margin-top: 1rem;
    font-weight: 600;
}
.login-links {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--app-border);
    text-align: center;
    font-size: 0.8125rem;
    font-weight: 500;
}
.login-language {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    color: var(--app-text-muted);
}
@media (max-width: 480px) {
    .login-card {
        padding: 1.5rem 1.25rem;
    }
}
</style>
