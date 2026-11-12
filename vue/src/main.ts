import { createApp } from 'vue';
import router from './router';
import ElementPlus from 'element-plus';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import 'element-plus/dist/index.css';

import App from './app.vue';
import { pinia } from './store';
import { i18n } from './locales';
const app = createApp(App).use(pinia).use(i18n).use(router).use(ElementPlus);
router.isReady().then(() => app.mount('#app'));
