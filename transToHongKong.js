const OpenCC = require('node-opencc');
/*
  读取路径下的所有文件内容，抽取中文输出
*/
const fs = require('fs');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const path = require('path');
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
    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (prefixPath !== './') prefixPath += '/'
        // 路径为文件夹
        if (stat.isDirectory()) {
            //根据文件路径读取文件列表，返回文件列表
            fs.readdir(filePath, function (err, files) {
                if (err) {
                    console.warn(err)
                } else {
                    //遍历读取到的文件列表
                    files.forEach(function (filename) {
                        //获取当前文件的绝对路径
                        let filedir = path.join(filePath, filename);
                        //根据文件路径获取文件信息，返回一个fs.Stats对象
                        fs.stat(filedir, async function (eror, stats) {
                            if (eror) {
                                console.warn('文件路径不正确，获取文件stats失败');
                            } else {
                                let isFile = stats.isFile();//是文件
                                let isDir = stats.isDirectory();//是文件夹
                                let pathName = prefixPath + filename;
                                if (isFile) {
                                    // 符合后缀的文件才读取
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
        } else if (stat.isFile()) {
            let filename = path.basename(filePath)
            // 符合后缀的文件才读取
            const nameSplit = filename.split(".")
            const suffix = nameSplit[nameSplit.length - 1]; // 文件后缀
            if (fs.existsSync(filename)) {
                filename = 'new_' + filename
            }
            if (includeSuffix) {
                for (let index = 0; index < includeSuffix.length; index++) {
                    const targetSuffix = includeSuffix[index];
                    if (targetSuffix === suffix) {
                        readFile(filePath, filename)
                    }
                }
            } else {
                readFile(filePath, filename)
            }
        } else {
            console.log(`${filePath}不存在`);
        }
    } else {
        console.log(`${filePath}不存在`);
    }

}

// 加载编码转换模块
let iconv = require('iconv-lite');
// 读取文件内容
function readFile(file, filename) {
    return new Promise(res => {
        const arr = filename.split(".");
        if (arr[arr.length - 1] === "docx") {
            // 读取docx文件
            const content = fs.readFileSync(file, "binary");
            const zip = new PizZip(content);
            // 初始化 Docxtemplater
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            // 获取docx文档的内容
            const contentXml = doc.getZip().file("word/document.xml").asText();
            // 清除原始文本内容并替换为新内容
            const updatedContent = OpenCC.simplifiedToHongKong(contentXml);
            // 获取渲染后的内容
            const updatedFile  = doc.getZip().file("word/document.xml", updatedContent).generate({ type: "nodebuffer" });
            // 将渲染后的内容写入新文件
            fs.writeFileSync(filename, updatedFile);
        } else {
            fs.readFile(file, "utf8", async function (err, data) {
                if (err)
                    console.log("读取文件fail " + err);
                else {
                    data = OpenCC.simplifiedToHongKong(data);
                    await writeFile(data, filename)
                    res();
                }
            });
        }
    })
}

// 写入文件内容
function writeFile(str, file) {
    return new Promise(res => {
        if (!file) file = "output.txt"
        // 把中文转换成字节数组
        let arr = iconv.encode(str + os.EOL, "utf-8");
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