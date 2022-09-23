// src/request/index.ts

import LJRequest from './request';
import { BASE_URL, TIME_OUT } from './base';
const ljRequest = new LJRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  interceptors: {
    requestInterceptor: (config) => {
      let _config = {
        ...config
      };
      _config.headers = {
        ...config.headers,
        token: sessionStorage.getItem('token') as any,
        app: 'visionary'
      };
      console.log('请求成功拦截');
      return _config;
    },

    requestInterceptorCatch: (err) => {
      console.log('请求失败拦截');
      return err;
    },
    responseInterceptor: (config) => {
      console.log('响应成功拦截');
      return config;
    },
    responseInterceptorCatch: (err) => {
      console.log('响应失败拦截');
      return err;
    }
  }
});

export default ljRequest;
