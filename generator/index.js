module.exports = (api, options) => {
  const pkg = {
    scripts: {
      'weex': "cross-env PLATFORM=weex vue-cli-service serve --open",
      'weex:build': "cross-env PLATFORM=weex vue-cli-service build",
      "start": "npm run serve & npm run weex ",
      "build:all": "npm run build & npm run weex:build ",
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
