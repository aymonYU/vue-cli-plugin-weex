## 功能
 weex plugin for vue-cli

## 使用
```
npm i -g @vue/cli
```
```js
vue add vue-cli-plugin-weex
```
```js
npm run weex:dev
```

## 特性
1. 支持在vue.config.js 中创建 entry 入口，以及alias 别名
2. 支持命令行中传入入口,例如：
```
script:{
    "weex:dev": "vue-cli-service weex './src/entry/weex.js'",
    "weex:build": "vue-cli-service weex './src/entry/weex.js' --mode 'production'"
}
```

