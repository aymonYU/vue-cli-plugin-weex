const commonConfig = require('./webpack.common.conf');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const os = require('os');
const webpack = require('webpack');
const config = require('./config');
const helper = require('./helper');




const weexConfig = webpackMerge(commonConfig[1], {
  // mode:'production',

    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        compressor: {
          warnings: false,
          drop_console: true,
          drop_debugger: true
        }
      }),
      // Need to run uglify first, then pipe other webpack plugins
      ...commonConfig[1].plugins
    ]
})


const webConfig = webpackMerge(commonConfig[0], {
  // mode:'production',

  devtool: config.prod.devtool,
  output: {
    path: helper.rootOut('./dist'),
    filename: '[name].web.js',
    sourceMapFilename: '[name].web.map'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': config.prod.env
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compressor: {
        warnings: false,
        drop_console: true,
        drop_debugger: true
      }
    })
  ]
});

module.exports = function(){
    return [weexConfig, webConfig]
}
