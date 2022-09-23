// src/request/type.ts

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface LJRequestInterceptors<T = AxiosResponse> {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorCatch?: (error: any) => any;
  responseInterceptor?: (res: T) => T;
  responseInterceptorCatch?: (error: any) => any;
}

export interface LJRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  showLoading?: boolean;
  interceptors?: LJRequestInterceptors<T>;
}
