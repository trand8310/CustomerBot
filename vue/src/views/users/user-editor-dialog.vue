<script setup lang="ts">
import { t } from '../../api';
import { userApi } from '../../api/users';
import { useEditorDialog } from '../../composables/editor-dialog';

const emit = defineEmits<{ saved: [] }>();
const { visible, busy, formRef, form, choices, tab, edit, rules, open, save } = useEditorDialog(
    userApi,
    async (id) => {
        const form = id !== undefined ? await userApi.get(id) : { isActive: true, roleNames: [] };
        form.roleNames ||= [];
        return { form, options: (await userApi.getRoles()).items || [] };
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
        :title="edit ? t('EditUser', '编辑') : t('CreateNewUser', '新建')"
        width="600"
        destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @submit.prevent="save">
            <el-tabs v-model="tab">
                <el-tab-pane :label="t('Details', '基本信息')" name="details">
                    <el-form-item :label="t('Name', '名字')" prop="name">
                        <el-input v-model="form.name" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('Surname', '姓氏')" prop="surname">
                        <el-input v-model="form.surname" maxlength="64" />
                    </el-form-item>
                    <el-form-item :label="t('UserName', '用户名')" prop="userName">
                        <el-input v-model="form.userName" maxlength="256" />
                    </el-form-item>
                    <el-form-item :label="t('EmailAddress', '邮箱')" prop="emailAddress">
                        <el-input v-model="form.emailAddress" maxlength="256" />
                    </el-form-item>
                    <template v-if="!edit">
                        <el-form-item :label="t('Password', '密码')" prop="password">
                            <el-input v-model="form.password" type="password" show-password />
                        </el-form-item>
                        <el-form-item :label="t('ConfirmPassword', '确认密码')" prop="confirm">
                            <el-input v-model="form.confirm" type="password" show-password />
                        </el-form-item>
                    </template>
                    <el-form-item :label="t('IsActive', '启用')">
                        <el-checkbox v-model="form.isActive" />
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane :label="t('UserRoles', '角色')" name="roles">
                    <el-checkbox-group v-model="form.roleNames" class="permission-list">
                        <el-checkbox v-for="r in choices" :key="r.id" :value="r.normalizedName">
                            {{ r.name }}
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
