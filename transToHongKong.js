const OpenCC = require('node-opencc');

/*
  读取路径下的所有文件内容，抽取中文输出
*/
var fs = require('fs');
var path = require('path');
const os = require('os') // os.EOL 换行符常量
/**
 * @description
 * @author luohongxin
 * @date 29/05/2023
 * @param {*} filePath 读取的路径
 * @param {*} includeSuffix 只读取哪些后缀的文件 输出的文件名
 */
// 开始读取文件
function transToHongKong(filePath, includeSuffix, prefixPath = './') {
    if (prefixPath !== './') prefixPath += '/'
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, async function (eror, stats) {
                    if (eror) {
                        console.warn('文件路径不正确，获取文件stats失败');
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        let pathName = prefixPath + filename;
                        if (isFile) {
                            // 符合后缀的文件才读取 && filedir.indexOf("src") > -1
                            const nameSplit = filename.split(".")
                            const suffix = nameSplit[nameSplit.length - 1]; // 文件后缀
                            if (fs.existsSync(pathName)) {
                                pathName = prefixPath + '_new' + filename
                            }
                            if (includeSuffix) {
                                for (let index = 0; index < includeSuffix.length; index++) {
                                    const targetSuffix = includeSuffix[index];
                                    if (targetSuffix === suffix) {
                                        await readFile(filedir, pathName)
                                    }
                                }
                            } else {
                                await readFile(filedir, pathName)
                            }
                        }
                        if (isDir) {
                            if (filedir.indexOf("node_modules") > -1) return; // node_modules 不用遍历访问
                            transToHongKong(filedir, includeSuffix, pathName);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}

// 加载编码转换模块
var iconv = require('iconv-lite');
// 读取文件内容
function readFile(file, filename) {
    return new Promise(res => {
        fs.readFile(file, "utf8", async function (err, data) {
            if (err)
                console.log("读取文件fail " + err);
            else {
                // 读取成功时
                // 输出字节数组
                // 写入匹配中文正则的字符串
                // const arr = data.match(/[\u4E00-\u9FA5\uF900-\uFA2D]+/g)
                const arr = data.match(/(?![0-9a-zA-Z]+$)[\u4E00-\u9FA5\uF900-\uFA2D，。？！；：“”‘’（）【】《》]+[0-9A-Za-z\s|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]*[\u4E00-\u9FA5\uF900-\uFA2D，。？！；：“”‘’（）【】《》]+/g)
                if (arr && arr.length > 0) {
                    const newArr = []
                    let fileStr = ""
                    // 去重
                    arr.forEach(str => {
                        if (!newArr.includes(str)) {
                            newArr.push(str);
                        }
                    })
                    newArr.forEach(str => {
                        fileStr = fileStr + os.EOL + str;
                        var reg = new RegExp(str, 'ig');
                        console.log(str, OpenCC.simplifiedToHongKong(str), 444);
                        data = data.replace(reg, OpenCC.simplifiedToHongKong(str))
                    })
                    if (fileStr) {
                        // 含有中文的写入读取的文件地址
                        console.log(data, 8888);
                        await writeFile(data, filename)
                    } else {
                        res()
                    }
                } else {
                    res()
                }
            }
        });
    })
}



// 写入文件内容
function writeFile(str, file) {
    return new Promise(res => {
        if (!file) file = "output.txt"
        // 把中文转换成字节数组
        var arr = iconv.encode(str + os.EOL, "utf-8");
        const dirPath = file.split('/').slice(0, -1).join('/'); // 获取目录路径
        // appendFile，如果文件不存在，会自动创建新文件
        // 如果用writeFile，那么会删除旧文件，直接写新文件
        if (dirPath) {
            fs.mkdir(dirPath, { recursive: true }, (err) => { // 创建目录，recursive代表递归创建
                if (err) throw err;
                fs.appendFile(file, arr, function (err) {
                    if (err)
                        console.log("写入文件失败：" + file + err);
                    else
                        console.log("写入文件成功" + file);
                    res()
                });
            });
        } else {
            fs.appendFile(file, arr, function (err) {
                if (err)
                    console.log("写入文件失败：" + file + err);
                else
                    console.log("写入文件成功" + file);
                res()
            });
        }

    })
}
module.exports = transToHongKong;