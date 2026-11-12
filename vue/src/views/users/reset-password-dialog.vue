<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { t } from '../../api';
import { userApi } from '../../api/users';
import { useValidation } from '../../composables/validation';

const visible = ref(false);
const busy = ref(false);
const resetForm = ref({ userId: 0, adminPassword: '', newPassword: '' });
const resetRef = ref<FormInstance>();
const { requiredRule } = useValidation(resetForm);

function open(userId: number) {
    resetForm.value = { userId, adminPassword: '', newPassword: Math.random().toString(36).slice(2, 12) };
    visible.value = true;
}

async function submitReset() {
    if (busy.value || !resetRef.value) return;
    busy.value = true;
    try {
        if (!(await resetRef.value.validate().catch(() => false))) return;
        const ok = await userApi.resetPassword(resetForm.value);
        if (ok === false) {
            ElMessage.error(t('AnErrorOccurred', '操作失败'));
            return;
        }
        ElMessage.success(t('SavedSuccessfully', '保存成功'));
        visible.value = false;
    } finally {
        busy.value = false;
    }
}

defineExpose({ open });
</script>
<template>
    <el-dialog
        v-model="visible"
        :close-on-click-modal="!busy"
        :close-on-press-escape="!busy"
        :show-close="!busy"
        :title="t('ResetPassword', '重置密码')"
        width="500">
        <el-form ref="resetRef" :model="resetForm" label-position="top">
            <p>{{ t('ResetPasswordStepOneInfo', '请输入管理员密码以确认操作。') }}</p>
            <el-form-item :label="t('AdminPassword', '管理员密码')" prop="adminPassword" :rules="[requiredRule]">
                <el-input v-model="resetForm.adminPassword" type="password" show-password />
            </el-form-item>
            <p>{{ t('ResetPasswordStepTwoInfo', '请记录生成的新密码。') }}</p>
            <el-form-item :label="t('NewPassword', '新密码')">
                <el-input v-model="resetForm.newPassword" readonly />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel', '取消') }}</el-button>
            <el-button type="primary" :loading="busy" @click="submitReset">{{ t('Save', '保存') }}</el-button>
        </template>
    </el-dialog>
</template>
