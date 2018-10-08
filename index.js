const webpack = require('webpack')
const Server = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var rm = require('rimraf')
const path = require('path')
const ip = require('ip').address()
const {
  openBrowser
} = require('@vue/cli-shared-utils')
const BannerPlugin = require('vue-banner-plugin')

const defaults = {
  host: ip,
  port: 9394
}

module.exports = (api, options) => {
  const platform = process.argv[2]

  api.registerCommand(
    'weex',
    {
      description: 'use weex loader',
      usage: 'vue-cli-service weex [options] [entry]',
      options: {
        '--mode': `specify env mode (default: development)`,
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`
      }
    },
    async args => {
      if (args.mode === 'production') {
        process.env.NODE_ENV = 'production'
      }
      const isProduction = process.env.NODE_ENV === 'production'

      let webpackConfig = api.resolveWebpackConfig()

      const port = args.port || process.env.PORT || webpackConfig.devServer.port
      const host = args.host || process.env.HOST || webpackConfig.devServer.host

      webpackConfig.devServer = Object.assign(
        webpackConfig.devServer || {},
        options.devServer,
        {
          port,
          host
        }
      )
      // defaut entry
      const entry = webpackConfig.entry
      if (JSON.stringify(entry) === '{"app":[]}') {
        webpackConfig.entry = './src/entry/weex'
      }
      // 支持entry传入参数
      if (args._[0]) {
        webpackConfig.entry = args._[0]
      }

      if (!isProduction) {
        const compile = webpack(webpackConfig)
        const server = new Server(compile, webpackConfig.devServer)

        server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, (err) => {
          openBrowser(`http://${webpackConfig.devServer.host || 'localhost'}:${webpackConfig.devServer.port}`)
          if (!err) {
            console.log(`Project is running at http://${webpackConfig.devServer.host || 'localhost'}:${webpackConfig.devServer.port}`)
          } else {
            console.error(err)
          }
        })
      } else {
        await rm(path.resolve(process.cwd(), 'dist'), err => {
          if (err) throw err
        })
        webpack(webpackConfig, function (err, stats) {
          if (err) throw err
          process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\n\n')
        })
      }
    }

  )

  // run `vue-cli-service weex` can work here
  if (platform === 'weex'|| platform === 'inspect') {
    api.chainWebpack(async (configChain, options = {}) => {
      const isProduction = process.env.NODE_ENV === 'production'
      configChain.entry('app').clear()
      configChain.module.rules.delete('vue')

      configChain.module.rule('weex')
        .test(/\.vue$/)
        .use('weex-loader')
        .loader('weex-loader')

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

      configChain.plugins.delete('html')
      configChain.plugins.delete('preload')
      configChain.plugins.delete('prefetch')
      configChain.plugins.delete('vue-loader')

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
          host: ip,
          port: 9394,
          contentBase: path.resolve(__dirname, 'web'),
          compress: true,
          historyApiFallback: true,
          disableHostCheck: true
        }
      })

      if (!isProduction) {
        configChain.plugin('html').use(HtmlWebpackPlugin, [{
          inject: true,
          title: '',
          filename: 'index.html',
          chunksSortMode: 'none',
          template: path.resolve(__dirname, './web/index.html')
        }])

        
      } else {
        // 避免分包
        configChain.optimization.clear()
      }
    })
  }
}
