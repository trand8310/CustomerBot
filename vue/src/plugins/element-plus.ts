/**
 * Registers only the Element Plus components this app uses, with their per-component styles,
 * instead of installing the whole library and its full stylesheet.
 * When a template starts using a new <el-*> component, add it to both lists below.
 */
import type { App, Plugin } from 'vue';
import {
    ElButton,
    ElCheckbox,
    ElCheckboxGroup,
    ElConfigProvider,
    ElDialog,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElForm,
    ElFormItem,
    ElIcon,
    ElInput,
    ElLoading,
    ElMenu,
    ElMenuItem,
    ElOption,
    ElPagination,
    ElSelect,
    ElSubMenu,
    ElTable,
    ElTableColumn,
    ElTabPane,
    ElTabs,
    ElTag,
} from 'element-plus';

import 'element-plus/es/components/base/style/css';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/checkbox-group/style/css';
import 'element-plus/es/components/config-provider/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/dropdown/style/css';
import 'element-plus/es/components/dropdown-item/style/css';
import 'element-plus/es/components/dropdown-menu/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/menu/style/css';
import 'element-plus/es/components/menu-item/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/sub-menu/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-column/style/css';
import 'element-plus/es/components/tab-pane/style/css';
import 'element-plus/es/components/tabs/style/css';
import 'element-plus/es/components/tag/style/css';
// Services called from code (ElMessage, ElMessageBox, ElNotification).
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/notification/style/css';

const components: Plugin[] = [
    ElButton,
    ElCheckbox,
    ElCheckboxGroup,
    ElConfigProvider,
    ElDialog,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElForm,
    ElFormItem,
    ElIcon,
    ElInput,
    ElMenu,
    ElMenuItem,
    ElOption,
    ElPagination,
    ElSelect,
    ElSubMenu,
    ElTable,
    ElTableColumn,
    ElTabPane,
    ElTabs,
    ElTag,
];

export default {
    install(app: App) {
        for (const component of components) app.use(component);
        // Provides the v-loading directive.
        app.use(ElLoading);
    },
};
