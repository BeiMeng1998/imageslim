#!/usr/bin/env node

const program = require('commander')
const ora = require('ora')
const package = require('./package.json')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const tinify = require("tinify")
const md5 = require('md5')
const chalk = require('chalk')
const {
    exec
} = require('child_process')
const spinner = ora(`building...`)

const log = console.log

const keyFilePath = path.resolve(process.env.HOME || process.env.USERPROFILE, '.imageslim') //tinypng存储卢靖
const cacheFilePath = path.resolve(process.cwd(), '.imageslimrc') //图片压缩信息存储路径
let allLen = 0 //需要压缩的图片数量
let index = 0 //当前已压缩的图片数量

program
    .version(package.version)
    .usage('imageslim [option] in_file [-o out_file]')
    .description('imageslim images')
    .option('-w --webp', 'convert (jpg|png|jpeg) to webp')
    .option('-o --output', 'convert (jpg|png|jpeg) to webp')
    .option('-f --force', 'ignore md5')
    .parse(process.argv)

// step1 如果key不存在， 抛出使用文档
if (!fs.existsSync(keyFilePath)) {
    fs.writeFileSync(keyFilePath, '', 'utf-8')
}
if (!fs.existsSync(cacheFilePath)) {
    fs.writeFileSync(cacheFilePath, '', 'utf-8')
}
// tinypng key list
const keyList = fs.readFileSync(keyFilePath, 'utf-8').trim().split('\n').filter((item) => {
    return item != ''
})
// 图片md5 list
const cacheList = fs.readFileSync(cacheFilePath, 'utf-8').trim().split('\n')

if (keyList.length == 0) {
    log(`${chalk.red('✖')}  No key`)
    log(`👉  Get started with the following:`)
    log(`   1. Please register on the ${chalk.yellow('https://tinypng.com/developers')}`)
    log(`   2. Add key to the ${chalk.yellow(keyFilePath)}`)
    log(`tips: Detailed documentation ${chalk.yellow('https://github.com/Braised-Cakes/imageslim')}`)
    return
}

tinify.key = keyList[0]

// step2 获取imgs
let imgs = glob.sync(path.resolve('', '**/*.@(jpg|png|jpeg)'), {
    ignore: [path.resolve(process.cwd(), 'node_modules/**')]
})

// 非强制压缩，匹配缓存数据进行过滤
if (!program.force) {
    imgs = imgs.filter((item) => {
        return !cacheList.includes(md5(fs.readFileSync(item)))
    })
}

allLen = imgs.length

// 没有要压缩的图片，则输出log
if (allLen == 0) {
    log(`${chalk.green('✔')}  No images need to be compressed`)
    return
}

function runWebp() {
    return new Promise((resolve, reject) => {
        imgs.forEach((source) => {
            source = source.replace(/ /g, '\\ ')
            let {
                dir,
                name
            } = path.parse(source)
            let target = path.resolve(dir, `${name}.webp`)
            exec(`cwebp ${source} -o ${target}`, function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error)
                }
                if (allLen == ++index) {
                    resolve()
                }
            })
        })
    })
}








// ${chalk.green('✔')}  
// log(`[2/4] 🚀  imageslim webp succeed`)

// log(`[3/4] 🚚  imageslim webp succeed`)

// return

// console.log(keyList)









spinner.text = 'Compressed pictures depend on the network, please wait a moment'
let startTime = +new Date()


function changeKey(){
    
}

function toCompress(item) {
    let image = tinify.fromFile(item)
    image.toFile(item, err => {
        console.log(err)

        if (err && err.status == 429) {
            // if (this.changeKey(item)) {
            //     this.error()
            // }
            toCompress(item)
        } else {
            // spinner.text = ++index

            if (allLen == ++index) {
                log(`Done in ${(+new Date() - startTime) / 1000}s.`)
                //多长时间， 多少个图片， 压缩掉了多少体积
            }
            fs.appendFileSync(cacheFilePath, '\n' + md5(fs.readFileSync(item)))
        }
    })
}


function runOutput() {
    return new Promise((resolve) => {
        imgs.forEach((item) => {
            toCompress(item)
        })
    })
}


(async function () {
    if (program.output) {
        await runOutput()
        log(`${chalk.green('✔')}  Done in ${(+new Date() - startTime) / 1000}s.`)
    }
    if (program.webp) {
        await runWebp()
        log(`${chalk.green('✔')}  imageslim webp succeed`)
    }
})()

console.log(program)

// if (!program.args.length) program.help();