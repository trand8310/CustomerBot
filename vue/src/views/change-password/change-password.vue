<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { t } from '../../api';
import { userApi } from '../../api/users';
import { useValidation } from '../../composables/validation';

const router = useRouter(),
    formRef = ref<any>(),
    form = ref<any>({}),
    busy = ref(false);

const { rules } = useValidation(form);

async function changePassword() {
    await formRef.value.validate();
    busy.value = true;
    try {
        const result = await userApi.changePassword(form.value);
        if (result === false) {
            ElMessage.error('密码修改失败');
            return;
        }
        ElMessage.success('密码修改成功');
        router.push(router.hasRoute('home') ? { name: 'home' } : { name: 'app' });
    } finally {
        busy.value = false;
    }
}
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('UpdatePassword', '修改密码') }}</h1>
        </div>
        <div class="panel card">
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-position="top"
                style="max-width: 500px"
                @submit.prevent="changePassword">
                <el-form-item :label="t('CurrentPassword', '当前密码')" prop="currentPassword">
                    <el-input v-model="form.currentPassword" type="password" show-password />
                </el-form-item>
                <el-form-item :label="t('NewPassword', '新密码')" prop="newPassword">
                    <el-input v-model="form.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item :label="t('ConfirmNewPassword', '确认新密码')" prop="confirm">
                    <el-input v-model="form.confirm" type="password" show-password />
                </el-form-item>
                <el-button type="primary" native-type="submit" :loading="busy">{{ t('Save', '保存') }}</el-button>
            </el-form>
        </div>
    </div>
</template>
<style>
.panel form {
    max-width: 500px;
}
</style>
