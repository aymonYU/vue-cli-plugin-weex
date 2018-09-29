const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const config = require('./config');
const helper = require('./helper');
const glob = require('glob');
const vueLoaderConfig = require('./vue-loader.conf');
const vueWebTemp = helper.rootOut(config.templateDir);
const hasPluginInstalled = fs.existsSync(helper.rootOut(config.pluginFilePath));
const isWin = /^win/.test(process.platform);
const weexEntry = {
  'index': helper.root('entry.js')
}

const getEntryFileContent = (source, routerpath) => {
  let dependence = `import Vue from 'vue'\n`;
  dependence += `const weex = require('weex-vue-render').WeexVueRender\n`;
  let relativePluginPath = helper.rootOut(config.pluginFilePath);
  let entryContents = fs.readFileSync(source).toString();
  let contents = '';
  entryContents = dependence + entryContents;
  entryContents = entryContents.replace(/\/\* weex initialized/, match => `weex.init(Vue)\n${match}`);
  if (isWin) {
    relativePluginPath = relativePluginPath.replace(/\\/g, '\\\\');
  }
  if (hasPluginInstalled) {
    contents += `\n// If detact plugins/plugin.js is exist, import and the plugin.js\n`;
    contents += `import plugins from '${relativePluginPath}';\n`;
    contents += `plugins.forEach(function (plugin) {\n\tweex.install(plugin)\n});\n\n`;
    entryContents = entryContents.replace(/\.\/router/, routerpath);
    entryContents = entryContents.replace(/weex\.init/, match => `${contents}${match}`);
  }
  return entryContents;
}

const getRouterFileContent = (source) => {
  const dependence = `import Vue from 'vue'\n`;
  let routerContents = fs.readFileSync(source).toString();
  routerContents = dependence + routerContents;
  return routerContents;
}

const getEntryFile = () => {
  const entryFile = path.join(vueWebTemp, config.entryFilePath)
  const routerFile = path.join(vueWebTemp, config.routerFilePath)
  fs.outputFileSync(entryFile, getEntryFileContent(helper.root(config.entryFilePath), routerFile));
  fs.outputFileSync(routerFile, getRouterFileContent(helper.root(config.routerFilePath)));
  return {
    index: entryFile
  }
}

// The entry file for web needs to add some library. such as vue, weex-vue-render
const webEntry = getEntryFile();


let vendorEntry 
if(fs.pathExistsSync(path.resolve(process.cwd(), './node_modules/phantom-limb/index.js'))){
  vendorEntry = path.resolve(process.cwd(), './node_modules/phantom-limb/index.js')
}else{
  vendorEntry = path.resolve(__dirname, '../node_modules/phantom-limb/index.js')
}

// Config for compile jsbundle for web.
const webConfig = {
  entry: Object.assign(webEntry, {
    'vendor': [vendorEntry]
  }),
  output: {
    path: helper.rootOut('./dist'),
    filename: '[name].web.js'
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules')]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': helper.resolve('src')
    },
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules'),'node_modules'],
  },
  module: {
    // webpack 2.0 
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [require.resolve('@vue/babel-preset-app')]
          }
        }],
        exclude: config.excludeModuleReg
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'vue-loader',
          options: Object.assign(vueLoaderConfig({useVue: true, usePostCSS: false}), {
            optimizeSSR: false,
            postcss: [
              require('postcss-plugin-weex')(),
              require('autoprefixer')({
                browsers: ['> 0.1%', 'ios >= 8', 'not ie < 12']
              }),
              require('postcss-plugin-px2rem')({
                rootValue: 75,
                minPixelValue: 1.01
              })
            ],
            compilerModules: [
              {
                postTransformNode: el => {
                  require('weex-vue-precompiler')()(el)
                }
              }
            ]
            
          })
        }],
        exclude: config.excludeModuleReg
      }
    ]
  },
  // plugins: [
  //   new webpack.BannerPlugin({
  //     banner: '// { "framework": "Vue"} \n',
  //     raw: true,
  //     exclude: 'Vue'
  //   })
  // ]
};
// Config for compile jsbundle for native.
const weexConfig = {
  entry: weexEntry,
  output: {
    path: helper.rootOut('./dist'),
    filename: '[name].js'
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules')]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': helper.resolve('src')
    },
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [require.resolve('@vue/babel-preset-app')]
          }
        }],
        exclude: config.excludeModuleReg
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'weex-loader',
          options: vueLoaderConfig({useVue: false})
        }],
        exclude: config.excludeModuleReg
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '// { "framework": "Vue"} \n',
      raw: true,
      exclude: 'Vue'
    })
  ],
  node: config.nodeConfiguration
};

module.exports = [webConfig, weexConfig];
