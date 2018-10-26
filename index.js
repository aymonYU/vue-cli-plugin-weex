const path = require('path')
const BannerPlugin = require('vue-banner-plugin')

module.exports = (api, options) => {
  const platform = process.env.PLATFORM || 'web'
  const isProduction = process.env.NODE_ENV === 'production'
  const isWeex = platform === 'weex'
  api.chainWebpack(async (configChain, options = {}) => {
    const currentWebpackConfig = configChain.toConfig();
    const entryKeys = Object.keys(currentWebpackConfig.entry);//入口的key
    const htmlPluginKeys = entryKeys.map(item=>`html-${item}`);//每个入口对应的htmlPlugin的插件名
    

    htmlPluginKeys.map((pluginKey, index) => {
        configChain.plugin(pluginKey).tap(args => {
            if(Array.isArray(args) && args.length>0){
                //判断是否有title
                if(!args[0].title){
                    //如果没有就帮忙设置title为入口名
                    if(isWeex){
                        args[0].title = `weex ${entryKeys[index]}`
                    }else{
                        args[0].title = entryKeys[index]
                    }
                }
                if(isWeex){
                    //weex强制设置
                    args[0].template = path.resolve(__dirname,'./web/preview.html')
                }
                //判断是否有template
                if(!args[0].template){
                    //web没有的话，设置默认值
                    if(!isWeex){
                        args[0].template =  path.resolve(__dirname,'./web/index.html')
                    }
                }
            }
            return args;
        })
    })
    // it work when pacage.json have typscript plugin
    if (api.hasPlugin('typescript')) {
      configChain.module.rules.delete('ts')
      configChain.module.rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options({
          appendTsSuffixTo: [/\.vue$/]
        })
    }

    configChain
      .plugin('define-platform')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env': {
          PLATFORM: JSON.stringify(platform)
        }
      }])

    configChain.resolve.alias.set('@platform', `./${platform}`)

    //platform for weex env
    if (isWeex) {
      configChain.module.rules.delete('vue')
      configChain.module.rule('weex')
        .test(/\.vue$/)
        .use('weex-loader')
        .loader('weex-loader')
        .options({
          loaders: {
            less: generateLoaders('less'),
            sass: generateLoaders('sass'),
            scss: generateLoaders('scss'),
            stylus: generateLoaders('stylus'),
            styl: generateLoaders('styl'),
          },
          cssSourceMap: false,
          cacheBusting: true
        })

      configChain.plugins.delete('vue-loader')
      configChain.plugins.delete('hmr')

      configChain.module.rule('no-hot-dev-server')
        .test(/hot(\/|\\)dev-server/)
        .use('null-loader')
        .loader('null-loader')

      configChain.module.rule('no-dev-server')
        .test(/webpack-dev-server(\/|\\)client/)
        .use('null-loader')
        .loader('null-loader')

      configChain.externals({
        'vue': 'Vue'
      })
      configChain.plugin('bannerPlugin')
        .use(BannerPlugin, [{
          banner: '// { "framework": "Vue"} \n',
          raw: true,
          exclude: 'Vue'
        }])
      configChain.merge({
        devServer: {
          port: 9394,
          contentBase: path.resolve(__dirname, 'web'),
        }
      })
      if (isProduction) {
        // 避免分包
        configChain.optimization.clear()
      }
    } else {
      configChain.externals({	
        'weex-vue-render': 'weex'
      })
      configChain.merge({
        devServer: {
          port: 8089,
        }
      })
      configChain.module.rules.delete('vue')
      configChain.module.rule('vue')
        .test(/\.vue$/)
        .use('vue-loader')
        .loader('vue-loader')
        .options({
          compilerOptions: {
            modules: [{
              postTransformNode: el => {
                // to convert vnode for weex components.
                require('weex-vue-precompiler')()(el)
              }
            }]
          }
        })
    }
  })
}

function generateLoaders(loader) {
  return [{
    loader: loader + '-loader',
    options: {
      sourceMap: false
    }
  }]
}