// ESLint 配置文件遵循 commonJS 的导出规则，所导出的对象就是 ESLint 的配置对象
// 文档：https://eslint.bootcss.com/docs/user-guide/configuring
module.exports = {
  // 表示当前目录为根目录，ESLint规则被限制到该目录下
  root: true,
  // env表示启用ESLint检测的环境
  env: {
    // 在node环境下启动ESLint检测
    node: true,
    browser: true
  },
  // ESLint中基础配置需要继承的配置
  extends: ['@nuxtjs', 'plugin:nuxt/recommended', 'prettier'],
  // 解析器
  // parser: '@babel/eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    // 指定ES版本，默认为5，某些require引入js会报错，修改为8后正常
    ecmaVersion: 8,
    requireConfigFile: false
  },
  // 需要修改的启用规则及其各自的错误级别
  /**
   * 错误级别分为三种：
   * "off" 或 0 - 关闭规则
   * "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
   * "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
   */
  rules: {
    'space-before-function-paren': 'off',
    'nuxt/no-cjs-in-config': 'off',
    // webpack异步import时可以不在最顶层
    // 'import/first': 'off',
    // TODO 兼容老项目关闭部分规则，待修复
    // ===要改成==
    eqeqeq: 'off',
    'no-prototype-builtins': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    // 正则相关 减少非必要的转义字符（不太懂）
    'no-useless-escape': 'off',
    'vue/no-reserved-component-names': 'off',
    // 降级警告展示
    'no-console': 'warn',
    'no-async-promise-executor': 'warn',
    'no-lonely-if': 'warn',
    'object-shorthand': 'off',
    'vue/attribute-hyphenation': 'off',
    camelcase: 'warn',
    'no-new': 'off'
  },
  globals: {
    // 全局变量定义 writable 可修改 readonly 只读
    urlParams: 'writable',
    envParams: 'writable',
    $nuxt: 'readonly',
    traceRecord: 'readonly',
    weui: 'readonly',
    WeixinJSBridge: 'readonly',
    wx: 'readonly'
  }
}
