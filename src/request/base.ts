// src/request/base.ts

let BASE_URL = '';
const TIME_OUT = 10000;
// if (process.env.NODE_ENV === 'dev') {
//   BASE_URL = '开发环境IP';
// } else if (process.env.NODE_ENV === 'prod') {
//   BASE_URL = '生产环境IP';
// } else {
//   BASE_URL = '其它环境IP';
// }
export { BASE_URL, TIME_OUT };
