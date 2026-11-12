<script setup lang="ts">
import { t } from '../../api';
import { roleApi } from '../../api/roles';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const { visible, busy, formRef, form, choices, tab, edit, rules, open, save } = useEditorDialog(
    roleApi,
    async (id) => {
        if (id !== undefined) {
            const r = await roleApi.getForEdit(id);
            return {
                form: { ...r.role, grantedPermissions: r.grantedPermissionNames || [] },
                options: r.permissions || [],
            };
        }
        const options = (await roleApi.getPermissions()).items || [];
        return { form: { grantedPermissions: options.map((p: any) => p.name) }, options };
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
        :title="edit ? t('EditRole', '编辑') : t('CreateNewRole', '新建')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details', '基本信息')" name="details">
                    <el-form-item :label="t('Name', '名称')" prop="name">
                        <el-input v-model="form.name" maxlength="32" />
                    </el-form-item>
                    <el-form-item :label="t('DisplayName', '显示名称')" prop="displayName">
                        <el-input v-model="form.displayName" maxlength="32" />
                    </el-form-item>
                    <el-form-item :label="t('RoleDescription', '描述')">
                        <el-input v-model="form.description" type="textarea" />
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane :label="t('Permissions', '权限')" name="permissions">
                    <el-checkbox-group v-model="form.grantedPermissions" class="permission-list">
                        <el-checkbox v-for="p in choices" :key="p.name" :value="p.name" :disabled="form.isStatic">
                            {{ p.displayName }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
            </el-tabs>
        </el-form>
        <template #footer>
            <el-button :disabled="busy" @click="visible = false">{{ t('Cancel', '取消') }}</el-button>
            <el-button type="primary" :loading="busy" @click="save">{{ t('Save', '保存') }}</el-button>
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
