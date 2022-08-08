module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  env: {
    "vue/setup-compiler-macros": true,
    browser: true, // 指定全局变量
    node: true,
  },
  parserOptions: { ecmaVersion: 12 },
  rules: {
    "@typescript-eslint/no-explicit-any": ["off"], // ts 定义数据类型为any不报错
    "@typescript-eslint/ban-types": [
      // 解决空对象报错
      "error",
      {
        extendDefaults: true,
        types: {
          "{}": false,
        },
      },
    ],
    "no-empty": "off", // catch finally语句块报错
    "no-empty-function": "off", // 关闭空函数报错
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-var-requires": "off", // require报错
    "@typescript-eslint/ban-ts-comment": "off", // 禁用@ts-ignore等指令的报错
    "vue/multi-word-component-names": ["off"], // 禁用组件名字非多单词报错
  },
  // 由于@vue/eslint-config-typescript/recommended只禁用了ts/tsx文件的no-undef错误，vue文件需要自己添加
  // issue: https://github.com/vuejs/eslint-config-typescript/issues/14
  overrides: [
    {
      files: ["*.vue"],
      rules: require("@typescript-eslint/eslint-plugin").configs[
        "eslint-recommended"
      ].overrides[0].rules,
    },
  ],
};
