<script setup lang="ts">
import { t } from '../../api';
import { tenantApi } from '../../api/tenants';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const { visible, busy, formRef, form, tab, edit, rules, open, save } = useEditorDialog(
    tenantApi,
    async (id) => {
        return { form: id !== undefined ? await tenantApi.get(id) : { isActive: true } };
    },
    () => emit('saved')
);

defineExpose({ open });
</script>
<template>
    <el-dialog
        v-model="visible"
        :close-on-click-modal="!busy"
        :close-on-press-escape="!busy"
        :show-close="!busy"
        :title="edit ? t('EditTenant', '编辑') : t('CreateNewTenant', '新建')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details', '基本信息')" name="details">
                    <el-form-item :label="t('TenancyName', '租户名称')" prop="tenancyName">
                        <el-input v-model="form.tenancyName" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('Name', '名称')" prop="name">
                        <el-input v-model="form.name" maxlength="128" />
                    </el-form-item>
                    <template v-if="!edit">
                        <el-form-item :label="t('DatabaseConnectionString', '数据库连接串')">
                            <el-input v-model="form.connectionString" />
                        </el-form-item>
                        <el-form-item :label="t('AdminEmailAddress', '管理员邮箱')" prop="adminEmailAddress">
                            <el-input v-model="form.adminEmailAddress" />
                        </el-form-item>
                        <p>{{ t('DefaultPasswordIs', '默认密码：{0}', '123qwe') }}</p>
                    </template>
                    <el-form-item :label="t('IsActive', '启用')">
                        <el-checkbox v-model="form.isActive" />
                    </el-form-item>
                </el-tab-pane>
            </el-tabs>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel', '取消') }}</el-button>
            <el-button type="primary" :loading="busy" @click="save">{{ t('Save', '保存') }}</el-button>
        </template>
    </el-dialog>
</template>
