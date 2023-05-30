#!/usr/bin/env node

var path = require('path');
const fileDisplay = require("./fileDisplay");
const checkFile = require("./checkFile");
const argv = process.argv.slice(2);
const package = require("./package.json")
// 版本号
if (argv[0] === '-v' || argv[0] === '-V') {
    return console.log(package.version);
}
// 帮助说明
if (argv[0] === '--help' || argv[0] === '-help') {
    console.log('\x1b[1m\x1b[32mhxread [读取文件的路径] [输出的文件名] [支持读取文件的后缀]\x1b[0m');
    console.log('\x1b[32m读取文件的路径: 会遍历递归读取路径上的所有文件\x1b[0m');
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
} else {
    console.log("Please enter the correct path");
}
// 判断是否为路径
function isPath(str) {
    return /^[a-zA-Z]:\\(.*\\)*.*$/.test(str);
}