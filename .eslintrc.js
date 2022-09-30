// .eslintrc.js
module.exports = {
  env: {
    node: true,
    'vue/setup-compiler-macros': true, // 新增的配置
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
  rules: {
    'vue/require-default-prop': 'off', // 关闭默认值
    '@typescript-eslint/no-explicit-any': 'off', // 关闭禁用any
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 0,
    'vue/comment-directive': 'off', // 只能在模板里写注释，不能在标签里写注释的检查 关闭
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
