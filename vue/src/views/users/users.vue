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
        label: (row) => row.fullName || row.userName,
    });
const passwordDialog = ref<InstanceType<typeof ResetPasswordDialog>>();
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('Users') }}</h1>
            <el-button type="primary" @click="editorDialog?.open()">{{ t('Create') }}</el-button>
        </div>
        <div class="panel card">
            <div class="filters">
                <el-input v-model="keyword" :placeholder="t('SearchWithThreeDot')" clearable @keyup.enter="search" />
                <el-select v-model="active" :placeholder="t('IsActive')" clearable style="width: 140px">
                    <el-option :label="t('Yes')" :value="true" />
                    <el-option :label="t('No')" :value="false" />
                </el-select>
                <el-button type="primary" @click="search">{{ t('Search') }}</el-button>
                <el-button @click="clearFilters">{{ t('Clear') }}</el-button>
                <el-button @click="list">{{ t('Refresh') }}</el-button>
            </div>
            <el-table :data="rows" v-loading="busy" @sort-change="sorting">
                <el-table-column prop="userName" :label="t('UserName')" sortable="custom" />
                <el-table-column prop="name" :label="t('FullName')" sortable="custom">
                    <template #default="{ row }">{{ row.fullName }}</template>
                </el-table-column>
                <el-table-column prop="emailAddress" :label="t('EmailAddress')" sortable="custom" />
                <el-table-column :label="t('IsActive')">
                    <template #default="{ row }">
                        <el-tag :type="row.isActive ? 'success' : 'info'">
                            {{ row.isActive ? t('Yes') : t('No') }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="t('Actions')" width="220">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="editorDialog?.open(row.id)">
                            {{ t('Edit') }}
                        </el-button>
                        <el-button link type="primary" @click="passwordDialog?.open(row.id)">
                            {{ t('ResetPassword') }}
                        </el-button>
                        <el-button link type="danger" @click="remove(row)">{{ t('Delete') }}</el-button>
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
