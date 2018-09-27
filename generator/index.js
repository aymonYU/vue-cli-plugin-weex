module.exports = (api, options) => {
  const pkg = {
    scripts: {
      'mpvue:dev': "vue-cli-service mpvue './src/mpvue.js'",
      'mpvue:build': "vue-cli-service mpvue './src/mpvue.js'  --mode 'production'"
    },
    dependencies: {
      'mpvue': '^1.0.13'
    },
    devDependencies: {
      'vue-cli-plugin-mpvue': '^1.0.12'
    }
  }
  api.extendPackage(pkg)
  api.render('./template')
}
