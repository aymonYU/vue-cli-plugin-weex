const path = require('path')
const glob = require('glob')
const fs = require('fs-extra');
const ip = require('ip').address();


const vueWebTemp = 'src/.temp';
const sourceDir = path.resolve(process.cwd(), 'src/pages')
const entryFilter = '**/*.ts'

const isWeex = process.env.PLATFORM === 'weex'
const entries = glob.sync(`${sourceDir}/${entryFilter}`);

// 获取不同weex和web的pages下的页面
const getPages = () => {
    let pages = {};
    const dir = sourceDir;

    // Wraping the entry file for web.
    const getWebEntryFileContent = (entryPath, ) => {
        let insertStr = `
import Vue from 'vue'
const weex = require('weex-vue-render')

/* eslint-disable no-undef */
weex.init(Vue)
                `
return  fs.readFileSync(entryPath).toString().replace("import Vue from 'vue'",insertStr)
        
    }

    let entryAr = entries.map(entry => {
        const extname = path.extname(entry)
        const basename = entry.replace(`${dir}/`, '')
        const filename = entry.replace(`${dir}/`, '').replace(extname, '');
        if (!isWeex) {
            const templatePathForWeb = path.join(vueWebTemp, basename);
            fs.outputFileSync(templatePathForWeb, getWebEntryFileContent(entry));
            return [filename, templatePathForWeb]
        } else {
            return [filename, entry]
        }

    })
    entryAr.forEach(ar => {
        let name = ar[0]
        pages[name] = {
            // page 的入口
            entry: ar[1],
            // 模板来源
            template: isWeex ? './node_modules/vue-cli-plugin-weex/web/preview.html' : './node_modules/vue-cli-plugin-weex/web/index.html',
            // 在 dist/index.html 的输出
            filename: `${name}.html`,
            // 当使用 title 选项时，
            title: isWeex ? `weex ${name}` : `web ${name}`,
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', name]
        }
    })
    return pages

}

//获取weex入口文件名称
function getWeexEntry() {
    return entries.map(entry => {
        const extname = path.extname(entry)
        const filename = entry.replace(`${sourceDir}/`, '').replace(extname, '');
        return filename
    })
}

//打开浏览器的地址
function getOpenPage() {
    const weexEntry = getWeexEntry()
    return isWeex ? `${weexEntry[0]}.html?page=${weexEntry[0]}.js&entrys=${weexEntry.join('|')}&ip=${ip}` : ''
}

module.exports = {
    getPages,
    getOpenPage
}