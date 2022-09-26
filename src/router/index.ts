import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/home/Index.vue';
import File from '../views/file/Index.vue';
import TextShare from '../views/textShare/Index.vue';
const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '共享',
    },
  },
  {
    path: '/file',
    name: 'File',
    component: File,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '文件',
    },
  },
  {
    path: '/textShare',
    name: 'TextShare',
    component: TextShare,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '文本',
    },
  },
];
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});
