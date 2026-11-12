import { ref, onMounted, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '../api';
import type { CrudApi, CrudEntity } from '../api/crud';
import type { EntityDto } from '../api/types';

export interface ManagementOptions<TDto> {
    kind: CrudEntity;
    api: CrudApi<TDto, never>;
    /** Localization key for the delete confirmation; `{0}` receives the row's name. */
    warningKey: string;
    /** Name shown in the delete confirmation. */
    label: (row: TDto) => string;
}

/** Payload of Element Plus' table `sort-change` event (order is 'ascending', 'descending' or null). */
export interface SortChange {
    prop: string;
    order: string | null;
}

export function useManagement<TDto extends EntityDto>(options: ManagementOptions<TDto>) {
    const route = useRoute(),
        busy = ref(false),
        rows = ref([]) as Ref<TDto[]>,
        total = ref(0),
        pageNum = ref(1),
        pageSize = ref(10),
        keyword = ref(String(route.query[options.kind === 'User' ? 'filterText' : 'keyword'] || '')),
        active = ref<boolean | ''>(''),
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
            rows.value = r.items ?? [];
            total.value = r.totalCount ?? 0;
        } finally {
            busy.value = false;
        }
    }
    function search() {
        pageNum.value = 1;
        return list();
    }
    function sorting({ prop, order }: SortChange) {
        sort.value = order ? `${prop} ${order === 'ascending' ? 'ASC' : 'DESC'}` : '';
        return search();
    }
    function clearFilters() {
        keyword.value = '';
        active.value = '';
        return search();
    }
    async function remove(row: TDto) {
        try {
            await ElMessageBox.confirm(t(options.warningKey, options.label(row)), t('Delete'), { type: 'warning' });
            await options.api.delete(row.id);
            ElMessage.success(t('SuccessfullyDeleted'));
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
