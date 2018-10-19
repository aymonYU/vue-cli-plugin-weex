const path = require('path')
const BannerPlugin = require('vue-banner-plugin')

module.exports = (api, options) => {
  const platform = process.env.PLATFORM


  // run `vue-cli-service weex` can work here

  api.chainWebpack(async (configChain, options = {}) => {
    const isProduction = process.env.NODE_ENV === 'production'

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
    if (platform === 'weex') {

      configChain.module.rules.delete('vue')

      configChain.module.rule('weex')
        .test(/\.vue$/)
        .use('weex-loader')
        .loader('weex-loader')

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
      configChain.merge({
        devServer: {
          port: 8089,
        }
      })
      configChain.externals({
        'weex-vue-render': 'weex'
      })
      configChain.module.rules.delete('vue')

      configChain.module.rule('vue')
        .test(/\.vue$/)
        .use('vue-loader')
        .loader('vue-loader')
        .options({
          loaders: {
            less: generateLoaders('less'),
            // sass: generateLoaders('sass'),
            // scss: generateLoaders('sass'),
            // stylus: generateLoaders('stylus'),
            // styl: generateLoaders('stylus')
          },
          optimizeSSR: false,
          postcss: [
            // to convert weex exclusive styles.
            require('postcss-plugin-weex')(),
            require('autoprefixer')({
              browsers: ['> 0.1%', 'ios >= 8', 'not ie < 12']
            }),
            require('postcss-plugin-px2rem')({
              // base on 750px standard.
              rootValue: 75,
              // to leave 1px alone.
              minPixelValue: 1.01
            })
          ],
          compilerModules: [{
            postTransformNode: el => {
              // to convert vnode for weex components.
              require('weex-vue-precompiler')()(el)
            }
          }]


        })
    }
  })

}

function generateLoaders(loader) {
  const sourceMap = true
  let loaders = [{
    loader: 'css-loader',
    options: {
      sourceMap
    }
  }, {
    loader: 'postcss-loader',
    options: {
      sourceMap
    }
  }]
  if (loader) {
    loaders.push({
      loader: loader + '-loader',
      options: {
        sourceMap
      }
    })
  }

  return ['vue-style-loader'].concat(loaders)

}