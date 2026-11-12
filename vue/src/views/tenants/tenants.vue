<script setup lang="ts">
import { ref } from 'vue';
import { tenantApi } from '../../api/tenants';
import { useManagement } from '../../composables/management';
import TenantEditorDialog from './tenant-editor-dialog.vue';

const editorDialog = ref<InstanceType<typeof TenantEditorDialog>>();
const { busy, rows, total, pageNum, pageSize, keyword, active, list, search, sorting, clearFilters, remove, t } =
    useManagement({
        kind: 'Tenant',
        api: tenantApi,
        warningKey: 'TenantDeleteWarningMessage',
        label: (row) => row.name || row.tenancyName,
    });
</script>
<template>
    <div>
        <div class="heading">
            <h1>{{ t('Tenants') }}</h1>
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
                <el-table-column prop="tenancyName" :label="t('TenancyName')" sortable="custom" />
                <el-table-column prop="name" :label="t('Name')" sortable="custom" />
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
        <TenantEditorDialog ref="editorDialog" @saved="list" />
    </div>
</template>
