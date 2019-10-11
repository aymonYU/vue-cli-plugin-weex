const path = require('path')
const BannerPlugin = require('vue-banner-plugin')
const ip = require('ip').address()
const HTMLPlugin = require('html-webpack-plugin')
const fs = require('fs')
let execSync = require('child_process').execSync;
const defaultWeexPort = portIsOccupied(8092)
const defaultWebPort =  portIsOccupied(8089)
console.log('web port:'+ defaultWebPort,' weex port:'+ defaultWeexPort)

//生成port.js文件
fs.writeFileSync(path.resolve(__dirname,'./web/assets/port.js'),`
(function port(win) {
    win.weexPort = "${defaultWeexPort}";
    win.webPort = "${defaultWebPort}";
})(window)
`)

module.exports = (api, options) => {
    const platform = process.env.PLATFORM || 'web'
    const isWeex = platform === 'weex'
    const isWeb = platform === 'web'
    if(!isWeb&&!isWeex){
        return
    }
    const isProduction = process.env.NODE_ENV === 'production'
    api.chainWebpack(async (configChain, options = {}) => {
        const currentWebpackConfig = configChain.toConfig();
        const entryKeys = Object.keys(currentWebpackConfig.entry); //入口的key
        const htmlPluginKeys = entryKeys.map(item => `html-${item}`); //每个入口对应的htmlPlugin的插件名
        const isTs = api.hasPlugin('typescript')

        if (isWeex) {
            entryKeys.forEach(item => {
                configChain.plugins.delete(`html-${item}`)
                configChain.plugins.delete(`preload-${item}`)
                configChain.plugins.delete(`prefetch-${item}`)
            })
        } else {
            htmlPluginKeys.map((pluginKey, index) => {
                configChain.plugin(pluginKey).tap(args => {
                    if (Array.isArray(args) && args.length > 0) {
                        //判断是否有title
                        if (!args[0].title) {
                            //如果没有就帮忙设置title为入口名
                            if (isWeex) {
                                args[0].title = `weex ${entryKeys[index]}`
                            } else {
                                args[0].title = entryKeys[index]
                            }
                        }
                        //判断是否有template
                        if (!args[0].template) {
                            //web没有的话，设置默认值
                            if (!isWeex) {
                                args[0].template = path.resolve(__dirname, './web/index.html')
                            }
                        }
                    }
                    return args;
                })
            })
            configChain.plugin(`html-preview-qr`)
                .use(HTMLPlugin, [{
                    template: path.resolve(__dirname, './web/preview.html'),
                    filename: 'preview.html',
                    title: 'preview'
                }])
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
            if(!configChain.module.rules.has('weex')){
                configChain.module.rule('weex')
                    .test(/\.vue$/)
                    .use('weex-loader')
                    .loader('weex-loader')
                    .options({
                        loaders: isTs ? {
                            ts: [{
                                loader: 'ts-loader',
                                options: {
                                    appendTsSuffixTo: [/\.vue$/],
                                    transpileOnly: true,
                                    happyPackMode: true
                                }
                            }],
                        } : {}
                    })
            }

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
                    banner: `// { "framework": "Vue"}
;(function vueApply() {
    if (typeof Vue !== 'undefined' && typeof Vue.apply === 'undefined') {
        Vue.apply = (self, args) => Reflect.apply(Vue, self, args)
    }
})(); \n`,
                    raw: true,
                    exclude: 'Vue'
                }])
            configChain.merge({
                devServer: {
                    port: defaultWeexPort,
                    contentBase: path.resolve(__dirname, 'web'),
                }
            })
            if (isProduction) {
                // 避免分包
                configChain.optimization.clear()
            }
            // weex 添加一些环境变量
            // 判断是dev环境 目前主要用于 navigator debug模式
            if (!isProduction) {
                configChain
                    .plugin('define-local-weex-env')
                    .use(require('webpack/lib/DefinePlugin'), [{
                        'process.env.VUE_APP_WEEX_IP': JSON.stringify(ip),
                        'process.env.VUE_APP_WEEX_PORT': JSON.stringify(defaultWeexPort),
                        'process.env.VUE_APP_WEEX_PAGES': JSON.stringify(entryKeys)
                    }]);
            }

        } else {
            configChain.merge({
                devServer: {
                    port: defaultWebPort,
                }
            })
            configChain.module.rule('vue').use('vue-loader').loader('vue-loader').tap(options => {
                options = Object.assign({}, options)
                options.compilerOptions = {
                    modules: [{
                        postTransformNode: el => {
                            // to convert vnode for weex components.
                            require('weex-vue-precompiler')()(el)
                        }
                    }],
                    isUnaryTag: makeMap(
                        'area,base,br,col,embed,frame,hr,img,image,input,isindex,keygen,' +
                        'link,meta,param,source,track,wbr'
                    ), // 这里主要是添加了image标签的支持，因为format函数会把image的闭合给干掉，但是vue默认又是要检测的，所以这里新增允许image不闭合
                }
                return options
            })
        }
    })
}


/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(
    str,
    expectsLowerCase
) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ?
        function (val) {
            return map[val.toLowerCase()];
        } :
        function (val) {
            return map[val];
        }
}

function portIsOccupied (port){
    try{
        if(execSync(process.platform=='win32'? `netstat -ano|findstr ":${port}"` : `lsof -i:${port} | grep -c -n .`)){
            console.log(`this port ${port} is occupied.try another.`)
            return portIsOccupied(port+1)
        }
    }catch(e){
        
    }
    return port
}
