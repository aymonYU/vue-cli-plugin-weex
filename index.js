const webpack = require('webpack')
const Server = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin');
var rm = require('rimraf')
const path = require('path')
const ip = require('ip').address();
const {
  openBrowser
} = require('@vue/cli-shared-utils')
const BannerPlugin = require('vue-banner-plugin');

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

      let webpackConfig = api.resolveWebpackConfig()
      webpackConfig.entry = {'index': path.resolve(process.cwd(),'src/entry.js')};

      
      webpackConfig.devServer = {
          port: 9394,
          host: ip,
          contentBase: path.resolve(__dirname,'web'),
          compress: true,
          historyApiFallback: true,
          disableHostCheck: true
      }

      if(!isProduction){
        const compile = webpack(webpackConfig)
        const server = new Server(compile, webpackConfig.devServer);

        server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, (err) => {
            openBrowser(`http://${webpackConfig.devServer.host || 'localhost'}:${webpackConfig.devServer.port}`)
            if (!err) {
                console.log(`Project is running at http://${webpackConfig.devServer.host || 'localhost'}:${webpackConfig.devServer.port}`);
            } else {
                console.error(err);
            }
        });
      }else{
        await rm(path.resolve(process.cwd(),'dist'), err => {
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
        });

      }

    }

  )

  api.chainWebpack(async (configChain, options = {}) => {
    const isProduction = process.env.NODE_ENV === 'production'
    configChain.entry('app').clear();
    configChain.module.rules.delete('vue')
    configChain.module.rule('weex')
      .test(/\.vue(\?[^?]+)?$/)
      .use('weex-loader')
      .loader('weex-loader')

    configChain.resolve.modules.add(path.resolve(__dirname, 'node_modules'))

    configChain.resolveLoader.modules.add(path.resolve(__dirname, 'node_modules'))

    

    configChain.plugins.delete('html')
    configChain.plugins.delete('preload')
    configChain.plugins.delete("prefetch")
    configChain.plugins.delete('vue-loader')


    configChain.plugin('bannerPlugin')
    .use(BannerPlugin, [{
      banner: '// { "framework": "Vue"} \n',
      raw: true,
      exclude: 'Vue'
    }])

    if(!isProduction){
      configChain.plugin('html').use(HtmlWebpackPlugin,[{
          inject: true,
          title: '',
          filename: 'index.html',
          chunksSortMode: 'none',
          template: path.resolve(__dirname, './web/index.html')
      }])
    }else{
      //避免分包
      configChain.optimization.clear()
    }

  })
}