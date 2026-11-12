import { createApp } from 'vue';
import router from './router';
import elementPlus from './plugins/element-plus';
// Only the solid icon set is used; this skips the brands, regular and v4 fonts.
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
// Design tokens and vendor overrides; must come after the vendor stylesheets.
import './styles/theme.css';

import App from './app.vue';
import { pinia } from './store';

const app = createApp(App).use(pinia).use(router).use(elementPlus);
router.isReady().then(() => app.mount('#app'));
