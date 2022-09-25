import { createApp } from 'vue';
import App from './App';
import { router } from './router';
import { createPinia } from 'pinia';
import { Toast } from './libs/Toast';
const userName = localStorage.getItem('userName') ?? 'visionary';
localStorage.setItem('userName', userName);
createApp(App).use(router).use(createPinia()).provide('Toast', Toast).mount('#app');
