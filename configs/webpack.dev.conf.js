const commonConfig = require('./webpack.common.conf');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
// tools
const chalk = require('chalk');
const path = require('path');
const webpack = require('webpack');
const ip = require('ip').address();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin');


const config = require('./config');
const utils = require('./utils');
const helper = require('./helper');

const postMessageToOpenPage =  (entry) => {
  let entrys = Object.keys(entry);
  let openpage = config.dev.openPage;
  // exclude vendor entry.
  entrys = entrys.filter(entry => entry !== 'vendor' );
  if(entrys.indexOf('index') > -1) {
    openpage += `?page=index.js`;
  }
  else {
    openpage += `?page=${entrys[0]}.js`;
  }
  if(entrys.length > 1) {
    openpage += `&entrys=${entrys.join('|')}`
  }
  return openpage;
}

const openPage = postMessageToOpenPage(commonConfig[0].entry);

const generateHtmlWebpackPlugin = (entry) => {
  let entrys = Object.keys(entry);
  // exclude vendor entry.
  entrys = entrys.filter(entry => entry !== 'vendor' );
  const htmlPlugin = entrys.map(name => {
    return new HtmlWebpackPlugin({
      filename: name + '.html',
      template: helper.rootDirNode(`web/index.html`),
      isDevServer: true,
      chunksSortMode: 'dependency',
      inject: true,
      devScripts: config.dev.htmlOptions.devScripts,
      chunks: ['vendor', name]
    })
  })
  return htmlPlugin;
}

const devWebpackConfig = webpackMerge(commonConfig[0], {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devtool: config.dev.devtool,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': config.dev.env
      }
    }),
    ...generateHtmlWebpackPlugin(commonConfig[0].entry),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),
    new OpenBrowserPlugin({
        delay: 1000,   //设置一个 1s 延迟，避免过早打开浏览器请求资源会卡住编译过程
        url: `http://${config.dev.host}:${config.dev.port}/${openPage}`
    }),
    new FriendlyErrorsPlugin({
      onErrors: config.dev.notifyOnErrors
      ? utils.createNotifierCallback()
      : undefined
    })
  ],
  devServer: {
    clientLogLevel: 'warning',
    compress: true,
    contentBase: config.dev.contentBase,
    host: config.dev.host,
    port: config.dev.port,
    historyApiFallback: config.dev.historyApiFallback,
    public: `${ip}:${config.dev.port}`,
    open:config.dev.open,
    watchContentBase: config.dev.watchContentBase,
    overlay: config.dev.errorOverlay
    ? { warnings: false, errors: true }
    : false,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    openPage: encodeURI(openPage),
    watchOptions: config.dev.watchOptions
  }
});

/**
 * Webpack configuration for weex.
 */
const weexConfig = webpackMerge(commonConfig[1], {
  watch: true
})

module.exports = function(){
  return [weexConfig,devWebpackConfig]
}
 


