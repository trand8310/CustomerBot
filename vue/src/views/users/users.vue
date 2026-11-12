<script setup lang="ts">
import { ref } from 'vue';
import { userApi } from '../../api/users';
import { useManagement } from '../../composables/management';
import UserEditorDialog from './user-editor-dialog.vue';
import ResetPasswordDialog from './reset-password-dialog.vue';

const editorDialog = ref<InstanceType<typeof UserEditorDialog>>();
const { busy, rows, total, pageNum, pageSize, keyword, active, list, search, sorting, clearFilters, remove, t } =
    useManagement({
        kind: 'User',
        api: userApi,
        warningKey: 'UserDeleteWarningMessage',
    });
const passwordDialog = ref<InstanceType<typeof ResetPasswordDialog>>();
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('Users', '用户') }}</h1>
            <el-button type="primary" @click="editorDialog?.open()">{{ t('Create', '新建') }}</el-button>
        </div>
        <div class="panel card">
            <div class="filters">
                <el-input
                    v-model="keyword"
                    :placeholder="t('SearchWithThreeDot', '搜索')"
                    clearable
                    @keyup.enter="search" />
                <el-select v-model="active" :placeholder="t('IsActive', '状态')" clearable style="width: 140px">
                    <el-option :label="t('Yes', '是')" :value="true" />
                    <el-option :label="t('No', '否')" :value="false" />
                </el-select>
                <el-button type="primary" @click="search">{{ t('Search', '搜索') }}</el-button>
                <el-button @click="clearFilters">{{ t('Clear', '清除') }}</el-button>
                <el-button @click="list">{{ t('Refresh', '刷新') }}</el-button>
            </div>
            <el-table :data="rows" v-loading="busy" @sort-change="sorting">
                <el-table-column prop="userName" :label="t('UserName', '用户名')" sortable="custom" />
                <el-table-column prop="name" :label="t('FullName', '姓名')" sortable="custom">
                    <template #default="{ row }">{{ row.fullName }}</template>
                </el-table-column>
                <el-table-column prop="emailAddress" :label="t('EmailAddress', '邮箱')" sortable="custom" />
                <el-table-column :label="t('IsActive', '状态')">
                    <template #default="{ row }">
                        <el-tag :type="row.isActive ? 'success' : 'info'">
                            {{ row.isActive ? t('Yes', '是') : t('No', '否') }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="t('Actions', '操作')" width="220">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="editorDialog?.open(row.id)">
                            {{ t('Edit', '编辑') }}
                        </el-button>
                        <el-button link type="primary" @click="passwordDialog?.open(row.id)">
                            {{ t('ResetPassword', '重置密码') }}
                        </el-button>
                        <el-button link type="danger" @click="remove(row)">{{ t('Delete', '删除') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pager">
                <el-pagination
                    v-model:current-page="pageNum"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next"
                    @current-change="list"
                    @size-change="search" />
            </div>
        </div>
        <UserEditorDialog ref="editorDialog" @saved="list" />
        <ResetPasswordDialog ref="passwordDialog" />
    </div>
</template>
<style>
.filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}
.filters .el-input {
    max-width: 300px;
}
.pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
</style>
