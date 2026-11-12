import { createApp } from 'vue';
import router from './router';
import elementPlus from './plugins/element-plus';
import { i18n } from './locales';
import 'admin-lte/dist/css/adminlte.min.css';
// Design tokens and vendor overrides; must come after the vendor stylesheets.
import './styles/theme.css';

import App from './app.vue';
import { pinia } from './store';

const app = createApp(App).use(pinia).use(i18n).use(router).use(elementPlus);
router.isReady().then(() => app.mount('#app'));
