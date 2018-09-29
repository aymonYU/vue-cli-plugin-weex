module.exports = (api, options) => {
  const pkg = {
    scripts: {
      'weex:dev': "vue-cli-service weex './src/weex.js'",
      'weex:build': "vue-cli-service weex './src/weex.js'  --mode 'production'"
    },
    dependencies: {
      'weex': '^1.0.13',
      "vue-router": "^3.0.1",
    },
    devDependencies: {
      'vue-cli-plugin-weex': '^1.0.6'
    }
  }
  api.extendPackage(pkg)
  api.render('./template')
}
