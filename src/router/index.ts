import { createRouter, createWebHashHistory } from 'vue-router';
import Latest from '../views/latest/Index.vue';
import Home from '../views/home/Index.vue';
import Upload from '../views/upload/Index.vue';
const routes = [
  { path: '/', redirect: '/latest' },
  {
    path: '/latest',
    name: 'Latest',
    component: Latest,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '最近',
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '文件',
    },
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload,
    meta: {
      keepAlive: true, //设置页面是否需要使用缓存
      tabbar: true,
      name: '上传',
    },
  },
];
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});
