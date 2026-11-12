<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { state, initialize, setCookie, t } from '../../api';
import { accountApi } from '../../api/account';
import { useValidation } from '../../composables/validation';
import { changeLanguage } from '../../composables/language';
import { startNotifications } from '../../services/notifications';
import ChangeTenantDialog from './change-tenant-dialog.vue';

const route = useRoute(),
    router = useRouter(),
    page = computed(() => String(route.name)),
    busy = ref(false),
    tenantDialog = ref(false),
    formRef = ref<any>(),
    form = ref<any>({});

const { rules, requiredRule } = useValidation(form);

watch(
    () => route.path,
    () => {
        form.value = {};
    }
);

async function login() {
    await formRef.value.validate();
    busy.value = true;
    try {
        const r = await accountApi.authenticate({
            userNameOrEmailAddress: form.value.userNameOrEmailAddress,
            password: form.value.password,
            rememberClient: !!form.value.rememberMe,
        });
        const age = form.value.rememberMe ? r.expireInSeconds : undefined;
        setCookie('Abp.AuthToken', r.accessToken, age);
        setCookie('enc_auth_token', r.encryptedAccessToken, age);
        await initialize();
        startNotifications();
        const redirect =
            typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app/')
                ? route.query.redirect
                : { name: 'app' };
        await router.push(redirect);
    } finally {
        busy.value = false;
    }
}

async function register() {
    await formRef.value.validate();
    busy.value = true;
    try {
        const r = await accountApi.register(form.value);
        if (r.canLogin) {
            form.value.userNameOrEmailAddress = form.value.userName;
            await login();
        } else {
            ElMessage.success(t('SuccessfullyRegistered', '注册成功'));
            router.push('/account/login');
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
                <div class="panel card">
                    <el-select
                        v-if="state.config?.localization?.languages?.length"
                        :model-value="state.config.localization.currentLanguage?.name"
                        @change="changeLanguage"
                        style="width: 150px; margin-bottom: 12px">
                        <el-option
                            v-for="l in state.config.localization.languages.filter((x) => !x.isDisabled)"
                            :key="l.name"
                            :label="l.displayName"
                            :value="l.name" />
                    </el-select>
                    <div v-if="state.config?.multiTenancy?.isEnabled" class="tenant-line">
                        {{ t('CurrentTenant', '当前租户') }}：{{
                            state.session?.tenant?.tenancyName || t('NotSelected', '未选择')
                        }}
                        <el-button link type="primary" @click="tenantDialog = true">
                            {{ t('Change', '切换') }}
                        </el-button>
                    </div>
                    <div class="account-heading">
                        <h3>{{ page === 'login' ? t('LogIn', '登录') : t('Register', '注册') }}</h3>
                        <p>{{ page === 'login' ? '欢迎回来，请登录以继续。' : '填写以下信息，创建你的账户。' }}</p>
                    </div>
                    <el-form
                        ref="formRef"
                        :model="form"
                        :rules="{ ...rules, password: [requiredRule] }"
                        @submit.prevent="page === 'login' ? login() : register()">
                        <template v-if="page === 'register'">
                            <el-form-item prop="name">
                                <el-input v-model="form.name" :placeholder="t('Name', '名字')" />
                            </el-form-item>
                            <el-form-item prop="surname">
                                <el-input v-model="form.surname" :placeholder="t('Surname', '姓氏')" />
                            </el-form-item>
                            <el-form-item prop="userName">
                                <el-input v-model="form.userName" :placeholder="t('UserName', '用户名')" />
                            </el-form-item>
                            <el-form-item prop="emailAddress">
                                <el-input v-model="form.emailAddress" :placeholder="t('EmailAddress', '邮箱')" />
                            </el-form-item>
                        </template>
                        <el-form-item v-else prop="userNameOrEmailAddress">
                            <el-input
                                v-model="form.userNameOrEmailAddress"
                                :placeholder="t('UserNameOrEmail', '用户名或邮箱')" />
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input
                                v-model="form.password"
                                type="password"
                                show-password
                                :placeholder="t('Password', '密码')" />
                        </el-form-item>
                        <el-checkbox v-if="page === 'login'" v-model="form.rememberMe">
                            {{ t('RememberMe', '记住我') }}
                        </el-checkbox>
                        <el-button class="login-button" type="primary" native-type="submit" :loading="busy">
                            {{ page === 'login' ? t('LogIn', '登录') : t('Register', '注册') }}
                        </el-button>
                    </el-form>
                    <div class="login-links">
                        <router-link
                            v-if="page !== 'login' || state.session?.tenant"
                            :to="page === 'login' ? '/account/register' : '/account/login'">
                            {{ page === 'login' ? t('Register', '注册') : t('Back', '返回') }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <ChangeTenantDialog v-model="tenantDialog" />
    </div>
</template>
<style>
.login-box {
    width: min(100%, 360px);
}
.login-title {
    margin-bottom: 0.75rem;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 500;
}
.login-mark {
    color: var(--bs-primary);
    margin-right: 0.5rem;
}
.login-box .card {
    border-top: 3px solid var(--bs-primary);
}
.account-heading h3 {
    font-size: 1.125rem;
}
.account-heading p,
.tenant-line {
    color: var(--bs-secondary-color);
}
.tenant-line,
.account-heading {
    margin-bottom: 1rem;
}
.login-button {
    width: 100%;
    margin-top: 0.5rem;
}
.login-links {
    margin-top: 1rem;
}
</style>
