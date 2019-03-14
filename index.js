#!/usr/bin/env node

/**
 * 使用方法： imageslim
 * 
 * cli形式调用  imageslim -wf source output 
 * api形式调用  
 * 
 * 
 * imageslim 就是压缩当前目录       没问题
 * imageslim source 压缩指定目录    
 * imageslim source output 把a目录的图片压缩到b目录
 * 
 * 
 * 规则：
 * 1. 如果从a目录压缩到b目录，不生成记录
 * 2. 同目录下压缩，默认生成记录
 * 3. 支持记录图片压缩信息，不重复压缩 TODO
 * 
 * TODO：目前要求必须是目录
 * 
 * 判断是否同一个目录
 */
const program = require('commander');
const imagemin = require('imagemin');
const package = require('./package.json');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const glob = require('glob');
const chalk = require('chalk');
const md5 = require('md5');
const path = require('path');
const fs = require('fs');
const log = console.log;
const cacheFilePath = path.resolve(process.cwd(), '.imageslimrc') //图片压缩信息存储路径



program
    .version(package.version)
    .usage('imageslim [option] in_file [-o out_file]')
    .description('imageslim images')
    .option('-w --webp', 'convert (jpg|png|jpeg) to webp')
    .option('-o --output', 'convert (jpg|png|jpeg) to webp')
    .option('-f --force', 'ignore md5')
    .parse(process.argv);

let [source, target] = program.args;
if (!source) {
    source = process.cwd();
}

let imgs = glob.sync(path.resolve(source, '**/*.@(jpg|jpeg|png)'), {
    ignore: [path.resolve(process.cwd(), 'node_modules/**')]
});

imgs = imgs.map((item) => {
    return {
        source: item,
        target: target ? target : path.parse(item).dir
    }
});
console.log(imgs);
// return;
(async () => {
    for (let i = 0; i < imgs.length; i++) {
        let item = imgs[i];
        if (['.jpg', '.jpeg'].includes(path.parse(item.source).ext)) {
            await imagemin([item.source], item.target, {
                use: [
                    imageminMozjpeg()
                ]
            });
        } else if (['.png'].includes(path.parse(item.source).ext)) {
            await imagemin([item.source], item.target, {
                use: [
                    imageminPngquant()
                ]
            });
        }
        await imagemin([item.source], item.target, {
            use: [
                imageminWebp()
            ]
        });
    }
    for (let i = 0; i < imgs.length; i++) {
        console.log(md5(fs.readFileSync(imgs[i])))
    }
    /* 记录图片压缩信息 TODO*/
    log(`${chalk.green('✔')}  imageslim webp succeed`)
})();