<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { permitted, tOr } from '../../api';
import type { NavigationItem } from '../../api/navigation';

const { item } = defineProps<{ item: NavigationItem }>();
const router = useRouter();
const title = computed(() => tOr(item.titleKey, item.title));

function isVisible(entry: NavigationItem): boolean {
    if (entry.type === 'group') return entry.children.some(isVisible);
    if (entry.type === 'external') return true;
    const route = router.resolve({ name: entry.page });
    return entry.menu !== false && (!route.meta.permission || permitted(route.meta.permission));
}
</script>

<template>
    <template v-if="isVisible(item)">
        <el-sub-menu v-if="item.type === 'group'" :index="'group:' + item.id">
            <template #title>
                <i v-if="item.icon" :class="['fa-solid', item.icon, 'menu-icon']" aria-hidden="true"></i>
                {{ title }}
            </template>
            <navigation-menu-item
                v-for="child in item.children"
                :key="child.type === 'group' ? child.id : child.type === 'page' ? child.page : child.url"
                :item="child" />
        </el-sub-menu>
        <el-menu-item
            v-else-if="item.type === 'page'"
            :index="router.resolve({ name: item.page }).path"
            :route="{ name: item.page }">
            <i v-if="item.icon" :class="['fa-solid', item.icon, 'menu-icon']" aria-hidden="true"></i>
            {{ title }}
        </el-menu-item>
        <li v-else role="none">
            <a class="el-menu-item" role="menuitem" :href="item.url" target="_blank" rel="noopener noreferrer">
                <i v-if="item.icon" :class="['fa-solid', item.icon, 'menu-icon']" aria-hidden="true"></i>
                {{ title }}
            </a>
        </li>
    </template>
</template>
