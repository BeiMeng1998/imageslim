#!/usr/bin/env node

const program = require('commander')
const imagemin = require('imagemin')
const package = require('./package.json')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminWebp = require('imagemin-webp')
const glob = require('glob')
const chalk = require('chalk')
const md5 = require('md5')
const ProgressBar = require('progress')
const path = require('path')
const fs = require('fs')
const log = console.log
const cacheFilePath = path.resolve(process.cwd(), '.imageslimrc') //图片压缩信息存储路径

if (!fs.existsSync(cacheFilePath)) {
    fs.writeFileSync(cacheFilePath, '', 'utf-8')
}

const cacheList = fs.readFileSync(cacheFilePath, 'utf-8').trim().split('\n')
program
    .version(package.version)
    .usage('imageslim [option] in_file [-o out_file]')
    .description('imageslim images')
    .option('-w --webp', 'convert (jpg|png|jpeg) to webp')
    .option('-f --force', 'ignore md5')
    .parse(process.argv)

let [source] = program.args
if (!source) {
    source = process.cwd()
}
let imgs = glob.sync(path.resolve(source, '**/*.@(jpg|jpeg|png)'), {
    ignore: [path.resolve(process.cwd(), 'node_modules/**')]
})

imgs = imgs.map((item) => {
    return {
        source: item,
        target: path.parse(item).dir
    }
})

// 非强制压缩，匹配缓存数据进行过滤
if (!program.force) {
    imgs = imgs.filter((item) => {
        return !cacheList.includes(md5(fs.readFileSync(item.source)))
    })
}

;
(async () => {
    log('')
    log(`${chalk.green('✈️')}  imageslim started`)
    let bar = new ProgressBar('[:bar] :percent  :current/:total', {
        total: imgs.length,
        width: 100
    })
    for (let i = 0; i < imgs.length; i++) {
        let item = imgs[i]
        if (['.jpg', '.jpeg'].includes(path.parse(item.source).ext)) {
            await imagemin([item.source], item.target, {
                use: [
                    imageminMozjpeg()
                ]
            })
        } else if (['.png'].includes(path.parse(item.source).ext)) {
            await imagemin([item.source], item.target, {
                use: [
                    imageminPngquant()
                ]
            })
        }
        if (program.webp) {
            await imagemin([item.source], item.target, {
                use: [
                    imageminWebp()
                ]
            })
        }

        bar.tick()
    }
    for (let i = 0; i < imgs.length; i++) {
        fs.appendFileSync(cacheFilePath, '\n' + md5(fs.readFileSync(imgs[i].source)))
    }
    log(`${chalk.green('✔')}  imageslim succeed`)
    log('')
})()