<script setup lang="ts">
import { t } from '../../api';
import { tenantApi } from '../../api/tenants';
import type { TenantForm } from '../../api/types';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const emptyForm = (): TenantForm => ({ isActive: true });
const { visible, busy, formRef, form, tab, edit, rules, open, save } = useEditorDialog(
    tenantApi,
    async (id) => ({ form: id !== undefined ? await tenantApi.get(id) : emptyForm() }),
    () => emit('saved'),
    emptyForm
);

defineExpose({ open });
</script>
<template>
    <el-dialog
        v-model="visible"
        :close-on-click-modal="!busy"
        :close-on-press-escape="!busy"
        :show-close="!busy"
        :title="edit ? t('EditTenant') : t('CreateNewTenant')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details')" name="details">
                    <el-form-item :label="t('TenancyName')" prop="tenancyName">
                        <el-input v-model="form.tenancyName" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('Name')" prop="name">
                        <el-input v-model="form.name" maxlength="128" />
                    </el-form-item>
                    <template v-if="!edit">
                        <el-form-item :label="t('DatabaseConnectionString')">
                            <el-input v-model="form.connectionString" />
                        </el-form-item>
                        <el-form-item :label="t('AdminEmailAddress')" prop="adminEmailAddress">
                            <el-input v-model="form.adminEmailAddress" />
                        </el-form-item>
                        <p>{{ t('DefaultPasswordIs', '123qwe') }}</p>
                    </template>
                    <el-form-item :label="t('IsActive')">
                        <el-checkbox v-model="form.isActive" />
                    </el-form-item>
                </el-tab-pane>
            </el-tabs>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel') }}</el-button>
            <el-button type="primary" :loading="busy" @click="save">{{ t('Save') }}</el-button>
        </template>
    </el-dialog>
</template>
