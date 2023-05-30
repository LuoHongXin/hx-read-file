#!/usr/bin/env node

var path = require('path');
const fileDisplay = require("./fileDisplay");
const argv = process.argv.slice(2);
if (argv[0] === '-v' || argv[0] === '-V') {
    return console.log('1.0.0');
}
if (argv[0] === '--help' || argv[0] === '-help') {
    console.log('\x1b[1m\x1b[32mhxread [读取文件的路径] [输出的文件名] [支持读取文件的后缀]\x1b[0m');
    console.log('\x1b[32m读取文件的路径: 会遍历递归读取路径上的所有文件\x1b[0m');
    console.log('\x1b[32m输出的文件名: 会在执行指令的所在目录下输出生成文件，文件名默认为 output.js\x1b[0m');
    return console.log('\x1b[32m支持读取文件的后缀: 不填会默认读取所有文件，填了则默认只读取支持读取文件的后缀的文件，用逗号分割符隔开，例: html,js ，这样就只会读取html和js文件\x1b[0m');
}
if (isPath(argv[0])) {
    var filePath = path.resolve(argv[0]);
    let includeSuffix = null;
    if (argv[2]) {
        includeSuffix = argv[2].split(",")
    }
    fileDisplay(filePath, argv[1], includeSuffix)
} else {
    console.log("Please enter the correct path");
}
// 判断是否为路径
function isPath(str) {
    return /^[a-zA-Z]:\\(.*\\)*.*$/.test(str);
}