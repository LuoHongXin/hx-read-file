
const program = require('commander');
var path = require('path');
const fileDisplay = require("./fileDisplay");
program
    // 版本号   
    .version('0.0.1', "-v -V")
    // 默认指令，提取目标路径下的中文
    // 参数1为目标读取路径，参数2为输出文件名+文件后缀，参数3为只读取包含的文件后缀，例如只读取js和html：html,js
    .command("*").action(function () {
        const argv = process.argv.slice(2);
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
    })
    .parse(process.argv);

function isPath(str) {
    return /^[a-zA-Z]:\\(.*\\)*.*$/.test(str);
}