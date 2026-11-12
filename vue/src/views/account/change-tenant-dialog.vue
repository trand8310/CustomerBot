<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { setCookie, t } from '../../api';
import { accountApi } from '../../api/account';

const visible = defineModel<boolean>({ required: true });
const tenantName = ref('');

async function changeTenant() {
    if (!tenantName.value) {
        setCookie('Abp.TenantId', '', 0);
        location.reload();
        return;
    }
    const r = await accountApi.isTenantAvailable(tenantName.value);
    if (r.state === 1) {
        setCookie('Abp.TenantId', r.tenantId);
        location.reload();
    } else
        ElMessage.warning(
            r.state === 2
                ? t('TenantIsNotActive', '租户 {0} 未启用', tenantName.value)
                : t('ThereIsNoTenantDefinedWithName{0}', '租户 {0} 不存在', tenantName.value)
        );
}
</script>
<template>
    <el-dialog v-model="visible" :title="t('ChangeTenant', '切换租户')" width="420">
        <p>{{ t('LeaveEmptyToSwitchToHost', '留空以切换到宿主。') }}</p>
        <el-input v-model="tenantName" :placeholder="t('TenancyName', '租户名称')" />
        <template #footer>
            <el-button @click="visible = false">{{ t('Cancel', '取消') }}</el-button>
            <el-button type="primary" @click="changeTenant">确定</el-button>
        </template>
    </el-dialog>
</template>
