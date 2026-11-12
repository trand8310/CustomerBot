<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { t } from '../../api';
import { userApi } from '../../api/users';
import { useValidation } from '../../composables/validation';

const router = useRouter(),
    formRef = ref<FormInstance>(),
    form = ref({ currentPassword: '', newPassword: '', confirm: '' }),
    busy = ref(false);

const { rules } = useValidation(form);

async function changePassword() {
    if (busy.value || !formRef.value || !(await formRef.value.validate().catch(() => false))) return;
    busy.value = true;
    try {
        const { currentPassword, newPassword } = form.value;
        const result = await userApi.changePassword({ currentPassword, newPassword });
        if (result === false) {
            ElMessage.error(t('PasswordChangeFailed'));
            return;
        }
        ElMessage.success(t('PasswordChangedSuccessfully'));
        await router.push(router.hasRoute('home') ? { name: 'home' } : { name: 'app' });
    } finally {
        busy.value = false;
    }
}
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('UpdatePassword') }}</h1>
        </div>
        <div class="panel card">
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-position="top"
                style="max-width: 500px"
                @submit.prevent="changePassword">
                <el-form-item :label="t('CurrentPassword')" prop="currentPassword">
                    <el-input v-model="form.currentPassword" type="password" show-password />
                </el-form-item>
                <el-form-item :label="t('NewPassword')" prop="newPassword">
                    <el-input v-model="form.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item :label="t('ConfirmNewPassword')" prop="confirm">
                    <el-input v-model="form.confirm" type="password" show-password />
                </el-form-item>
                <el-button type="primary" native-type="submit" :loading="busy">{{ t('Save') }}</el-button>
            </el-form>
        </div>
    </div>
</template>
<style>
.panel form {
    max-width: 500px;
}
</style>
