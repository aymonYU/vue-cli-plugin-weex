
const path = require('path')
const glob = require('glob')
const fs = require('fs-extra');
const ip = require('ip').address();

const isWeex = process.env.PLATFORM ==='weex'


// Retrieve entry file mappings by function recursion
const getPages = () => {
    let pages={};
    let weexEntry = []
    const vueWebTemp = 'src/.temp'
    const config = {
        sourceDir:path.resolve(process.cwd(),'src/pages'),
        entryFilter: '**/*.js',
    }
    const dir = config.sourceDir;

    // Wraping the entry file for web.
    const getWebEntryFileContent = (entryPath, ) => {
        return  `
import weex from 'weex-vue-render'
${fs.readFileSync(entryPath).toString()}
/* eslint-disable no-undef */
weex.init(Vue)
        `
    }

    const entries = glob.sync(`${dir}/${config.entryFilter}`);
    let entryAr = entries.map(entry=>{
        const extname = path.extname(entry)
        const basename = entry.replace(`${dir}/`, '')
        const filename = entry.replace(`${dir}/`, '').replace(extname, '');
        if(!isWeex){
            const templatePathForWeb = path.join(vueWebTemp, basename);
            fs.outputFileSync(templatePathForWeb, getWebEntryFileContent(entry));
            return  [filename, templatePathForWeb]
        }else{
            weexEntry.push(filename)
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
    return [pages,weexEntry];
    
}

        

let result = getPages()
const weexEntry = result[1]
const entryStr = weexEntry.join('|')

module.exports = {
    pages:result[0],
    devServer:{
        openPage: isWeex?`${weexEntry[0]}.html?page=${weexEntry[0]}.js&entrys=${entryStr}&ip=${ip}`:''
    }
}
