<script setup lang="ts">
import { t } from '../../api';
import { roleApi } from '../../api/roles';
import type { RoleForm } from '../../api/types';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const emptyForm = (): RoleForm => ({ grantedPermissions: [] });
const { visible, busy, formRef, form, choices, tab, edit, rules, open, save } = useEditorDialog(
    roleApi,
    async (id) => {
        if (id !== undefined) {
            const r = await roleApi.getForEdit(id);
            return {
                form: { ...r.role, grantedPermissions: r.grantedPermissionNames ?? [] },
                options: r.permissions ?? [],
            };
        }
        // New roles start with no permissions; the administrator grants them explicitly.
        const options = (await roleApi.getPermissions()).items ?? [];
        return { form: emptyForm(), options };
    },
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
        :title="edit ? t('EditRole') : t('CreateNewRole')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details')" name="details">
                    <el-form-item :label="t('Name')" prop="name">
                        <el-input v-model="form.name" maxlength="32" />
                    </el-form-item>
                    <el-form-item :label="t('DisplayName')" prop="displayName">
                        <el-input v-model="form.displayName" maxlength="32" />
                    </el-form-item>
                    <el-form-item :label="t('RoleDescription')">
                        <el-input v-model="form.description" type="textarea" />
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane :label="t('Permissions')" name="permissions">
                    <el-checkbox-group v-model="form.grantedPermissions" class="permission-list">
                        <el-checkbox v-for="p in choices" :key="p.name" :value="p.name" :disabled="form.isStatic">
                            {{ p.displayName }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
            </el-tabs>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel') }}</el-button>
            <el-button type="primary" :loading="busy" @click="save">{{ t('Save') }}</el-button>
        </template>
    </el-dialog>
</template>
<style scoped>
.permission-list {
    display: flex;
    flex-direction: column;
    max-height: 320px;
    overflow: auto;
}
</style>
