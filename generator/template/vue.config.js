
const path = require('path')
const glob = require('glob')
const fs = require('fs-extra');
const ip = require('ip').address();


const config = {
    vueWebTemp:'src/.temp',
    sourceDir:path.resolve(process.cwd(),'src/pages'),
    entryFilter: '**/*.js',
}

const isWeex = process.env.PLATFORM ==='weex'
const entries = glob.sync(`${config.sourceDir}/${config.entryFilter}`);

// 获取不同weex和web的pages下的页面
const getPages = () => {
    let pages={};
    const dir = config.sourceDir;

    // Wraping the entry file for web.
    const getWebEntryFileContent = (entryPath, ) => {
        return  `
const weex = require('weex-vue-render')
${fs.readFileSync(entryPath).toString()}
/* eslint-disable no-undef */
weex.init(Vue)
        `
    }

    let entryAr = entries.map(entry=>{
        const extname = path.extname(entry)
        const basename = entry.replace(`${dir}/`, '')
        const filename = entry.replace(`${dir}/`, '').replace(extname, '');
        if(!isWeex){
            const templatePathForWeb = path.join(config.vueWebTemp, basename);
            fs.outputFileSync(templatePathForWeb, getWebEntryFileContent(entry));
            return  [filename, templatePathForWeb]
        }else{
            return [filename, entry]
        }
        
    })
    entryAr.forEach(ar=>{
        let name = ar[0]
        pages[name]={
                // page 的入口
                entry: ar[1],
                // 模板来源
                template: isWeex?'./node_modules/vue-cli-plugin-weex/web/preview.html':'./node_modules/vue-cli-plugin-weex/web/index.html',
                // 在 dist/index.html 的输出
                filename: `${name}.html`,
                // 当使用 title 选项时，
                title: isWeex?`weex ${name}`:`web ${name}`,
                // 在这个页面中包含的块，默认情况下会包含
                // 提取出来的通用 chunk 和 vendor chunk。
                chunks: ['chunk-vendors', 'chunk-common', name]
        }
    })
    return pages
    
}

//获取weex入口文件名称
function getWeexEntry(){
    return  entries.map(entry=>{
        const extname = path.extname(entry)
        const filename = entry.replace(`${config.sourceDir}/`, '').replace(extname, '');
        return filename
    })
}
        
const weexEntry = getWeexEntry()
const entryStr = weexEntry.join('|')

module.exports = {
    pages:getPages(),
    devServer:{
        openPage: isWeex?`${weexEntry[0]}.html?page=${weexEntry[0]}.js&entrys=${entryStr}&ip=${ip}`:''
    }
}
