import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { join, resolve } from 'path';
import eslintPlugin from 'vite-plugin-eslint';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createSvg } from './src/icons/index';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/oss/',
  plugins: [vue(), eslintPlugin(), vueJsx(), createSvg('./src/icons/svg/')],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      '~': join(__dirname, 'node_modules'),
    },
  },
  server: {
    hmr: true,
    proxy: {
      '/ossApi': {
        ws: false,
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/visionary/, ''),
      },
      '/upload': {
        ws: false,
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
    },
  },
});
