import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import './style.css';
import App from './App.vue';
import router from './router';
import { migratePersistedLocalData } from './utils/appDataMigration';

migratePersistedLocalData();

const pinia = createPinia();
pinia.use(createPersistedState());

createApp(App).use(pinia).use(router).mount('#app');
