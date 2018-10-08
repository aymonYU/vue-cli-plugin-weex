module.exports = (api, options) => {
  const pkg = {
    scripts: {
      'weex:dev': "vue-cli-service weex ",
      'weex:build': "vue-cli-service weex  --mode 'production'"
    },
    dependencies: {
      "vue-router": "^3.0.1"
    }
  }
  api.extendPackage(pkg)
  if(api.hasPlugin('typescript')){
    //ts template
    api.render('./ts-template')

  }else{
    //js template
    api.render('./template')

  }
  
}
