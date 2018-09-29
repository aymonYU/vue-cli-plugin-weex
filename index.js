const webpack = require('webpack')
const merge = require('webpack-merge')
const Server = require('webpack-dev-server')
var rm = require('rimraf')
const path = require('path')

module.exports = (api, options) => {
  // if (options.pluginOptions.platform === 'weex')
  api.registerCommand(
    'weex',
    {
      description: 'use weex loader',
      usage: 'vue-cli-service weex [options] [entry]',
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
        
        webpackConfig = require('./configs/webpack.prod.conf.js')(options)
      } else {
        webpackConfig = require('./configs/webpack.dev.conf.js')(options)
      }

      // 合并从配置中读取的配置结果
      // webpackConfig = merge(webpackConfig, { resolve: {
      //   alias
      // }})

      
      if(!isProduction){
        // build source to weex_bundle with watch mode.
        webpack(webpackConfig[0], (err, stats) => {
          if (err) {
            console.err('COMPILE ERROR:', err.stack)
          }
        })
        let webConfig = webpackConfig[1]

        const compile = webpack(webConfig)
        const server = new Server(compile, webConfig.devServer);

        server.listen(webConfig.devServer.port, webConfig.devServer.host, (err) => {
            if (!err) {
                console.log(`Project is running at http://${webConfig.devServer.host || 'localhost'}:${webConfig.devServer.port}/web/preview.html?page=index.js`);
            } else {
                console.error(err);
            }
        });
      }else{
        await rm(path.resolve(process.cwd(),'dist'), err => {
          if (err) throw err
        })
        webpack(webpackConfig[0], function (err, stats) {
          if (err) throw err
          process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\n\n')
        });
        webpack(webpackConfig[1], function (err, stats) {
          if (err) throw err
          process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\n\n')
        });

      }

    }

  )

  // api.chainWebpack(async (configChain, options = {}) => {

  // })
}
// weex entry 参数传入校验
function assetEntry (entry) {
  if (Array.isArray(entry)) {
    if (entry.length > 1) {
      console.error('the entry of weex do not surport multiple entries ')
      process.exit(1)
    }
    return entry[0]
  } else if (typeof entry === 'object') {
    if (Object.keys(entry).length > 1) {
      console.error('the entry of weex do not surport multiple entries ')
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
