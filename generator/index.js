module.exports = (api, options) => {
  const pkg = {
    scripts: {
      "weex:dev": "npm run serve & npm run weex ",
      'weex:build': "cross-env PLATFORM=weex vue-cli-service build",
      'weex': "cross-env PLATFORM=weex vue-cli-service serve --open",
      "webWeex:build": "npm run build & npm run weex:build "
    },
    "postcss": {
      "plugins": {
        "postcss-plugin-weex":{}
      }
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
