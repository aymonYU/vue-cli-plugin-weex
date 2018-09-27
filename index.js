const webpack = require('webpack')
const config = require('./config')
const merge = require('webpack-merge')
var rm = require('rimraf')

module.exports = (api, options) => {
  // if (options.pluginOptions.platform === 'mpvue')
  api.registerCommand(
    'mpvue',
    {
      description: 'use mpvue loader',
      usage: 'vue-cli-service mpvue [options] [entry]',
      options: {
        '--mode': `specify env mode (default: development)`
      }
    },
    async args => {
      if (args.mode === 'production') {
        process.env.NODE_ENV = 'production'
      }
      const isProduction = process.env.NODE_ENV === 'production'
      let { entry } = api.resolveWebpackConfig()
      const { resolve: { alias }} = api.resolveWebpackConfig()

      // 支持entry传入参数
      if (args._[0]) {
        entry = args._[0]
      }

      // 倒入想要传入的参数
      entry = assetEntry(entry)
      const options = {
        entry
      }
      console.log(`using the entry file of ${entry}`)

      let webpackConfig = {}

      if (isProduction) {
        await rm(config.build.assetsRoot, err => {
          if (err) throw err
        })
        webpackConfig = require('./build/webpack.prod.conf.js')(options)
      } else {
        webpackConfig = require('./build/webpack.dev.conf.js')(options)
      }

      // 合并从配置中读取的配置结果
      webpackConfig = merge(webpackConfig, { resolve: {
        alias
      }})

      const compile = webpack(webpackConfig, function (err, stats) {
        if (err) throw err
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n')
      })
      if (!isProduction) {
        require('./build/server')(compile, webpackConfig)
      }
    }

  )

  // api.chainWebpack(async (configChain, options = {}) => {

  // })
}
// mpvue entry 参数传入校验
function assetEntry (entry) {
  if (Array.isArray(entry)) {
    if (entry.length > 1) {
      console.error('the entry of mpvue do not surport multiple entries ')
      process.exit(1)
    }
    return entry[0]
  } else if (typeof entry === 'object') {
    if (Object.keys(entry).length > 1) {
      console.error('the entry of mpvue do not surport multiple entries ')
      process.exit(1)
    }
    const entryFirstKeyValue = entry[Object.keys(entry)[0]]
    if (typeof entryFirstKeyValue === 'string') {
      return entryFirstKeyValue
    } else {
      return assetEntry(entryFirstKeyValue)
    }
  } else if (typeof entry === 'string') {
    return entry
  } else {
    return './src/main.js'
  }
}
