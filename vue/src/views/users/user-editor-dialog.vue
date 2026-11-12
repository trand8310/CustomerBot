<script setup lang="ts">
import { t } from '../../api';
import { userApi } from '../../api/users';
import type { UserForm } from '../../api/types';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const emptyForm = (): UserForm => ({ isActive: true, roleNames: [] });
const { visible, busy, formRef, form, choices, tab, edit, rules, open, save } = useEditorDialog(
    userApi,
    async (id) => {
        const [user, roles] = await Promise.all([
            id !== undefined ? userApi.get(id) : Promise.resolve(undefined),
            userApi.getRoles(),
        ]);
        const form: UserForm = user ? { ...user, roleNames: user.roleNames ?? [] } : emptyForm();
        return { form, options: roles.items ?? [] };
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
        :title="edit ? t('EditUser') : t('CreateNewUser')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details')" name="details">
                    <el-form-item :label="t('Name')" prop="name">
                        <el-input v-model="form.name" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('Surname')" prop="surname">
                        <el-input v-model="form.surname" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('UserName')" prop="userName">
                        <el-input v-model="form.userName" maxlength="256" />
                    </el-form-item>
                    <el-form-item :label="t('EmailAddress')" prop="emailAddress">
                        <el-input v-model="form.emailAddress" maxlength="256" />
                    </el-form-item>
                    <template v-if="!edit">
                        <el-form-item :label="t('Password')" prop="password">
                            <el-input v-model="form.password" type="password" show-password />
                        </el-form-item>
                        <el-form-item :label="t('ConfirmPassword')" prop="confirm">
                            <el-input v-model="form.confirm" type="password" show-password />
                        </el-form-item>
                    </template>
                    <el-form-item :label="t('IsActive')">
                        <el-checkbox v-model="form.isActive" />
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane :label="t('UserRoles')" name="roles">
                    <el-checkbox-group v-model="form.roleNames" class="permission-list">
                        <el-checkbox v-for="r in choices" :key="r.id" :value="r.normalizedName">
                            {{ r.name }}
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
