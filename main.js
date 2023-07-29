#!/usr/bin/env node

var path = require('path');
const fileDisplay = require("./fileDisplay");
const checkFile = require("./checkFile");
const transToHongKong = require("./transToHongKong");
const transVar = require("./transVar");
const checkFullStop = require("./checkFullStop");
const argv = process.argv.slice(2);
const package = require("./package.json")
// 版本号
if (argv[0] === '-v' || argv[0] === '-V') {
    return console.log(package.version);
}
// 帮助说明
if (argv[0] === '--help' || argv[0] === '-help') {
    console.log('\x1b[32m1、抽取目标路径文件内容中文：\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[1m\x1b[32mhxread [读取文件的路径] [输出的文件名] [支持读取文件的后缀]\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[32m2、读目标路径文件内容中文是否使用国际化文件中的对象：\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[1m\x1b[32mhxread [读取文件的路径] [国际化文件的路径] [输出的文件名] [支持读取文件的后缀]\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[32m3、目标路径下的文件内容中文转换成香港繁体字：\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[1m\x1b[32mhxread --hk [读取文件的路径] [支持读取文件的后缀]\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[32m4、读取翻译好的xlsx文件（含中英文），根据翻译后的英文生成变量，输出中文和英文的js对象：\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[1m\x1b[32mhxread --transObj [必填，翻译好的xlsx文件的路径] sheetName [读取所在sheet名称] cnName [必填，中文列名] enName [必填，英文列名] sheetIndex [读取所在sheet下标] only[cn:只输出中文,en:只输出英文,默认all]\x1b[0m');
    console.log('\x1b[32m```\x1b[0m');
    console.log('\x1b[32m额外提示：\x1b[0m');
    console.log('\x1b[32m读取文件的路径: 会遍历递归读取路径上的所有文件\x1b[0m');
    console.log('\x1b[32m国际化文件的路径，国际化一般就是导出一个对象，可为json文件或js文件，js文件需要module.exports导出\x1b[0m');
    console.log('\x1b[32m输出的文件名: 会在执行指令的所在目录下输出生成文件，文件名默认为 output.txt\x1b[0m');
    return console.log('\x1b[32m支持读取文件的后缀: 不填会默认读取所有文件，填了则默认只读取支持读取文件的后缀的文件，用逗号分割符隔开，例: html,js ，这样就只会读取html和js文件\x1b[0m');
}

if (isPath(argv[0])) {
    // 检查校验国际化对象是否有使用
    if (isPath(argv[1])) {
        const targetObj = require(argv[1]);
        let includeSuffix = null;
        if (argv[3]) {
            includeSuffix = argv[3].split(",")
        }
        checkFile(argv[0], targetObj, argv[2], includeSuffix)
    } else {
        // 遍历文件读取中文
        var filePath = path.resolve(argv[0]);
        let includeSuffix = null;
        if (argv[2]) {
            includeSuffix = argv[2].split(",")
        }
        fileDisplay(filePath, argv[1], includeSuffix)
    }
} else if (argv[0] === '--hk') {
    // 转繁体
    let includeSuffix = null;
    if (argv[2]) {
        includeSuffix = argv[2].split(",")
    }
    transToHongKong(argv[1], includeSuffix)
} else if (argv[0] === '--checkStop') {
    // 根据中文句号，判断对应英文句子是否需要英文点
    checkFullStop(argv[1], argv[2])
} else if (argv[0] === '--transObj') {
    /**
    * 读取翻译好的xlsx文件（含中英文），根据翻译后的英文生成变量，输出中文和英文的js对象
    */
    let xlsxPath, sheetIndex, sheetName, cnName, enName, only;
    xlsxPath = argv[1]
    for (let index = 0; index < argv.length; index++) {
        const str = argv[index];
        if (str === 'sheetIndex') {
            sheetIndex = argv[index + 1]
        } else if (str === 'sheetName') {
            sheetName = argv[index + 1]
        } else if (str === 'cnName') {
            cnName = argv[index + 1]
        } else if (str === 'enName') {
            enName = argv[index + 1]
        } else if (str === 'only') {
            only = argv[index + 1]
        }
    }
    transVar(xlsxPath, sheetIndex, sheetName, cnName, enName, only)
} else {
    console.log("Please enter the correct path");
}
// 判断是否为路径
function isPath(str) {
    return /^[a-zA-Z]:\\(.*\\)*.*$/.test(str);
}