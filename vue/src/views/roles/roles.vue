<script setup lang="ts">
import { ref } from 'vue';
import { roleApi } from '../../api/roles';
import { useManagement } from '../../composables/management';
import RoleEditorDialog from './role-editor-dialog.vue';

const editorDialog = ref<InstanceType<typeof RoleEditorDialog>>();
const { busy, rows, total, pageNum, pageSize, keyword, list, search, sorting, clearFilters, remove, t } = useManagement(
    {
        kind: 'Role',
        api: roleApi,
        warningKey: 'RoleDeleteWarningMessage',
    }
);
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('Roles', '角色') }}</h1>
            <el-button type="primary" @click="editorDialog?.open()">{{ t('Create', '新建') }}</el-button>
        </div>
        <div class="panel card">
            <div class="filters">
                <el-input
                    v-model="keyword"
                    :placeholder="t('SearchWithThreeDot', '搜索')"
                    clearable
                    @keyup.enter="search" />
                <el-button type="primary" @click="search">{{ t('Search', '搜索') }}</el-button>
                <el-button @click="clearFilters">{{ t('Clear', '清除') }}</el-button>
                <el-button @click="list">{{ t('Refresh', '刷新') }}</el-button>
            </div>
            <el-table :data="rows" v-loading="busy" @sort-change="sorting">
                <el-table-column prop="name" :label="t('RoleName', '角色名称')" sortable="custom" />
                <el-table-column prop="displayName" :label="t('DisplayName', '显示名称')" sortable="custom" />
                <el-table-column prop="description" :label="t('RoleDescription', '描述')" />
                <el-table-column :label="t('Actions', '操作')" width="220">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="editorDialog?.open(row.id)">
                            {{ t('Edit', '编辑') }}
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
        <RoleEditorDialog ref="editorDialog" @saved="list" />
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
