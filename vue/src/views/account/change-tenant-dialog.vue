<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '../../api';
import { removeItem, storageKeys, writeItem } from '../../api/storage';
import { TenantAvailabilityState } from '../../api/types';
import { accountApi } from '../../api/account';

const visible = defineModel<boolean>({ required: true });
const tenantName = ref('');

async function changeTenant() {
    if (!tenantName.value) {
        removeItem(storageKeys.tenantId);
        location.reload();
        return;
    }
    const r = await accountApi.isTenantAvailable(tenantName.value);
    if (r.state === TenantAvailabilityState.Available && r.tenantId !== undefined) {
        writeItem(storageKeys.tenantId, String(r.tenantId));
        location.reload();
    } else
        ElMessage.warning(
            r.state === TenantAvailabilityState.InActive
                ? t('TenantIsNotActive', tenantName.value)
                : t('ThereIsNoTenantDefinedWithName{0}', tenantName.value)
        );
}
</script>
<template>
    <el-dialog v-model="visible" :title="t('ChangeTenant')" width="420">
        <p>{{ t('LeaveEmptyToSwitchToHost') }}</p>
        <el-input v-model="tenantName" :placeholder="t('TenancyName')" />
        <template #footer>
            <el-button @click="visible = false">{{ t('Cancel') }}</el-button>
            <el-button type="primary" @click="changeTenant">{{ t('OK') }}</el-button>
        </template>
    </el-dialog>
</template>
