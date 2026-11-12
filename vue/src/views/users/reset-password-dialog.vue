<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { t } from '../../api';
import { userApi } from '../../api/users';
import { generatePassword } from '../../utils/password';
import { useValidation } from '../../composables/validation';

const visible = ref(false);
const busy = ref(false);
const resetForm = ref({ userId: 0, adminPassword: '', newPassword: '' });
const resetRef = ref<FormInstance>();
const { requiredRule } = useValidation(resetForm);

function open(userId: number) {
    resetForm.value = { userId, adminPassword: '', newPassword: generatePassword() };
    visible.value = true;
}

async function submitReset() {
    if (busy.value || !resetRef.value) return;
    busy.value = true;
    try {
        if (!(await resetRef.value.validate().catch(() => false))) return;
        const ok = await userApi.resetPassword(resetForm.value);
        if (ok === false) {
            ElMessage.error(t('AnErrorOccurred'));
            return;
        }
        ElMessage.success(t('SavedSuccessfully'));
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
        :title="t('ResetPassword')"
        width="500">
        <el-form ref="resetRef" :model="resetForm" label-position="top">
            <p>{{ t('ResetPasswordStepOneInfo') }}</p>
            <el-form-item :label="t('AdminPassword')" prop="adminPassword" :rules="[requiredRule]">
                <el-input v-model="resetForm.adminPassword" type="password" show-password />
            </el-form-item>
            <p>{{ t('ResetPasswordStepTwoInfo') }}</p>
            <el-form-item :label="t('NewPassword')">
                <el-input v-model="resetForm.newPassword" readonly />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel') }}</el-button>
            <el-button type="primary" :loading="busy" @click="submitReset">{{ t('Save') }}</el-button>
        </template>
    </el-dialog>
</template>
