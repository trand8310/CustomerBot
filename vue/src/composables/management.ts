import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '../api';
import type { crudApi } from '../api/crud';
export interface ManagementOptions {
    kind: 'User' | 'Role' | 'Tenant';
    api: ReturnType<typeof crudApi>;
    warningKey: string;
}
export function useManagement(options: ManagementOptions) {
    const route = useRoute(),
        busy = ref(false),
        rows = ref<any[]>([]),
        total = ref(0),
        pageNum = ref(1),
        pageSize = ref(10),
        keyword = ref(String(route.query[options.kind === 'User' ? 'filterText' : 'keyword'] || '')),
        active = ref<boolean | string>(''),
        sort = ref('');
    async function list() {
        busy.value = true;
        try {
            const r = await options.api.getAll({
                Keyword: keyword.value,
                IsActive: active.value,
                Sorting: sort.value,
                SkipCount: (pageNum.value - 1) * pageSize.value,
                MaxResultCount: pageSize.value,
            });
            rows.value = r.items || [];
            total.value = r.totalCount || 0;
        } finally {
            busy.value = false;
        }
    }
    function search() {
        pageNum.value = 1;
        return list();
    }
    function sorting({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) {
        sort.value = order ? `${prop} ${order === 'ascending' ? 'ASC' : 'DESC'}` : '';
        return search();
    }
    function clearFilters() {
        keyword.value = '';
        active.value = '';
        return search();
    }
    async function remove(row: any) {
        try {
            await ElMessageBox.confirm(
                t(options.warningKey, '确定删除 {0} 吗？', row.fullName || row.displayName || row.name || row.userName),
                t('Delete', '删除'),
                { type: 'warning' }
            );
            await options.api.delete(row.id);
            ElMessage.success(t('SuccessfullyDeleted', '删除成功'));
            await list();
        } catch (e) {
            if (e !== 'cancel' && e !== 'close') throw e;
        }
    }
    onMounted(list);
    return {
        busy,
        rows,
        total,
        pageNum,
        pageSize,
        keyword,
        active,
        list,
        search,
        sorting,
        clearFilters,
        remove,
        t,
    };
}
