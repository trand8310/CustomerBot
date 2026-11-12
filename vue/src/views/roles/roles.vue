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
        label: (row) => row.displayName || row.name,
    }
);
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('Roles') }}</h1>
            <el-button type="primary" @click="editorDialog?.open()">{{ t('Create') }}</el-button>
        </div>
        <div class="panel card">
            <div class="filters">
                <el-input v-model="keyword" :placeholder="t('SearchWithThreeDot')" clearable @keyup.enter="search" />
                <el-button type="primary" @click="search">{{ t('Search') }}</el-button>
                <el-button @click="clearFilters">{{ t('Clear') }}</el-button>
                <el-button @click="list">{{ t('Refresh') }}</el-button>
            </div>
            <el-table :data="rows" v-loading="busy" @sort-change="sorting">
                <el-table-column prop="name" :label="t('RoleName')" sortable="custom" />
                <el-table-column prop="displayName" :label="t('DisplayName')" sortable="custom" />
                <el-table-column prop="description" :label="t('RoleDescription')" />
                <el-table-column :label="t('Actions')" width="220">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="editorDialog?.open(row.id)">
                            {{ t('Edit') }}
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
        <RoleEditorDialog ref="editorDialog" @saved="list" />
    </div>
</template>
